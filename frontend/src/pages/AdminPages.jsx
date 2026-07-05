import {
  AlertTriangle,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  FileSearch,
  Search,
  Server,
  ShieldCheck,
  UsersRound
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import LoadingState from '../components/LoadingState';
import MetricCard from '../components/MetricCard';
import PageHeader from '../components/PageHeader';
import { demoAdmin } from '../data/demoData';
import { adminApi } from '../services/api';

const pageClass = 'mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12';

const useAdminData = (loader, initialValue) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loader().then((response) => setData(response.data)).finally(() => setLoading(false));
  }, []);

  return [data, loading];
};

const SectionHeading = ({ eyebrow, title, icon: Icon }) => (
  <CardHeader className="flex-row items-center justify-between p-6 pb-2">
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">{eyebrow}</span>
      <CardTitle className="mt-2 text-2xl font-bold text-slate-950">{title}</CardTitle>
    </div>
    <Icon className="text-blue-600" />
  </CardHeader>
);

export function AdminDashboardPage() {
  const [data, loading] = useAdminData(adminApi.analytics, demoAdmin.analytics);

  if (loading) {
    return <div className={pageClass}><PageHeader title="Admin Dashboard" /><LoadingState message="Loading platform health…" /></div>;
  }

  const overview = data.overview;
  return (
    <div className={pageClass}>
      <PageHeader eyebrow="System command center" title="Admin Dashboard" description="System overview and key operating metrics." />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={UsersRound} label="Total users" value={overview.total_users.toLocaleString()} detail="+84 this month" />
        <MetricCard icon={FileSearch} label="Total analyses" value={overview.total_analyses.toLocaleString()} detail="+14% this week" tone="purple" />
        <MetricCard icon={BrainCircuit} label="AI calls" value={`${(overview.ai_calls / 1000).toFixed(1)}K`} detail="99.4% successful" tone="green" />
        <MetricCard icon={AlertTriangle} label="System alerts" value={overview.system_alerts} detail="No critical incidents" tone="orange" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
          <SectionHeading eyebrow="Live feed" title="Recent activity" icon={Clock3} />
          <CardContent className="grid gap-2 p-6 pt-3">
            {data.recent_activity.map((activity, index) => (
              <div className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-xl bg-slate-50 p-3" key={activity}>
                <span className="grid size-9 place-items-center rounded-xl bg-blue-100 text-xs font-bold text-blue-600">{index + 1}</span>
                <p className="text-sm font-medium text-slate-700">{activity}</p>
                <small className="text-xs text-slate-400">{index * 12 + 2}m ago</small>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
          <SectionHeading eyebrow="Operational" title="System status" icon={Server} />
          <CardContent className="p-6 pt-3">
            <div className="divide-y divide-slate-100">
              {data.system_status.map((service) => (
                <div className="flex min-h-14 items-center justify-between" key={service.service}>
                  <span className="text-sm font-medium text-slate-600">{service.service}</span>
                  <Badge className="gap-2 bg-emerald-100 text-emerald-800">
                    <span className="size-2 rounded-full bg-emerald-500" /> {service.status}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Demo status confirms each local demonstration service is available.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export function AdminUsersPage() {
  const [users, loading] = useAdminData(adminApi.users, demoAdmin.users);
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return users.filter((user) => `${user.full_name} ${user.email}`.toLowerCase().includes(query));
  }, [users, search]);

  if (loading) {
    return <div className={pageClass}><PageHeader title="Manage Users" /><LoadingState message="Loading user monitoring data…" /></div>;
  }

  return (
    <div className={pageClass}>
      <PageHeader eyebrow="Account monitoring" title="Manage Users" description="View candidate and administrator accounts and their platform activity." />
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
        <CardContent className="p-5 sm:p-7">
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-11 bg-slate-50 pl-10"
              placeholder="Search users by name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Analyses</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 rounded-xl">
                          <AvatarFallback className="rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
                            {user.full_name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <strong className="block text-slate-950">{user.full_name}</strong>
                          <small className="text-slate-500">{user.email}</small>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="gap-2 bg-emerald-100 text-emerald-800">
                        <span className="size-2 rounded-full bg-emerald-500" /> {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{user.analyses}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{user.role || 'candidate'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && (
            <div className="grid min-h-44 place-items-center text-center text-sm text-slate-500">
              No users match “{search}”.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const Chart = ({ labels, values, purple = false }) => {
  const max = Math.max(...values);
  return (
    <div className="flex h-64 items-end gap-2 rounded-2xl bg-slate-50 p-5 sm:gap-3">
      {values.map((value, index) => (
        <div className="group flex h-full flex-1 flex-col items-center justify-end gap-2" key={labels[index]}>
          <span className="text-[10px] font-bold text-slate-400 opacity-0 transition group-hover:opacity-100">{value}</span>
          <span
            className={cn(
              'w-full max-w-14 rounded-t-lg',
              purple
                ? 'bg-gradient-to-b from-violet-400 to-violet-600'
                : 'bg-gradient-to-b from-blue-400 to-blue-600'
            )}
            style={{ height: `${Math.max(18, (value / max) * 100)}%` }}
          />
          <small className="text-[10px] text-slate-400">{labels[index]}</small>
        </div>
      ))}
    </div>
  );
};

export function AdminAnalyticsPage() {
  const [data, loading] = useAdminData(adminApi.analytics, demoAdmin.analytics);
  if (loading) {
    return <div className={pageClass}><PageHeader title="System Analytics" /><LoadingState message="Preparing platform trends…" /></div>;
  }

  return (
    <div className={pageClass}>
      <PageHeader eyebrow="Performance and usage trends" title="System Analytics" description="Monitor candidate engagement and resume-analysis activity." />
      <section className="mb-6 grid gap-6 xl:grid-cols-2">
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
          <SectionHeading eyebrow="Engagement" title="Daily active users" icon={UsersRound} />
          <CardContent className="p-6 pt-3"><Chart labels={data.trends.labels} values={data.trends.active_users} /></CardContent>
        </Card>
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
          <SectionHeading eyebrow="Core feature" title="Resume analyses" icon={BarChart3} />
          <CardContent className="p-6 pt-3"><Chart labels={data.trends.labels} values={data.trends.analyses} purple /></CardContent>
        </Card>
      </section>
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
        <CardContent className="flex items-start gap-4 p-6">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <p className="text-sm leading-6 text-slate-600">
            ATS scoring, suggestions, interview generation, and recommendations are operating within target thresholds. Engagement increased by 14% this week.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminUsagePage() {
  const [usage, loading] = useAdminData(adminApi.aiUsage, demoAdmin.aiUsage);
  if (loading) {
    return <div className={pageClass}><PageHeader title="AI Usage Monitoring" /><LoadingState message="Checking analysis endpoints…" /></div>;
  }

  return (
    <div className={pageClass}>
      <PageHeader eyebrow="Model operations" title="AI Usage Monitoring" description="Monitor analysis calls, response health, latency, and local demo services." />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard icon={BrainCircuit} label="Total AI calls" value={usage.total_calls.toLocaleString()} detail={`${usage.quota_used_percent}% of monthly demo quota`} />
        <MetricCard icon={CheckCircle2} label="Success rate" value={`${usage.success_rate}%`} detail="Healthy request completion" tone="green" />
        <MetricCard icon={Clock3} label="Average latency" value={usage.average_latency} detail="Across analysis services" tone="purple" />
      </section>
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
        <SectionHeading eyebrow="Service detail" title="AI endpoints health" icon={Bot} />
        <CardContent className="p-6 pt-3">
          <div className="mb-6 rounded-xl bg-slate-50 p-4">
            <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
              <span>Monthly demo quota</span><span>{usage.quota_used_percent}%</span>
            </div>
            <Progress value={usage.quota_used_percent} className="h-2" />
          </div>
          <div className="grid gap-2">
            {usage.endpoints.map((endpoint) => (
              <div className="grid min-h-18 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-[1fr_100px_110px] sm:items-center" key={endpoint.name}>
                <div>
                  <strong className="block text-sm text-slate-900">{endpoint.name}</strong>
                  <small className="text-xs text-slate-500">{endpoint.model}</small>
                </div>
                <span className="text-sm text-slate-500">{endpoint.latency}</span>
                <Badge className="w-fit gap-2 bg-emerald-100 text-emerald-800">
                  <span className="size-2 rounded-full bg-emerald-500" /> {endpoint.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const logStyles = {
  warning: 'bg-orange-100 text-orange-600',
  success: 'bg-emerald-100 text-emerald-600',
  info: 'bg-blue-100 text-blue-600'
};

export function AdminLogsPage() {
  const [logs, loading] = useAdminData(adminApi.logs, demoAdmin.logs);
  if (loading) {
    return <div className={pageClass}><PageHeader title="Admin Logs" /><LoadingState message="Loading audit and system events…" /></div>;
  }

  return (
    <div className={pageClass}>
      <PageHeader eyebrow="Audit trail" title="Admin Logs" description="Important model, analysis, authentication, and system events." />
      <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
        <CardContent className="grid gap-2 p-5 sm:p-7">
          {logs.map((log) => {
            const Icon = log.level === 'warning' ? AlertTriangle : log.level === 'success' ? CheckCircle2 : ShieldCheck;
            return (
              <div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-[44px_1fr_auto] sm:items-center" key={log.id}>
                <span className={cn('grid size-11 place-items-center rounded-xl', logStyles[log.level] || logStyles.info)}>
                  <Icon className="size-5" />
                </span>
                <div>
                  <strong className="block text-sm text-slate-900">{log.description}</strong>
                  <small className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {log.action_type?.replaceAll('_', ' ') || 'SYSTEM EVENT'}
                  </small>
                </div>
                <time className="text-xs text-slate-500">{new Date(log.performed_at).toLocaleString()}</time>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
