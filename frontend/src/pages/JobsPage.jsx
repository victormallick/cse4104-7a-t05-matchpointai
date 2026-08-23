import {
  AlertTriangle,
  Briefcase,
  Compass,
  ExternalLink,
  FileText,
  Globe,
  MapPin,
  Play,
  Search,
  Sparkles,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import PageHeader from '../components/PageHeader';

const readLatestResult = () => {
  try {
    return JSON.parse(localStorage.getItem('matchpoint_latest_result') || 'null');
  } catch {
    return null;
  }
};

const getPortalEngines = (jobTitle = '', region = 'bangladesh') => {
  const query = encodeURIComponent(jobTitle || 'Software Engineer');
  const slug = encodeURIComponent((jobTitle || 'Software Engineer').toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  const isBD = region === 'bangladesh';

  if (isBD) {
    return [
      {
        id: 'linkedin',
        name: 'LinkedIn Jobs BD',
        badge: 'Top Professional Network',
        description: `Browse live verified openings for "${jobTitle}" in Bangladesh on LinkedIn.`,
        url: `https://www.linkedin.com/jobs/search/?keywords=${query}&location=Bangladesh`,
        theme: 'from-[#0a66c2] to-[#004182]',
        border: 'hover:border-[#0a66c2]/50',
        glow: 'hover:shadow-[#0a66c2]/20',
        btnClass: 'bg-[#0a66c2] hover:bg-[#004182] text-white',
        logoText: 'in',
        stats: 'Active Bangladesh Postings'
      },
      {
        id: 'google-jobs-bd',
        name: 'Google Jobs BD',
        badge: 'Instant Live Aggregator',
        description: `Explore live job openings indexed by Google across company career sites in Bangladesh.`,
        url: `https://www.google.com/search?q=${encodeURIComponent((jobTitle || 'Software Engineer') + ' jobs in Bangladesh')}`,
        theme: 'from-[#4285F4] to-[#1a73e8]',
        border: 'hover:border-[#4285F4]/50',
        glow: 'hover:shadow-[#4285F4]/20',
        btnClass: 'bg-[#4285F4] hover:bg-[#1a73e8] text-white',
        logoText: 'G',
        stats: 'Direct Employer Pages'
      },
      {
        id: 'bdjobs',
        name: 'Bdjobs.com',
        badge: 'Bangladesh #1 Job Portal',
        description: `Search corporate and tech job postings for "${jobTitle}" on Bdjobs.`,
        url: `https://jobs.bdjobs.com/jobsearch.asp?txtsearch=${query}`,
        theme: 'from-[#e05624] to-[#b8380d]',
        border: 'hover:border-[#e05624]/50',
        glow: 'hover:shadow-[#e05624]/20',
        btnClass: 'bg-[#e05624] hover:bg-[#b8380d] text-white',
        logoText: 'BD',
        stats: 'Enterprise & Local Hubs'
      },
      {
        id: 'google-bd-careers',
        name: 'Bangladesh Vacancies Hub',
        badge: 'Direct Career Portals',
        description: `Find all current hiring announcements and open positions for "${jobTitle}" in Bangladesh.`,
        url: `https://www.google.com/search?q=${encodeURIComponent((jobTitle || 'Software Engineer') + ' vacancies in Bangladesh')}`,
        theme: 'from-emerald-600 to-teal-700',
        border: 'hover:border-emerald-500/50',
        glow: 'hover:shadow-emerald-500/20',
        btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        logoText: 'BD',
        stats: 'Verified Hiring Hubs'
      }
    ];
  }

  return [
    {
      id: 'linkedin-remote',
      name: 'LinkedIn Remote',
      badge: 'Global Remote Network',
      description: `Browse global remote and hybrid openings for "${jobTitle}" worldwide with 1-click apply.`,
      url: `https://www.linkedin.com/jobs/search/?keywords=${query}&location=Worldwide&f_WT=2`,
      theme: 'from-[#0a66c2] to-[#004182]',
      border: 'hover:border-[#0a66c2]/50',
      glow: 'hover:shadow-[#0a66c2]/20',
      btnClass: 'bg-[#0a66c2] hover:bg-[#004182] text-white',
      logoText: 'in',
      stats: 'Worldwide Remote Postings'
    },
    {
      id: 'google-remote',
      name: 'Google Jobs Global',
      badge: 'Worldwide Aggregator',
      description: `Search global remote postings indexed by Google across verified career portals worldwide.`,
      url: `https://www.google.com/search?q=${encodeURIComponent((jobTitle || 'Software Engineer') + ' global remote jobs')}`,
      theme: 'from-[#4285F4] to-[#1a73e8]',
      border: 'hover:border-[#4285F4]/50',
      glow: 'hover:shadow-[#4285F4]/20',
      btnClass: 'bg-[#4285F4] hover:bg-[#1a73e8] text-white',
      logoText: 'G',
      stats: 'Direct Career Portals'
    }
  ];
};

export default function JobsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const latestResult = location.state?.result || readLatestResult();

  const [region, setRegion] = useState('bangladesh');
  const [activeJobTitle, setActiveJobTitle] = useState(latestResult?.job_title || 'Software Engineer');
  const [roleSearchInput, setRoleSearchInput] = useState('');

  const currentResult = location.state?.result || readLatestResult();
  const isInvalidUpload = currentResult?.is_valid_resume === false || (currentResult?.ats_score === 0 && Boolean(currentResult?.document_warning));
  const hasValidResume = Boolean(currentResult && currentResult.analysis_id && !isInvalidUpload);

  if (!hasValidResume) {
    return (
      <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
        <PageHeader
          eyebrow="AI Career Engine"
          title="Career Opportunities"
          description="Personalized career recommendations tailored from your verified resume profile."
        />

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-8 sm:p-14 text-center shadow-xl shadow-blue-500/5 ring-1 ring-slate-200/60 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0f172a]/90 dark:ring-slate-800/60">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-72 rounded-full bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

          <div className="relative flex flex-col items-center justify-center max-w-lg mx-auto">
            <div className={`grid size-20 place-items-center rounded-3xl ${
              isInvalidUpload
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30'
                : 'bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-violet-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30 shadow-inner'
            } mb-6`}>
              {isInvalidUpload ? (
                <AlertTriangle className="size-9" />
              ) : (
                <Briefcase className="size-9" />
              )}
            </div>

            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 mb-3 ${
              isInvalidUpload
                ? 'bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/50 dark:text-amber-300'
                : 'bg-blue-50 text-blue-700 ring-blue-500/30 dark:bg-blue-950/50 dark:text-blue-300'
            }`}>
              <Sparkles className="size-3" />
              {isInvalidUpload ? 'Document Alert' : 'Resume Required'}
            </span>

            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100">
              {isInvalidUpload ? 'Non-Resume Document Detected — 0% ATS Score' : 'No Resume Document Detected'}
            </h3>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
              {isInvalidUpload
                ? 'The uploaded file was flagged as non-resume content (e.g. recipe, research article, or essay). Live career search is only generated for genuine candidate resumes.'
                : 'Upload your resume on the Analyze page to automatically calibrate in-demand skills, benchmark market salaries, and search verified live job openings.'}
            </p>

            <Link
              to="/analyze"
              className="mt-8 inline-flex flex-row items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:shadow-indigo-600/35 hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none"
            >
              <FileText className="size-4.5 shrink-0" />
              <span>{isInvalidUpload ? 'Upload Valid Resume' : 'Upload Resume to Get Started'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSearchNewRole = (e) => {
    if (e) e.preventDefault();
    const trimmed = roleSearchInput.trim();
    if (!trimmed) return;
    setActiveJobTitle(trimmed);
  };

  const handlePracticeForRole = () => {
    navigate('/interview', {
      state: {
        result: {
          ...latestResult,
          job_title: activeJobTitle
        }
      }
    });
  };

  const candidateSkills = latestResult?.skills || latestResult?.identified_skills || [
    'Strategy & Planning', 'Core Competencies', 'Industry Best Practices', 'Execution & Delivery'
  ];
  const portals = getPortalEngines(activeJobTitle, region);

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      {/* Search Header Banner */}
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-violet-50/90 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-violet-950/40 p-6 sm:p-8 ring-1 ring-blue-200/70 dark:ring-blue-900/60 shadow-xs">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                <Sparkles className="size-3.5" /> Real-Time Live Job Search Hub
              </div>
              <h3 className="mt-1.5 text-2xl font-bold text-slate-950 dark:text-slate-100">
                Live Job Search for: <span className="text-blue-700 dark:text-blue-400">{activeJobTitle}</span>
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Pre-filtered direct queries across verified portals to view and apply for <strong>currently active, real-time job openings</strong>.
              </p>
            </div>

            {/* Region Mode Toggle Buttons */}
            <div className="flex items-center gap-1 rounded-2xl bg-white/90 dark:bg-[#0b1222] p-1.5 ring-1 ring-blue-200/60 dark:ring-slate-800 shadow-sm w-fit shrink-0">
              <button
                onClick={() => setRegion('bangladesh')}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer",
                  region === 'bangladesh'
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <span>🇧🇩</span>
                <span>Bangladesh Market</span>
              </button>

              <button
                onClick={() => setRegion('abroad')}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer",
                  region === 'abroad'
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Globe className="size-3.5" />
                <span>Global Remote / Abroad</span>
              </button>
            </div>
          </div>

          {/* Search by Target Role Input */}
          <form onSubmit={handleSearchNewRole} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-blue-600 dark:text-blue-400" />
              <input
                type="text"
                value={roleSearchInput}
                onChange={(e) => setRoleSearchInput(e.target.value)}
                placeholder="Type any target job title (e.g. Full Stack Developer, Product Manager, Growth Lead)..."
                className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-white dark:bg-[#070d1a] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={!roleSearchInput.trim()}
              className="h-12 w-full sm:w-auto px-7 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-blue-600/25 font-semibold text-xs gap-2 cursor-pointer hover:opacity-95 disabled:opacity-50"
            >
              <Search className="size-4" />
              <span>Update Search Role</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Target Role Market Profile Overview */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Target Market Focus Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
              <Compass className="size-4" /> Target Market & Location
            </div>
            <div className="flex items-center gap-2 text-lg font-bold text-slate-950 dark:text-slate-100">
              <span>{region === 'bangladesh' ? '🇧🇩 Bangladesh Market' : '🌍 Global Remote Worldwide'}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {region === 'bangladesh'
                ? 'Targeting verified tech hubs (Dhaka, Chittagong, Sylhet) and nationwide on-site & hybrid openings.'
                : 'Targeting verified international distributed teams, worldwide remote contracts, and global companies.'}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">Pre-filtered query active for <strong>{activeJobTitle}</strong></span>
          </div>
        </div>

        {/* In-Demand Matched Skills */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Zap className="size-4" /> Matched Skills on Resume
              </div>
              <Badge variant="secondary" className="text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                {candidateSkills.length} Verified
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {candidateSkills.slice(0, 6).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300 font-medium">
                  ✓ {skill}
                </Badge>
              ))}
            </div>
          </div>
          <p className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
            Core competencies verified and benchmarked from your uploaded profile.
          </p>
        </div>

        {/* Action / Prep Interview Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                <Sparkles className="size-4" /> Interview Preparation
              </div>
              <Badge variant="secondary" className="text-[10px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                STAR Mode
              </Badge>
            </div>
            <h4 className="text-lg font-bold text-slate-950 dark:text-slate-100 truncate">
              Prepare for {activeJobTitle}
            </h4>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generate custom STAR behavioral and technical interview questions tailored to this role.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <Button
              onClick={handlePracticeForRole}
              className="w-full gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-3 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:opacity-95 cursor-pointer"
            >
              <Play className="size-3.5 fill-current" />
              <span>Practice Interview Questions</span>
            </Button>
          </div>
        </div>
      </div>

      <PageHeader
        eyebrow="Verified Portals"
        title="Live Job Search Engines"
        description={`Click any verified job board below to open real-time, currently available postings for "${activeJobTitle}" in ${region === 'bangladesh' ? 'Bangladesh' : 'the global remote market'}.`}
      />

      {/* Live Job Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {portals.map((portal) => (
          <Card
            key={portal.id}
            className={cn(
              "group relative overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
              portal.border,
              portal.glow
            )}
          >
            <div className="flex flex-col justify-between h-full gap-5">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "grid size-11 place-items-center rounded-2xl font-black text-white text-base shadow-md",
                      portal.btnClass
                    )}>
                      {portal.logoText}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-950 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {portal.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        {portal.stats}
                      </span>
                    </div>
                  </div>

                  <Badge variant="secondary" className="text-[11px] bg-slate-100 dark:bg-slate-800 dark:text-slate-300 font-semibold">
                    {portal.badge}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {portal.description}
                </p>

                {/* Query preview snippet */}
                <div className="mt-4 rounded-xl bg-slate-50 dark:bg-[#070d1a] px-3 py-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                  <Search className="size-3 text-slate-400 shrink-0" />
                  <span className="truncate">query: &quot;{activeJobTitle}&quot; in {region === 'bangladesh' ? 'Bangladesh' : 'Remote Worldwide'}</span>
                </div>
              </div>

              {/* Direct 1-Click Launch Button */}
              <a
                href={portal.url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 px-6 font-bold text-xs shadow-md transition-all hover:opacity-95 hover:scale-[1.01] active:scale-[0.98] cursor-pointer select-none",
                  portal.btnClass
                )}
              >
                <span>Search Live on {portal.name}</span>
                <ExternalLink className="size-4 shrink-0" />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
