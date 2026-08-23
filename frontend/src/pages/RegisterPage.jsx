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
  const { register } = useAuth();
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
