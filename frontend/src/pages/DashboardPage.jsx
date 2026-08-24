import {
  ArrowRight,
  Bookmark,
  Briefcase,
  FileText,
  Gauge,
  Globe,
  MessageSquareText,
  Plus,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Brand from '../components/Brand';
import MetricCard from '../components/MetricCard';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import {
  deduplicateHistory,
  getLatestResult,
  getSavedQuestions,
  getUserHistory,
  setUserHistory
} from '../utils/storage';

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState(() => getUserHistory(user?.id));
  const [savedQuestionsCount, setSavedQuestionsCount] = useState(() => getSavedQuestions(user?.id).length);

  useEffect(() => {
    if (!user?.id) {
      setHistory([]);
      return;
    }

    // Initialize with local cache strictly belonging to this user
    const local = getUserHistory(user.id);
    setHistory(local);
    setSavedQuestionsCount(getSavedQuestions(user.id).length);

    // Fetch authoritative database records for this user from backend
    userApi.history()
      .then((response) => {
        const apiRecords = response?.data;
        if (Array.isArray(apiRecords)) {
          const deduplicated = deduplicateHistory(apiRecords);
          setHistory(deduplicated);
          setUserHistory(deduplicated, user.id);
        }
      })
      .catch((err) => {
        console.warn('API history fetch notice:', err);
      });
  }, [user?.id]);

  const historyList = Array.isArray(history) ? history : [];
  // Filter for valid completed analyses
  const validHistory = historyList.filter(item => item && (item.ats_score !== undefined || item.job_title));
  const latestItem = validHistory[0] || getLatestResult(user?.id);
  const latestScore = latestItem?.ats_score ?? latestItem?.match_rate ?? null;

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      {/* Top Welcome Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Brand size="sm" showBadge={false} />
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Intelligence Dashboard</span>
        </div>

        <div className="flex items-center gap-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs">
          <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Live Workspace Active</span>
        </div>
      </div>

      <PageHeader
        eyebrow="Candidate Workspace"
        title={`Welcome back, ${user?.full_name?.split(' ')[0] || 'Candidate'}`}
        description="Your personalized MatchPoint AI career analytics, ATS resume scoring, and live interview simulator."
        action={(
          <Link to="/analyze">
            <Button className="h-11 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:shadow-indigo-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
              <Plus className="size-4 mr-1.5" /> New Analysis
            </Button>
          </Link>
        )}
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-fade-in-up">
        <MetricCard
          icon={Gauge}
          label="Latest ATS score"
          value={latestScore !== null ? `${latestScore}%` : '--'}
          detail={latestScore !== null ? `${latestItem?.job_title || 'Target Role'}` : "No scans yet"}
        />
        <MetricCard
          icon={FileText}
          label="Total analyses"
          value={String(validHistory.length)}
          detail={validHistory.length > 0 ? `${validHistory.length} scan${validHistory.length > 1 ? 's' : ''} completed` : "Upload a resume to begin"}
          tone="purple"
        />
        <MetricCard
          icon={Briefcase}
          label="Live Career Engines"
          value="BD & Global"
          detail="Real-time verified portals"
          tone="green"
        />
        <MetricCard
          icon={Bookmark}
          label="Question Bank"
          value={savedQuestionsCount > 0 ? `${savedQuestionsCount} Qs` : (validHistory.length > 0 ? "Active" : "0 Qs")}
          detail={savedQuestionsCount > 0 ? `${savedQuestionsCount} questions saved` : (validHistory.length > 0 ? "Practice questions ready" : "Ready when you are")}
          tone="orange"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)] animate-fade-in-up stagger-1">
        <Card className="border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
          <CardHeader className="flex-row items-center justify-between p-6 pb-2 sm:p-7">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">Career Trajectory</span>
              <CardTitle className="mt-1 text-2xl font-bold text-slate-950 dark:text-slate-100">Recent Resume Analyses</CardTitle>
            </div>
            {validHistory.length > 0 && (
              <Link to="/history">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold cursor-pointer">
                  View all <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="grid gap-3 p-6 pt-3 sm:p-7 sm:pt-3">
            {validHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131d35]/50 my-2">
                <FileText className="size-10 text-blue-600 dark:text-blue-400 mb-3 opacity-80" />
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">No Resume Analyses Yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  Upload your target resume on the Analyze page to see your live ATS score, detected skill gaps, and interview prep questions.
                </p>
                <Link to="/analyze" className="mt-4">
                  <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                    Start First Analysis <ArrowRight className="size-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              validHistory.slice(0, 4).map((item) => {
                const score = item.ats_score ?? item.match_rate ?? 0;
                const isTop = score >= 85;
                const isGood = score >= 70;
                const isWarning = score < 40;

                return (
                  <Link
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800/80 dark:bg-[#131d35] dark:hover:border-blue-900/60 dark:hover:bg-blue-950/40 group"
                    to="/result"
                    state={{ result: item }}
                    key={item.analysis_id || item.id || `${item.job_title}-${item.created_at || Math.random()}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-100/80 text-blue-600 shadow-xs dark:bg-blue-950/80 dark:text-blue-400">
                        <FileText className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <strong className="block truncate text-sm font-bold text-slate-950 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400 transition-colors">
                          {item.job_title}
                        </strong>
                        <small className="block truncate text-xs text-slate-500 dark:text-slate-400">
                          {item.company || 'Direct Target'} · {item.analyzed_at ? new Date(item.analyzed_at).toLocaleDateString() : 'Recent'}
                        </small>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        "hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border",
                        isTop
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50"
                          : isGood
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50"
                            : isWarning
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50"
                      )}>
                        {isTop ? '⚡ Ready to Apply' : isGood ? '✓ Competitive' : isWarning ? '⚠️ Needs Review' : '⚠️ Gaps Detected'}
                      </span>
                      <Badge className={cn(
                        "text-xs font-bold px-2.5 py-1 text-white shadow-xs",
                        isTop
                          ? "bg-emerald-600 shadow-emerald-600/30"
                          : isGood
                            ? "bg-blue-600 shadow-blue-600/30"
                            : isWarning
                              ? "bg-rose-600 shadow-rose-600/30"
                              : "bg-amber-600 shadow-amber-600/30"
                      )}>
                        {score}%
                      </Badge>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-xl shadow-blue-600/20 flex flex-col justify-between">
          <CardContent className="p-7 sm:p-8 flex flex-col justify-between h-full">
            <div>
              <span className="grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm shadow-xs">
                <TrendingUp className="size-6" />
              </span>
              <span className="mt-6 inline-block text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
                Recommended Action
              </span>
              <h2 className="mt-2 text-2xl font-black tracking-tight leading-snug">
                Scan Target Job Description
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-blue-50/90">
                Instantly compute keyword match percentages, extract missing technical proficiencies, and rewrite drafted bullets into high-impact STAR accomplishments.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/15">
              <Link to="/analyze" className="w-full block">
                <Button className="h-12 w-full rounded-xl bg-white text-sm font-bold text-blue-700 hover:bg-blue-50 shadow-md shadow-black/10 cursor-pointer active:scale-[0.99] transition-all">
                  Analyze Target Role <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </Link>
              <div className="mt-3 flex items-center justify-between text-xs text-blue-100/90">
                <span>⚡ ATS Gap Analysis & Scoring</span>
                <span className="font-medium">Instant AI Evaluation</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
