import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Brand({ light = false, className, to }) {
  const { user } = useAuth();
  const targetDestination = to || (user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/');

  return (
    <Link
      className={cn(
        'inline-flex items-center gap-2.5 whitespace-nowrap text-xl font-bold tracking-tight transition hover:opacity-90',
        light ? 'text-white' : 'text-slate-950 dark:text-white',
        className
      )}
      to={targetDestination}
    >
      <img
        src="/logo_icon.png"
        alt="MatchPoint AI Logo"
        className="size-9 object-contain shrink-0 drop-shadow-sm"
      />
      <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-violet-400 font-extrabold tracking-tight">
        MatchPoint AI
      </span>
    </Link>
  );
}
