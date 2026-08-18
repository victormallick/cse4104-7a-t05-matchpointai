// Cloudflare Worker main entrypoint with static assets and API routes

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id, X-Demo-Role',
  'Content-Type': 'application/json'
};

const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: CORS_HEADERS
  });
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS Preflight
    if (request.method.toUpperCase() === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS, status: 204 });
    }

    // 1. API Routes
    if (url.pathname.startsWith('/api')) {
      const path = url.pathname.replace(/^\/api/, '');
      const method = request.method.toUpperCase();

      // Health
      if (path === '/health' || path === '' || path === '/') {
        return jsonResponse({
          success: true,
          message: 'MatchPoint AI Cloudflare Worker is healthy.',
          data: {
            environment: 'cloudflare-worker',
            time: new Date().toISOString()
          }
        });
      }

      // Jobs
      if (path === '/jobs/recommendations' && method === 'POST') {
        let body = {};
        try { body = await request.json(); } catch (e) {}
        const jobTitle = body.job_title || 'Software Engineer';
        const region = body.region || 'bangladesh';
        const skills = body.skills || [];

        const bdJobs = [
          {
            id: 'cf_bd_1',
            job_title: `${jobTitle} (Full-Time)`,
            company: 'Brain Station 23',
            location: 'Dhaka, Bangladesh (Hybrid)',
            salary_range: '৳1,10,000 - ৳1,60,000 / month',
            match_score: 94,
            match_rationale: `Strong alignment with your core ${skills.slice(0, 2).join(' and ') || 'development'} background.`,
            skills: skills.length > 0 ? skills.slice(0, 3) : ['React', 'Node.js', 'PostgreSQL'],
            growth_skills: ['Docker', 'Microservices'],
            job_url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}&location=Bangladesh`
          },
          {
            id: 'cf_bd_2',
            job_title: `${jobTitle}`,
            company: 'KAZ Software',
            location: 'Dhaka, Bangladesh',
            salary_range: '৳90,000 - ৳1,40,000 / month',
            match_score: 89,
            match_rationale: 'Active requirements for engineering candidates with scalable system delivery.',
            skills: skills.length > 0 ? skills.slice(0, 2) : ['React', 'JavaScript'],
            growth_skills: ['AWS', 'CI/CD'],
            job_url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}&location=Bangladesh`
          }
        ];

        const abroadJobs = [
          {
            id: 'cf_abroad_1',
            job_title: `${jobTitle} (Remote)`,
            company: 'Turing Global',
            location: 'Worldwide · Remote',
            salary_range: '$4,500 - $7,000 / month',
            match_score: 92,
            match_rationale: 'High compatibility with remote engineering standards and distributed team delivery.',
            skills: skills.length > 0 ? skills.slice(0, 3) : ['TypeScript', 'Node.js', 'PostgreSQL'],
            growth_skills: ['GraphQL', 'Kubernetes'],
            job_url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(jobTitle)}&location=Worldwide`
          }
        ];

        return jsonResponse({
          success: true,
          message: 'Job recommendations loaded successfully.',
          data: region === 'abroad' ? abroadJobs : bdJobs
        });
      }

      // Interview
      if (path === '/interview/generate' && method === 'POST') {
        let body = {};
        try { body = await request.json(); } catch (e) {}
        const jobTitle = body.job_title || 'Target Role';

        return jsonResponse({
          success: true,
          message: 'Tailored interview questions generated successfully.',
          data: {
            job_title: jobTitle,
            questions: {
              technical: [
                {
                  id: 'cf_tech_1',
                  question: `In your role as a ${jobTitle}, how do you approach architectural trade-offs between delivery velocity and maintainability?`,
                  context: 'Assesses technical seniority, ownership, and systematic engineering methodology.',
                  expected_keywords: ['Modular Architecture', 'Technical Debt', 'Test Coverage', 'Scalability']
                }
              ],
              behavioral: [
                {
                  id: 'cf_behav_1',
                  question: `Describe a situation where project requirements shifted mid-sprint. How did you realign priorities?`,
                  context: 'Tests adaptability, cross-functional communication, and stakeholder management under deadlines.',
                  expected_keywords: ['Sprint Prioritization', 'Stakeholder Communication', 'Risk Mitigation']
                }
              ],
              hr: [
                {
                  id: 'cf_hr_1',
                  question: `What motivated you to specialize as a ${jobTitle}, and what does your ideal engineering team culture look like?`,
                  context: 'Evaluates long-term career drive, team alignment, and cultural contribution.',
                  expected_keywords: ['Continuous Learning', 'Collaborative Culture', 'Mentorship']
                }
              ]
            }
          }
        });
      }

      // Gap Analysis
      if (path === '/analysis/gap-analysis' && method === 'POST') {
        let body = {};
        try { body = await request.json(); } catch (e) {}
        const jobTitle = body.job_title || 'Target Role';

        return jsonResponse({
          success: true,
          message: 'Resume analysis completed successfully.',
          data: {
            ats_score: 88,
            is_valid_resume: true,
            job_title: jobTitle,
            summary: `Strong baseline alignment detected for ${jobTitle}. Quantifying your project bullet points with measurable metrics will elevate your profile to the top 5%.`,
            matched_skills: ['Core Domain Experience', 'Project Leadership', 'System Design'],
            missing_skills: ['Cloud Architecture & CI/CD', 'Automated Integration Testing', 'Distributed Caching'],
            improvement_suggestions: [
              {
                title: 'Quantify Engineering Impact with Metrics',
                detail: 'Include concrete numbers like percentage throughput increases, latency drops, or conversion gains in your project descriptions.'
              }
            ],
            improved_bullets: [
              {
                original: 'Worked on web applications and improved features.',
                improved: 'Spearheaded full-stack application feature development, reducing API response times by 35% and supporting 50k+ active users.'
              }
            ]
          }
        });
      }

      return jsonResponse({ success: false, message: 'Endpoint not found' }, 404);
    }

    // 2. Static Assets (SPA)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
