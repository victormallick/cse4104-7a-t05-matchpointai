export const demoResult = {
  analysis_id: 'a1111111-1111-4111-8111-111111111111',
  job_title: 'Frontend Developer',
  company: 'NovaLabs',
  ats_score: 88,
  summary: 'Your resume is a promising match. Add evidence for the highlighted gaps to improve ATS alignment.',
  missing_keywords: ['Docker', 'CI/CD', 'GraphQL', 'Jest', 'Agile'],
  missing_skills: ['Deployment automation', 'API testing', 'Cloud monitoring'],
  improvement_suggestions: [
    {
      title: 'Quantify your impact',
      detail: 'Add measurable outcomes to recent projects and experience bullets.'
    },
    {
      title: 'Mirror the target role',
      detail: 'Use important job-description verbs naturally in your experience.'
    },
    {
      title: 'Strengthen the skills section',
      detail: 'Group technical skills by language, framework, tooling, and cloud.'
    }
  ]
};

export const demoHistory = [
  { analysis_id: '1', job_title: 'Frontend Developer', company: 'NovaLabs', ats_score: 88, analyzed_at: '2026-06-20T10:42:00Z' },
  { analysis_id: '2', job_title: 'Backend Engineer', company: 'CloudGrid', ats_score: 82, analyzed_at: '2026-06-12T09:15:00Z' },
  { analysis_id: '3', job_title: 'React Developer', company: 'BluePeak', ats_score: 76, analyzed_at: '2026-06-04T08:30:00Z' }
];

export const demoJobs = [
  { id: '1', job_title: 'AI Frontend Engineer', company: 'TalentHub', location: 'Dhaka · Hybrid', match_score: 94, is_saved: true, skills: ['React', 'TypeScript', 'REST APIs'] },
  { id: '2', job_title: 'Software Developer III', company: 'MatchWorks', location: 'Remote', match_score: 89, is_saved: false, skills: ['Node.js', 'PostgreSQL', 'CI/CD'] },
  { id: '3', job_title: 'Full Stack Engineer', company: 'CloudGrid', location: 'Khulna · On-site', match_score: 86, is_saved: false, skills: ['React', 'Express', 'Docker'] }
];

export const demoQuestions = {
  technical: [
    { id: 't1', topic: 'React performance', difficulty: 'Medium', question: 'Explain your approach to optimizing a React dashboard.' },
    { id: 't2', topic: 'API design', difficulty: 'Medium', question: 'How would you design a secure resume parsing API?' },
    { id: 't3', topic: 'CI/CD', difficulty: 'Hard', question: 'How would you build and validate a safe deployment pipeline?' }
  ],
  behavioral: [
    { id: 'b1', topic: 'Quality', difficulty: 'Medium', question: 'Tell me about a time you improved delivery quality.' },
    { id: 'b2', topic: 'Learning', difficulty: 'Easy', question: 'Describe a time you learned a new tool under a deadline.' }
  ],
  hr: [
    { id: 'h1', topic: 'Motivation', difficulty: 'Easy', question: 'Why are you interested in this role?' },
    { id: 'h2', topic: 'Growth', difficulty: 'Easy', question: 'What would you like to learn in your first six months?' }
  ]
};

export const demoAdmin = {
  analytics: {
    overview: { total_users: 1248, total_analyses: 3842, ai_calls: 18642, system_alerts: 3 },
    trends: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      active_users: [38, 57, 43, 74, 52, 83, 69],
      analyses: [44, 61, 58, 79, 67, 88, 94]
    },
    system_status: [
      { service: 'Database', status: 'online' },
      { service: 'AI Engine', status: 'demo' },
      { service: 'API Gateway', status: 'online' }
    ],
    recent_activity: ['Amina Rahman signed up', 'Noah Chen analyzed a resume', 'System backup completed']
  },
  users: [
    { id: '1', full_name: 'Amina Rahman', email: 'amina.rahman@example.com', status: 'active', analyses: 12 },
    { id: '2', full_name: 'Noah Chen', email: 'noah.chen@example.com', status: 'active', analyses: 15 },
    { id: '3', full_name: 'Maya Patel', email: 'maya.patel@example.com', status: 'active', analyses: 18 },
    { id: '4', full_name: 'John Doe', email: 'john.doe@example.com', status: 'active', analyses: 21 },
    { id: '5', full_name: 'Sarah Smith', email: 'sarah.smith@example.com', status: 'active', analyses: 24 }
  ],
  aiUsage: {
    total_calls: 18642,
    success_rate: 99.4,
    average_latency: '1.2s',
    quota_used_percent: 63,
    endpoints: [
      { name: 'Resume parsing', model: 'Local parser', latency: '0.4s', status: 'healthy' },
      { name: 'ATS and keyword analysis', model: 'Demo rules engine', latency: '0.8s', status: 'healthy' },
      { name: 'Mock interview generator', model: 'Demo question bank', latency: '0.3s', status: 'healthy' }
    ]
  },
  logs: [
    { id: '1', level: 'info', description: 'AI score model health checked', performed_at: '2026-07-05T10:42:00Z' },
    { id: '2', level: 'success', description: 'New analysis batch completed', performed_at: '2026-07-05T09:15:00Z' },
    { id: '3', level: 'info', description: 'Keyword extractor latency is normal', performed_at: '2026-07-05T08:30:00Z' },
    { id: '4', level: 'warning', description: 'Failed demo login attempt was safely rejected', performed_at: '2026-07-04T16:12:00Z' },
    { id: '5', level: 'success', description: 'Database backup completed successfully', performed_at: '2026-07-04T02:00:00Z' }
  ]
};
