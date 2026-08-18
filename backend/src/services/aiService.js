const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');

const getGeminiKeys = () => {
  const keys = [];
  if (process.env.GEMINI_API_KEYS) {
    keys.push(...process.env.GEMINI_API_KEYS.split(',').map((k) => k.trim()).filter(Boolean));
  }
  if (process.env.GEMINI_API_KEY) {
    keys.push(...process.env.GEMINI_API_KEY.split(',').map((k) => k.trim()).filter(Boolean));
  }
  for (let i = 1; i <= 20; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k && k.trim()) keys.push(k.trim());
  }
  return [...new Set(keys)];
};

const getOpenAIKeys = () => {
  const keys = [];
  if (process.env.OPENAI_API_KEYS) {
    keys.push(...process.env.OPENAI_API_KEYS.split(',').map((k) => k.trim()).filter(Boolean));
  }
  if (process.env.OPENAI_API_KEY) {
    keys.push(...process.env.OPENAI_API_KEY.split(',').map((k) => k.trim()).filter(Boolean));
  }
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`OPENAI_API_KEY_${i}`];
    if (k && k.trim()) keys.push(k.trim());
  }
  return [...new Set(keys)];
};

let currentGeminiIndex = 0;
let currentOpenAIIndex = 0;

const isAIConfigured = () => getGeminiKeys().length > 0 || getOpenAIKeys().length > 0;

const getAIClient = () => {
  const geminiKeys = getGeminiKeys();
  if (geminiKeys.length > 0) {
    return {
      provider: 'gemini',
      client: new GoogleGenAI({ apiKey: geminiKeys[currentGeminiIndex % geminiKeys.length] }),
      keyCount: geminiKeys.length
    };
  }
  const openAIKeys = getOpenAIKeys();
  if (openAIKeys.length > 0) {
    return {
      provider: 'openai',
      client: new OpenAI({ apiKey: openAIKeys[currentOpenAIIndex % openAIKeys.length] }),
      keyCount: openAIKeys.length
    };
  }
  return null;
};

const withTimeout = (promise, ms = 25000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI request timed out')), ms))
  ]);
};

const callGeminiWithRetry = async (client, prompt, retries = 1) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await withTimeout(client.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      }), 25000);
      return response;
    } catch (err) {
      if (attempt < retries && (err.status === 503 || String(err.message).includes('high demand') || String(err.message).includes('timed out'))) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
};

const executeWithGeminiPool = async (prompt) => {
  const keys = getGeminiKeys();
  if (keys.length === 0) return null;

  const totalKeys = keys.length;
  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const keyIndex = (currentGeminiIndex + attempt) % totalKeys;
    const apiKey = keys[keyIndex];
    try {
      const client = new GoogleGenAI({ apiKey });
      const response = await callGeminiWithRetry(client, prompt);
      currentGeminiIndex = keyIndex;
      return parseAIJson(response.text);
    } catch (err) {
      const isRateLimit =
        err.status === 429 ||
        err.status === 403 ||
        err.status === 503 ||
        String(err.message).toLowerCase().includes('rate limit') ||
        String(err.message).toLowerCase().includes('resource_exhausted') ||
        String(err.message).toLowerCase().includes('quota') ||
        String(err.message).toLowerCase().includes('too many requests');

      if (isRateLimit && totalKeys > 1) {
        console.warn(`[AI Pool] Gemini Key #${keyIndex + 1}/${totalKeys} rate limited. Auto-switching to next key...`);
        continue;
      }
      if (attempt === totalKeys - 1) {
        console.error(`[AI Pool] All ${totalKeys} Gemini key(s) exhausted:`, err.message);
        return null;
      }
    }
  }
  return null;
};

