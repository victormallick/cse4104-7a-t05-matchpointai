import { AlertCircle, ArrowRight } from 'lucide-react';
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

  const fields = [
    ['full_name', 'Full name', 'text'],
    ['email', 'Email', 'email'],
    ['password', 'Password', 'password'],
    ['confirmPassword', 'Confirm password', 'password']
  ];

  return (
    <AuthLayout>
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Start preparing</span>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Create account</h2>
        <p className="mt-2 text-sm text-slate-500">Build a focused career preparation workspace.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
        {fields.map(([field, label, type]) => (
          <div className="grid gap-2" key={field}>
            <Label htmlFor={`register-${field}`}>{label}</Label>
            <Input
              id={`register-${field}`}
              type={type}
              minLength={type === 'password' ? 6 : undefined}
              className="h-11 bg-slate-50"
              value={form[field]}
              onChange={updateField(field)}
              required
            />
          </div>
        ))}
        <Button type="submit" className="mt-1 h-11 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20" disabled={loading}>
          {loading ? 'Creating account…' : <>Register <ArrowRight /></>}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered? <Link className="font-semibold text-blue-600 hover:underline" to="/login">Login</Link>
      </p>
    </AuthLayout>
  );
}
