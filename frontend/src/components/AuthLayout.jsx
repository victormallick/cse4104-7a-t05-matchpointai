import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import Brand from './Brand';
import ThemeToggle from './ThemeToggle';

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-[#070d1e] lg:grid-cols-[minmax(360px,0.85fr)_minmax(520px,1.15fr)]">
      <section className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-slate-100/90 p-7 text-slate-900 shadow-sm border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:from-[#060c22] dark:via-[#09153a] dark:to-[#04091a] dark:text-white dark:border-slate-800/60 lg:min-h-screen lg:p-14 transition-colors duration-200">
        <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-blue-500/10 dark:bg-blue-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-80 rounded-full bg-violet-500/10 dark:bg-violet-600/20 blur-3xl" />
        <Brand className="relative z-10" />
        <div className="relative z-10 my-12 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
            Career preparation, made focused
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 dark:text-white sm:text-5xl xl:text-6xl">
            AI-guided applications without guesswork.
          </h1>
          <p className="mt-5 max-w-lg leading-7 text-slate-600 dark:text-slate-300">
            Score resumes, find skill gaps, practice interviews, and track every application insight.
          </p>
          <ul className="mt-8 hidden gap-3 text-sm text-slate-700 dark:text-slate-200 sm:grid">
            {[
              'Works without paid API keys in demo mode',
              'PDF and DOCX resume workflow',
              'Candidate and administrator experiences'
            ].map((item) => (
              <li className="flex items-center gap-2" key={item}>
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <a
          href="https://github.com/victormallick/cse4104-7a-t05-matchpointai"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Repository"
          className="relative z-10 grid size-8 place-items-center rounded-lg bg-slate-200/80 text-slate-700 transition hover:bg-slate-300 dark:bg-white/10 dark:text-slate-400 dark:hover:text-white"
        >
          <svg className="size-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </section>

      <section className="grid place-items-center p-4 sm:p-8 bg-slate-50 dark:bg-[#070d1e]">
        <Card className="w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-300/40 dark:border-slate-800 dark:bg-[#0f172a] dark:shadow-none transition-all">
          <CardContent className="p-6 sm:p-9">
            <div className="mb-8 flex items-center justify-between">
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                to="/"
              >
                <ArrowLeft className="size-4" /> Back to home
              </Link>
              <ThemeToggle />
            </div>
            {children}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
