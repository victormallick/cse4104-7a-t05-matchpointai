const { randomUUID } = require('crypto');
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const {
  DEMO_USER_ID,
  interviewQuestions,
  now,
  store
} = require('../data/demoData');
const {
  isAIConfigured,
  analyzeResumeWithAI
} = require('../services/aiService');

const KEYWORDS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Express',
  'REST APIs',
  'GraphQL',
  'PostgreSQL',
  'Supabase',
  'Docker',
  'Kubernetes',
  'CI/CD',
  'Redis',
  'Jest',
  'Unit Testing',
  'Agile',
  'AWS',
  'Git'
];

const SKILL_MAP = {
  // Software / Tech
  Docker: 'Containerization & Docker',
  Kubernetes: 'Container Orchestration & Kubernetes',
  'CI/CD': 'CI/CD Pipeline Automation',
  Jest: 'Automated Unit & Integration Testing',
  'Unit Testing': 'Test-Driven Development (TDD)',
  AWS: 'Cloud Infrastructure & AWS',
  Redis: 'Distributed In-Memory Caching',
  GraphQL: 'GraphQL API Design & Schemas',
  PostgreSQL: 'Relational Database Optimization',
  TypeScript: 'Type-Safe Application Architecture',
  React: 'Component State & React Architecture',
  'Node.js': 'Node.js Backend Architecture',
  Python: 'Python Backend & Scripting',
  FastAPI: 'Asynchronous API Development',
  Microservices: 'Distributed Systems & Microservices',
  Git: 'Distributed Version Control & GitFlow',
  Agile: 'Agile/Scrum Sprint Delivery',

  // Marketing & Growth
  SEO: 'Search Engine Optimization (SEO)',
  'Google Ads': 'Paid Search Advertising (Google Ads)',
  PPC: 'Paid Search & Bidding Strategies (PPC)',
  'Meta Ads': 'Social Media Paid Advertising (Meta Ads)',
  HubSpot: 'Marketing Automation & Inbound (HubSpot)',
  GA4: 'Google Analytics 4 & Web Attribution',
  CRO: 'Conversion Rate Optimization (CRO)',
  ROAS: 'Campaign ROI & ROAS Optimization',
  Marketing: 'Multi-Channel Growth Strategy',

  // HR & People Ops
  'Talent Acquisition': 'Full-Cycle Talent Sourcing & Recruiting',
  HRIS: 'HR Information Systems (HRIS)',
  BambooHR: 'HRIS Administration (BambooHR)',
  Workday: 'Enterprise HRIS (Workday)',
  FMLA: 'Employment Law & Labor Compliance (FMLA)',
  Benefits: 'Total Rewards & Benefits Administration',
  DEI: 'Diversity, Equity & Inclusion (DEI)',
  Generalist: 'Strategic Human Resources Operations',

  // Finance & Accounting
  'Financial Modeling': 'Three-Statement Financial Modeling',
  DCF: 'Discounted Cash Flow (DCF) Valuation',
  'FP&A': 'Financial Planning & Forecasting (FP&A)',
  'Variance Analysis': 'Budget vs. Actual Variance Analysis',
  Excel: 'Advanced Spreadsheet Modeling (Excel)',
  VBA: 'Spreadsheet Macro Automation (VBA)',
  SQL: 'Financial Data Querying (SQL)',
  'Power BI': 'Financial Dashboarding & Reporting (Power BI)',
  CapEx: 'Capital Allocation & CapEx Budgeting'
};

