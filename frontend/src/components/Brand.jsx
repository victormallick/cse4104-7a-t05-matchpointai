import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Brand({ light = false, className }) {
  return (
    <Link
      className={cn(
        'inline-flex items-center gap-3 whitespace-nowrap text-xl font-bold tracking-tight',
        light ? 'text-white' : 'text-slate-950',
        className
      )}
      to="/"
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-violet-500/25">
        <Sparkles className="size-5" />
      </span>
      <span>MatchPoint AI</span>
    </Link>
  );
}
