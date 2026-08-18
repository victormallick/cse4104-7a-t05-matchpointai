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
import MetricCard from '../components/MetricCard';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { demoHistory } from '../data/demoData';
import { userApi } from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState(demoHistory);

  useEffect(() => {
    userApi.history().then((response) => setHistory(response.data)).catch(() => {});
  }, []);

  const latestScore = history[0]?.ats_score || 88;

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      <PageHeader
        eyebrow="Candidate workspace"
        title={`Welcome back, ${user?.full_name?.split(' ')[0] || 'Amina'}`}
        description="Your latest MatchPoint AI insights are ready."
        action={(
          <Button
            render={<Link to="/analyze" />}
            className="h-11 rounded-xl bg-blue-600 px-5 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            <Plus /> New analysis
          </Button>
        )}
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Gauge} label="Latest ATS score" value={`${latestScore}%`} detail="+6 points this month" />
        <MetricCard icon={FileText} label="Total analyses" value={history.length + 21} detail="3 completed recently" tone="purple" />
        <MetricCard icon={Bookmark} label="Saved jobs" value="12" detail="4 new matches" tone="green" />
        <MetricCard icon={MessageSquareText} label="Interview practice" value="36 Qs" detail="72% preparation progress" tone="orange" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.8fr)]">
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0f172a] dark:ring-slate-800">
          <CardHeader className="flex-row items-center justify-between p-6 pb-2 sm:p-7">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">Your progress</span>
              <CardTitle className="mt-2 text-2xl font-bold text-slate-950 dark:text-slate-100">Recent analyses</CardTitle>
            </div>
            <Button render={<Link to="/history" />} variant="ghost" className="text-blue-600 dark:text-blue-400">
              View all <ArrowRight />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-2 p-6 pt-3 sm:p-7 sm:pt-3">
            {history.slice(0, 4).map((item) => (
              <Link
                className="grid min-h-18 grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-slate-50 dark:bg-[#131d35] p-3 transition hover:bg-blue-50 dark:hover:bg-blue-950/40"
                to="/history"
                key={item.analysis_id || item.id}
              >
                <span className="grid size-10 place-items-center rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                  <FileText className="size-4.5" />
                </span>
                <span className="grid min-w-0 gap-1">
                  <strong className="truncate text-sm text-slate-950 dark:text-slate-100">{item.job_title}</strong>
                  <small className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.company || 'Direct Submission'} · {item.analyzed_at ? new Date(item.analyzed_at).toLocaleDateString() : 'Today'}
                  </small>
                </span>
                <Badge className={item.ats_score >= 75 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300" : "bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300"}>
                  {item.ats_score}%
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 bg-[radial-gradient(circle_at_100%_0,rgba(255,255,255,0.2),transparent_32%),linear-gradient(145deg,#1c65f4,#7432f8)] text-white shadow-xl shadow-violet-600/20">
          <CardContent className="flex h-full min-h-80 flex-col p-7">
            <span className="grid size-12 place-items-center rounded-2xl bg-white/15">
              <TrendingUp />
            </span>
            <span className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-violet-100">Next best action</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Analyze a new resume</h2>
            <p className="mt-3 leading-7 text-blue-50/90">
              Compare your latest resume against a specific role and turn its gaps into a practice plan.
            </p>
            <Button render={<Link to="/analyze" />} className="mt-5 h-11 w-fit rounded-xl bg-white px-5 text-blue-700 hover:bg-blue-50">
              Analyze resume <ArrowRight />
            </Button>
            <small className="mt-auto pt-8 text-blue-100">
              Top recommendation: Product Frontend Engineer · 91% match
            </small>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
