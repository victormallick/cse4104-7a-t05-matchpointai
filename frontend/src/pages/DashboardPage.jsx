import {
  ArrowRight,
  Bookmark,
  FileText,
  Gauge,
  MessageSquareText,
  Plus,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import MetricCard from '../components/MetricCard';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { demoHistory } from '../data/demoData';
import { userApi } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    userApi.history()
      .then((response) => {
        if (response?.data && Array.isArray(response.data)) {
          setHistory(response.data);
        }
      })
      .catch(() => {});
  }, []);

  const historyList = Array.isArray(history) ? history : [];
  const latestScore = historyList[0]?.ats_score ?? null;

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      <PageHeader
        eyebrow="Candidate workspace"
        title={`Welcome back, ${user?.full_name?.split(' ')[0] || 'Candidate'}`}
        description="Your personalized MatchPoint AI career workspace."
        action={(
          <Link to="/analyze">
            <Button className="h-11 rounded-xl bg-blue-600 px-5 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 cursor-pointer">
              <Plus className="size-4" /> New analysis
            </Button>
          </Link>
        )}
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-fade-in-up">
        <MetricCard
          icon={Gauge}
          label="Latest ATS score"
          value={latestScore !== null ? `${latestScore}%` : '--'}
          detail={latestScore !== null ? "+6 points this month" : "No scans yet"}
        />
        <MetricCard
          icon={FileText}
          label="Total analyses"
          value={String(historyList.length)}
          detail={historyList.length > 0 ? `${historyList.length} scans completed` : "Upload a resume to begin"}
          tone="purple"
        />
        <MetricCard
          icon={Bookmark}
          label="Saved jobs"
          value="0"
          detail="Explore recommendations"
          tone="green"
        />
        <MetricCard
          icon={MessageSquareText}
          label="Interview practice"
          value={historyList.length > 0 ? "Active" : "0 Qs"}
          detail={historyList.length > 0 ? "Practice questions ready" : "Ready when you are"}
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
            {historyList.length > 0 && (
              <Link to="/history">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold cursor-pointer">
                  View all <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="grid gap-3 p-6 pt-3 sm:p-7 sm:pt-3">
            {historyList.length === 0 ? (
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
              historyList.slice(0, 4).map((item) => {
                const score = item.ats_score || 85;
                const isTop = score >= 85;
                const isGood = score >= 70;

                return (
                  <Link
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800/80 dark:bg-[#131d35] dark:hover:border-blue-900/60 dark:hover:bg-blue-950/40 group"
                    to="/history"
                    key={item.analysis_id || item.id}
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
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50"
                      )}>
                        {isTop ? '⚡ Ready to Apply' : isGood ? '✓ Competitive' : '⚠️ Gaps Detected'}
                      </span>
                      <Badge className={cn(
                        "text-xs font-bold px-2.5 py-1",
                        isTop
                          ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/30"
                          : "bg-blue-600 text-white shadow-xs shadow-blue-600/30"
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
