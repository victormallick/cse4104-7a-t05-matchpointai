import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const toneStyles = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-violet-50 text-violet-600',
  green: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600'
};

export default function MetricCard({ icon: Icon, label, value, detail, tone = 'blue' }) {
  return (
    <Card className="border-0 bg-white py-0 shadow-sm ring-1 ring-slate-200/80">
      <CardContent className="flex min-h-36 items-start gap-4 p-6">
        <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl', toneStyles[tone])}>
          <Icon className="size-5" />
        </span>
        <div className="grid gap-1">
          <span className="text-sm font-medium text-slate-500">{label}</span>
          <strong className="text-3xl font-bold tracking-tight text-slate-950">{value}</strong>
          {detail && <small className="text-xs text-slate-400">{detail}</small>}
        </div>
      </CardContent>
    </Card>
  );
}
