import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
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
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <AuthLayout>
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Welcome back</span>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-100">Sign in</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Continue to your MatchPoint AI workspace.</p>
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
            placeholder="name@example.com"
            className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-10"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="h-11 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20 cursor-pointer hover:opacity-95" disabled={loading}>
          {loading ? 'Signing in…' : <>Login <ArrowRight /></>}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Need an account? <Link className="font-semibold text-blue-600 dark:text-blue-400 hover:underline" to="/register">Register</Link>
      </p>
    </AuthLayout>
  );
}
