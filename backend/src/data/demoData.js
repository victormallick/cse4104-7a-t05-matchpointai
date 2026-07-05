const { randomUUID } = require('crypto');

const DEMO_USER_ID = '11111111-1111-4111-8111-111111111111';
const DEMO_ADMIN_ID = '99999999-9999-4999-8999-999999999999';

const now = () => new Date().toISOString();

const demoUser = {
  id: DEMO_USER_ID,
  email: 'amina.rahman@example.com',
  full_name: 'Amina Rahman',
  role: 'candidate',
  target_job_role: 'Frontend Software Engineer',
  portfolio_url: 'https://portfolio.example.com',
  status: 'active',
  created_at: '2026-05-24T08:30:00.000Z',
  updated_at: now()
};

const adminUser = {
  id: DEMO_ADMIN_ID,
  email: 'admin@matchpoint.ai',
  full_name: 'MatchPoint Admin',
  role: 'admin',
  status: 'active',
  created_at: '2026-05-20T06:00:00.000Z'
};

const history = [
  {
    analysis_id: 'a1111111-1111-4111-8111-111111111111',
    job_title: 'Frontend Developer',
    company: 'NovaLabs',
    ats_score: 88,
    missing_keywords: ['Docker', 'CI/CD', 'GraphQL'],
    missing_skills: ['Deployment automation', 'API testing'],
    analyzed_at: '2026-06-20T10:42:00.000Z'
  },
  {
    analysis_id: 'a2222222-2222-4222-8222-222222222222',
    job_title: 'Backend Engineer',
    company: 'CloudGrid',
    ats_score: 82,
    missing_keywords: ['Redis', 'Kubernetes'],
    missing_skills: ['Distributed caching', 'Cloud monitoring'],
    analyzed_at: '2026-06-12T09:15:00.000Z'
  },
  {
    analysis_id: 'a3333333-3333-4333-8333-333333333333',
    job_title: 'React Developer',
    company: 'BluePeak',
    ats_score: 76,
    missing_keywords: ['Jest', 'TypeScript'],
    missing_skills: ['Automated testing'],
    analyzed_at: '2026-06-04T08:30:00.000Z'
  }
];

const jobRecommendations = [
  {
    id: 'j1111111-1111-4111-8111-111111111111',
    job_title: 'AI Frontend Engineer',
    company: 'TalentHub',
    location: 'Dhaka · Hybrid',
    match_score: 94,
    job_url: 'https://example.com/jobs/ai-frontend-engineer',
    is_saved: true,
    skills: ['React', 'TypeScript', 'REST APIs']
  },
  {
    id: 'j2222222-2222-4222-8222-222222222222',
    job_title: 'Software Developer III',
    company: 'MatchWorks',
    location: 'Remote',
    match_score: 89,
    job_url: 'https://example.com/jobs/software-developer',
    is_saved: false,
    skills: ['Node.js', 'PostgreSQL', 'CI/CD']
  },
  {
    id: 'j3333333-3333-4333-8333-333333333333',
    job_title: 'Full Stack Engineer',
    company: 'CloudGrid',
    location: 'Khulna · On-site',
    match_score: 86,
    job_url: 'https://example.com/jobs/full-stack-engineer',
    is_saved: false,
    skills: ['React', 'Express', 'Docker']
  }
];

const adminUsers = [
  { ...demoUser, analyses: 12, last_active: '2 minutes ago' },
  {
    id: '22222222-2222-4222-8222-222222222222',
    full_name: 'Noah Chen',
    email: 'noah.chen@example.com',
    role: 'candidate',
    status: 'active',
    analyses: 15,
    last_active: '18 minutes ago'
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    full_name: 'Maya Patel',
    email: 'maya.patel@example.com',
    role: 'candidate',
    status: 'active',
    analyses: 18,
    last_active: '1 hour ago'
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'candidate',
    status: 'active',
    analyses: 21,
    last_active: '3 hours ago'
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    full_name: 'Sarah Smith',
    email: 'sarah.smith@example.com',
    role: 'candidate',
    status: 'active',
    analyses: 24,
    last_active: 'Yesterday'
  }
];

