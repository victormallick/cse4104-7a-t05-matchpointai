const { randomUUID } = require('crypto');
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const {
  DEMO_USER_ID,
  interviewQuestions,
  now,
  store
} = require('../data/demoData');

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
  Docker: 'Containerization',
  Kubernetes: 'Container orchestration',
  'CI/CD': 'Deployment automation',
  Jest: 'Automated testing',
  'Unit Testing': 'Test-driven development',
  AWS: 'Cloud infrastructure',
  Redis: 'Distributed caching',
  GraphQL: 'GraphQL API design',
  PostgreSQL: 'Relational database design',
  TypeScript: 'Type-safe application development'
};

const aliases = {
  'Node.js': ['node.js', 'nodejs', 'node '],
  'REST APIs': ['rest api', 'restful'],
  'CI/CD': ['ci/cd', 'continuous integration', 'continuous delivery'],
  'Unit Testing': ['unit test', 'unit testing']
};

const containsKeyword = (text, keyword) => {
  const candidates = aliases[keyword] || [keyword.toLowerCase()];
  return candidates.some((candidate) => text.includes(candidate));
};

const buildAnalysis = ({ resumeText, jdText, jobTitle, company }) => {
  const normalizedResume = resumeText.toLowerCase();
  const normalizedJd = jdText.toLowerCase();
  let requiredKeywords = KEYWORDS.filter((keyword) => containsKeyword(normalizedJd, keyword));

  if (requiredKeywords.length < 5) {
    requiredKeywords = [...new Set([...requiredKeywords, 'Docker', 'CI/CD', 'Jest', 'Agile', 'Git'])];
  }

  const matchedKeywords = requiredKeywords.filter((keyword) =>
    containsKeyword(normalizedResume, keyword)
  );
  let missingKeywords = requiredKeywords.filter((keyword) =>
    !containsKeyword(normalizedResume, keyword)
  );

  if (missingKeywords.length < 3) {
    const fallback = ['Docker', 'CI/CD', 'GraphQL', 'Jest', 'Agile'];
    missingKeywords = [...new Set([...missingKeywords, ...fallback])].slice(0, 5);
  } else {
    missingKeywords = missingKeywords.slice(0, 6);
  }

  const coverage = matchedKeywords.length / Math.max(requiredKeywords.length, 1);
  const detailBonus = Math.min(Math.floor(resumeText.length / 700), 5);
  const atsScore = Math.max(58, Math.min(94, Math.round(62 + coverage * 27 + detailBonus)));
  const missingSkills = missingKeywords
    .map((keyword) => SKILL_MAP[keyword])
    .filter(Boolean)
    .slice(0, 4);

  if (missingSkills.length < 3) {
    missingSkills.push('Cloud monitoring', 'API testing', 'Deployment automation');
  }

  const improvementSuggestions = [
    {
      title: 'Quantify your impact',
      detail: 'Add measurable outcomes such as delivery time, performance gains, users served, or defects reduced.'
    },
    {
      title: 'Mirror the target role',
      detail: `Use the language of the ${jobTitle || 'target role'} description naturally in your experience bullets.`
    },
    {
      title: 'Strengthen the skills section',
      detail: `Group relevant tools and add evidence for ${missingKeywords.slice(0, 2).join(' and ')} where accurate.`
    }
  ];

  const improvedBullets = [
    {
      original: 'Worked on frontend features and fixed bugs.',
      improved: 'Delivered responsive React features and resolved high-priority defects, improving release quality and user experience.',
      reason: 'Uses strong action verbs and describes the result of the work.'
    },
    {
      original: 'Helped deploy the application.',
      improved: 'Collaborated on an automated CI/CD workflow for reliable application testing and deployment.',
      reason: 'Connects the experience to an important target-job keyword.'
    }
  ];

  return {
    ats_score: atsScore,
    matched_keywords: matchedKeywords,
    missing_keywords: missingKeywords,
    missing_skills: [...new Set(missingSkills)].slice(0, 4),
    improvement_suggestions: improvementSuggestions,
    improved_bullets: improvedBullets,
    summary: `Your resume is a promising match for ${jobTitle || 'this role'}${company ? ` at ${company}` : ''}. Add evidence for the highlighted gaps to improve ATS alignment.`
  };
};

const runGapAnalysis = async (req, res) => {
  try {
    const {
      resume_id: resumeId,
      resume_text: providedResumeText,
      jd_text: jdText,
      job_title: jobTitle = 'Software Engineer',
      company = 'Target Company'
    } = req.body;
    const userId = req.body.user_id || req.user?.id || DEMO_USER_ID;

    if (!jdText || String(jdText).trim().length < 30) {
      return res.status(400).json({
        success: false,
        message: 'Provide a job description containing at least 30 characters.'
      });
    }

    let resumeText = providedResumeText;

    if (!resumeText && !resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Provide a resume_id from the upload API or include resume_text.'
      });
    }

    if (!resumeText && !isSupabaseConfigured) {
      resumeText = store.resumes.get(resumeId)?.parsed_text;
    }

    if (!resumeText && isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('resumes')
        .select('parsed_text')
        .eq('id', resumeId)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          message: 'The uploaded resume could not be found.'
        });
      }
      resumeText = data.parsed_text;
    }

    if (!resumeText) {
      return res.status(404).json({
        success: false,
        message: 'The uploaded resume could not be found. Upload it again and retry.'
      });
    }

    const result = buildAnalysis({
      resumeText: String(resumeText),
      jdText: String(jdText),
      jobTitle: String(jobTitle).trim(),
      company: String(company).trim()
    });
    const analysisId = randomUUID();
    const analyzedAt = now();
    let jobDescriptionId = null;

    if (isSupabaseConfigured) {
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

      if (jobError) {
        return res.status(500).json({
          success: false,
          message: `Job description could not be saved: ${jobError.message}`
        });
      }

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

      if (analysisError) {
        return res.status(500).json({
          success: false,
          message: `Analysis could not be saved: ${analysisError.message}`
        });
      }

      result.analysis_id = savedAnalysis.id;
      result.analyzed_at = savedAnalysis.analyzed_at;
    } else {
      const record = {
        analysis_id: analysisId,
        user_id: userId,
        resume_id: resumeId || null,
        job_title: jobTitle,
        company,
        ...result,
        analyzed_at: analyzedAt
      };
      store.analyses.set(analysisId, record);
      store.history.unshift(record);
      result.analysis_id = analysisId;
      result.analyzed_at = analyzedAt;
    }

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
