import { ArrowRight, CalendarDays, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import { deduplicateHistory, getUserHistory, setLatestResult, setUserHistory } from '../utils/storage';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState(() => deduplicateHistory(getUserHistory(user?.id)));
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) {
      setHistory([]);
      return;
    }
    const local = deduplicateHistory(getUserHistory(user.id));
    setHistory(local);

    setLoading(true);
    userApi.history()
      .then((response) => {
        const apiRecords = response?.data;
        if (Array.isArray(apiRecords)) {
          const clean = deduplicateHistory(apiRecords);
          setHistory(clean);
          setUserHistory(clean, user.id);
        }
      })
      .catch((err) => {
        console.warn('API history fetch notice:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.id]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return history.filter((item) =>
      `${item.job_title} ${item.company}`.toLowerCase().includes(query)
    );
  }, [history, search]);

  const viewResult = (item) => {
    const result = {
      ...item,
      user_id: user?.id,
      missing_keywords: item.missing_keywords || [],
      missing_skills: item.missing_skills || [],
      improvement_suggestions: item.improvement_suggestions || []
    };
    setLatestResult(result, user?.id);
    navigate('/result', { state: { result } });
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
        <PageHeader title="Analysis History" />
        <LoadingState message="Loading your previous analyses…" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      <PageHeader
        eyebrow="Your application archive"
        title="Analysis History"
        description="Search and revisit previous ATS results, gaps, and improvement guidance."
      />

      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
        <CardContent className="p-5 sm:p-7">
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-11 bg-slate-50 pl-10"
              placeholder="Search by job title or company"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Target role</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>ATS score</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, idx) => (
                  <TableRow key={item.analysis_id || item.id || idx}>
                    <TableCell>
                      <strong className="block text-slate-950">{item.job_title || 'Target Role'}</strong>
                      <small className="text-slate-500">{item.company || 'Direct Submission'}</small>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 text-slate-600">
                        <CalendarDays className="size-4" />
                        {item.analyzed_at ? new Date(item.analyzed_at).toLocaleDateString() : 'Today'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-xs font-bold px-2.5 py-1 text-white shadow-xs",
                        (item.ats_score ?? 0) >= 85
                          ? "bg-emerald-600 shadow-emerald-600/30"
                          : (item.ats_score ?? 0) >= 70
                            ? "bg-blue-600 shadow-blue-600/30"
                            : (item.ats_score ?? 0) < 40
                              ? "bg-rose-600 shadow-rose-600/30"
                              : "bg-amber-600 shadow-amber-600/30"
                      )}>
                        {item.ats_score ?? item.match_rate ?? 0}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" onClick={() => viewResult(item)}>
                        View result <ArrowRight />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filtered.length === 0 && (
            <div className="grid min-h-52 place-items-center text-center">
              <div>
                <Search className="mx-auto size-9 text-slate-300" />
                <h3 className="mt-3 font-semibold text-slate-800">No analyses found</h3>
                <p className="mt-1 text-sm text-slate-500">No analyses match “{search}”.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
