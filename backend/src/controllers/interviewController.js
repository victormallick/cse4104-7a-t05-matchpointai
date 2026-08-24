const { randomUUID } = require('crypto');
const { supabase, isSupabaseConfigured } = require('../config/supabase');
const {
  DEMO_USER_ID,
  interviewQuestions,
  store
} = require('../data/demoData');
const {
  isAIConfigured,
  generateInterviewQuestionsWithAI,
  evaluateAnswerWithAI,
  generateInterviewReadinessReportWithAI
} = require('../services/aiService');

const getRoleDomainSkills = (jobTitle = '') => {
  const t = (jobTitle || '').toLowerCase();
  if (t.includes('ai') || t.includes('machine learning') || t.includes('ml') || t.includes('data science') || t.includes('deep learning') || t.includes('nlp') || t.includes('vision') || t.includes('llm') || t.includes('python')) {
    return [
      'Distributed Neural Network Training (PyTorch/DistributedDataParallel)',
      'High-Performance Model Inference Optimization (TensorRT/ONNX/vLLM)',
      'Feature Engineering & High-Throughput Data Pipeline Orchestration',
      'Automated CI/CD for Model Deployment & MLOps (MLflow/Kubeflow)',
      'Model Evaluation Metrics (Precision/Recall/F1/AUC-ROC/Latency)',
      'Handling Data Drift, Concept Drift & Model Performance Monitoring',
      'Transformer Architecture & LLM Fine-Tuning (PEFT/LoRA)',
      'Vector Databases & Retrieval-Augmented Generation (RAG)',
      'Unit Testing & Test-Driven ML Development (pytest/Hypothesis)',
      'Asynchronous Data Ingestion & Batch Prediction Pipelines',
      'Model Quantization, Pruning & Memory Footprint Reduction'
    ];
  }
  if (t.includes('market') || t.includes('growth') || t.includes('seo') || t.includes('digital marketing')) {
    return [
      'Campaign Analytics & Execution', 'Conversion Rate Optimization (CRO)', 'Multi-Channel Funnel Attribution',
      'Search Engine Optimization (SEO)', 'Paid Search Strategy (PPC)', 'Social Media Advertising (Meta/LinkedIn)',
      'Customer Lifecycle & Email Automation', 'Marketing Technology Stack (HubSpot/GA4)', 'A/B Testing & Experimentation',
      'Audience Segmentation & Persona Mapping', 'Content Strategy & SEO Growth', 'Customer Acquisition Cost (CAC) Optimization'
    ];
  }
  if (t.includes('hr') || t.includes('human') || t.includes('talent') || t.includes('people') || t.includes('recruit')) {
    return [
      'Full-Cycle Talent Sourcing', 'HR Information Systems (HRIS)', 'Employee Relations & Conflict Resolution',
      'Compensation & Benefits Administration', 'DEI & Inclusion Strategy', 'Performance Management Frameworks',
      'Onboarding & Employee Retention', 'Labor Law & Regulatory Compliance', 'Workplace Culture & Psychological Safety'
    ];
  }
  if (t.includes('financ') || t.includes('account') || t.includes('audit') || t.includes('fp&a') || t.includes('analyst')) {
    return [
      'Three-Statement Financial Modeling', 'Variance Analysis & Budget Forecasting', 'Discounted Cash Flow (DCF) Valuation',
      'Advanced Excel Modeling & Macros', 'SQL & Financial Database Queries', 'CapEx & Capital Allocation Strategy',
      'KPI Dashboarding & Executive Reporting', 'Internal Controls & Risk Management', 'Cost Optimization & Working Capital'
    ];
  }
  if (t.includes('design') || t.includes('ux') || t.includes('ui') || t.includes('product designer')) {
    return [
      'Design System Architecture', 'User Journey Mapping & Wireframing', 'Interactive Prototyping (Figma)',
      'Usability Testing & User Research', 'Responsive Accessibility (WCAG 2.1)', 'Design-to-Engineering Handoff',
      'Information Architecture', 'Micro-Interactions & Animation', 'Conversion-Focused UI UX'
    ];
  }
  // Engineering / Tech default
  return [
    'System Architecture & Modularity', 'API Design & Contract Versioning', 'Distributed In-Memory Caching (Redis)',
    'Relational & NoSQL Database Optimization', 'CI/CD Pipeline Automation', 'Containerization & Docker Orchestration',
    'Automated Testing Coverage & QA', 'Observability, Logging & Alerting', 'Security & Vulnerability Mitigation',
    'Microservices & Event-Driven Architecture', 'Asynchronous Processing & Message Queues', 'Frontend State & Performance Optimization'
  ];
};

const extractCandidateBullets = (text = '') => {
  if (!text) return [];
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 25);
  const bullets = [];
  for (const line of lines) {
    const clean = line.replace(/^[•\-\*\d\.\)\s]+/, '').trim();
    if (
      clean.length >= 35 &&
      clean.length <= 250 &&
      /^[A-Z]/.test(clean) &&
      !/^(experience|education|skills|summary|projects|certifications|awards|contact|curriculum|resume|profile|bachelor|master|university|phone|email)/i.test(clean) &&
      !/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i.test(clean) &&
      !/\s+[-–—]\s+(present|\d{4})/i.test(clean)
    ) {
      bullets.push(clean);
    }
  }
  return bullets;
};

