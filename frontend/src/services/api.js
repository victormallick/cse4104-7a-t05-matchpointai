import axios from 'axios';
import {
  demoAdmin,
  demoHistory,
  demoJobs,
  demoQuestions,
  demoResult
} from '../data/demoData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 60000
});

api.interceptors.request.use((config) => {
  const session = JSON.parse(localStorage.getItem('matchpoint_session') || 'null');
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

const dataOrFallback = async (request, fallback) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    if (!error.response) {
      return {
        success: true,
        message: 'Backend unavailable; showing browser demo data.',
        data: fallback,
        offline_demo: true
      };
    }
    throw new Error(error.response.data?.message || 'The request could not be completed.');
  }
};

export const authApi = {
  login: (payload) => api.post('/api/auth/login', payload).then((response) => response.data),
  register: (payload) => api.post('/api/auth/register', payload).then((response) => response.data),
  logout: () => api.post('/api/auth/logout').then((response) => response.data)
};

export const userApi = {
  profile: () => dataOrFallback(
    () => api.get('/api/user/profile'),
    {
      id: '11111111-1111-4111-8111-111111111111',
      full_name: 'Amina Rahman',
      email: 'amina.rahman@example.com',
      role: 'candidate',
      target_job_role: 'Frontend Software Engineer',
      portfolio_url: 'https://portfolio.example.com'
    }
  ),
  updateProfile: (payload) => api.put('/api/user/profile', payload).then((response) => response.data),
  history: () => dataOrFallback(() => api.get('/api/user/history'), demoHistory)
};

export const analysisApi = {
  upload: (file, userId) => {
    const form = new FormData();
    form.append('resume', file);
    form.append('user_id', userId);
    return api.post('/api/upload', form).then((response) => response.data);
  },
  analyze: (payload) => api.post('/api/analysis/gap-analysis', payload).then((response) => response.data),
  interview: (payload) => dataOrFallback(
    () => api.post('/api/interview/generate', payload),
    { questions: demoQuestions }
  ),
  evaluateAnswer: (payload) => api.post('/api/interview/evaluate', payload).then((response) => response.data),
  getReadinessReport: (payload) => api.post('/api/interview/readiness-report', payload).then((response) => response.data)
};

export const interviewApi = analysisApi;

export const jobsApi = {
  recommendations: (payload) => dataOrFallback(
    () => api.post('/api/jobs/recommendations', payload || {}),
    demoJobs
  ),
  generateCoverLetter: (payload) => api.post('/api/jobs/cover-letter', payload).then((response) => response.data)
};

export const adminApi = {
  analytics: () => dataOrFallback(() => api.get('/api/admin/analytics'), demoAdmin.analytics),
  users: () => dataOrFallback(() => api.get('/api/admin/users'), demoAdmin.users),
  aiUsage: () => dataOrFallback(() => api.get('/api/admin/ai-usage'), demoAdmin.aiUsage),
  logs: () => dataOrFallback(() => api.get('/api/admin/logs'), demoAdmin.logs)
};

export { demoResult };
export default api;
