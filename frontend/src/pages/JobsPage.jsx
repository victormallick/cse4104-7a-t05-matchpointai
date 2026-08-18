import {
  Banknote,
  Bookmark,
  Bot,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Play,
  Search,
  Sparkles,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { jobsApi } from '../services/api';

const readLatestResult = () => {
  try {
    return JSON.parse(localStorage.getItem('matchpoint_latest_result') || 'null');
  } catch {
    return null;
  }
};

const getJobStorageKey = (result, region, targetTitle) => {
  const keyPart = result?.analysis_id || result?.resume_id || (result?.created_at || 'latest');
  const safeTitle = (targetTitle || 'default').toLowerCase().replace(/\s+/g, '_');
  return `matchpoint_job_recommendations_${keyPart}_${region}_${safeTitle}`;
};

const readSavedJobs = () => {
  try {
    return JSON.parse(localStorage.getItem('matchpoint_saved_jobs') || '[]');
  } catch {
    return [];
  }
};

export default function JobsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const latestResult = location.state?.result || readLatestResult();

  const initialJobTitle = latestResult?.job_title || 'Software Engineer';
  const [activeJobTitle, setActiveJobTitle] = useState(initialJobTitle);
  const [roleSearchInput, setRoleSearchInput] = useState(initialJobTitle);

  const [region, setRegion] = useState('bangladesh'); // 'bangladesh' | 'abroad'
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchingAI, setSearchingAI] = useState(false);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'saved'
  const [savedJobs, setSavedJobs] = useState(readSavedJobs);
  const [localQuery, setLocalQuery] = useState('');

  const candidateSkills = latestResult?.missing_skills ? (latestResult.skills || []) : [];
  const focusSkills = latestResult?.missing_skills || latestResult?.missing_keywords || [];

  const persistSavedJobs = (newList) => {
    setSavedJobs(newList);
    try {
      localStorage.setItem('matchpoint_saved_jobs', JSON.stringify(newList));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  };

  const isJobSaved = (jobId) => savedJobs.some((item) => item.id === jobId);

  const toggleSaved = (job) => {
    if (isJobSaved(job.id)) {
      persistSavedJobs(savedJobs.filter((item) => item.id !== job.id));
    } else {
      persistSavedJobs([{ ...job, is_saved: true, saved_at: new Date().toISOString() }, ...savedJobs]);
    }
  };

  const loadRecommendations = async (targetRole = activeJobTitle, targetRegion = region, forceRefresh = false) => {
    const result = location.state?.result || readLatestResult();
    const storageKey = getJobStorageKey(result, targetRegion, targetRole);

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setJobs(parsed);
            setLoading(false);
            setSearchingAI(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to parse cached jobs', e);
      }
    }

    if (forceRefresh) setSearchingAI(true);
    else setLoading(true);

    try {
      const response = await jobsApi.recommendations({
        analysis_id: result?.analysis_id,
        resume_id: result?.resume_id,
        resume_text: result?.resume_text || '',
        jd_text: result?.jd_text || '',
        job_title: targetRole || 'Target Role',
        company: result?.company || '',
        skills: result?.skills || candidateSkills,
        missing_skills: result?.missing_skills || focusSkills,
        region: targetRegion
      });

      if (response?.data && Array.isArray(response.data)) {
        setJobs(response.data);
        try {
          localStorage.setItem(storageKey, JSON.stringify(response.data));
        } catch (err) {
          console.warn('LocalStorage save error:', err);
        }
      }
    } catch (err) {
      console.error('Job recommendations error:', err);
    } finally {
      setLoading(false);
      setSearchingAI(false);
    }
  };

  useEffect(() => {
    loadRecommendations(activeJobTitle, region, false);
  }, [region, activeJobTitle, location.state?.result?.analysis_id, location.state?.result?.resume_id]);

  const handleSearchNewRole = (e) => {
    if (e) e.preventDefault();
    const trimmed = roleSearchInput.trim();
    if (!trimmed) return;
    setActiveJobTitle(trimmed);
    loadRecommendations(trimmed, region, true);
  };

  const handleRegionSwitch = (newRegion) => {
    if (newRegion === region) return;
    setRegion(newRegion);
    loadRecommendations(activeJobTitle, newRegion, false);
  };

  const handlePracticeForRole = (job) => {
    navigate('/interview', {
      state: {
        result: {
          ...latestResult,
          job_title: job.job_title,
          company: job.company,
          missing_skills: job.growth_skills || []
        }
      }
    });
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
        <PageHeader
          eyebrow="AI Career Engine"
          title={region === 'abroad' ? "Searching Jobs Abroad" : "Searching Jobs in Bangladesh"}
          description={`Scanning LinkedIn for ${activeJobTitle} opportunities matching your profile…`}
        />
        <LoadingState message={`Finding 5-10 tailored opportunities for "${activeJobTitle}" on LinkedIn…`} />
      </div>
    );
  }

  const displayedJobs = (filterTab === 'saved' ? savedJobs : jobs).filter((j) => {
    if (!localQuery.trim()) return true;
    const q = localQuery.toLowerCase();
    return (
      j.job_title?.toLowerCase().includes(q) ||
      j.company?.toLowerCase().includes(q) ||
      j.location?.toLowerCase().includes(q) ||
      j.skills?.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      {/* Search Header Banner */}
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/90 to-violet-50/90 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-violet-950/40 p-6 ring-1 ring-blue-200/70 dark:ring-blue-900/60 shadow-xs">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                <Sparkles className="size-3.5" /> AI Job Search Engine
              </div>
              <h3 className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-100">
                {region === 'abroad' ? '🌍 International Opportunities for: ' : '🇧🇩 Bangladesh Tech Opportunities for: '}
                <span className="text-blue-700 dark:text-blue-400">{activeJobTitle}</span>
              </h3>
            </div>

            {/* Region Mode Toggle Buttons */}
            <div className="flex items-center gap-1 rounded-2xl bg-white/90 dark:bg-[#0b1222] p-1.5 ring-1 ring-blue-200/60 dark:ring-slate-800 shadow-sm w-fit">
              <button
                onClick={() => handleRegionSwitch('bangladesh')}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                  region === 'bangladesh'
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <span>🇧🇩</span>
                <span>Jobs in Bangladesh</span>
              </button>

              <button
                onClick={() => handleRegionSwitch('abroad')}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                  region === 'abroad'
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <Globe className="size-3.5" />
                <span>Find Jobs Abroad</span>
              </button>
            </div>
          </div>

          {/* AI Search by Target Role Input */}
          <form onSubmit={handleSearchNewRole} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-blue-600 dark:text-blue-400" />
              <input
                type="text"
                value={roleSearchInput}
                onChange={(e) => setRoleSearchInput(e.target.value)}
                placeholder="Search jobs for any title (e.g. Digital Marketing Manager, AI Engineer, Financial Analyst)..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-white dark:bg-[#070d1a] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={searchingAI || !roleSearchInput.trim()}
              className="h-11 w-full sm:w-auto px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-blue-600/25 font-semibold text-xs gap-2 cursor-pointer hover:opacity-95 disabled:opacity-50"
            >
              {searchingAI ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Searching with AI…</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4 text-amber-300" />
                  <span>Search with AI</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      <PageHeader
        eyebrow="Targeted opportunities"
        title="Job Recommendations"
        description={`AI recommendations matching "${activeJobTitle}" in ${region === 'abroad' ? 'the international / remote market' : 'Bangladesh'} with direct LinkedIn searches.`}
        action={(
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 bg-violet-100 dark:bg-violet-950/80 dark:text-violet-300 px-3 py-2 text-violet-700 font-semibold text-xs">
              <Bot className="size-3.5" /> {jobs.length} AI Matched Roles
            </Badge>
          </div>
        )}
      />

      {/* Filter Tabs & Local Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Switcher */}
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-[#131d35] p-1.5 ring-1 ring-slate-200/70 dark:ring-slate-800 w-fit">
          <button
            onClick={() => setFilterTab('all')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer',
              filterTab === 'all'
                ? 'bg-white dark:bg-[#0b1222] text-slate-950 dark:text-slate-100 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            )}
          >
            <Briefcase className="size-3.5" /> {region === 'abroad' ? 'Abroad Matches' : 'Bangladesh Matches'} ({jobs.length})
          </button>

          <button
            onClick={() => setFilterTab('saved')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer',
              filterTab === 'saved'
                ? 'bg-white dark:bg-[#0b1222] text-amber-700 dark:text-amber-300 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            )}
          >
            <Bookmark className="size-3.5 fill-current text-amber-500" /> Saved Roles ({savedJobs.length})
          </button>
        </div>

        {/* Quick Filter */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Filter list by company, skill…"
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1222] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {localQuery && (
            <button
              onClick={() => setLocalQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {displayedJobs.length === 0 ? (
        <Card className="border-0 bg-white dark:bg-[#0f172a] p-12 text-center shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800">
          <CardContent className="flex flex-col items-center justify-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 mb-4">
              {filterTab === 'saved' ? <Bookmark className="size-8" /> : <BriefcaseBusiness className="size-8" />}
            </span>
            <h3 className="text-xl font-bold text-slate-950 dark:text-slate-100">
              {filterTab === 'saved' ? 'No Saved Roles Yet' : 'No Matching Roles Found'}
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
              {filterTab === 'saved'
                ? 'Click the bookmark icon on any recommended role to save it here for targeted job applications.'
                : 'Try typing a new job title in the search box above and clicking "Search with AI".'}
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Jobs List */
        <section className="grid gap-5">
          {displayedJobs.map((job) => {
            const saved = isJobSaved(job.id);
            const score = job.match_score || 88;
            const linkedInUrl = job.job_url || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.job_title)}&location=${region === 'abroad' ? 'Worldwide' : 'Bangladesh'}`;

            return (
              <Card
                key={job.id}
                className="border-0 bg-white dark:bg-[#0f172a] shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800 hover:ring-blue-300 dark:hover:ring-blue-700/60 transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Role Header & Details */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 shrink-0">
                        <Building2 className="size-6" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h2 className="text-lg font-bold text-slate-950 dark:text-slate-100 leading-tight">
                            {job.job_title}
                          </h2>
                          {job.work_type && (
                            <Badge variant="secondary" className="text-[11px] bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                              {job.work_type}
                            </Badge>
                          )}
                          {job.region === 'bangladesh' || (!job.region && region === 'bangladesh') ? (
                            <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                              🇧🇩 BD Tech
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                              🌍 Global / Abroad
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{job.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5 text-slate-400" /> {job.location || (region === 'abroad' ? 'Remote · Global' : 'Dhaka, Bangladesh')}
                          </span>
                          {job.salary_range && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                <Banknote className="size-3.5" /> {job.salary_range}
                              </span>
                            </>
                          )}
                        </div>

                        {/* AI Match Rationale */}
                        {job.match_rationale && (
                          <div className="mt-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 p-3.5 ring-1 ring-blue-100 dark:ring-blue-900/50">
                            <div className="flex items-start gap-2 text-xs leading-relaxed text-blue-950 dark:text-blue-200">
                              <Sparkles className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-bold text-blue-900 dark:text-blue-300">AI Fit Analysis: </strong>
                                {job.match_rationale}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Skills Breakdown */}
                        <div className="mt-4 space-y-2">
                          {job.skills?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">Matched Stack:</span>
                              {job.skills.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="text-[11px] border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300 font-medium"
                                >
                                  ✓ {skill}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {job.growth_skills?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mr-1">Growth Skills:</span>
                              {job.growth_skills.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="text-[11px] border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/50 dark:text-violet-300 font-medium"
                                >
                                  + {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match Score & Action Buttons */}
                    <div className="flex lg:flex-col items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
                      {/* Score Gauge */}
                      <div className="text-left lg:text-right">
                        <div className="flex items-baseline lg:justify-end gap-1">
                          <strong className={cn(
                            "text-3xl font-black tracking-tight",
                            score >= 90 ? "text-emerald-600 dark:text-emerald-400" :
                            score >= 80 ? "text-blue-600 dark:text-blue-400" :
                            "text-amber-600 dark:text-amber-400"
                          )}>
                            {score}%
                          </strong>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Match</span>
                        </div>
                        <span className="text-[11px] font-medium text-slate-400 hidden lg:block">Profile Alignment</span>
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePracticeForRole(job)}
                          className="text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 cursor-pointer"
                          title="Generate targeted interview questions for this specific role"
                        >
                          <Play className="size-3 fill-current text-blue-600" /> Prep Interview
                        </Button>

                        <Button
                          size="sm"
                          render={
                            <a
                              href={linkedInUrl}
                              target="_blank"
                              rel="noreferrer"
                            />
                          }
                          className="bg-[#0a66c2] hover:bg-[#004182] text-white shadow-xs text-xs font-semibold gap-1.5 cursor-pointer"
                          title={`Search ${job.job_title} on LinkedIn`}
                        >
                          <span>Apply on LinkedIn</span>
                          <ExternalLink className="size-3" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className={cn(
                            "h-8 w-8 cursor-pointer transition",
                            saved
                              ? "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-400"
                              : "border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-600"
                          )}
                          onClick={() => toggleSaved(job)}
                          aria-label="Bookmark job"
                          title={saved ? 'Remove from Saved' : 'Save job'}
                        >
                          <Bookmark fill={saved ? 'currentColor' : 'none'} className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}