const executeWithOpenAIPool = async (prompt) => {
  const keys = getOpenAIKeys();
  if (keys.length === 0) return null;

  const totalKeys = keys.length;
  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const keyIndex = (currentOpenAIIndex + attempt) % totalKeys;
    const apiKey = keys[keyIndex];
    try {
      const client = new OpenAI({ apiKey });
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });
      currentOpenAIIndex = keyIndex;
      return parseAIJson(response.choices[0]?.message?.content);
    } catch (err) {
      const isRateLimit =
        err.status === 429 ||
        String(err.message).toLowerCase().includes('rate limit') ||
        String(err.message).toLowerCase().includes('quota');

      if (isRateLimit && totalKeys > 1) {
        console.warn(`[AI Pool] OpenAI Key #${keyIndex + 1}/${totalKeys} rate limited. Auto-switching to next key...`);
        continue;
      }
      if (attempt === totalKeys - 1) {
        console.error(`[AI Pool] All ${totalKeys} OpenAI key(s) exhausted:`, err.message);
        return null;
      }
    }
  }
  return null;
};

const parseAIJson = (text) => {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch (e) {
        console.error('Failed to parse AI response JSON substring:', e);
      }
    }
    console.error('Failed to parse raw AI response JSON:', err);
    return null;
  }
};

const analyzeResumeWithAI = async ({ resumeText, jdText, jobTitle, company }) => {
  const geminiKeys = getGeminiKeys();
  const openAIKeys = getOpenAIKeys();
  if (geminiKeys.length === 0 && openAIKeys.length === 0) return null;

  const targetRole = jobTitle && jobTitle.trim() ? jobTitle.trim() : 'General Professional';
  const targetCompany = company && company.trim() ? company.trim() : 'Not specified';
  const targetJd = jdText && jdText.trim() ? jdText.trim() : `General Industry Best Practices & ATS Quality Audit for ${targetRole}`;

  const prompt = `You are an expert ATS (Applicant Tracking System) scanner and Senior Technical Recruiter.
Analyze the following candidate resume ${jdText && jdText.trim() ? 'against the target job description.' : 'and perform a comprehensive ATS Quality and Resume Strength Audit.'}

Target Role: ${targetRole}
Target Company: ${targetCompany}

JOB DESCRIPTION / EVALUATION SCOPE:
${targetJd}

CANDIDATE RESUME:
${resumeText}

IMPORTANT INSTRUCTIONS:
1. First, check if the CANDIDATE RESUME is genuinely a resume or CV (containing work history, skills, experience, or education).
2. If the document is NOT a resume (for example: cooking recipe, news article, essay, academic paper, invoice, or unrelated text):
   - Set "is_valid_resume": false
   - Set "document_warning": "The uploaded file does not appear to be a candidate resume/CV. Uploaded content resembles a non-resume document (e.g. recipe, article, or general text)."
   - Set "ats_score": a realistic low number between 0 and 12 based strictly on match.
   - Set "match_summary": "Non-resume document detected. No relevant professional experience found for this role."
3. If it IS a genuine resume:
   - Set "is_valid_resume": true
   - Set "document_warning": null
   - Calculate an accurate "ats_score" between 0 and 100 based strictly on keyword coverage, relevant skills, and role qualifications.
4. For "improved_bullets": You MUST extract a REAL sentence or bullet point verbatim from the CANDIDATE RESUME text above for the "original" field. Then rewrite it in "improved" to include quantifiable impact, strong action verbs, and role-appropriate competencies for ${targetRole}.
5. For "matched_keywords": Include only keywords that ACTUALLY exist in the candidate's resume.
6. For "missing_keywords" and "missing_skills": Include only relevant competencies for ${targetRole} that are absent from the candidate's resume.
7. For "improvement_suggestions": Provide 3 bespoke recommendations tailored strictly to this specific candidate's resume and target position.

Respond ONLY with a valid, raw JSON object:
{
  "is_valid_resume": true,
  "document_warning": null,
  "ats_score": 75,
  "match_summary": "Concise overview of candidate suitability and key strengths/gaps",
  "matched_keywords": ["Keyword1", "Keyword2"],
  "missing_keywords": ["Keyword3", "Keyword4"],
  "missing_skills": ["Skill 1", "Skill 2"],
  "improvement_suggestions": [
    {
      "title": "Actionable Suggestion Title",
      "detail": "Detailed guidance tailored to this candidate's specific background"
    }
  ],
  "improved_bullets": [
    {
      "original": "Verbatim sentence found in candidate resume",
      "improved": "High-impact rewritten bullet point using strong action verbs, quantifiable metrics, and relevant keywords for this role",
      "reason": "Why this change improves ATS scoring and recruiter appeal"
    }
  ]
}`;

  if (geminiKeys.length > 0) {
    const result = await executeWithGeminiPool(prompt);
    if (result) return result;
  }

  if (openAIKeys.length > 0) {
    const result = await executeWithOpenAIPool(prompt);
    if (result) return result;
  }

  return null;
};

