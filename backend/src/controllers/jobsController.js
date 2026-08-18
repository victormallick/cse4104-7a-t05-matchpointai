const { randomUUID } = require('crypto');
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { DEMO_USER_ID, jobRecommendations, store } = require('../data/demoData');
const { isAIConfigured, generateJobRecommendationsWithAI, generateCoverLetterWithAI } = require('../services/aiService');

const getDomainProfile = (jobTitle = '', resumeText = '', providedSkills = []) => {
  const t = (jobTitle || '').toLowerCase();
  const r = (resumeText || '').toLowerCase();

  // 1. Digital Marketing / Growth / SEO / Social Media
  if (
    t.includes('market') || t.includes('growth') || t.includes('seo') || t.includes('digital') ||
    t.includes('content') || t.includes('social media') || t.includes('brand') || t.includes('ppc') ||
    r.includes('seo') || r.includes('google ads') || r.includes('meta ads') || r.includes('growth marketing') || r.includes('conversion rate')
  ) {
    const defaultSkills = [
      'Search Engine Optimization (SEO)', 'Meta & Google Ads (PPC)', 'Google Analytics 4 (GA4)',
      'Conversion Rate Optimization (CRO)', 'Content Strategy & Copywriting', 'Email Marketing (Klaviyo/HubSpot)',
      'Social Media Brand Strategy', 'Performance Marketing', 'A/B Testing & Funnel Attribution'
    ];
    const skills = Array.isArray(providedSkills) && providedSkills.length > 0
      ? providedSkills.filter(s => !['React', 'Node.js', 'Docker', 'Kubernetes'].includes(s))
      : defaultSkills;

    return {
      domain: 'marketing',
      skills: skills.length ? skills : defaultSkills,
      bdCompanies: ['Daraz (Alibaba Group)', 'Pathao', 'bKash (Growth Marketing)', 'ShopUp', '10 Minute School', 'Chaldal', 'Brain Station 23 (Digital Growth)'],
      abroadCompanies: ['HubSpot', 'Shopify', 'Canva', 'Semrush', 'Buffer', 'Automattic', 'Klarna'],
      bdRoles: [
        {
          title: jobTitle.includes('Senior') || jobTitle.includes('Lead') ? jobTitle : `Senior ${jobTitle || 'Digital Marketing Manager'}`,
          company: 'Daraz Bangladesh',
          location: 'Dhaka · Hybrid (Banani)',
          salary: '৳130,000 - ৳210,000 / mo',
          rationale: `Your track record executing multi-channel paid media campaigns, SEO organic growth, and conversion funnel optimizations directly matches Daraz e-commerce expansion targets.`
        },
        {
          title: 'Performance & Growth Marketing Lead',
          company: 'Pathao',
          location: 'Dhaka · Hybrid (Gulshan)',
          salary: '৳140,000 - ৳220,000 / mo',
          rationale: `Strong match on paid user acquisition, Google Analytics 4 tracking, and CAC/LTV retention loops across ride-sharing and food logistics.`
        },
        {
          title: 'Head of Brand & Content Marketing',
          company: '10 Minute School',
          location: 'Dhaka · On-site (Panthapath)',
          salary: '৳150,000 - ৳240,000 / mo',
          rationale: `Direct alignment with viral organic content distribution, creative storytelling, and educational platform student engagement metrics.`
        },
        {
          title: 'SEO & Organic Acquisition Strategist',
          company: 'Brain Station 23 (Growth Unit)',
          location: 'Dhaka · Remote / Hybrid',
          salary: '৳110,000 - ৳165,000 / mo',
          rationale: `Matches requirements for technical SEO audits, international client lead generation, and keyword ranking authority across search engines.`
        },
        {
          title: 'Lifecycle & CRM Retention Specialist',
          company: 'bKash Limited',
          location: 'Dhaka · Hybrid (Gulshan)',
          salary: '৳135,000 - ৳195,000 / mo',
          rationale: `Capitalizes on your customer journey mapping, automated email/push notifications, and cohort retention experimentation.`
        },
        {
          title: 'E-Commerce Growth Marketing Manager',
          company: 'Chaldal',
          location: 'Dhaka · Remote / Hybrid',
          salary: '৳120,000 - ৳175,000 / mo',
          rationale: `High compatibility with daily active user growth campaigns, paid social ad spend scaling, and weekly conversion rate optimization.`
        }
      ],
      abroadRoles: [
        {
          title: 'Growth Marketing Manager (Remote)',
          company: 'Shopify',
          location: 'Remote · Worldwide',
          salary: '$120,000 - $160,000 / yr',
          rationale: `Your multi-channel acquisition experience and data-driven A/B experimentation match Shopify's global merchant acquisition team.`
        },
        {
          title: 'Senior Performance Marketing Lead',
          company: 'HubSpot',
          location: 'Remote · Worldwide',
          salary: '$135,000 - $175,000 / yr',
          rationale: `Strong alignment with paid search, SaaS funnel metrics, and inbound demand generation pipelines.`
        },
        {
          title: 'Global SEO & Content Strategist',
          company: 'Semrush',
          location: 'Remote · Worldwide',
          salary: '$115,000 - $155,000 / yr',
          rationale: `Proven ability to drive high-intent organic traffic and architect scalable pillar content strategies across international search engines.`
        },
        {
          title: 'Director of Demand Generation',
          company: 'Canva',
          location: 'Sydney, Australia · Hybrid / Remote',
          salary: '$145,000 - $190,000 / yr',
          rationale: `Direct fit for product-led growth (PLG) user acquisition and international marketing expansion.`
        },
        {
          title: 'Lifecycle Marketing Specialist',
          company: 'Buffer',
          location: 'Remote · Worldwide',
          salary: '$110,000 - $145,000 / yr',
          rationale: `Excellent match for asynchronous remote teams optimizing onboarding email drip flows and churn reduction.`
        }
      ]
    };
  }

  // 2. HR & Talent Acquisition
  if (t.includes('hr') || t.includes('human') || t.includes('talent') || t.includes('people') || t.includes('recruit')) {
    const defaultSkills = [
      'Full-Cycle Talent Sourcing', 'HRIS Systems', 'Employee Relations & Culture',
      'Performance Management Frameworks', 'Compensation & Benefits', 'Onboarding & Retention',
      'Labor Law & Compliance'
    ];
    return {
      domain: 'hr',
      skills: Array.isArray(providedSkills) && providedSkills.length ? providedSkills : defaultSkills,
      bdCompanies: ['bKash', 'BRAC', 'Grameenphone', 'Brain Station 23', 'Pathao'],
      abroadCompanies: ['Remote.com', 'Deel', 'GitLab', 'Automattic', 'Gusto'],
      bdRoles: [
        {
          title: 'Senior Talent Acquisition & People Partner',
          company: 'bKash Limited',
          location: 'Dhaka · Hybrid (Gulshan)',
          salary: '৳120,000 - ৳180,000 / mo',
          rationale: `Your end-to-end recruitment experience and stakeholder management directly support high-scale hiring.`
        },
        {
          title: 'Head of People & Organizational Culture',
          company: 'Brain Station 23',
          location: 'Dhaka · Hybrid (Mohakhali)',
          salary: '৳140,000 - ৳210,000 / mo',
          rationale: `Matches enterprise employee retention, technical performance appraisal frameworks, and company culture scaling.`
        },
        {
          title: 'HR Operations & Compliance Lead',
          company: 'Grameenphone',
          location: 'Dhaka · Hybrid (Bashundhara)',
          salary: '৳150,000 - ৳230,000 / mo',
          rationale: `Strong foundations in local labor compliance, compensation modeling, and employee wellness initiatives.`
        }
      ],
      abroadRoles: [
        {
          title: 'Global People Operations Manager',
          company: 'Remote.com',
          location: 'Remote · Worldwide',
          salary: '$115,000 - $155,000 / yr',
          rationale: `Direct fit for international remote workforce compliance, cross-border onboarding, and benefits administration.`
        },
        {
          title: 'Senior Technical Recruiter (Remote)',
          company: 'GitLab',
          location: 'Remote · Worldwide',
          salary: '$125,000 - $165,000 / yr',
          rationale: `Matches asynchronous sourcing pipelines, candidate experience curation, and technical role closing.`
        }
      ]
    };
  }

  // 3. Finance & Accounting
  if (t.includes('financ') || t.includes('account') || t.includes('audit') || t.includes('fp&a') || t.includes('analyst')) {
    const defaultSkills = [
      'Financial Modeling & Forecasting', 'Variance Analysis (FP&A)', 'Advanced Excel & Financial Modeling',
      'SQL & Business Intelligence', 'CapEx & Budget Allocation', 'Internal Controls & Auditing', 'IFRS Standards'
    ];
    return {
      domain: 'finance',
      skills: Array.isArray(providedSkills) && providedSkills.length ? providedSkills : defaultSkills,
      bdCompanies: ['Standard Chartered Bangladesh', 'bKash Finance', 'IDLC Finance', 'BRAC Bank', 'Unilever BD'],
      abroadCompanies: ['Stripe Finance', 'Revolut', 'Wise', 'Brex', 'Checkout.com'],
      bdRoles: [
        {
          title: 'Senior Financial Analyst (FP&A)',
          company: 'bKash Finance',
          location: 'Dhaka · Hybrid (Gulshan)',
          salary: '৳130,000 - ৳195,000 / mo',
          rationale: `Your analytical modeling, budget forecasting, and variance tracking match high-volume mobile transaction finance requirements.`
        },
        {
          title: 'Manager · Corporate Finance & Strategy',
          company: 'IDLC Finance',
          location: 'Dhaka · On-site (Dilkusha)',
          salary: '৳140,000 - ৳220,000 / mo',
          rationale: `Strong match on corporate capital structure analysis, commercial lending assessments, and financial risk mitigation.`
        }
      ],
      abroadRoles: [
        {
          title: 'Senior Strategic Finance Analyst',
          company: 'Stripe',
          location: 'Remote · Worldwide',
          salary: '$135,000 - $175,000 / yr',
          rationale: `Matches fintech revenue modeling, cohort unit economics forecasting, and executive reporting standards.`
        }
      ]
    };
  }

  // 4. Default: Engineering / Tech / Software
  const defaultSkills = [
    'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'System Architecture', 'CI/CD Pipelines'
  ];
  const skills = Array.isArray(providedSkills) && providedSkills.length ? providedSkills : defaultSkills;
  const baseTitle = jobTitle && jobTitle !== 'Target Role' ? jobTitle : 'Full Stack Software Engineer';

  return {
    domain: 'tech',
    skills,
    bdCompanies: ['bKash Limited', 'Brain Station 23', 'Optimizely Bangladesh', 'Therap (BD) Ltd.', 'Pathao', 'Selise Digital Platforms', 'Chaldal Tech'],
    abroadCompanies: ['Stripe', 'Datadog', 'Shopify', 'Scale AI', 'Cloudflare', 'GitLab'],
    bdRoles: [
      {
        title: baseTitle.includes('Senior') || baseTitle.includes('Lead') ? baseTitle : `Senior ${baseTitle}`,
        company: 'bKash Limited',
        location: 'Dhaka · Hybrid (Gulshan)',
        salary: '৳140,000 - ৳220,000 / mo',
        rationale: `Your core expertise in ${skills.slice(0, 3).join(', ')} directly aligns with bKash's high-concurrency fintech microservices platform.`
      },
      {
        title: `Senior ${skills[0] || 'Full Stack'} Lead`,
        company: 'Brain Station 23',
        location: 'Dhaka · Hybrid (Mohakhali)',
        salary: '৳125,000 - ৳185,000 / mo',
        rationale: `Strong match on ${skills[0] || 'system design'} and ${skills[1] || 'backend logic'}. Brain Station 23 seeks engineers with your practical delivery track record for enterprise international clients.`
      },
      {
        title: `Lead Software Engineer (${baseTitle})`,
        company: 'Optimizely Bangladesh',
        location: 'Dhaka · Remote / Hybrid',
        salary: '৳175,000 - ৳260,000 / mo',
        rationale: `High match for digital experimentation platforms requiring end-to-end reliability and clean architecture with ${skills.slice(0, 2).join(', ')}.`
      },
      {
        title: `Software Engineer III · Core Platform`,
        company: 'Therap (BD) Ltd.',
        location: 'Dhaka · On-site (Banani)',
        salary: '৳115,000 - ৳165,000 / mo',
        rationale: `Demonstrated database design and system stability matching Therap's mission-critical global healthcare platforms.`
      },
      {
        title: `Platform & Backend Engineer`,
        company: 'Pathao',
        location: 'Dhaka · Hybrid (Gulshan)',
        salary: '৳120,000 - ৳180,000 / mo',
        rationale: `Matches Pathao's logistics and real-time backend orchestration tech stack, capitalizing on your ${skills[1] || 'cloud'} skills.`
      },
      {
        title: `Senior Full Stack Architect`,
        company: 'Selise Digital Platforms',
        location: 'Dhaka · Hybrid (Uttara)',
        salary: '৳135,000 - ৳210,000 / mo',
        rationale: `Fits Swiss-standard quality engineering workflows and responsive application development with ${skills[0] || 'modern frameworks'}.`
      }
    ],
    abroadRoles: [
      {
        title: baseTitle.includes('Senior') || baseTitle.includes('Lead') ? baseTitle : `Senior ${baseTitle}`,
        company: 'Stripe',
        location: 'Remote · US / Worldwide',
        salary: '$150,000 - $195,000 / yr',
        rationale: `Your demonstrated experience with ${skills.slice(0, 3).join(', ')} and production system design aligns directly with senior engineering expectations.`
      },
      {
        title: `Staff Systems Specialist`,
        company: 'Datadog',
        location: 'New York, NY · Hybrid',
        salary: '$145,000 - $180,000 / yr',
        rationale: `Strong alignment on core ${skills[0] || 'infrastructure'} workflows, with high compatibility for scalable cloud infrastructure.`
      },
      {
        title: `Platform & Solutions Engineer`,
        company: 'Shopify',
        location: 'San Francisco, CA · Remote',
        salary: '$165,000 - $215,000 / yr',
        rationale: `Matches key requirements in end-to-end architecture, API contracts, and high-throughput application scaling with ${skills[2] || 'cloud systems'}.`
      },
      {
        title: `Lead Technical Architect`,
        company: 'Cloudflare',
        location: 'London, UK · Hybrid',
        salary: '£110,000 - £145,000 / yr',
        rationale: `Capitalizes on your solid foundations in ${skills.slice(0, 3).join(', ')} for mission-critical edge and cloud application delivery.`
      }
    ]
  };
};

