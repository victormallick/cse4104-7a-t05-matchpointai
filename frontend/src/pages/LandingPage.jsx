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
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_10%,rgba(91,156,255,0.18),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(138,77,255,0.13),transparent_30%),#fbfcff]">
      <header className="mx-auto flex h-20 w-[min(1180px,calc(100%-2rem))] items-center justify-between sm:h-24">
        <Brand />
        <nav className="flex items-center gap-6 text-sm font-semibold text-slate-600">
          <a className="hidden transition hover:text-blue-600 md:inline" href="#features">Features</a>
          <a className="hidden transition hover:text-blue-600 md:inline" href="#workflow">How it works</a>
          <Link className="transition hover:text-blue-600" to="/login">Sign in</Link>
          <Button
            render={<Link to="/register" />}
            className="hidden h-10 rounded-xl bg-blue-600 px-5 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 sm:inline-flex"
          >
            Get started
          </Button>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid min-h-[650px] w-[min(1180px,calc(100%-2rem))] items-center gap-16 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <Badge variant="outline" className="mb-5 gap-2 border-violet-200 bg-violet-50 px-3 py-1.5 text-violet-700">
              <Sparkles className="size-3.5" />
              AI resume analyzer & interview preparation
            </Badge>
            <h1 className="max-w-3xl text-5xl font-bold leading-[0.98] tracking-[-0.05em] text-slate-950 sm:text-6xl xl:text-7xl">
              Turn every application into a stronger match.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Upload your resume, paste a job description, receive an ATS score,
              uncover missing skills, improve weak bullets, and practice the
              questions that matter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                render={<Link to="/register" />}
                className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 text-white shadow-xl shadow-blue-600/20"
              >
                Get started <ArrowRight />
              </Button>
              <Button
                render={<Link to="/login" />}
                variant="outline"
                className="h-12 rounded-xl border-blue-200 bg-white px-6 text-blue-700"
              >
                Analyze resume
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
              {proofItems.map((item) => (
                <span className="inline-flex items-center gap-1.5" key={item}>
                  <Check className="size-4 text-emerald-600" /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <Card className="border-0 bg-white py-0 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200/80">
              <CardHeader className="flex-row items-center justify-between p-7 pb-0">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">Live analysis preview</Badge>
                <span className="grid size-11 place-items-center rounded-full border-4 border-emerald-500 text-emerald-600">
                  <Check className="size-5" />
                </span>
              </CardHeader>
              <CardContent className="p-7 pt-5">
                <div className="grid">
                  <strong className="text-6xl font-bold tracking-tight text-slate-950">92%</strong>
                  <span className="mt-1 font-semibold text-slate-700">ATS match score</span>
                </div>
                <h3 className="mb-3 mt-7 font-semibold text-slate-950">Missing keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {['CI/CD', 'REST APIs', 'Unit Testing'].map((item) => (
                    <Badge key={item} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{item}</Badge>
                  ))}
                </div>
                <div className="mt-6 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Bot className="mt-0.5 size-5 shrink-0 text-violet-600" />
                  <p className="text-sm leading-6 text-slate-600">
                    Quantify backend delivery impact and add deployment tooling aligned with the role.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Badge className="absolute -right-4 -top-5 hidden gap-2 rounded-xl bg-white px-4 py-3 text-slate-700 shadow-xl ring-1 ring-slate-200 lg:flex">
              <Target className="size-4 text-violet-600" /> Recruiter-style scoring
            </Badge>
            <Badge className="absolute -bottom-5 -left-4 hidden gap-2 rounded-xl bg-white px-4 py-3 text-slate-700 shadow-xl ring-1 ring-slate-200 lg:flex">
              <Sparkles className="size-4 text-violet-600" /> Actionable rewrites
            </Badge>
          </div>
        </section>

        <section id="features" className="mx-auto w-[min(1180px,calc(100%-2rem))] py-20 sm:py-28">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Everything in one preparation workspace
            </span>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Know the gap. Build the answer.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
                <CardHeader className="p-7 pb-2">
                  <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="text-lg font-bold text-slate-950">{title}</CardTitle>
                </CardHeader>
                <CardContent className="px-7 pb-7 text-sm leading-6 text-slate-600">{text}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="workflow" className="bg-[#030a20] text-white">
          <div className="mx-auto grid w-[min(1180px,calc(100%-2rem))] gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
                A clean three-step flow
              </span>
              <h2 className="mt-3 max-w-md text-4xl font-bold tracking-tight sm:text-5xl">
                From document to interview room.
              </h2>
            </div>
            <ol className="grid gap-4">
              {[
                ['01', 'Upload', 'Add a PDF or DOCX resume and your target job details.'],
                ['02', 'Analyze', 'Review your score, missing skills, keywords, and improvements.'],
                ['03', 'Practice', 'Prepare with focused questions and explore matched roles.']
              ].map(([number, title, text]) => (
                <li className="grid grid-cols-[48px_1fr] gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5" key={number}>
                  <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold">
                    {number}
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex min-h-28 w-[min(1180px,calc(100%-2rem))] flex-col items-start justify-center gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <Brand />
        <span>CSE4104-7A-T05 · MatchPoint AI</span>
      </footer>
    </div>
  );
}
