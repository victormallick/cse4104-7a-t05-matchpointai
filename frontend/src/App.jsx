import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzePage from './pages/AnalyzePage';
import ResultPage from './pages/ResultPage';
import InterviewPage from './pages/InterviewPage';
import JobsPage from './pages/JobsPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import {
  AdminAnalyticsPage,
  AdminDashboardPage,
  AdminLogsPage,
  AdminUsagePage,
  AdminUsersPage
} from './pages/AdminPages';

const CandidateShell = () => (
  <ProtectedRoute>
    <AppLayout />
  </ProtectedRoute>
);

const AdminShell = () => (
  <ProtectedRoute admin>
    <AppLayout admin />
  </ProtectedRoute>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<CandidateShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route element={<AdminShell />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/ai-usage" element={<AdminUsagePage />} />
        <Route path="/admin/logs" element={<AdminLogsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
