const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DEMO_MODE = 'true';
process.env.NODE_ENV = 'test';

const app = require('../src/server');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  assert.equal(typeof body.success, 'boolean');
  assert.equal(typeof body.message, 'string');
  return { response, body };
};

test('health and demo authentication work', async () => {
  const health = await requestJson('/api/health');
  assert.equal(health.response.status, 200);
  assert.equal(health.body.data.database, 'demo');

  const login = await requestJson('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'amina.rahman@example.com',
      password: 'password123'
    })
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.body.data.session.access_token, 'demo-user-token');
});

test('profile can be loaded and updated in demo mode', async () => {
  const profile = await requestJson('/api/user/profile', {
    headers: { Authorization: 'Bearer demo-user-token' }
  });
  assert.equal(profile.response.status, 200);
  assert.equal(profile.body.data.full_name, 'Amina Rahman');

  const update = await requestJson('/api/user/profile', {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer demo-user-token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ target_job_role: 'Full Stack Engineer' })
  });
  assert.equal(update.response.status, 200);
  assert.equal(update.body.data.target_job_role, 'Full Stack Engineer');
});

test('resume upload, analysis, and interview generation form a complete flow', async () => {
  const form = new FormData();
  form.append(
    'resume',
    new Blob([
      'React JavaScript Node.js Express PostgreSQL Git. Built dashboards and REST APIs.'
    ], { type: 'text/plain' }),
    'resume.txt'
  );

  const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': '11111111-1111-4111-8111-111111111111' },
    body: form
  });
  const upload = await uploadResponse.json();
  assert.equal(uploadResponse.status, 200);
  assert.equal(upload.success, true);

  const analysis = await requestJson('/api/analysis/gap-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: '11111111-1111-4111-8111-111111111111',
      resume_id: upload.data.resume_id,
      job_title: 'Full Stack Engineer',
      company: 'CloudGrid',
      jd_text: 'Build React and TypeScript applications with Node.js, PostgreSQL, Docker, CI/CD, Jest, Redis, and Agile delivery practices.'
    })
  });
  assert.equal(analysis.response.status, 200);
  assert.ok(analysis.body.data.ats_score >= 0);
  assert.ok(analysis.body.data.missing_keywords.length > 0);

  const interview = await requestJson('/api/interview/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis_id: analysis.body.data.analysis_id })
  });
  assert.equal(interview.response.status, 200);
  assert.ok(interview.body.data.questions.technical.length > 0);
});

test('history, jobs, and admin monitoring endpoints return demo data', async () => {
  const history = await requestJson('/api/user/history');
  assert.ok(history.body.data.length >= 3);

  const jobs = await requestJson('/api/jobs/recommendations');
  assert.equal(jobs.body.data.length, 3);

  const headers = { Authorization: 'Bearer demo-admin-token' };
  const analytics = await requestJson('/api/admin/analytics', { headers });
  const users = await requestJson('/api/admin/users', { headers });
  const usage = await requestJson('/api/admin/ai-usage', { headers });
  const logs = await requestJson('/api/admin/logs', { headers });

  assert.ok(analytics.body.data.overview.total_users > 0);
  assert.ok(users.body.data.length > 0);
  assert.ok(usage.body.data.total_calls > 0);
  assert.ok(logs.body.data.length > 0);
});
