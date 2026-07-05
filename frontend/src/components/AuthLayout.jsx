import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import Brand from './Brand';

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[minmax(360px,0.85fr)_minmax(520px,1.15fr)]">
      <section className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-[#030a20] p-7 text-white sm:p-10 lg:min-h-screen lg:p-14">
        <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-80 rounded-full bg-violet-600/20 blur-3xl" />
        <Brand light className="relative z-10" />
        <div className="relative z-10 my-12 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
            Career preparation, made focused
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
            AI-guided applications without guesswork.
          </h1>
          <p className="mt-5 max-w-lg leading-7 text-slate-300">
            Score resumes, find skill gaps, practice interviews, and track every application insight.
          </p>
          <ul className="mt-8 hidden gap-3 text-sm text-slate-200 sm:grid">
            {[
              'Works without paid API keys in demo mode',
              'PDF and DOCX resume workflow',
              'Candidate and administrator experiences'
            ].map((item) => (
              <li className="flex items-center gap-2" key={item}>
                <CheckCircle2 className="size-4 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <small className="relative z-10 text-slate-500">
          CSE4104-7A-T05 · Software Development III
        </small>
      </section>

      <section className="grid place-items-center p-4 sm:p-8">
        <Card className="w-full max-w-xl border-0 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-200">
          <CardContent className="p-6 sm:p-9">
            <Link
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              to="/"
            >
              <ArrowLeft className="size-4" /> Back to home
            </Link>
            {children}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
