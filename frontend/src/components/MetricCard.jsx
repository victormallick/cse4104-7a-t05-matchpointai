import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const toneStyles = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
  purple: 'bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400'
};

export default function MetricCard({ icon: Icon, label, value, detail, tone = 'blue' }) {
  return (
    <Card className="border-0 bg-white py-0 shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0f172a] dark:ring-slate-800">
      <CardContent className="flex min-h-36 items-start gap-4 p-6">
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl', toneStyles[tone])}>
          <Icon className="size-5" />
        </span>
        <div className="grid gap-1">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
          <strong className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100">{value}</strong>
          {detail && <small className="text-xs text-slate-400 dark:text-slate-500">{detail}</small>}
        </div>
      </CardContent>
    </Card>
  );
}
