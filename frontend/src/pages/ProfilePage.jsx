import {
  AlertCircle,
  Award,
  Bookmark,
  Briefcase,
  Building,
  CheckCircle2,
  ExternalLink,
  Globe,
  Layers,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

const readLatestResult = () => {
  try {
    return JSON.parse(localStorage.getItem('matchpoint_latest_result') || 'null');
  } catch {
    return null;
  }
};

const readSavedJobsCount = () => {
  try {
    const list = JSON.parse(localStorage.getItem('matchpoint_saved_jobs') || '[]');
    return Array.isArray(list) ? list.length : 0;
  } catch {
    return 0;
  }
};

const readPracticedCount = () => {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('matchpoint_interview_answers_')) {
        const answers = JSON.parse(localStorage.getItem(key) || '{}');
        total += Object.keys(answers).length;
      }
    }
    return total;
  } catch {
    return 0;
  }
};

const domainSkillSuggestions = {
  marketing: ['Google Analytics 4 (GA4)', 'Meta Ads & Pixel', 'Search Engine Optimization (SEO)', 'Content Strategy', 'HubSpot & Klaviyo', 'Conversion Rate Optimization (CRO)', 'A/B Testing', 'PPC & SEM'],
  tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'System Architecture', 'CI/CD Pipelines', 'Kubernetes', 'GraphQL', 'AWS'],
  design: ['Figma', 'Design Systems', 'User Journey Mapping', 'Wireframing', 'Usability Testing', 'Responsive Web Design', 'Prototyping'],
  hr: ['Full-Cycle Talent Sourcing', 'HRIS Systems', 'Employee Relations', 'Performance Appraisals', 'Compensation & Benefits', 'Labor Law & Compliance'],
  finance: ['Financial Modeling', 'Variance Analysis (FP&A)', 'Advanced Excel', 'SQL & Reporting', 'CapEx & Budgeting', 'Internal Controls', 'IFRS Standards']
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const latestResult = readLatestResult();

  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    location: '',
    bio: '',
    target_job_role: latestResult?.job_title || '',
    portfolio_url: '',
    linkedin_url: '',
    github_url: '',
    skills: latestResult?.matched_keywords || []
  });

  const [newSkillInput, setNewSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savedCount] = useState(readSavedJobsCount);
  const [practicedCount] = useState(readPracticedCount);

  useEffect(() => {
    userApi.profile()
      .then((response) => {
        if (response?.data) {
          const dbName = response.data.full_name;
          const effectiveName = dbName || user?.full_name || '';
          setProfile((prev) => ({
            ...prev,
            ...response.data,
            full_name: effectiveName,
            email: response.data.email || user?.email || prev.email,
            location: response.data.location || prev.location || '',
            target_job_role: response.data.target_job_role || prev.target_job_role || '',
            bio: response.data.bio || prev.bio || '',
            skills: Array.isArray(response.data.skills) ? response.data.skills : (prev.skills || [])
          }));
          if (dbName && dbName !== user?.full_name) {
            updateUser({ full_name: dbName });
          }
        }
      })
      .catch((err) => console.warn('Profile fetch note:', err))
      .finally(() => setLoading(false));
  }, []);

  const calculateCompleteness = () => {
    let score = 0;
    if (profile.full_name) score += 20;
    if (profile.email) score += 20;
    if (profile.location) score += 15;
    if (profile.target_job_role) score += 15;
    if (profile.portfolio_url || profile.linkedin_url) score += 15;
    if (profile.skills && profile.skills.length >= 4) score += 15;
    return Math.min(score, 100);
  };

  const handleAddSkill = (skillToAdd) => {
    const s = (skillToAdd || newSkillInput).trim();
    if (!s) return;
    if (!profile.skills.some((existing) => existing.toLowerCase() === s.toLowerCase())) {
      setProfile({ ...profile, skills: [...profile.skills, s] });
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove)
    });
  };

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await userApi.updateProfile({
        full_name: profile.full_name,
        target_job_role: profile.target_job_role,
        portfolio_url: profile.portfolio_url,
        bio: profile.bio,
        location: profile.location,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        skills: profile.skills
      });

      const nextFullName = response?.data?.full_name || profile.full_name;
      if (response?.data) {
        setProfile((prev) => ({ ...prev, ...response.data, full_name: nextFullName }));
      }
      if (nextFullName) {
        updateUser({ full_name: nextFullName });
      }

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (requestError) {
      setError(requestError.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
        <PageHeader title="User Profile" />
        <LoadingState message="Loading your career profile…" />
      </div>
    );
  }

  const initials = profile.full_name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || (user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'MP');
  const completeness = calculateCompleteness();
  const bestScore = latestResult?.ats_score ?? latestResult?.match_score ?? null;

  const roleLower = (profile.target_job_role || '').toLowerCase();
  const activeDomain = roleLower.includes('market') || roleLower.includes('seo') || roleLower.includes('growth') ? 'marketing'
    : roleLower.includes('design') || roleLower.includes('ux') ? 'design'
    : roleLower.includes('hr') || roleLower.includes('recruit') ? 'hr'
    : roleLower.includes('financ') || roleLower.includes('account') ? 'finance'
    : 'tech';

  const suggestedSkills = domainSkillSuggestions[activeDomain] || domainSkillSuggestions.tech;

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      <PageHeader
        eyebrow="Personal Settings"
        title="User Profile"
        description="Manage your contact identity, target role, and verified master skill bank."
        action={(
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-md hover:opacity-95"
          >
            {saving ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            <span>{saving ? 'Saving…' : 'Save Changes'}</span>
          </Button>
        )}
      />

      {/* Top Career Snapshot Metric Ribbon */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0f172a] dark:ring-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Award className="size-6" />
            </span>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{bestScore !== null ? `${bestScore}%` : '--'}</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{bestScore !== null ? 'Top ATS' : 'No Scan'}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Peak Resume Score</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0f172a] dark:ring-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <MessageSquare className="size-6" />
            </span>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{practicedCount}</span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Answers</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Interviews Practiced</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0f172a] dark:ring-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Bookmark className="size-6" />
            </span>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{savedCount}</span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Roles</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Saved Opportunities</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0f172a] dark:ring-slate-800">
          <CardContent className="p-5 flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
              <Zap className="size-6" />
            </span>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{completeness}%</span>
                <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">Profile Ready</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      {message && (
        <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <AlertDescription className="font-medium text-xs sm:text-sm">{message}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription className="font-medium text-xs sm:text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
        {/* Personal Identity Card */}
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0f172a] dark:ring-slate-800">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Avatar className="size-16 rounded-2xl ring-2 ring-blue-500/20">
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-xl font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-xl font-bold text-slate-950 dark:text-slate-100">{profile.full_name}</h2>
                  <Badge className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px]">
                    <CheckCircle2 className="size-3" /> Active Candidate
                  </Badge>
                </div>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400 mt-0.5">{profile.email} • {profile.location || 'Dhaka, BD'}</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="profile-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <UserRound className="size-3.5 text-blue-600" /> Full Name
                </Label>
                <Input
                  id="profile-name"
                  className="h-10 text-xs rounded-xl bg-slate-50/80 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="profile-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-slate-400" /> Email Address
                </Label>
                <Input
                  id="profile-email"
                  className="h-10 text-xs rounded-xl bg-slate-100 dark:bg-[#080d1a] border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-80"
                  value={profile.email || ''}
                  disabled
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="profile-location" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-blue-600" /> City / Location
                </Label>
                <Input
                  id="profile-location"
                  placeholder="e.g. Dhaka, Bangladesh"
                  className="h-10 text-xs rounded-xl bg-slate-50/80 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="profile-role" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Target className="size-3.5 text-blue-600" /> Target Job Role
                </Label>
                <Input
                  id="profile-role"
                  placeholder="e.g. Digital Marketing Manager, Full Stack Engineer"
                  className="h-10 text-xs rounded-xl bg-slate-50/80 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800"
                  value={profile.target_job_role || ''}
                  onChange={(e) => setProfile({ ...profile, target_job_role: e.target.value })}
                />
              </div>

              <div className="grid gap-1.5 md:col-span-2">
                <Label htmlFor="profile-bio" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-blue-600" /> Professional Bio & Summary
                </Label>
                <textarea
                  id="profile-bio"
                  rows={2}
                  placeholder="Briefly describe your career background and key strengths..."
                  className="w-full p-3 text-xs rounded-xl bg-slate-50/80 dark:bg-[#0b1222] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </div>
            </div>

            <Separator className="my-6 dark:bg-slate-800" />

            {/* Social & Portfolio Links */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <LinkIcon className="size-3.5 text-blue-600" /> Professional Links
            </h4>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">LinkedIn Profile</Label>
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                      Visit <ExternalLink className="size-2.5" />
                    </a>
                  )}
                </div>
                <Input
                  placeholder="https://linkedin.com/in/your-profile"
                  className="h-9 text-xs rounded-xl bg-slate-50/80 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800"
                  value={profile.linkedin_url || ''}
                  onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                />
              </div>

              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Portfolio / Website</Label>
                  {profile.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                      Visit <ExternalLink className="size-2.5" />
                    </a>
                  )}
                </div>
                <Input
                  placeholder="https://yourportfolio.com"
                  className="h-9 text-xs rounded-xl bg-slate-50/80 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800"
                  value={profile.portfolio_url || ''}
                  onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                />
              </div>

              <div className="grid gap-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">GitHub / Repositories</Label>
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                      Visit <ExternalLink className="size-2.5" />
                    </a>
                  )}
                </div>
                <Input
                  placeholder="https://github.com/your-username"
                  className="h-9 text-xs rounded-xl bg-slate-50/80 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800"
                  value={profile.github_url || ''}
                  onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Master Candidate Skill Bank Card */}
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0f172a] dark:ring-slate-800">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="size-4 text-blue-600" /> Master Candidate Skill Bank ({profile.skills?.length || 0})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verified skills used for ATS match calculation and mock interview question generation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add custom skill (e.g. GA4, SQL)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="h-9 w-56 text-xs rounded-xl bg-slate-50 dark:bg-[#0b1222] border-slate-200 dark:border-slate-800"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAddSkill()}
                  className="h-9 px-3 rounded-xl bg-blue-600 text-white text-xs font-semibold gap-1 cursor-pointer hover:bg-blue-700"
                >
                  <Plus className="size-3.5" /> Add
                </Button>
              </div>
            </div>

            {/* Active Skill Cloud */}
            <div className="min-h-16 rounded-2xl bg-slate-50/80 dark:bg-[#0b1222] p-4 ring-1 ring-slate-200/70 dark:ring-slate-800 flex flex-wrap gap-2 items-center">
              {profile.skills?.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No skills added yet. Type a skill above or click quick suggestions below.</span>
              ) : (
                profile.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="gap-1.5 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 text-xs py-1.5 px-3 rounded-xl shadow-xs"
                  >
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">✓</span>
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer ml-1"
                      title="Remove skill"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>

            {/* Suggested Skills for Role */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-600 dark:text-slate-300 mr-1 flex items-center gap-1">
                <Sparkles className="size-3 text-amber-500" /> Recommended for {profile.target_job_role || 'your role'}:
              </span>
              {suggestedSkills
                .filter((s) => !profile.skills.some((existing) => existing.toLowerCase() === s.toLowerCase()))
                .slice(0, 6)
                .map((rec) => (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => handleAddSkill(rec)}
                    className="flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 text-[11px] font-medium hover:bg-blue-100 dark:hover:bg-blue-900/60 cursor-pointer transition"
                  >
                    <Plus className="size-2.5" /> {rec}
                  </button>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white hover:opacity-95 text-xs font-semibold px-8 rounded-2xl cursor-pointer gap-2 shadow-md shadow-blue-600/25"
          >
            {saving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{saving ? 'Saving Changes…' : 'Save Profile Changes'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
