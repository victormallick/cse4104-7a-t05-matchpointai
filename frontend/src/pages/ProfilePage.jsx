import { AlertCircle, CheckCircle2, Link as LinkIcon, Mail, Save, Target, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: user.full_name,
    email: user.email,
    target_job_role: '',
    portfolio_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    userApi.profile()
      .then((response) => setProfile(response.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await userApi.updateProfile({
        full_name: profile.full_name,
        target_job_role: profile.target_job_role,
        portfolio_url: profile.portfolio_url
      });
      setProfile(response.data);
      setMessage(response.message);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
        <PageHeader title="User Profile" />
        <LoadingState message="Loading your profile…" />
      </div>
    );
  }

  const initials = profile.full_name?.split(' ').map((part) => part[0]).join('').slice(0, 2);

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      <PageHeader
        eyebrow="Personal settings"
        title="User Profile"
        description="Keep your career goal and contact details up to date."
      />

      <Card className="max-w-5xl border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="size-18 rounded-2xl">
              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold text-slate-950">{profile.full_name}</h2>
              <p className="truncate text-sm text-slate-500">{profile.email}</p>
            </div>
            <Badge className="ml-0 gap-2 bg-emerald-100 text-emerald-800 sm:ml-auto">
              <CheckCircle2 className="size-3.5" /> Active candidate
            </Badge>
          </div>

          <Separator className="my-7" />

          {message && (
            <Alert className="mb-5 border-emerald-200 bg-emerald-50 text-emerald-800">
              <CheckCircle2 />
              <AlertDescription className="text-emerald-700">{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="profile-name" className="gap-2"><UserRound className="size-4" /> Full name</Label>
                <Input id="profile-name" className="h-11 bg-slate-50" value={profile.full_name || ''} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-email" className="gap-2"><Mail className="size-4" /> Email</Label>
                <Input id="profile-email" className="h-11 bg-slate-100" value={profile.email || ''} disabled />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-role" className="gap-2"><Target className="size-4" /> Target job role</Label>
                <Input id="profile-role" className="h-11 bg-slate-50" value={profile.target_job_role || ''} onChange={(event) => setProfile({ ...profile, target_job_role: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="profile-url" className="gap-2"><LinkIcon className="size-4" /> Portfolio URL</Label>
                <Input id="profile-url" type="url" className="h-11 bg-slate-50" value={profile.portfolio_url || ''} onChange={(event) => setProfile({ ...profile, portfolio_url: event.target.value })} />
              </div>
            </div>
            <Button type="submit" className="mt-6 h-11 bg-blue-600 px-5 text-white hover:bg-blue-700" disabled={saving}>
              <Save /> {saving ? 'Saving…' : 'Update profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
