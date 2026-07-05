import { ArrowRight, CheckCircle2, Lightbulb, Sparkles, Target } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import PageHeader from '../components/PageHeader';
import { demoResult } from '../data/demoData';

const readStoredResult = () => {
  try {
    return JSON.parse(localStorage.getItem('matchpoint_latest_result') || 'null');
  } catch {
    return null;
  }
};

export default function ResultPage() {
  const location = useLocation();
  const result = location.state?.result || readStoredResult() || demoResult;
  const suggestions = result.improvement_suggestions || demoResult.improvement_suggestions;

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      <PageHeader
        eyebrow={`${result.job_title || 'Target role'} · ${result.company || 'Target company'}`}
        title="AI Analysis Result"
        description={result.summary || 'Your ATS and skill-gap report is ready.'}
        action={(
          <Badge variant="secondary" className="gap-2 bg-violet-100 px-3 py-2 text-violet-700">
            <Sparkles className="size-3.5" /> {result.analysis_mode === 'demo' ? 'Demo analysis' : 'Analysis ready'}
          </Badge>
        )}
      />

      <section className="mb-10 grid gap-6 xl:grid-cols-[minmax(360px,0.72fr)_minmax(480px,1.28fr)]">
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
          <CardContent className="flex h-full flex-col items-start gap-7 p-7 sm:flex-row sm:items-center">
            <div
              className="grid size-44 shrink-0 place-items-center rounded-full p-5"
              style={{ background: `conic-gradient(#7534f5 ${result.ats_score * 3.6}deg, #e8e4f6 0)` }}
            >
              <span className="grid size-full place-items-center rounded-full bg-white text-4xl font-bold text-slate-950">
                {result.ats_score}%
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">ATS match score</span>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                {result.ats_score >= 80 ? 'Strong foundation' : 'Promising start'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Focus on the identified terms and back them up with honest project evidence.
              </p>
              <Progress value={result.ats_score} className="mt-5 h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
          <CardHeader className="flex-row items-start justify-between p-7 pb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Gap analysis</span>
              <CardTitle className="mt-2 text-2xl font-bold text-slate-950">What is missing</CardTitle>
            </div>
            <Target className="text-blue-600" />
          </CardHeader>
          <CardContent className="p-7 pt-3">
            <h3 className="mb-3 text-sm font-semibold text-slate-950">Missing keywords</h3>
            <div className="flex flex-wrap gap-2">
              {result.missing_keywords?.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="bg-violet-100 text-violet-700">{keyword}</Badge>
              ))}
            </div>
            <h3 className="mb-3 mt-7 text-sm font-semibold text-slate-950">Missing skills</h3>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {result.missing_skills?.map((skill) => (
                <li className="flex items-center gap-2 text-sm text-slate-600" key={skill}>
                  <CheckCircle2 className="size-4 text-emerald-600" /> {skill}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-5">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Make the next revision count</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">AI improvement suggestions</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((suggestion, index) => (
            <Card key={suggestion.title || index} className="relative border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
              <CardContent className="min-h-52 p-7">
                <span className="absolute right-6 top-5 text-3xl font-bold text-slate-100">0{index + 1}</span>
                <Lightbulb className="size-5 text-violet-600" />
                <h3 className="mt-6 font-bold text-slate-950">{suggestion.title || 'Improve this section'}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {suggestion.detail || suggestion.improved || suggestion}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {result.improved_bullets?.length > 0 && (
        <Card className="mt-6 border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
          <CardContent className="p-7">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">Bullet rewrite example</span>
            <div className="mt-4 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-2xl bg-slate-50 p-5">
                <small className="font-bold uppercase tracking-wide text-slate-400">Before</small>
                <p className="mt-2 text-sm leading-6 text-slate-600">{result.improved_bullets[0].original}</p>
              </div>
              <ArrowRight className="mx-auto rotate-90 text-slate-400 md:rotate-0" />
              <div className="rounded-2xl bg-emerald-50 p-5">
                <small className="font-bold uppercase tracking-wide text-emerald-600">Improved</small>
                <p className="mt-2 text-sm leading-6 text-slate-700">{result.improved_bullets[0].improved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <Button render={<Link to="/interview" />} className="h-11 bg-blue-600 px-5 text-white hover:bg-blue-700">
          Generate interview questions <ArrowRight />
        </Button>
        <Button render={<Link to="/jobs" />} variant="outline" className="h-11 px-5 text-blue-700">
          View job recommendations
        </Button>
      </div>
    </div>
  );
}
