import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className, variant = 'outline', mode = 'icon' }) {
  const { theme, toggleTheme, setTheme, isDark } = useTheme();

  if (mode === 'segmented') {
    return (
      <div className={cn('flex w-full items-center rounded-xl border border-slate-200 bg-slate-100/90 p-1 dark:border-white/15 dark:bg-white/10 backdrop-blur-sm', className)}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer',
            !isDark
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <Sun className={cn('size-3.5', !isDark ? 'text-amber-500' : 'text-slate-400')} />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer',
            isDark
              ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
        >
          <Moon className={cn('size-3.5', isDark ? 'text-violet-200' : 'text-slate-400')} />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={cn(
        'size-9.5 rounded-xl border border-slate-200/90 bg-white text-slate-800 shadow-xs transition-all hover:scale-105 hover:border-slate-300 hover:bg-slate-50 dark:border-white/20 dark:bg-white/15 dark:text-white dark:hover:bg-white/25',
        className
      )}
    >
      {isDark ? (
        <Sun className="size-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="size-5 text-indigo-600 drop-shadow-[0_0_6px_rgba(79,70,229,0.3)] transition-transform duration-300 hover:-rotate-12" />
      )}
    </Button>
  );
}