const deriveSkillPhrase = (keyword) => {
  if (SKILL_MAP[keyword]) return SKILL_MAP[keyword];

  const lower = keyword.toLowerCase();
  for (const [key, val] of Object.entries(SKILL_MAP)) {
    if (key.toLowerCase() === lower || lower.includes(key.toLowerCase())) {
      return val;
    }
  }

  if (lower.includes('project') || lower.includes('management')) {
    return 'Project & Delivery Management';
  }
  if (lower.includes('problem') || lower.includes('solving')) {
    return 'Problem Solving & Analytical Thinking';
  }
  if (lower.includes('communicat')) {
    return 'Stakeholder Communication & Alignment';
  }

  if (keyword.length <= 4 && keyword === keyword.toUpperCase()) {
    return `${keyword} Strategy & Implementation`;
  }

  if (/management|strategy|systems|analytics|development|design|testing|architecture/i.test(keyword)) {
    return `${keyword} & Execution`;
  }

  if (/^[A-Z]/.test(keyword)) {
    return `${keyword} Best Practices`;
  }

  return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Proficiency`;
};

const getRoleBasedSkills = (jobTitle = '') => {
  const t = jobTitle.toLowerCase();
  if (t.includes('market') || t.includes('growth') || t.includes('seo') || t.includes('brand')) {
    return ['Conversion Rate Optimization', 'Audience Growth Strategy', 'Multi-Channel Campaign Analytics'];
  }
  if (t.includes('hr') || t.includes('human') || t.includes('talent') || t.includes('recruit') || t.includes('people')) {
    return ['Strategic Talent Sourcing', 'Performance Management Frameworks', 'Labor Law & Compliance Standards'];
  }
  if (t.includes('financ') || t.includes('account') || t.includes('audit') || t.includes('tax') || t.includes('fp&a') || t.includes('analyst')) {
    return ['Financial Forecasting & FP&A', 'Quantitative Risk Assessment', 'Executive Financial Reporting'];
  }
  if (t.includes('design') || t.includes('ux') || t.includes('ui')) {
    return ['Design Systems Scalability', 'User Research & Prototyping', 'Usability Testing & Journey Mapping'];
  }
  if (t.includes('data') || t.includes('ai') || t.includes('ml')) {
    return ['Statistical Hypothesis Testing', 'Machine Learning Pipelines', 'Data Quality & Feature Engineering'];
  }
  if (t.includes('junior') || t.includes('intern')) {
    return ['Production Code Quality', 'Automated Testing Coverage', 'Version Control & Workflows'];
  }
  if (t.includes('dev') || t.includes('engineer') || t.includes('software') || t.includes('frontend') || t.includes('backend')) {
    return ['System Architecture & Scalability', 'Automated Testing & QA', 'CI/CD Pipeline Security'];
  }
  return ['Strategic Project Delivery', 'Cross-Functional Collaboration', 'KPI & Impact Measurement'];
};

const aliases = {
  'Node.js': ['node.js', 'nodejs', 'node '],
  'REST APIs': ['rest api', 'restful'],
  'CI/CD': ['ci/cd', 'continuous integration', 'continuous delivery'],
  'Unit Testing': ['unit test', 'unit testing']
};

const containsKeyword = (text, keyword) => {
  if (keyword === 'REST APIs' || keyword === 'REST') {
    return /\brestful\b/i.test(text) || /\brest\s+apis?\b/i.test(text) || (/\bREST\b/.test(text) && !/\brest\s+(for|the|in|your|dough)\b/i.test(text));
  }
  if (keyword === 'CI/CD') {
    return /ci\/cd|continuous integration|continuous delivery/i.test(text);
  }
  if (keyword.length <= 4 && keyword === keyword.toUpperCase()) {
    const regex = new RegExp(`\\b${keyword}\\b`);
    return regex.test(text);
  }
  const candidates = aliases[keyword] || [keyword.toLowerCase()];
  return candidates.some((candidate) => text.toLowerCase().includes(candidate));
};

const NON_RESUME_KEYWORDS = [
  'renewable energy', 'solar panel', 'wind turbine', 'fossil fuel', 'greenhouse gas',
  'climate change', 'recipe', 'tablespoon', 'teaspoon', 'preheat oven', 'ingredients',
  'invoice #', 'bill to:', 'subtotal', 'due date', 'academic journal', 'doi:',
  'bibliography', 'et al.', 'abstract:', 'in this article', 'scientific study'
];

const checkIsResume = (text = '', fileName = '') => {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  const lowerFile = (fileName || '').toLowerCase();

  // If the file name itself flags article / recipe / invoice
  if (
    lowerFile.includes('article') ||
    lowerFile.includes('recipe') ||
    lowerFile.includes('invoice') ||
    lowerFile.includes('essay') ||
    lowerFile.includes('paper')
  ) {
    return false;
  }

  // Check for strong non-resume indicators
  let nonResumeHits = 0;
  for (const phrase of NON_RESUME_KEYWORDS) {
    if (lower.includes(phrase)) nonResumeHits++;
  }
  if (nonResumeHits >= 2) {
    return false;
  }

  // Must check for explicit candidate structural sections:
  const hasExperience = /\b(work\s+experience|professional\s+experience|employment\s+history|career\s+history|experience\s+summary)\b/i.test(text) ||
    (/\b(experience|employment|work)\b/i.test(text) && /\b(responsibilities|achieved|managed|developed|led|engineered|built)\b/i.test(text));

  const hasEducation = /\b(education|academic|university|bachelor|master|phd|degree|graduated|diploma|gpa)\b/i.test(text);

  const hasSkills = /\b(skills|technical\s+skills|core\s+competencies|technologies|proficiencies|tools\s+&\s+technologies)\b/i.test(text);

  const hasContact = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text) ||
    /\b(github\.com|linkedin\.com)\b/i.test(text) ||
    /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text);

  // Score structural elements
  let resumeScore = 0;
  if (hasExperience) resumeScore += 2;
  if (hasEducation) resumeScore += 2;
  if (hasSkills) resumeScore += 2;
  if (hasContact) resumeScore += 1;
  if (/\b(curriculum\s+vitae|resume)\b/i.test(text)) resumeScore += 2;

  return resumeScore >= 4;
};

const extractDynamicKeywords = (jdText) => {
  const clean = (jdText || '').replace(/[^a-zA-Z0-9\+\#\/\.\-\s]/g, ' ');
  const rawTokens = clean.split(/\s+/).filter((w) => w.length > 2);
  
  const stopWords = new Set([
    'and', 'the', 'for', 'with', 'you', 'are', 'looking', 'seeking', 'strong', 'experience',
    'experienced', 'role', 'team', 'work', 'working', 'build', 'building', 'years', 'hiring',
    'responsible', 'responsibility', 'skills', 'ability', 'must', 'have', 'from', 'into',
    'across', 'will', 'our', 'their', 'about', 'join', 'opportunity', 'company', 'candidate',
    'such', 'that', 'this', 'help', 'plus', 'need', 'well', 'high', 'both', 'good', 'ideal',
    'skilled', 'proficient', 'proficiency', 'proven', 'using', 'knowledge', 'hands-on'
  ]);

  const extracted = [];
  for (const raw of rawTokens) {
    const token = raw.replace(/^[.\-_,/]+|[.\-_,/]+$/g, '');
    if (token.length < 2) continue;
    const lower = token.toLowerCase();
    if (!stopWords.has(lower) && !extracted.some((e) => e.toLowerCase() === lower)) {
      extracted.push(token);
    }
  }
  return extracted.slice(0, 15);
};

const getRoleDefaultKeywords = (jobTitle = '') => {
  const t = (jobTitle || '').toLowerCase();
  if (t.includes('hr') || t.includes('human') || t.includes('talent') || t.includes('recruit') || t.includes('people')) {
    return ['Talent Acquisition', 'HRIS', 'Employee Relations', 'Labor Compliance', 'Benefits', 'Onboarding', 'Performance Management', 'Communication'];
  }
  if (t.includes('market') || t.includes('growth') || t.includes('seo') || t.includes('brand') || t.includes('content')) {
    return ['SEO', 'Google Ads', 'Meta Ads', 'GA4', 'HubSpot', 'CRO', 'Content Strategy', 'Campaign Analytics', 'ROI'];
  }
  if (t.includes('financ') || t.includes('account') || t.includes('audit') || t.includes('tax') || t.includes('fp&a') || t.includes('analyst')) {
    return ['Financial Modeling', 'FP&A', 'Variance Analysis', 'Excel VBA', 'Budgeting', 'SQL', 'DCF', 'Forecasting'];
  }
  if (t.includes('design') || t.includes('ux') || t.includes('ui') || t.includes('product designer')) {
    return ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Wireframing', 'Usability Testing'];
  }
  if (t.includes('data') || t.includes('ai') || t.includes('ml')) {
    return ['Python', 'SQL', 'Machine Learning', 'Data Pipelines', 'Pandas', 'Statistical Modeling'];
  }
  // Tech / Software default
  return ['React', 'TypeScript', 'JavaScript', 'Node.js', 'REST APIs', 'Docker', 'CI/CD', 'Git', 'Agile'];
};

const extractResumeBullets = (resumeText = '') => {
  const lines = String(resumeText).split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 20);
  const candidates = [];
  for (const line of lines) {
    const clean = line.replace(/^[•\-\*\d\.\)\s]+/, '').trim();
    if (clean.length >= 25 && clean.length <= 250 && /^[A-Z]/.test(clean)) {
      if (!/^(experience|education|skills|summary|projects|certifications|awards|contact|curriculum|resume|profile)/i.test(clean)) {
        candidates.push(clean);
      }
    }
  }
  return candidates;
};

const getRoleBulletRewrites = (jobTitle = '', resumeText = '') => {
  const t = (jobTitle || '').toLowerCase();
  const rawBullets = extractResumeBullets(resumeText);
  const candidateOriginal1 = rawBullets[0] || 'Managed daily operational responsibilities and assisted team deliverables.';
  const candidateOriginal2 = rawBullets[1] || 'Collaborated with team members to resolve workflow bottlenecks and track metrics.';

  if (t.includes('hr') || t.includes('human') || t.includes('talent') || t.includes('recruit') || t.includes('people')) {
    return [
      {
        original: candidateOriginal1,
        improved: `Streamlined core HR workflows and administered talent initiatives, improving process efficiency by 35% and boosting team alignment.`,
        reason: 'Transforms generic task descriptions into proactive, quantified operational impact.'
      },
      {
        original: candidateOriginal2,
        improved: `Partnered with departmental leaders to resolve organizational bottlenecks, achieving 100% policy compliance across teams.`,
        reason: 'Demonstrates cross-functional collaboration and leadership accountability.'
      }
    ];
  }
  if (t.includes('market') || t.includes('growth') || t.includes('seo') || t.includes('brand') || t.includes('content')) {
    return [
      {
        original: candidateOriginal1,
        improved: `Architected targeted growth campaigns and optimized key conversion funnels, driving a 38% increase in qualified pipeline and lowering acquisition costs.`,
        reason: 'Connects tactical marketing execution to quantifiable business growth and ROI.'
      },
      {
        original: candidateOriginal2,
        improved: `Leveraged data analytics to optimize campaign performance, boosting audience engagement rates by 26%.`,
        reason: 'Highlights data-driven decision making and performance optimization.'
      }
    ];
  }
  if (t.includes('financ') || t.includes('account') || t.includes('audit') || t.includes('tax') || t.includes('fp&a') || t.includes('analyst')) {
    return [
      {
        original: candidateOriginal1,
        improved: `Built financial models and monthly variance analyses, identifying $1.2M in cost-saving opportunities and improving budget forecasting accuracy by 24%.`,
        reason: 'Quantifies portfolio scope and connects financial modeling directly to bottom-line results.'
      },
      {
        original: candidateOriginal2,
        improved: `Automated recurring reporting workflows using advanced Excel and SQL, saving 6+ hours of manual compilation per cycle.`,
        reason: 'Emphasizes reporting automation and operational time savings.'
      }
    ];
  }
  if (t.includes('design') || t.includes('ux') || t.includes('ui') || t.includes('product designer')) {
    return [
      {
        original: candidateOriginal1,
        improved: `Overhauled responsive UI component library, reducing design handoff friction by 40% and improving user task completion rates.`,
        reason: 'Highlights design system scale and user task efficiency.'
      }
    ];
  }
  // Software / Tech
  return [
    {
      original: candidateOriginal1,
      improved: `Engineered scalable production features and optimized critical workflows, improving reliability and performance by 32%.`,
      reason: 'Uses active engineering verbs and highlights measurable system performance.'
    },
    {
      original: candidateOriginal2,
      improved: `Collaborated across engineering teams to streamline deployment pipelines, reducing release turnaround times.`,
      reason: 'Connects software development to modern engineering best practices.'
    }
  ];
};

const buildAnalysis = ({ resumeText, jdText = '', jobTitle = 'Target Role', company = '', fileName = '' }) => {
  const normalizedResume = resumeText.toLowerCase();
  const normalizedJd = (jdText || '').toLowerCase();
  const hasJd = Boolean(jdText && jdText.trim().length >= 10);
  
  let requiredKeywords;
  if (hasJd) {
    const dynamicJdKeywords = extractDynamicKeywords(jdText);
    const staticMatches = KEYWORDS.filter((keyword) => containsKeyword(normalizedJd, keyword));
    requiredKeywords = [...new Set([...staticMatches, ...dynamicJdKeywords])];
  } else {
    // Role-specific General ATS Quality Audit
    const roleKeywords = getRoleDefaultKeywords(jobTitle);
    const resumeTechMatches = KEYWORDS.filter((kw) => containsKeyword(resumeText, kw));
    requiredKeywords = [...new Set([
      ...roleKeywords,
      ...resumeTechMatches.slice(0, 5),
      'Communication',
      'Problem Solving'
    ])];
  }

  if (requiredKeywords.length < 5) {
    requiredKeywords = [...new Set([...requiredKeywords, 'Communication', 'Project Management', 'Problem Solving'])];
  }

  const isValidResume = checkIsResume(resumeText, fileName);

  if (!isValidResume) {
    return {
      is_valid_resume: false,
      document_warning: 'Non-resume document detected (e.g. article, research paper, essay, or recipe). The uploaded file does not contain candidate work experience, skills, or education sections. ATS score is 0%.',
      ats_score: 0,
      matched_keywords: [],
      missing_keywords: requiredKeywords.slice(0, 8),
      missing_skills: ['Candidate Work History Required', 'Relevant Role Competencies Required'],
      improvement_suggestions: [
        {
          title: 'Upload a Valid Candidate Resume / CV',
          detail: 'MatchPoint AI analyzes resume sections such as Work Experience, Technical Skills, and Education. Please upload a standard PDF or DOCX resume.'
        },
        {
          title: 'Ensure Standard Resume Structure',
          detail: 'Include clear headings for Professional Experience, Core Competencies, and Education.'
        },
        {
          title: 'Target Role Alignment',
          detail: `Ensure your document highlights competencies aligned with ${jobTitle || 'the target position'}.`
        }
      ],
      improved_bullets: [],
      summary: `Excluded from ATS Scoring: The uploaded document ('${fileName || 'Uploaded File'}') does not appear to be a candidate resume or CV. No professional qualifications or relevant work experience were detected for ${jobTitle || 'this role'}. Please upload a genuine resume.`
    };
  }

  const matchedKeywords = requiredKeywords.filter((keyword) =>
    containsKeyword(resumeText, keyword)
  );
  const missingKeywords = requiredKeywords.filter((keyword) =>
    !containsKeyword(resumeText, keyword)
  );

  const coverage = matchedKeywords.length / Math.max(requiredKeywords.length, 1);
  const detailBonus = Math.min(Math.floor(resumeText.length / 500), 10);
  const atsScore = Math.max(40, Math.min(96, Math.round(coverage * 60 + detailBonus + 28)));
  const summary = hasJd
    ? `Your resume is a ${atsScore >= 75 ? 'strong' : 'promising'} match for ${jobTitle || 'this role'}${company ? ` at ${company}` : ''}. Add evidence for highlighted gaps to improve ATS alignment.`
    : `General ATS Resume Audit: Your resume exhibits strong structure and relevant competencies for ${jobTitle || 'your field'}. Add quantifiable achievements and project metrics to maximize recruiter impact.`;

  let missingSkills = missingKeywords
    .map((keyword) => deriveSkillPhrase(keyword))
    .filter(Boolean);

  if (missingSkills.length < 3) {
    const roleFallbacks = getRoleBasedSkills(jobTitle);
    missingSkills = [...new Set([...missingSkills, ...roleFallbacks])];
  }
  missingSkills = missingSkills.slice(0, 4);

  const improvementSuggestions = [
    {
      title: 'Quantify your impact',
      detail: 'Add measurable outcomes such as time saved, performance gains, team size managed, or budget optimized.'
    },
    {
      title: 'Mirror target competency phrasing',
      detail: `Incorporate standard industry terminology for ${jobTitle || 'your target role'} naturally across your experience bullets.`
    },
    {
      title: 'Strengthen focus skill evidence',
      detail: `Add quantifiable project bullet points demonstrating hands-on experience in ${missingSkills.slice(0, 2).join(' and ')}.`
    }
  ];

  const improvedBullets = getRoleBulletRewrites(jobTitle, resumeText);

  return {
    is_valid_resume: true,
    document_warning: null,
    ats_score: atsScore,
    matched_keywords: matchedKeywords,
    missing_keywords: missingKeywords,
    missing_skills: [...new Set(missingSkills)].slice(0, 4),
    improvement_suggestions: improvementSuggestions,
    improved_bullets: improvedBullets,
    summary
  };
};

const runGapAnalysis = async (req, res) => {
  try {
    const {
      resume_id: resumeId,
      resume_text: providedResumeText,
      jd_text: rawJdText = '',
      job_title: rawJobTitle = '',
      company: rawCompany = ''
    } = req.body;
    const userId = req.body.user_id || req.user?.id || DEMO_USER_ID;

    const jdText = typeof rawJdText === 'string' ? rawJdText.trim() : '';
    const jobTitle = (typeof rawJobTitle === 'string' && rawJobTitle.trim()) || 'Target Role';
    const company = (typeof rawCompany === 'string' && rawCompany.trim()) || '';

    let resumeText = providedResumeText;

    if (!resumeText && !resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Provide a resume_id from the upload API or include resume_text.'
      });
    }

    let fileName = req.body.file_name || '';

    if (!resumeText && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('resumes')
          .select('parsed_text, file_path')
          .eq('id', resumeId)
          .single();

        if (data && data.parsed_text) {
          resumeText = data.parsed_text;
          if (data.file_path) fileName = data.file_path;
        }
      } catch (err) {
        console.warn('Supabase resume fetch fallback:', err.message);
      }
    }

    if (!resumeText) {
      const stored = store.resumes.get(resumeId);
      resumeText = stored?.parsed_text;
      if (stored?.file_path) fileName = stored.file_path;
    }

    if (!resumeText) {
      return res.status(404).json({
        success: false,
        message: 'The uploaded resume could not be found. Upload it again and retry.'
      });
    }

    let result = null;
    if (isAIConfigured()) {
      result = await analyzeResumeWithAI({
        resumeText: String(resumeText),
        jdText: String(jdText),
        jobTitle: String(jobTitle).trim(),
        company: String(company).trim(),
        fileName: String(fileName).trim()
      });
    }

    if (!result) {
      result = buildAnalysis({
        resumeText: String(resumeText),
        jdText: String(jdText),
        jobTitle: String(jobTitle).trim(),
        company: String(company).trim(),
        fileName: String(fileName).trim()
      });
    } else {
      if (!result.summary && result.match_summary) {
        result.summary = result.match_summary;
      }
    }
    const analysisId = randomUUID();
    const analyzedAt = now();
    let jobDescriptionId = null;

    let savedInSupabase = false;
    if (isSupabaseConfigured) {
      try {
        const { data: jobDescription, error: jobError } = await supabase
          .from('job_descriptions')
          .insert([
            {
              user_id: userId,
              title: jobTitle,
              company,
              jd_text: jdText
            }
          ])
          .select()
          .single();

        if (!jobError && jobDescription) {
          jobDescriptionId = jobDescription.id;
          const { data: savedAnalysis, error: analysisError } = await supabase
            .from('analysis_records')
            .insert([
              {
                user_id: userId,
                resume_id: resumeId || null,
                jd_id: jobDescriptionId,
                ats_score: result.ats_score,
                missing_keywords: result.missing_keywords,
                missing_skills: result.missing_skills,
                improved_bullets: result.improved_bullets
              }
            ])
            .select()
            .single();

          if (!analysisError && savedAnalysis) {
            result.analysis_id = savedAnalysis.id;
            result.analyzed_at = savedAnalysis.analyzed_at;
            savedInSupabase = true;
          }
        }
      } catch (dbErr) {
        console.warn('Supabase analysis insert fallback:', dbErr.message);
      }
    }

    const record = {
      analysis_id: result.analysis_id || analysisId,
      user_id: userId,
      resume_id: resumeId || null,
      job_title: jobTitle,
      company,
      resume_text: resumeText,
      jd_text: jdText,
      ...result,
      analyzed_at: result.analyzed_at || analyzedAt
    };
    store.analyses.set(record.analysis_id, record);
    store.history.unshift(record);

    return res.status(200).json({
      success: true,
      message: isSupabaseConfigured
        ? 'Resume analysis completed successfully.'
        : 'Resume analysis completed with the local demo engine.',
      data: {
        user_id: userId,
        resume_id: resumeId || null,
        job_description_id: jobDescriptionId,
        job_title: jobTitle,
        company,
        resume_text: resumeText,
        jd_text: jdText,
        ...result,
        interview_preview: {
          technical: interviewQuestions.technical.slice(0, 1),
          behavioral: interviewQuestions.behavioral.slice(0, 1)
        },
        analysis_mode: process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY
          ? 'ai-ready'
          : 'demo'
      }
    });
  } catch (error) {
    console.error('Gap analysis controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Resume analysis could not be completed.'
    });
  }
};

module.exports = {
  runGapAnalysis,
  buildAnalysis
};
