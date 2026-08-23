import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Check,
  FileSearch,
  MessageSquareText,
  Sparkles,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Brand from '../components/Brand';
import ThemeToggle from '../components/ThemeToggle';

const features = [
  {
    icon: FileSearch,
    title: 'ATS gap analysis',
    text: 'Compare your resume with a target job description and uncover important missing terms.'
  },
  {
    icon: MessageSquareText,
    title: 'Interview preparation',
    text: 'Practice technical, behavioral, and HR questions shaped around your detected gaps.'
  },
  {
    icon: BriefcaseBusiness,
    title: 'Smart job matches',
    text: 'Explore recommended roles with clear match scores and the skills that connect you.'
  }
];

const proofItems = ['No paid key required', 'PDF / DOCX support', 'Demo ready'];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_10%,rgba(91,156,255,0.18),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(138,77,255,0.13),transparent_30%),#fbfcff] dark:bg-[radial-gradient(circle_at_15%_10%,rgba(91,156,255,0.1),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(138,77,255,0.08),transparent_30%),#070d1e] dark:text-slate-100">
      <header className="mx-auto flex h-20 w-[min(1180px,calc(100%-2rem))] items-center justify-between sm:h-24">
        <Brand />
        <nav className="flex items-center gap-4 sm:gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <a className="hidden transition hover:text-blue-600 dark:hover:text-blue-400 md:inline" href="#features">Features</a>
          <a className="hidden transition hover:text-blue-600 dark:hover:text-blue-400 md:inline" href="#workflow">How it works</a>
          <ThemeToggle />
          <Link className="transition hover:text-blue-600 dark:hover:text-blue-400" to="/login">Sign in</Link>
          <Link to="/register" className="hidden sm:inline-flex">
            <Button
              className="h-10 rounded-xl bg-blue-600 px-5 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 cursor-pointer"
            >
              Get started
            </Button>
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid min-h-[650px] w-[min(1180px,calc(100%-2rem))] items-center gap-16 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <Badge variant="outline" className="mb-5 gap-2 border-violet-200 bg-violet-50 px-3 py-1.5 text-violet-700">
              <Sparkles className="size-3.5" />
              AI resume analyzer & interview preparation
            </Badge>
            <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.05em] text-slate-950 dark:text-white sm:text-6xl xl:text-7xl">
              Turn every application into a stronger match.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              Upload your resume, paste a job description, receive an ATS score,
              uncover missing skills, improve weak bullets, and practice the
              questions that matter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button
                  className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 text-white shadow-xl shadow-blue-600/20 cursor-pointer hover:opacity-95"
                >
                  Get started <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="h-12 rounded-xl border-blue-200 bg-white text-blue-700 cursor-pointer hover:bg-blue-50 dark:border-slate-700 dark:bg-[#0f172a] dark:text-blue-400 dark:hover:bg-slate-800"
                >
                  Analyze resume
                </Button>
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {proofItems.map((item) => (
                <span className="inline-flex items-center gap-1.5" key={item}>
                  <Check className="size-4 text-emerald-600 dark:text-emerald-400" /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <Card className="border-0 bg-white dark:bg-[#0f172a] py-0 shadow-2xl shadow-slate-900/10 dark:shadow-none ring-1 ring-slate-200/80 dark:ring-slate-800">
              <CardHeader className="flex-row items-center justify-between p-7 pb-0">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">Live analysis preview</Badge>
                <span className="grid size-11 place-items-center rounded-full border-4 border-emerald-500 text-emerald-600 dark:text-emerald-400">
                  <Check className="size-5" />
                </span>
              </CardHeader>
              <CardContent className="p-7 pt-5">
                <div className="grid">
                  <strong className="text-6xl font-bold tracking-tight text-slate-950 dark:text-white">92%</strong>
                  <span className="mt-1 font-semibold text-slate-700 dark:text-slate-300">ATS match score</span>
                </div>
                <h3 className="mb-3 mt-7 font-semibold text-slate-950 dark:text-white">Missing keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {['CI/CD', 'REST APIs', 'Unit Testing'].map((item) => (
                    <Badge key={item} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">{item}</Badge>
                  ))}
                </div>
                <div className="mt-6 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 p-4">
                  <Bot className="mt-0.5 size-5 shrink-0 text-violet-600 dark:text-violet-400" />
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Quantify backend delivery impact and add deployment tooling aligned with the role.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Badge className="absolute -right-4 -top-5 hidden gap-2 rounded-xl bg-white dark:bg-[#0f172a] px-4 py-3 text-slate-700 dark:text-slate-200 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 lg:flex">
              <Target className="size-4 text-violet-600 dark:text-violet-400" /> Recruiter-style scoring
            </Badge>
            <Badge className="absolute -bottom-5 -left-4 hidden gap-2 rounded-xl bg-white dark:bg-[#0f172a] px-4 py-3 text-slate-700 dark:text-slate-200 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 lg:flex">
              <Sparkles className="size-4 text-violet-600 dark:text-violet-400" /> Actionable rewrites
            </Badge>
          </div>
        </section>

        <section id="features" className="mx-auto w-[min(1180px,calc(100%-2rem))] py-20 sm:py-28">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
              Everything in one preparation workspace
            </span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Know the gap. Build the answer.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="border-0 bg-white dark:bg-[#0f172a] shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800">
                <CardHeader className="p-7 pb-2">
                  <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="text-lg font-bold text-slate-950 dark:text-white">{title}</CardTitle>
                </CardHeader>
                <CardContent className="px-7 pb-7 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="workflow" className="border-y border-slate-200/80 bg-slate-100/70 text-slate-900 transition-colors duration-200 dark:border-slate-800/80 dark:bg-[#030a20] dark:text-white">
          <div className="mx-auto grid w-[min(1180px,calc(100%-2rem))] gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
                A clean three-step flow
              </span>
              <h2 className="mt-3 max-w-md text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                From document to interview room.
              </h2>
            </div>
            <ol className="grid gap-4">
              {[
                ['01', 'Upload', 'Add a PDF or DOCX resume and your target job details.'],
                ['02', 'Analyze', 'Review your score, missing skills, keywords, and improvements.'],
                ['03', 'Practice', 'Prepare with focused questions and explore matched roles.']
              ].map(([number, title, text]) => (
                <li className="grid grid-cols-[48px_1fr] gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-xs transition-colors duration-200 dark:border-white/10 dark:bg-white/[0.04]" key={number}>
                  <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-xs">
                    {number}
                  </span>
                  <div>
                    <strong className="text-slate-950 dark:text-white">{title}</strong>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex min-h-24 w-[min(1180px,calc(100%-2rem))] items-center justify-between text-sm text-slate-500">
        <Brand />
        <a
          href="https://github.com/victormallick/cse4104-7a-t05-matchpointai"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Repository"
          className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
        >
          <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </footer>
    </div>
  );
}