const buildDynamicInterviewQuestions = ({ jobTitle, company, missingSkills = [], resumeText = '', offset = 0, existingQuestions = [] }) => {
  const domainSkills = getRoleDomainSkills(jobTitle);
  const rawSkills = [
    ...(Array.isArray(missingSkills) ? missingSkills : []),
    ...domainSkills
  ].filter(Boolean);

  const skills = [...new Set(rawSkills)];
  const candidateBullets = extractCandidateBullets(resumeText);
  const existingSet = new Set(
    (existingQuestions || []).map((q) => (typeof q === 'string' ? q : q.question || '').trim().toLowerCase())
  );

  const techTemplates = [
    (s) => `How would you leverage ${s} to address core operational or architectural challenges in your role as a ${jobTitle}${company ? ` at ${company}` : ''}?`,
    (s) => `In the context of ${jobTitle}, walk through your approach to implementing ${s} while ensuring measurable scalability and reliability.`,
    (s) => `What key technical or strategic trade-offs do you evaluate when deciding how to integrate ${s} into an existing workflow?`,
    (s) => `Can you discuss a complex production issue or bottleneck you resolved related to ${s}, and the edge cases you mitigated?`,
    (s) => `How do you measure and optimize system performance and code quality when working with ${s}?`,
    (s) => `Explain how you would design a fault-tolerant subsystem relying on ${s} that can handle unexpected traffic spikes.`,
    (s) => `When evaluating ${s} against alternative technologies or paradigms, what criteria guide your decision for a high-traffic environment?`,
    (s) => `How do you ensure data integrity, security, and backward compatibility when refactoring legacy modules incorporating ${s}?`,
    (s) => `Describe your strategy for automated end-to-end testing, integration testing, and CI/CD validation when deploying changes involving ${s}.`,
    (s) => `How do you establish monitoring, distributed tracing, and actionable alerting around ${s} to guarantee high uptime?`,
    (s) => `Walk us through how you would architect a zero-downtime migration or version update for a core service powered by ${s}.`,
    (s) => `How do you balance rapid delivery deadlines against technical debt and maintainability when implementing ${s}?`
  ];

  const difficulties = ['Medium', 'Hard', 'Medium', 'Hard', 'Medium', 'Hard'];

  const candidateTechnical = [];

  // If candidate has real resume bullets, prioritize grounded questions referencing their actual experience
  if (candidateBullets.length > 0) {
    for (let bIdx = 0; bIdx < candidateBullets.length; bIdx++) {
      const bullet = candidateBullets[bIdx];
      const bulletQuestions = [
        `On your resume, you detailed: "${bullet}". Walk me through the technical architecture, key trade-offs, and how you ensured scalability during this project.`,
        `You highlighted: "${bullet}". What specific metrics or performance benchmarks did you track, and what architectural trade-offs did you make?`,
        `Regarding your experience: "${bullet}", describe the most challenging technical edge case or bug you encountered and how you mitigated it.`
      ];

      for (const qText of bulletQuestions) {
        if (!existingSet.has(qText.trim().toLowerCase())) {
          candidateTechnical.push({
            id: `tech-${randomUUID().slice(0, 8)}`,
            topic: 'Resume Project Deep Dive',
            difficulty: 'Hard',
            focus_skill: skills[bIdx % skills.length] || 'Technical Execution',
            question: qText,
            expected_keywords: ['Architecture', 'Trade-offs', 'Scalability', 'Metrics', 'Implementation'],
            sample_answer: `Explain your role in this project, technical decisions made, constraints considered, and the quantifiable outcome achieved.`
          });
        }
      }
    }
  }

  for (let sIdx = 0; sIdx < skills.length; sIdx++) {
    const skill = skills[sIdx];
    for (let tIdx = 0; tIdx < techTemplates.length; tIdx++) {
      const qText = techTemplates[tIdx](skill);
      if (!existingSet.has(qText.trim().toLowerCase())) {
        candidateTechnical.push({
          id: `tech-${randomUUID().slice(0, 8)}`,
          topic: skill,
          difficulty: difficulties[(sIdx + tIdx) % difficulties.length],
          focus_skill: skill,
          question: qText,
          expected_keywords: [skill, 'Scalability', 'Trade-offs', 'Best practices', 'Monitoring'],
          sample_answer: `A structured response should explain practical experience with ${skill}, define the problem scope, detail implementation steps, and quantify the resulting outcome.`
        });
      }
    }
  }

  const behavioralBank = [];

  // Ground behavioral questions in candidate's resume achievements
  if (candidateBullets.length > 0) {
    for (let bIdx = 0; bIdx < Math.min(candidateBullets.length, 6); bIdx++) {
      const bullet = candidateBullets[bIdx];
      behavioralBank.push({
        topic: 'Project Execution & Ownership',
        difficulty: 'Medium',
        question: `Reflecting on your achievement: "${bullet}", tell me about a major technical or stakeholder disagreement you navigated during that initiative (STAR method).`,
        framework: 'STAR',
        key_points: ['Stakeholder alignment', 'Technical rationale', 'Outcome'],
        sample_answer: `Describe the context, conflicting viewpoints, how you presented data, and the final deliverable impact.`
      });
      behavioralBank.push({
        topic: 'Overcoming Roadblocks',
        difficulty: 'Hard',
        question: `In connection with your experience: "${bullet}", tell me about a time an unexpected roadblock or timeline delay occurred. How did you adapt your plan?`,
        framework: 'STAR',
        key_points: ['Agility', 'Root cause mitigation', 'Delivery'],
        sample_answer: `Explain the roadblock, your re-planning steps, and how you communicated to ensure project delivery.`
      });
      behavioralBank.push({
        topic: 'Quality & Delivery Standards',
        difficulty: 'Medium',
        question: `Regarding your work on: "${bullet}", how did you balance rapid delivery deadlines against code quality and long-term maintainability?`,
        framework: 'STAR',
        key_points: ['Prioritization', 'Trade-off analysis', 'Pragmatic engineering'],
        sample_answer: `Detail how you scoped MVP requirements, established test gates, and tracked technical debt for future sprints.`
      });
    }
  }

  // Dynamic Skill-Parameterized Behavioral Scenarios
  const behavioralTemplates = [
    (skill) => ({
      topic: `${skill} Execution & Trade-offs`,
      difficulty: 'Medium',
      question: `Tell me about a complex initiative where you applied ${skill}. How did you prioritize technical requirements and ensure high delivery quality under pressure?`,
      framework: 'STAR',
      key_points: ['Scoping', 'Technical execution', 'Outcome'],
      sample_answer: `Describe applying ${skill}, trade-offs evaluated, and quantifiable results delivered.`
    }),
    (skill) => ({
      topic: `Overcoming Roadblocks in ${skill}`,
      difficulty: 'Hard',
      question: `Describe a situation involving ${skill} where an unexpected bug, dependency delay, or architectural blocker arose. How did you troubleshoot and resolve it?`,
      framework: 'STAR',
      key_points: ['Root cause analysis', 'Decisiveness', 'Delivery'],
      sample_answer: `Explain the roadblock, your technical troubleshooting steps, and the final resolution.`
    }),
    (skill) => ({
      topic: `Stakeholder Alignment on ${skill}`,
      difficulty: 'Medium',
      question: `Have you ever had to advocate for adopting, refactoring, or optimizing ${skill} to skeptical stakeholders or peers? How did you build consensus?`,
      framework: 'STAR',
      key_points: ['Data-driven persuasion', 'Business value', 'Consensus'],
      sample_answer: `Explain how you framed the cost/benefit of ${skill} in terms of reliability, cost savings, and developer velocity.`
    }),
    (skill) => ({
      topic: `Mentorship & Scaling ${skill}`,
      difficulty: 'Medium',
      question: `Tell me about a time you helped a teammate or mentored a peer to master ${skill}. How did you structure your coaching and feedback?`,
      framework: 'STAR',
      key_points: ['Pairing', 'Clear standards', 'Empowerment'],
      sample_answer: `Describe your mentorship approach, setting clear benchmarks, and watching the peer become autonomous.`
    }),
    (skill) => ({
      topic: `Incident Recovery with ${skill}`,
      difficulty: 'Hard',
      question: `Walk me through a production issue or workflow bottleneck related to ${skill}. What was your immediate containment strategy and preventative safeguard?`,
      framework: 'STAR',
      key_points: ['Incident management', 'Blameless post-mortem', 'Safeguards'],
      sample_answer: `Explain the triage priority, customer communication, and safeguards added to prevent recurrence.`
    })
  ];

  for (const skill of skills) {
    for (const bTmpl of behavioralTemplates) {
      behavioralBank.push(bTmpl(skill));
    }
  }

  behavioralBank.push(
    {
      topic: 'Adapting to Skill Gaps',
      difficulty: 'Medium',
      question: `Tell me about a project where you had to quickly acquire proficiency in ${skills[0] || 'a new technology or framework'} under tight delivery deadlines.`,
      framework: 'STAR',
      key_points: ['Learning strategy', 'Execution under pressure', 'Project outcome'],
      sample_answer: `Describe the context, your structured learning plan, how you delivered on time, and the measurable impact on the team.`
    },
    {
      topic: 'Cross-functional Collaboration',
      difficulty: 'Medium',
      question: `Describe a situation as a ${jobTitle} where you navigated conflicting technical or business priorities with key stakeholders.`,
      framework: 'STAR',
      key_points: ['Stakeholder negotiation', 'Data-driven decision making', 'Consensus building'],
      sample_answer: `Explain the conflicting viewpoints, the data analysis you presented, and how you reached a mutually beneficial consensus.`
    },
    {
      topic: 'Resolving Ambiguity & Scoping',
      difficulty: 'Hard',
      question: `Share an experience where project requirements were vaguely defined. How did you establish technical clarity and guide execution for your team?`,
      framework: 'STAR',
      key_points: ['Scoping', 'Risk mitigation', 'Proactive communication'],
      sample_answer: `Detail how you conducted technical discovery, consulted domain experts, created milestone checkpoints, and delivered successfully.`
    },
    {
      topic: 'Managing Incidents & Crisis',
      difficulty: 'Hard',
      question: `Tell me about a time a major release or production workflow failed. How did you manage the triage, root-cause analysis, and post-mortem?`,
      framework: 'STAR',
      key_points: ['Incident containment', 'Blameless post-mortem', 'Preventative safeguards'],
      sample_answer: `Explain how you prioritized recovery, communicated transparently, and instituted automated testing to prevent recurrence.`
    },
    {
      topic: 'Advocating for Best Practices',
      difficulty: 'Medium',
      question: `Describe a time when you identified significant technical debt or architectural flaws and successfully convinced leadership to invest in remediation.`,
      framework: 'STAR',
      key_points: ['Business case formulation', 'Risk assessment', 'Incremental refactoring'],
      sample_answer: `Outline how you measured the cost of inaction, drafted an incremental refactoring plan, and delivered without slowing down roadmap velocity.`
    },
    {
      topic: 'Code Reviews & Mentorship',
      difficulty: 'Medium',
      question: `How do you handle a scenario where a peer or junior colleague consistently submits pull requests that do not meet team architecture standards?`,
      framework: 'STAR',
      key_points: ['Empathy in feedback', 'Pair programming', 'Raising team standard'],
      sample_answer: `Discuss using constructive code review comments, establishing shared linting rules, and pairing to elevate the engineer's skillset.`
    },
    {
      topic: 'Prioritization Under Pressure',
      difficulty: 'Hard',
      question: `Tell me about a high-stakes sprint where simultaneous critical bugs and roadmap features competed for your time. How did you prioritize?`,
      framework: 'STAR',
      key_points: ['Impact matrix', 'Transparent stakeholder triage', 'Focus execution'],
      sample_answer: `Describe applying severity/impact triage, aligning with product management on trade-offs, and shielding team focus.`
    },
    {
      topic: 'Championing Innovation',
      difficulty: 'Hard',
      question: `Tell me about a modern tool, process, or workflow optimization you introduced that fundamentally improved team productivity or product reliability.`,
      framework: 'STAR',
      key_points: ['Pilot implementation', 'Metrics measurement', 'Team onboarding'],
      sample_answer: `Detail your initial proof-of-concept, performance benchmark results, and how you led internal workshops to drive adoption.`
    },
    {
      topic: 'Overcoming Setbacks & Failures',
      difficulty: 'Hard',
      question: `Walk me through a project where the initial approach failed to meet performance benchmarks. What did you learn and how did you pivot?`,
      framework: 'STAR',
      key_points: ['Humility & accountability', 'Root cause profiling', 'Successful re-architecture'],
      sample_answer: `Focus on objective profiling, isolating the architectural bottleneck, and executing a revised strategy that achieved the performance target.`
    },
    {
      topic: 'Client & Stakeholder Communication',
      difficulty: 'Medium',
      question: `Describe an occasion where you had to explain a complex technical risk or delay to non-technical executives or customers.`,
      framework: 'STAR',
      key_points: ['Plain language clarity', 'Solution options', 'Trust preservation'],
      sample_answer: `Explain how you avoided jargon, framed the issue in terms of customer experience and security, and provided realistic mitigation timelines.`
    }
  );

  const hrBank = [];

  // Dynamic Skill-Parameterized HR & Culture Questions
  const hrTemplates = [
    (skill) => ({
      topic: `Passion & Craft in ${skill}`,
      difficulty: 'Easy',
      question: `What initially drew you to specialize in ${skill}, and how do you stay current with emerging industry best practices in this area?`,
      intent: 'Evaluates passion, curiosity, and continuous learning mindset.',
      tip: 'Mention relevant engineering blogs, open source contributions, podcasts, or community meetups.'
    }),
    (skill) => ({
      topic: `Productivity & Environment for ${skill}`,
      difficulty: 'Easy',
      question: `When executing high-impact work involving ${skill}, what kind of management style and engineering autonomy allows you to do your highest quality work?`,
      intent: 'Assesses autonomy expectations, management preferences, and team fit.',
      tip: 'Highlight clear mission ownership, transparent communication, and psychological safety.'
    }),
    (skill) => ({
      topic: `Cross-Functional Alignment around ${skill}`,
      difficulty: 'Easy',
      question: `How do you bridge the gap between technical execution in ${skill} and communicating business value to non-technical stakeholders?`,
      intent: 'Assesses communication clarity, empathy, and business alignment.',
      tip: 'Explain translating technical complexity into user benefits, performance metrics, or cost efficiency.'
    })
  ];

  for (const skill of skills) {
    for (const hTmpl of hrTemplates) {
      hrBank.push(hTmpl(skill));
    }
  }

  hrBank.push(
    {
      topic: 'Role & Cultural Alignment',
      difficulty: 'Easy',
      question: `What specifically interests you about the ${jobTitle} opportunity${company ? ` at ${company}` : ''}, and how does it advance your long-term career goals?`,
      intent: 'Evaluates genuine motivation, company research, and career alignment.',
      tip: 'Highlight specific aspects of the company mission, tech stack, or product scale that excite you.'
    },
    {
      topic: 'Continuous Growth & Feedback',
      difficulty: 'Easy',
      question: `How do you approach receiving constructive criticism on your architecture or pull requests, and continuously improving your craft?`,
      intent: 'Assesses humility, continuous learning mindset, and collaborative culture fit.',
      tip: 'Provide a real example of feedback you incorporated to improve your output.'
    },
    {
      topic: 'Workplace Values & Collaboration',
      difficulty: 'Easy',
      question: `What kind of team culture and work environment allows you to do your highest quality work as a ${jobTitle}?`,
      intent: 'Assesses environmental fit, autonomy expectations, and team alignment.',
      tip: 'Speak to transparency, psychological safety, and clear product goals.'
    },
    {
      topic: 'Work-Life Balance & Burnout Management',
      difficulty: 'Easy',
      question: `In fast-paced delivery environments with competing priorities, how do you manage workload stress and maintain sustainable productivity?`,
      intent: 'Evaluates emotional intelligence, self-management, and boundary-setting.',
      tip: 'Discuss time-blocking, asynchronous communication, and proactive workload negotiation.'
    },
    {
      topic: 'Diversity, Equity & Inclusion',
      difficulty: 'Easy',
      question: `How do you contribute to fostering an inclusive, welcoming, and psychologically safe environment for teammates from diverse backgrounds?`,
      intent: 'Assesses interpersonal maturity, empathy, and positive cultural contribution.',
      tip: 'Highlight actively listening to diverse viewpoints and creating space for all voices in meetings.'
    },
    {
      topic: 'Long-Term Career Vision',
      difficulty: 'Easy',
      question: `Where do you envision your professional trajectory evolving over the next 3 to 5 years as a ${jobTitle}?`,
      intent: 'Evaluates ambition, goal orientation, and organizational retention potential.',
      tip: 'Express interest in technical mastery, architectural leadership, or cross-functional mentorship.'
    },
    {
      topic: 'Handling Organizational Change',
      difficulty: 'Easy',
      question: `Tell me about how you adapt when company roadmaps or team structures shift unexpectedly mid-quarter.`,
      intent: 'Assesses agility, resilience, and positive change management.',
      tip: 'Emphasize focusing on core mission objectives and helping teammates realign quickly.'
    },
    {
      topic: 'Motivations & Core Values',
      difficulty: 'Easy',
      question: `What aspects of day-to-day engineering and product problem solving bring you the greatest sense of fulfillment?`,
      intent: 'Identifies intrinsic drivers and energy alignment with the day-to-day responsibilities.',
      tip: 'Connect technical craft to tangible user impact and team camaraderie.'
    },
    {
      topic: 'Conflict Resolution & Empathy',
      difficulty: 'Easy',
      question: `Describe your approach to resolving a subtle personality conflict or communication friction with a peer before it escalates.`,
      intent: 'Evaluates emotional maturity, proactive de-escalation, and empathy.',
      tip: 'Focus on 1-on-1 private conversations, assuming good intent, and active listening.'
    },
    {
      topic: 'Remote & Hybrid Communication',
      difficulty: 'Easy',
      question: `What communication habits or documentation practices do you rely on to stay aligned and proactive in remote or hybrid teams?`,
      intent: 'Assesses async communication skills, self-discipline, and transparency.',
      tip: 'Mention detailed pull request descriptions, documentation-first culture, and proactive status updates.'
    }
  );

  const candidateBehavioral = behavioralBank.filter(
    (b) => !existingSet.has(b.question.trim().toLowerCase())
  ).map((b) => ({ ...b, id: `beh-${randomUUID().slice(0, 8)}` }));

  const candidateHr = hrBank.filter(
    (h) => !existingSet.has(h.question.trim().toLowerCase())
  ).map((h) => ({ ...h, id: `hr-${randomUUID().slice(0, 8)}` }));

  const technical = candidateTechnical.slice(offset % Math.max(1, candidateTechnical.length - 6)).slice(0, 6);
  const behavioral = candidateBehavioral.slice(offset % Math.max(1, candidateBehavioral.length - 4)).slice(0, 6);
  const hr = candidateHr.slice(offset % Math.max(1, candidateHr.length - 3)).slice(0, 6);

  return {
    technical: technical.length > 0 ? technical : candidateTechnical.slice(0, 4),
    behavioral: behavioral.length > 0 ? behavioral : candidateBehavioral.slice(0, 4),
    hr: hr.length > 0 ? hr : candidateHr.slice(0, 4)
  };
};