const generateInterviewQuestionsWithAI = async ({ resumeText, jdText, jobTitle, missingSkills, existingQuestions = [] }) => {
  const geminiKeys = getGeminiKeys();
  const openAIKeys = getOpenAIKeys();
  if (geminiKeys.length === 0 && openAIKeys.length === 0) return null;

  const existingNotice = Array.isArray(existingQuestions) && existingQuestions.length > 0
    ? `\nCRITICAL: Do NOT duplicate or closely rephrase any of these already asked questions:\n${existingQuestions.map((q, i) => `- ${typeof q === 'string' ? q : q.question || ''}`).filter(Boolean).slice(0, 15).join('\n')}\n`
    : '';

  const prompt = `You are an elite Senior Technical Interviewer and Hiring Bar Raiser.
Generate a deeply personalized, rigorous mock interview preparation question set for a candidate applying for the role: ${jobTitle || 'Target Role'}.

CRITICAL INSTRUCTIONS:
1. Every Technical and Behavioral question MUST be directly grounded in the candidate's actual RESUME provided below.
2. Probe their real past projects, listed technologies, metrics, job experiences, and achievements mentioned in their resume.
3. For Technical questions: Reference specific tools, systems, or projects from their resume and ask in-depth questions about architecture, trade-offs, scalability, edge cases, and failure modes.
4. For Behavioral questions: Use the STAR methodology and tailor the scenarios to situations relevant to their past roles and target position.
5. For HR questions: Focus on genuine alignment with ${jobTitle || 'this role'}, feedback receptivity, and workplace values.
${existingNotice}

CANDIDATE RESUME:
${resumeText || 'Candidate background in ' + (jobTitle || 'target domain')}

JOB DESCRIPTION / TARGET REQUIREMENTS:
${jdText || 'Standard industry competencies for ' + (jobTitle || 'target role')}

FOCUS GAPS / MISSING COMPETENCIES:
${Array.isArray(missingSkills) ? missingSkills.join(', ') : 'Key domain competencies'}

Respond ONLY with a valid, raw JSON object:
{
  "technical": [
    {
      "question": "Deep technical question directly referencing candidate's resume projects, tools, or architectural decisions",
      "difficulty": "Medium",
      "expected_keywords": ["SpecificTool", "Scalability", "TradeOff"],
      "topic": "Specific Topic from Resume",
      "focus_skill": "Skill name",
      "sample_answer": "Structured model answer highlighting architectural rationale, metrics, and best practices"
    }
  ],
  "behavioral": [
    {
      "question": "Behavioral question probing a real challenge relevant to candidate's background using the STAR format",
      "context": "Scenario context",
      "framework": "STAR",
      "key_points": ["Key Point 1", "Key Point 2"],
      "sample_answer": "Model STAR response (Situation, Task, Action, Result)"
    }
  ],
  "hr": [
    {
      "question": "HR / Culture question evaluating career goals and team collaboration",
      "intent": "What is evaluated",
      "tip": "How to answer"
    }
  ]
}`;

  if (geminiKeys.length > 0) {
    const result = await executeWithGeminiPool(prompt);
    if (result) return result;
  }

  if (openAIKeys.length > 0) {
    const result = await executeWithOpenAIPool(prompt);
    if (result) return result;
  }

  return null;
};

