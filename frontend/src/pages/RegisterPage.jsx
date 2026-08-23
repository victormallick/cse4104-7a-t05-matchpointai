import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        password: form.password
      });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field) => (event) =>
    setForm({ ...form, [field]: event.target.value });

  return (
    <AuthLayout>
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Start preparing</span>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">Create account</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Build a focused career preparation workspace.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
        <Button
          type="button"
          variant="outline"
          onClick={loginWithGoogle}
          className="h-11 w-full border-slate-200/90 bg-white dark:bg-[#0b1222] dark:border-slate-800 text-slate-800 dark:text-slate-100 font-semibold gap-2.5 cursor-pointer shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
        >
          <svg className="size-4.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign up with Google</span>
        </Button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#0f172a] px-3 text-slate-400 font-medium">Or continue with email</span>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-full_name" className="text-xs font-semibold text-slate-700 dark:text-slate-200">Full name</Label>
          <Input
            id="register-full_name"
            type="text"
            placeholder="John Doe"
            className="h-11 bg-slate-50 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            value={form.full_name}
            onChange={updateField('full_name')}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-email" className="text-xs font-semibold text-slate-700 dark:text-slate-200">Email</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="name@example.com"
            className="h-11 bg-slate-50 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            value={form.email}
            onChange={updateField('email')}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="register-password" className="text-xs font-semibold text-slate-700 dark:text-slate-200">Password</Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              minLength={6}
              className="h-11 bg-slate-50 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800 pr-10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              value={form.password}
              onChange={updateField('password')}
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

        <div className="grid gap-2">
          <Label htmlFor="register-confirmPassword" className="text-xs font-semibold text-slate-700 dark:text-slate-200">Confirm password</Label>
          <div className="relative">
            <Input
              id="register-confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              minLength={6}
              className="h-11 bg-slate-50 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800 pr-10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="mt-2 h-11 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20 cursor-pointer hover:opacity-95" disabled={loading}>
          {loading ? 'Creating account…' : <>Register <ArrowRight className="size-4 ml-1" /></>}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already registered? <Link className="font-semibold text-blue-600 dark:text-blue-400 hover:underline" to="/login">Login</Link>
      </p>
    </AuthLayout>
  );
}