const buildDynamicJobRecommendations = ({
  jobTitle = 'Software Engineer',
  company = '',
  skills = [],
  missingSkills = [],
  resumeText = '',
  region = 'bangladesh'
}) => {
  const isBD = String(region).toLowerCase() !== 'abroad';
  const profile = getDomainProfile(jobTitle, resumeText, skills);
  const targetRoles = isBD ? profile.bdRoles : profile.abroadRoles;

  const baseScores = [96, 93, 91, 89, 87, 85, 84];

  return targetRoles.map((role, idx) => ({
    id: randomUUID(),
    job_title: role.title,
    company: role.company,
    location: role.location,
    region: isBD ? 'bangladesh' : 'abroad',
    work_type: role.location.includes('Remote') ? 'Full-time · Remote' : role.location.includes('Hybrid') ? 'Full-time · Hybrid' : 'Full-time · On-site',
    salary_range: role.salary,
    match_score: baseScores[idx % baseScores.length] || 88,
    match_rationale: role.rationale,
    skills: profile.skills.slice(0, 5),
    growth_skills: missingSkills.slice(0, 2).length ? missingSkills.slice(0, 2) : profile.skills.slice(5, 7),
    job_url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role.title)}&location=${isBD ? 'Bangladesh' : 'Worldwide'}`,
    is_saved: false
  }));
};

const getRecommendations = async (req, res) => {
  try {
    const userId = req.query?.user_id || req.body?.user_id || req.user?.id || DEMO_USER_ID;
    const resumeText = req.body?.resume_text || req.query?.resume_text || '';
    const jobTitle = req.body?.job_title || req.query?.job_title || 'Target Role';
    const company = req.body?.company || req.query?.company || '';
    const skills = req.body?.skills || req.body?.missing_skills || [];
    const missingSkills = req.body?.missing_skills || [];
    const region = req.body?.region || req.query?.region || 'bangladesh';

    let recommendations = null;

    // 1. Try Live AI Generation with Gemini / OpenAI
    if (isAIConfigured() && (resumeText || jobTitle !== 'Target Role' || skills.length > 0)) {
      try {
        recommendations = await generateJobRecommendationsWithAI({
          resumeText,
          jobTitle,
          company,
          skills,
          missingSkills,
          region
        });
      } catch (err) {
        console.warn('AI job recommendations notice (falling back to dynamic engine):', err.message);
      }
    }

    // 2. Dynamic Grounded Generator Fallback
    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
      recommendations = buildDynamicJobRecommendations({
        jobTitle,
        company,
        skills,
        missingSkills,
        resumeText,
        region
      });
    }

    // Persist to Supabase if available
    if (isSupabaseConfigured && userId) {
      try {
        const payload = recommendations.map((rec) => ({
          user_id: userId,
          job_title: rec.job_title,
          company: rec.company,
          location: rec.location || 'Bangladesh',
          match_score: rec.match_score || 85,
          job_url: rec.job_url || '',
          skills: rec.skills || []
        }));
        await supabase.from('job_recommendations').upsert(payload, { onConflict: 'id' });
      } catch (err) {
        console.warn('Supabase job recommendations notice:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      region,
      message: `AI job recommendations in ${region === 'abroad' ? 'international / global market' : 'Bangladesh'} generated successfully.`,
      data: recommendations
    });
  } catch (error) {
    console.error('Job recommendations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Job recommendations could not be loaded.'
    });
  }
};

const generateCoverLetter = async (req, res) => {
  try {
    const candidateName = req.body?.candidate_name || req.user?.full_name || 'Amina Rahman';
    const jobTitle = req.body?.job_title || 'Software Specialist';
    const company = req.body?.company || 'Hiring Organization';
    const resumeText = req.body?.resume_text || '';
    const skills = req.body?.skills || [];
    const location = req.body?.location || '';

    let coverLetterData = null;

    if (isAIConfigured()) {
      try {
        coverLetterData = await generateCoverLetterWithAI({
          candidateName,
          jobTitle,
          company,
          resumeText,
          skills,
          location
        });
      } catch (err) {
        console.warn('AI cover letter notice (falling back to dynamic engine):', err.message);
      }
    }

    if (!coverLetterData || !coverLetterData.cover_letter) {
      const topSkills = Array.isArray(skills) && skills.length ? skills.slice(0, 3).join(', ') : 'strategic execution, scalable delivery, and technical ownership';
      const letter = `Dear Hiring Team at ${company},\n\nI am writing to express my enthusiastic interest in the ${jobTitle} role at ${company}. Having followed ${company}'s industry impact and rapid growth trajectory, I am eager to contribute my background in ${topSkills} to accelerate your team's mission-critical goals.\n\nThroughout my career, I have consistently driven measurable results by bridging domain expertise with high-impact execution. My practical experience delivering robust solutions, optimizing core workflows, and collaborating across cross-functional teams directly aligns with the challenges and growth opportunities at ${company}. Whether designing resilient architectures, executing data-backed strategies, or managing end-to-end deliverables, I thrive in environments that value innovation and accountability.\n\nI would welcome the opportunity to discuss how my proven track record and passion for continuous improvement can add immediate value to ${company}. Thank you for your time and consideration, and I look forward to the possibility of speaking with you.\n\nSincerely,\n${candidateName}`;

      coverLetterData = {
        subject_line: `Application for ${jobTitle} - ${candidateName}`,
        hiring_manager_hook: `Proven experience in ${topSkills} tailored for ${company}`,
        cover_letter: letter,
        key_highlights: [
          `Targeted domain expertise in ${topSkills}`,
          `Demonstrated track record solving real-world challenges at scale`,
          `Strong cultural alignment with ${company}'s fast-paced expansion goals`
        ]
      };
    }

    return res.status(200).json({
      success: true,
      message: 'Cover letter generated successfully.',
      data: coverLetterData
    });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Cover letter could not be generated.'
    });
  }
};

module.exports = {
  getRecommendations,
  buildDynamicJobRecommendations,
  generateCoverLetter
};
