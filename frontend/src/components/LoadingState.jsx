import { useEffect, useState } from 'react';
import {
  Bot,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  FileSearch,
  FileText,
  Lightbulb,
  Loader2,
  Sparkles,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const analysisSteps = [
  {
    title: 'Extracting Document Structure',
    description: 'Parsing skills, work history, and education from your resume...',
    icon: FileText
  },
  {
    title: 'Evaluating Job Description',
    description: 'Extracting required frameworks, tools, and technical keywords...',
    icon: FileSearch
  },
  {
    title: 'Running MatchPoint AI ATS Scoring',
    description: 'Matching keyword coverage, ATS compatibility, and relevancy...',
    icon: BrainCircuit
  },
  {
    title: 'Generating Tailored Improvements',
    description: 'Crafting action-oriented bullet point rewrites and missing skills report...',
    icon: Sparkles
  }
];

const proTips = [
  'Pro Tip: Quantifying your achievements with % metrics and numbers boosts ATS score by up to 40%.',
  'Pro Tip: Mirroring exact keyword phrasing from the job description helps pass automated recruiter filters.',
  'Pro Tip: Focus your top 3 bullet points on high-impact projects matching the required tech stack.',
  'Pro Tip: Action verbs like "Architected", "Engineered", and "Optimized" demonstrate strong ownership.'
];

export default function LoadingState({
  message = 'Building your ATS and skill-gap report…',
  subtitle = 'MatchPoint AI is comparing your experience against the target role requirements.'
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(12);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // Step progression timer
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < analysisSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 2800);

    // Progress bar smooth increment
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return 94;
        const jump = Math.floor(Math.random() * 6) + 3;
        return Math.min(prev + jump, 94);
      });
    }, 600);

    // Tips rotation
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % proTips.length);
    }, 4500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, []);

  return (
    <Card className="mx-auto my-8 max-w-2xl overflow-hidden border-0 bg-white shadow-xl shadow-indigo-500/5 ring-1 ring-slate-200/80 backdrop-blur-md dark:bg-[#0f172a] dark:ring-slate-800 dark:shadow-black/40">
      <CardContent className="flex flex-col items-center p-8 text-center sm:p-12">
        {/* Animated Glowing AI Core */}
        <div className="relative mb-8 grid size-32 place-items-center">
          {/* Radar ripple rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 animate-radar-ripple" />
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-violet-500/20 animate-radar-ripple"
            style={{ animationDelay: '1.2s' }}
          />

          {/* Orbiting particles */}
          <div className="absolute size-28 animate-orbit pointer-events-none">
            <span className="grid size-7 place-items-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/40">
              <Sparkles className="size-3.5" />
            </span>
          </div>
          <div className="absolute size-36 animate-orbit-reverse pointer-events-none">
            <span className="grid size-6 place-items-center rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-500/40">
              <Zap className="size-3" />
            </span>
          </div>

          {/* Central AI Orb */}
          <div className="relative z-10 grid size-20 place-items-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-500 text-white shadow-xl shadow-indigo-500/30 animate-pulse-glow">
            <BrainCircuit className="size-9 animate-float" />
          </div>
        </div>

        {/* Title and Subtitle */}
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
          {message}
        </h3>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {subtitle}
        </p>

        {/* Progress Bar with animated shimmer */}
        <div className="mt-6 w-full max-w-md">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <Loader2 className="size-3.5 animate-spin" />
              Processing AI analysis
            </span>
            <span className="font-mono text-slate-900 dark:text-slate-200">{progress}%</span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full animate-shimmer-beam" />
            </div>
          </div>
        </div>

        {/* Live Milestone Steps Sequence */}
        <div className="mt-8 w-full max-w-md space-y-3 rounded-2xl bg-slate-50/90 dark:bg-[#131d35] p-4 text-left ring-1 ring-slate-200/70 dark:ring-slate-700/60">
          {analysisSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const StepIcon = step.icon;

            return (
              <div
                key={step.title}
                className={`flex items-start gap-3 transition-all duration-300 ${
                  isCurrent
                    ? 'scale-[1.01] opacity-100'
                    : isCompleted
                    ? 'opacity-90'
                    : 'opacity-40'
                }`}
              >
                <div className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full">
                  {isCompleted ? (
                    <CheckCircle2 className="size-5 text-emerald-500 transition-transform duration-200 scale-110" />
                  ) : isCurrent ? (
                    <span className="relative grid size-5 place-items-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                      <Loader2 className="size-3.5 animate-spin" />
                    </span>
                  ) : (
                    <span className="grid size-5 place-items-center rounded-full bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      <StepIcon className="size-3" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-indigo-900 dark:text-indigo-300 font-bold'
                        : isCompleted
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  {isCurrent && (
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 leading-snug animate-fade-in">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Pro-Tip Ticker */}
        <div className="mt-6 flex w-full max-w-md items-center gap-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 px-3.5 py-2.5 text-left text-xs text-amber-900 dark:text-amber-200 ring-1 ring-amber-200/70 dark:ring-amber-800/60 transition-all">
          <Lightbulb className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="leading-snug transition-opacity duration-300">
            {proTips[tipIndex]}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