const adminLogs = [
  {
    id: randomUUID(),
    level: 'info',
    action_type: 'AI_HEALTH_CHECK',
    description: 'AI score model health checked',
    performed_at: '2026-07-05T10:42:00.000Z'
  },
  {
    id: randomUUID(),
    level: 'success',
    action_type: 'ANALYSIS_BATCH',
    description: 'New analysis batch completed',
    performed_at: '2026-07-05T09:15:00.000Z'
  },
  {
    id: randomUUID(),
    level: 'info',
    action_type: 'LATENCY_CHECK',
    description: 'Keyword extractor latency is within the normal range',
    performed_at: '2026-07-05T08:30:00.000Z'
  },
  {
    id: randomUUID(),
    level: 'warning',
    action_type: 'AUTH_WARNING',
    description: 'Failed demo login attempt was safely rejected',
    performed_at: '2026-07-04T16:12:00.000Z'
  },
  {
    id: randomUUID(),
    level: 'success',
    action_type: 'BACKUP',
    description: 'Database backup completed successfully',
    performed_at: '2026-07-04T02:00:00.000Z'
  }
];

const interviewQuestions = {
  technical: [
    {
      id: 'technical-1',
      topic: 'React performance',
      difficulty: 'Medium',
      question: 'Explain your approach to optimizing a React dashboard that renders frequently changing data.'
    },
    {
      id: 'technical-2',
      topic: 'API design',
      difficulty: 'Medium',
      question: 'How would you design a secure resume parsing API for PDF and DOCX uploads?'
    },
    {
      id: 'technical-3',
      topic: 'CI/CD',
      difficulty: 'Hard',
      question: 'How would you build a CI/CD pipeline that tests and safely deploys this application?'
    }
  ],
  behavioral: [
    {
      id: 'behavioral-1',
      topic: 'Quality',
      difficulty: 'Medium',
      question: 'Tell me about a time you improved delivery quality while working under a deadline.'
    },
    {
      id: 'behavioral-2',
      topic: 'Learning',
      difficulty: 'Easy',
      question: 'Describe a situation where you had to learn a new tool quickly to complete a project.'
    }
  ],
  hr: [
    {
      id: 'hr-1',
      topic: 'Motivation',
      difficulty: 'Easy',
      question: 'Why are you interested in this role, and how does it support your career goals?'
    },
    {
      id: 'hr-2',
      topic: 'Growth',
      difficulty: 'Easy',
      question: 'What skill would you most like to develop during your first six months?'
    }
  ]
};

const store = {
  profiles: new Map([
    [DEMO_USER_ID, { ...demoUser }],
    [DEMO_ADMIN_ID, { ...adminUser }]
  ]),
  resumes: new Map(),
  analyses: new Map(history.map((item) => [item.analysis_id, { ...item }])),
  history: [...history]
};

const analytics = {
  overview: {
    total_users: 1248,
    total_analyses: 3842,
    ai_calls: 18642,
    system_alerts: 3
  },
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
  recent_activity: [
    'Amina Rahman signed up',
    'Noah Chen analyzed a resume',
    'System backup completed'
  ]
};

const aiUsage = {
  total_calls: 18642,
  success_rate: 99.4,
  average_latency: '1.2s',
  quota_used_percent: 63,
  endpoints: [
    { name: 'Resume parsing', model: 'Local parser', latency: '0.4s', status: 'healthy' },
    { name: 'ATS and keyword analysis', model: 'Demo rules engine', latency: '0.8s', status: 'healthy' },
    { name: 'Mock interview generator', model: 'Demo question bank', latency: '0.3s', status: 'healthy' }
  ]
};

module.exports = {
  DEMO_USER_ID,
  DEMO_ADMIN_ID,
  demoUser,
  adminUser,
  adminUsers,
  adminLogs,
  aiUsage,
  analytics,
  interviewQuestions,
  jobRecommendations,
  store,
  now
};