const evaluateAnswerWithAI = async ({ question, answer, jobTitle, category = 'technical', expectedKeywords = [], topic = '' }) => {
  const geminiKeys = getGeminiKeys();
  const openAIKeys = getOpenAIKeys();
  if (geminiKeys.length === 0 && openAIKeys.length === 0) return null;

  const prompt = `You are a Senior Hiring Lead evaluating a candidate's response during a mock interview for the role: ${jobTitle || 'Target Role'}.

INTERVIEW QUESTION:
${question}

TOPIC / DOMAIN:
${topic || category}

EXPECTED KEYWORDS / CONCEPTS:
${Array.isArray(expectedKeywords) ? expectedKeywords.join(', ') : 'Standard competencies'}

CANDIDATE SUBMITTED ANSWER:
${answer}

CRITICAL EVALUATION GUIDELINES:
1. Score the answer from 0 to 100 based on technical accuracy, structure, clarity, use of metrics, and relevance to ${jobTitle || 'the role'}.
2. Provide 2-3 specific strengths (what the candidate articulated well).
3. Provide 2-3 actionable improvement areas / missing gaps (e.g. edge cases, quantifiable outcomes, trade-offs, or STAR structure).
4. Provide an exemplary "improved_answer" showing how a Principal / Senior level candidate would structure this response.
5. Provide a quick coaching tip.

Respond ONLY with a valid, raw JSON object:
{
  "score": 85,
  "verdict": "Strong Answer",
  "strengths": [
    "Clear architectural overview and rationale",
    "Highlighted quantifiable outcome and trade-offs"
  ],
  "gaps": [
    "Did not mention automated testing safeguards or failure recovery",
    "Could specify exact scale or traffic volume"
  ],
  "improved_answer": "Model senior-level answer using strong active verbs, clear structure, and measurable outcomes.",
  "coaching_tip": "Focus on the 'Result' in STAR by stating the quantifiable business or system performance metric early."
}`;

  if (geminiKeys.length > 0) {
    const result = await executeWithGeminiPool(prompt);
    if (result) return result;
  }

  if (openAIKeys.length > 0) {
    const result = await executeWithOpenAIPool(prompt);
    if (result) return result;
  }

  return null;
};

