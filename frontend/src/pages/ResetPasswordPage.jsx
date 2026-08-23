import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '../components/AuthLayout';
import { authApi } from '../services/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Extract access_token from URL hash or query params
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setToken(accessToken);
      }
    } else {
      const queryParams = new URLSearchParams(window.location.search);
      const queryToken = queryParams.get('token') || queryParams.get('access_token');
      if (queryToken) {
        setToken(queryToken);
      }
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ password, token }, token);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
          Security Update
        </span>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
          Reset password
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Choose a strong, new password for your MatchPoint AI account.
        </p>
      </div>

      {success ? (
        <div className="mt-7 grid gap-6 animate-fade-in-up">
          <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/80 p-6 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
            <div className="flex items-start gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white shrink-0">
                <CheckCircle2 className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm">Password updated successfully!</h3>
                <p className="text-xs leading-5 text-emerald-800 dark:text-emerald-300">
                  Your new credentials are now active. Redirecting you to sign in...
                </p>
              </div>
            </div>
          </div>

          <Link to="/login" className="w-full">
            <Button className="h-11 w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-xs font-semibold">
              Go to Sign in now <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="reset-password" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  minLength={6}
                  className="h-11 bg-slate-50 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800 pr-10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <Label htmlFor="reset-confirmPassword" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="reset-confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  minLength={6}
                  className="h-11 bg-slate-50 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800 pr-10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

            <Button
              type="submit"
              className="mt-2 h-11 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20 cursor-pointer hover:opacity-95 text-xs font-semibold"
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? 'Updating password…' : 'Save New Password'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Back to{' '}
            <Link className="font-semibold text-blue-600 dark:text-blue-400 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