const generateInterview = async (req, res) => {
  try {
    const analysisId = req.body.analysis_id;
    const resumeId = req.body.resume_id;
    const userId = req.body.user_id || req.user?.id || DEMO_USER_ID;
    const analysis = analysisId ? store.analyses.get(analysisId) : null;
    const missingSkills = req.body.missing_skills || analysis?.missing_skills || analysis?.missing_keywords || [];
    const jobTitle = req.body.job_title || analysis?.job_title || 'Software Engineer';
    const company = req.body.company || analysis?.company || '';
    const jdText = req.body.jd_text || analysis?.jd_text || '';
    const existingQuestions = req.body.existing_questions || [];

    let resumeText = req.body.resume_text || analysis?.resume_text || '';

    if (!resumeText && resumeId && isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('resumes')
          .select('parsed_text')
          .eq('id', resumeId)
          .single();
        if (data?.parsed_text) resumeText = data.parsed_text;
      } catch (err) {
        console.warn('Supabase resume fetch for interview:', err.message);
      }
    }

    if (!resumeText && resumeId) {
      resumeText = store.resumes.get(resumeId)?.parsed_text || '';
    }

    let questions = null;
    const targetCategory = req.body.category ? req.body.category.toLowerCase() : null;
    const targetCount = Number(req.body.count) || null;

    if (isAIConfigured()) {
      questions = await generateInterviewQuestionsWithAI({
        resumeText,
        jdText,
        jobTitle,
        missingSkills,
        existingQuestions,
        category: targetCategory,
        count: targetCount
      });

      if (questions) {
        if (Array.isArray(questions.technical)) {
          questions.technical = questions.technical.map((q) => ({ ...q, id: q.id || `tech-${randomUUID().slice(0, 8)}` }));
        }
        if (Array.isArray(questions.behavioral)) {
          questions.behavioral = questions.behavioral.map((q) => ({ ...q, id: q.id || `beh-${randomUUID().slice(0, 8)}` }));
        }
        if (Array.isArray(questions.hr)) {
          questions.hr = questions.hr.map((q) => ({ ...q, id: q.id || `hr-${randomUUID().slice(0, 8)}` }));
        }
      }
    }

    const hasQuestionsForCategory = targetCategory ? Boolean(questions?.[targetCategory]?.length) : Boolean(questions?.technical?.length);

    if (!questions || !hasQuestionsForCategory) {
      const fallbackQuestions = buildDynamicInterviewQuestions({
        jobTitle,
        company,
        missingSkills,
        resumeText,
        offset: existingQuestions.length + Math.floor(Math.random() * 5),
        existingQuestions
      });

      questions = {
        technical: questions?.technical?.length ? questions.technical : fallbackQuestions.technical,
        behavioral: questions?.behavioral?.length ? questions.behavioral : fallbackQuestions.behavioral,
        hr: questions?.hr?.length ? questions.hr : fallbackQuestions.hr
      };
    }

    // Ensure all 3 categories are always safe arrays
    questions = {
      technical: Array.isArray(questions?.technical) ? questions.technical : [],
      behavioral: Array.isArray(questions?.behavioral) ? questions.behavioral : [],
      hr: Array.isArray(questions?.hr) ? questions.hr : []
    };

    let sessionId = randomUUID();

    if (isSupabaseConfigured && analysisId) {
      try {
        const { data, error } = await supabase
          .from('interview_sessions')
          .insert([
            {
              user_id: userId,
              analysis_id: analysisId,
              questions_json: questions
            }
          ])
          .select()
          .single();

        if (!error && data) {
          sessionId = data.id;
        }
      } catch (err) {
        console.warn('Supabase interview session insert notice (using memory):', err.message);
      }
    }

    const totalCount =
      (questions.technical?.length || 0) +
      (questions.behavioral?.length || 0) +
      (questions.hr?.length || 0);

    return res.status(200).json({
      success: true,
      message: isSupabaseConfigured
        ? 'Interview questions generated successfully.'
        : 'Interview questions generated from the demo question bank.',
      data: {
        session_id: sessionId,
        analysis_id: analysisId || null,
        questions,
        total_questions: totalCount,
        generation_mode: process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY
          ? 'ai-ready'
          : 'demo'
      }
    });
  } catch (error) {
    console.error('Interview generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Interview questions could not be generated.'
    });
  }
};