const generateJobRecommendationsWithAI = async ({
  resumeText = '',
  jobTitle = 'Target Role',
  company = '',
  skills = [],
  missingSkills = [],
  region = 'bangladesh'
}) => {
  const geminiKeys = getGeminiKeys();
  const openAIKeys = getOpenAIKeys();

  if (geminiKeys.length === 0 && openAIKeys.length === 0) {
    return null;
  }

  const isBD = String(region).toLowerCase() !== 'abroad';

  const prompt = `You are a Principal Technical Career Strategist and Executive Hiring Partner.
Analyze this candidate's resume and generate 6 to 8 high-precision, realistic job recommendations that match their skillset, actual project achievements, and career trajectory.

TARGET REGION / MARKET:
${isBD ? 'BANGLADESH (First priority: Dhaka, Chittagong, Bangladesh Remote/Hybrid across top BD tech enterprises/startups like bKash, Brain Station 23, Optimizely BD, Pathao, Chaldal, Therap BD, ShopUp, Selise, Kona Software Lab, Kaz Software, BJIT, Augmedix)' : 'ABROAD / INTERNATIONAL (US, Europe, UK, Singapore, Canada, Dubai/UAE, Remote Worldwide across top global tech companies like Stripe, DataDog, Shopify, Cloudflare, Linear, Scale AI, Google, AWS, Gitlab)'}

CANDIDATE'S TARGET / RECENT ROLE:
${jobTitle || 'Target Role'} ${company ? `(Context: ${company})` : ''}

CANDIDATE'S IDENTIFIED SKILLS & TOOLS:
${Array.isArray(skills) && skills.length ? skills.join(', ') : 'Extract directly from resume text'}

CANDIDATE'S FULL RESUME TEXT:
${resumeText ? resumeText.slice(0, 4500) : 'Technical candidate profile with full stack and system design experience.'}

CRITICAL RULES:
1. STRICT ROLE TITLE ALIGNMENT: All 6 to 8 recommended job titles MUST directly match, specialize in, or represent seniorities/functions of the target role: "${jobTitle || 'Target Role'}".
   - If target role is "${jobTitle}", every recommendation MUST be directly in the "${jobTitle}" field. Never return generic software engineering or programming roles for non-coding positions like marketing, design, finance, sales, or HR.
2. If REGION is BANGLADESH:
   - Companies must be realistic employers in Bangladesh (e.g. bKash, Brain Station 23, Optimizely BD, Pathao, Chaldal, Therap BD, ShopUp, Selise, Daraz, 10 Minute School, Grameenphone, Augmedix, or international remote companies hiring in BD).
   - Locations: "Dhaka · Hybrid", "Dhaka · On-site", "Bangladesh · Remote", "Chittagong · On-site".
   - Salary ranges in BDT (e.g. "৳100,000 - ৳180,000 / mo" or "৳1,200,000 - ৳2,200,000 / yr") or USD for remote.
   - "job_url": must be a live LinkedIn Bangladesh search link: "https://www.linkedin.com/jobs/search/?keywords=" + encodeURIComponent(job_title) + "&location=Bangladesh"
3. If REGION is ABROAD:
   - Companies: modern reputable international employers relevant to ${jobTitle}.
   - Locations: "Remote · Worldwide", "San Francisco, CA · Hybrid", "London, UK · Hybrid", "Singapore · On-site", "Berlin, Germany · Remote".
   - Salary ranges in USD/EUR (e.g. "$130,000 - $185,000 / yr").
   - "job_url": must be a live LinkedIn search link: "https://www.linkedin.com/jobs/search/?keywords=" + encodeURIComponent(job_title) + "&location=Worldwide"
4. For each job recommendation object, provide:
   - "id": unique string (e.g. "job-ai-1")
   - "job_title": compelling title matching their skill tier
   - "company": modern high-reputation company name
   - "location": realistic location based on region
   - "region": "${isBD ? 'bangladesh' : 'abroad'}"
   - "work_type": "Full-time · Remote", "Full-time · Hybrid", or "Full-time · On-site"
   - "salary_range": realistic market compensation
   - "match_score": integer between 82 and 98 based on technical alignment
   - "match_rationale": 2 clear sentences explaining WHY the candidate's specific background (mentioning tools & achievements from their resume) makes them an ideal candidate.
   - "skills": array of 4-6 required skills/technologies that the candidate already has
   - "growth_skills": array of 1-2 complementary skills that would make them 100% competitive
   - "job_url": live LinkedIn search URL as specified above

Respond ONLY with a valid, raw JSON array of objects:
[
  {
    "id": "job-ai-1",
    "job_title": "Senior Software Engineer (${jobTitle})",
    "company": "${isBD ? 'bKash Limited' : 'Stripe'}",
    "location": "${isBD ? 'Dhaka · Hybrid' : 'Remote · Worldwide'}",
    "region": "${isBD ? 'bangladesh' : 'abroad'}",
    "work_type": "Full-time · Hybrid",
    "salary_range": "${isBD ? '৳120,000 - ৳180,000 / mo' : '$140,000 - $185,000 / yr'}",
    "match_score": 95,
    "match_rationale": "Your demonstrated track record building scalable web microservices and frontend architectures aligns directly with core system requirements.",
    "skills": ["React", "TypeScript", "Node.js", "Docker", "PostgreSQL"],
    "growth_skills": ["Kubernetes", "GraphQL"],
    "job_url": "https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}&location=${isBD ? 'Bangladesh' : 'Worldwide'}"
  }
]`;

  if (geminiKeys.length > 0) {
    const result = await executeWithGeminiPool(prompt);
    if (Array.isArray(result) && result.length > 0) return result;
    if (result && Array.isArray(result.recommendations)) return result.recommendations;
    if (result && Array.isArray(result.jobs)) return result.jobs;
  }

  if (openAIKeys.length > 0) {
    const result = await executeWithOpenAIPool(prompt);
    if (Array.isArray(result) && result.length > 0) return result;
    if (result && Array.isArray(result.recommendations)) return result.recommendations;
    if (result && Array.isArray(result.jobs)) return result.jobs;
  }

  return null;
};

