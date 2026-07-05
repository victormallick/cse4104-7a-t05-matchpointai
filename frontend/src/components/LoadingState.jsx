import { LoaderCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingState({ message = 'Loading your MatchPoint insights…' }) {
  return (
    <Card className="mx-auto my-10 max-w-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
      <CardContent className="flex min-h-80 flex-col items-center justify-center p-8 text-center sm:p-12">
        <span className="relative mb-6 grid size-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <LoaderCircle className="size-8 animate-spin" />
          <Sparkles className="absolute right-2 top-2 size-3.5 text-violet-600" />
        </span>
        <strong className="text-base font-semibold text-slate-950">{message}</strong>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Document parsing and AI-style analysis can take a moment.
        </p>
        <Progress value={68} className="mt-6 h-2 w-full max-w-sm" />
        <div className="mt-6 grid w-full max-w-sm gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5 justify-self-center" />
        </div>
      </CardContent>
    </Card>
  );
}