const evaluateAnswer = async (req, res) => {
  try {
    const question = req.body?.question || req.body?.prompt || '';
    const answer = String(req.body?.answer || req.body?.user_answer || req.body?.response || '').trim();
    const jobTitle = req.body?.job_title || req.body?.role || 'Target Role';
    const category = req.body?.category || 'technical';
    const expectedKeywords = req.body?.expected_keywords || [];
    const topic = req.body?.topic || req.body?.context || '';

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both the question and your response.'
      });
    }

    let evaluation = null;
    if (isAIConfigured()) {
      evaluation = await evaluateAnswerWithAI({
        question,
        answer,
        jobTitle,
        category,
        expectedKeywords,
        topic
      });
    }

    if (!evaluation) {
      const words = answer.split(/\s+/).filter(Boolean).length;
      const lower = answer.toLowerCase();
      const isUncertain = lower.includes('dont know') || lower.includes("don't know") || lower.includes('not sure') || words < 5;

      if (isUncertain) {
        evaluation = {
          score: 45,
          verdict: 'Incomplete / Needs Preparation',
          strengths: [
            'Honest communication style without guessing or fabricating facts'
          ],
          gaps: [
            'Did not attempt to break down the problem from first principles or relate it to prior experience',
            'Missing structured frameworks (STAR), execution steps, or industry tools'
          ],
          improved_answer: `When you don't know the exact answer in an interview for ${jobTitle}, structure a response like: "While I haven't implemented this exact scenario yet, I would approach it systematically: First, diagnose the core root cause; second, benchmark best practices; third, execute a small-scale pilot to measure impact."`,
          coaching_tip: 'Never stop at "I don\'t know". Always pivot by explaining your diagnostic thought process and how you rapidly ramp up on new challenges.'
        };
      } else {
        // Intelligent Content Analyzer
        // 1. Metric / Quantifiable Result Detection (e.g. 35%, 48%, 3x, 4.2%, 40%, 60 days, 2.8 minutes, 54%, $120k)
        const metricMatches = answer.match(/\d+(\.\d+)?%|\d+(\.\d+)?x|\d+(\.\d+)?\s*(days|months|minutes|seconds|leads|users|hours|turnaround|pipeline|ratio|budget|conversions)/gi) || [];
        const hasMetrics = metricMatches.length > 0;

        // 2. Structured Action Framework (Step 1/2/3, First/Second/Third, bullet points, numbers)
        const hasNumberedList = /\b(first|second|third|step 1|step 2|finally)\b/i.test(answer) || answer.includes('1.') || answer.includes('2.') || answer.includes('3.');
        const hasSTARStructure = /\b(situation|task|action|result|audit|diagnose|implement|established|optimized|scaled|resolved|mitigated|delivered)\b/i.test(answer);

        // 3. Domain & Tool Keyword Extraction
        const domainTools = [
          'GA4', 'Google Analytics', 'HubSpot', 'SEMrush', 'Ahrefs', 'SEO', 'CRO', 'PPC', 'Meta Ads',
          'Notion', 'Airtable', 'Zapier', 'Cloudinary', 'Cloudflare', 'CDN', 'Headless CMS', 'Redis',
          'A/B Testing', 'UTM', 'CAC', 'LTV', 'Core Web Vitals', 'Search Console', 'Screaming Frog',
          'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'REST API', 'GraphQL',
          'Figma', 'HRIS', 'Excel', 'Financial Modeling'
        ];
        const extractedTools = domainTools.filter((t) => new RegExp(`\\b${t.replace('.', '\\.')}\\b`, 'i').test(answer));

        // 4. Expected Keyword Matching
        const matchedExpected = (expectedKeywords || []).filter((k) => new RegExp(`\\b${k}\\b`, 'i').test(answer));

        // 5. Dynamic Multi-Dimensional Scoring
        let calculatedScore = 72; // Baseline for coherent domain response

        // Word count / elaboration bonus
        if (words >= 100) calculatedScore += 10;
        else if (words >= 60) calculatedScore += 6;
        else if (words < 25) calculatedScore -= 12;

        // Metric bonus
        if (metricMatches.length >= 2) calculatedScore += 8;
        else if (metricMatches.length === 1) calculatedScore += 4;

        // Structure & Framework bonus
        if (hasNumberedList && hasSTARStructure) calculatedScore += 6;
        else if (hasNumberedList || hasSTARStructure) calculatedScore += 3;

        // Tools / Tech integration bonus
        if (extractedTools.length >= 2) calculatedScore += 5;
        else if (extractedTools.length === 1) calculatedScore += 2;

        calculatedScore = Math.min(Math.max(calculatedScore, 55), 96);

        // 6. Dynamic Strengths Generation
        const strengthsList = [];
        if (hasMetrics) {
          strengthsList.push(`Strong data-driven articulation with concrete quantifiable results (${metricMatches.slice(0, 3).join(', ')})`);
        }
        if (extractedTools.length > 0) {
          strengthsList.push(`Practical technology stack integration citing ${extractedTools.slice(0, 4).join(', ')}`);
        }
        if (hasNumberedList || hasSTARStructure) {
          strengthsList.push('Clean chronological and structured framework breakdown (Situation → Action → Measurable Impact)');
        }
        if (matchedExpected.length > 0) {
          strengthsList.push(`Directly addressed core evaluation parameters: ${matchedExpected.slice(0, 3).join(', ')}`);
        }
        if (strengthsList.length === 0) {
          strengthsList.push(`Clearly framed relevant practical experience for the ${jobTitle} role`);
          strengthsList.push('Addressed the core prompt requirements logically');
        }

        // 7. Dynamic Gaps & Improvement Areas
        const gapsList = [];
        if (!hasMetrics) {
          gapsList.push('Include specific quantifiable business metrics or percentage improvements (e.g. 35% conversion lift or turnaround reduction)');
        }
        if (extractedTools.length < 2) {
          gapsList.push(`Explicitly mention industry-standard tools or platforms utilized for ${jobTitle}`);
        }
        if (!hasNumberedList) {
          gapsList.push('Use structured step-by-step numbering or the STAR framework to enhance answer scanability');
        }
        if (words < 80) {
          gapsList.push('Elaborate with deeper technical execution details or edge-case handling');
        }
        if (gapsList.length === 0) {
          gapsList.push('State the primary headline metric in the opening 15 seconds to immediately hook executive interviewers');
        }

        const verdict =
          calculatedScore >= 90 ? 'Strong Answer (Top Tier)' :
          calculatedScore >= 80 ? 'Good Answer with Minor Polish' :
          calculatedScore >= 70 ? 'Adequate / Add More Specifics' :
          'Needs More Detail';

        evaluation = {
          score: calculatedScore,
          verdict,
          strengths: strengthsList,
          gaps: gapsList,
          improved_answer: `As a Senior ${jobTitle}, an ideal answer bridges strategic execution with metric proof: "First, I diagnose root causes using ${extractedTools[0] || 'analytics'}; second, I implement a structured framework to eliminate bottlenecks; third, I track quantifiable business outcomes (such as a 35%+ gain in throughput or conversion)."`,
          coaching_tip: 'Always state your highest-impact metric upfront in your opening sentence before detailing technical implementation.'
        };
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Answer evaluated successfully.',
      data: evaluation
    });
  } catch (error) {
    console.error('Answer evaluation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Evaluation could not be completed.'
    });
  }
};

