import { AlertCircle, ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '../components/AuthLayout';
import { authApi } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword({
        email,
        redirect_to: `${window.location.origin}/reset-password`
      });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
          Account Recovery
        </span>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
          Forgot password?
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Enter your registered email address and we'll send you a link to reset your password.
        </p>
      </div>

      {sent ? (
        <div className="mt-7 grid gap-6 animate-fade-in-up">
          <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/80 p-6 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
            <div className="flex items-start gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-white shrink-0">
                <CheckCircle2 className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm">Reset link dispatched!</h3>
                <p className="text-xs leading-5 text-emerald-800 dark:text-emerald-300">
                  If an account exists for <span className="font-semibold">{email}</span>, you will receive an email shortly with instructions to reset your password.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setSent(false); setEmail(''); }}
              className="h-11 border-slate-200 dark:border-slate-800 cursor-pointer text-xs font-semibold"
            >
              Try another email
            </Button>
            <Link to="/login" className="w-full">
              <Button className="h-11 w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-xs font-semibold">
                Back to Sign in
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="forgot-email" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Registered Email
              </Label>
              <div className="relative">
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-11 pl-10 bg-slate-50 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20 cursor-pointer hover:opacity-95 text-xs font-semibold gap-2"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                'Sending reset link…'
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <Send className="size-3.5 ml-1" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Remembered your password?{' '}
            <Link className="font-semibold text-blue-600 dark:text-blue-400 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