const generateCoverLetterWithAI = async ({
  candidateName = 'Amina Rahman',
  jobTitle = 'Target Role',
  company = 'Hiring Team',
  resumeText = '',
  skills = [],
  location = ''
}) => {
  const geminiKeys = getGeminiKeys();
  const openAIKeys = getOpenAIKeys();

  if (geminiKeys.length === 0 && openAIKeys.length === 0) {
    return null;
  }

  const prompt = `You are a Principal Executive Recruiter and Career Advisor at MatchPoint AI.
Write an authentic, highly compelling 3-paragraph tailored cover letter for this candidate applying to "${jobTitle}" at "${company}".

CANDIDATE NAME: ${candidateName || 'Candidate'}
TARGET ROLE: ${jobTitle}
TARGET COMPANY: ${company} ${location ? `(${location})` : ''}
CORE SKILLS & TOOLS: ${Array.isArray(skills) && skills.length ? skills.join(', ') : 'Relevant domain competencies'}
CANDIDATE RESUME SUMMARY:
${resumeText ? resumeText.slice(0, 4000) : 'Experienced candidate with proven delivery and measurable project achievements.'}

GUIDELINES:
1. Paragraph 1: Powerful hook expressing excitement for the specific role at ${company}, concisely introducing the candidate's core domain superpower.
2. Paragraph 2: Two concrete achievements citing tools and quantifiable impact from the candidate's background that directly solve challenges for ${company}.
3. Paragraph 3: Forward-looking closing reiterating value proposition, cultural alignment, and a confident call to action for an interview.
4. Keep the tone professional, confident, modern, and engaging (not generic or clichéd).

Respond ONLY with a valid, raw JSON object:
{
  "subject_line": "Application for ${jobTitle} - ${candidateName}",
  "hiring_manager_hook": "Why I am excited to drive impact at ${company}",
  "cover_letter": "Dear Hiring Team at ${company},\\n\\n...",
  "key_highlights": [
    "Highlight 1 referencing proven metrics",
    "Highlight 2 referencing core stack and ownership"
  ]
}`;

  if (geminiKeys.length > 0) {
    const result = await executeWithGeminiPool(prompt);
    if (result && result.cover_letter) return result;
  }

  if (openAIKeys.length > 0) {
    const result = await executeWithOpenAIPool(prompt);
    if (result && result.cover_letter) return result;
  }

  return null;
};

const generateInterviewReadinessReportWithAI = async ({
  candidateName = 'Candidate',
  jobTitle = 'Target Role',
  questions = [],
  answers = {}
}) => {
  const geminiKeys = getGeminiKeys();
  const openAIKeys = getOpenAIKeys();

  if (geminiKeys.length === 0 && openAIKeys.length === 0) {
    return null;
  }

  const answeredCount = Object.keys(answers).length;
  const prompt = `You are an Executive Hiring Director and Bar Raiser at MatchPoint AI.
Evaluate this candidate's overall interview performance across their answered mock interview questions for the role: "${jobTitle}".

CANDIDATE: ${candidateName}
TARGET ROLE: ${jobTitle}
QUESTIONS AND CANDIDATE RESPONSES:
${JSON.stringify({ questions, answers }, null, 2)}

Provide a comprehensive hiring readiness scorecard.
Respond ONLY with a valid, raw JSON object:
{
  "readiness_score": 88,
  "verdict": "Strong Hire",
  "verdict_summary": "Demonstrated consistent STAR structure with clear technical articulation and quantifiable outcomes.",
  "metrics": {
    "star_structure_score": 90,
    "technical_depth_score": 87,
    "communication_clarity_score": 88,
    "confidence_rating_score": 86
  },
  "top_strengths": [
    "Specific strength with examples from responses",
    "Effective problem-solving methodology shown"
  ],
  "areas_to_polish": [
    "Actionable tip to make answers even more concise",
    "Suggested metric or framework to mention"
  ],
  "questions_completed": ${answeredCount}
}`;

  if (geminiKeys.length > 0) {
    const result = await executeWithGeminiPool(prompt);
    if (result && result.readiness_score) return result;
  }

  if (openAIKeys.length > 0) {
    const result = await executeWithOpenAIPool(prompt);
    if (result && result.readiness_score) return result;
  }

  return null;
};

module.exports = {
  isAIConfigured,
  getAIClient,
  getGeminiKeys,
  getOpenAIKeys,
  analyzeResumeWithAI,
  generateInterviewQuestionsWithAI,
  evaluateAnswerWithAI,
  generateJobRecommendationsWithAI,
  generateCoverLetterWithAI,
  generateInterviewReadinessReportWithAI
};