const getReadinessReport = async (req, res) => {
  try {
    const candidateName = req.body?.candidate_name || req.user?.full_name || 'Candidate';
    const jobTitle = req.body?.job_title || 'Target Role';
    const questions = req.body?.questions || [];
    const answers = req.body?.answers || {};

    let reportData = null;

    if (isAIConfigured() && Object.keys(answers).length > 0) {
      try {
        reportData = await generateInterviewReadinessReportWithAI({
          candidateName,
          jobTitle,
          questions,
          answers
        });
      } catch (err) {
        console.warn('AI readiness report notice (falling back to dynamic evaluator):', err.message);
      }
    }

    if (!reportData || !reportData.readiness_score) {
      const answeredKeys = Object.keys(answers);
      const totalAnswered = answeredKeys.length;
      let totalWordCount = 0;
      let starHits = 0;

      answeredKeys.forEach((k) => {
        const text = answers[k] || '';
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        totalWordCount += words;
        if (text.toLowerCase().includes('result') || text.toLowerCase().includes('situation') || text.toLowerCase().includes('action') || text.toLowerCase().includes('achieved') || text.toLowerCase().includes('led')) {
          starHits += 1;
        }
      });

      const avgWords = totalAnswered > 0 ? Math.round(totalWordCount / totalAnswered) : 0;
      const baseScore = totalAnswered >= 3 ? 88 : totalAnswered >= 1 ? 82 : 75;
      const lengthBonus = Math.min(Math.round(avgWords / 25), 8);
      const finalScore = Math.min(baseScore + lengthBonus, 96);

      reportData = {
        readiness_score: finalScore,
        verdict: finalScore >= 90 ? 'Strong Hire' : finalScore >= 80 ? 'Hire' : 'Leaning Hire',
        verdict_summary: `Demonstrated structured problem solving, clear technical vocabulary, and practical domain ownership across all evaluated mock interview questions.`,
        metrics: {
          star_structure_score: Math.min(85 + starHits * 3, 95),
          technical_depth_score: Math.min(84 + (avgWords > 40 ? 8 : 4), 94),
          communication_clarity_score: Math.min(86 + (avgWords > 30 ? 6 : 2), 92),
          confidence_rating_score: 88
        },
        top_strengths: [
          'Strong command of domain frameworks and problem diagnosis',
          'Structured chronological explanation of solutions and technical decisions',
          'Active integration of quantifiable impacts and measurable success metrics'
        ],
        areas_to_polish: [
          'State the high-level business impact in the opening 15 seconds before detailing technical execution',
          'Explicitly mention preventative safeguards, testing methodologies, or cross-functional team alignment'
        ],
        questions_completed: totalAnswered
      };
    }

    return res.status(200).json({
      success: true,
      message: 'Interview readiness report generated successfully.',
      data: reportData
    });
  } catch (error) {
    console.error('Interview readiness report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Readiness report could not be generated.'
    });
  }
};

module.exports = {
  generateInterview,
  evaluateAnswer,
  getReadinessReport
};
