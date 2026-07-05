import { AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({
    email: 'amina.rahman@example.com',
    password: 'password123'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const session = await login(form);
      const destination = session.user.role === 'admin'
        ? '/admin'
        : location.state?.from || '/dashboard';
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const useAdmin = () => setForm({
    email: 'admin@matchpoint.ai',
    password: 'password123'
  });

  return (
    <AuthLayout>
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Welcome back</span>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Sign in</h2>
        <p className="mt-2 text-sm text-slate-500">Continue to your MatchPoint AI workspace.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            className="h-11 bg-slate-50"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            type="password"
            className="h-11 bg-slate-50"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </div>
        <Button type="submit" className="h-11 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20" disabled={loading}>
          {loading ? 'Signing in…' : <>Login <ArrowRight /></>}
        </Button>
      </form>

      <Button variant="ghost" className="mx-auto mt-4 flex text-violet-700" type="button" onClick={useAdmin}>
        <ShieldCheck /> Fill admin demo credentials
      </Button>
      <p className="mt-5 text-center text-sm text-slate-500">
        Need an account? <Link className="font-semibold text-blue-600 hover:underline" to="/register">Register</Link>
      </p>
      <p className="mt-2 text-center text-xs text-slate-400">
        Demo mode accepts any valid email and a non-empty password.
      </p>
    </AuthLayout>
  );
}
