import { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Briefcase,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FileSearch,
  FileText,
  Globe2,
  GraduationCap,
  Lightbulb,
  Loader2,
  MapPin,
  Mic,
  Sparkles,
  Target,
  User,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const analyzeSteps = [
  { title: 'Extracting Document Structure', description: 'Parsing skills, work history, and education from your resume...', icon: FileText },
  { title: 'Evaluating Job Description', description: 'Extracting required frameworks, tools, and technical keywords...', icon: FileSearch },
  { title: 'Running MatchPoint AI ATS Scoring', description: 'Matching keyword coverage, ATS compatibility, and relevancy...', icon: BrainCircuit },
  { title: 'Generating Tailored Improvements', description: 'Crafting action-oriented bullet point rewrites and missing skills report...', icon: Sparkles }
];

const interviewSteps = [
  { title: 'Deconstructing Target Role Profile', description: 'Benchmarking required competencies against candidate background...', icon: Target },
  { title: 'Synthesizing Behavioral STAR Scenarios', description: 'Formulating conflict, leadership, and execution questions...', icon: Mic },
  { title: 'Structuring Technical & Architecture Challenges', description: 'Drafting domain-specific problem-solving questions...', icon: BrainCircuit },
  { title: 'Calibrating Recruiter Intent & Tips', description: 'Generating ideal answering frameworks and key keywords to mention...', icon: Sparkles }
];

const proTips = [
  'Pro Tip: Quantifying your achievements with % metrics and numbers boosts ATS score by up to 40%.',
  'Pro Tip: Mirroring exact keyword phrasing from the job description helps pass automated recruiter filters.',
  'Pro Tip: Focus your top 3 bullet points on high-impact projects matching the required tech stack.',
  'Pro Tip: Action verbs like "Architected", "Engineered", and "Optimized" demonstrate strong ownership.'
];

export default function LoadingState({
  type = 'analyze',
  message,
  subtitle
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(14);
  const [tipIndex, setTipIndex] = useState(0);

  const steps = type === 'interview' ? interviewSteps : analyzeSteps;

  const defaultMessage =
    type === 'interview'
      ? 'Generating tailored mock interview questions with MatchPoint AI…'
      : 'Inspecting resume & calibrating ATS match score…';

  const defaultSubtitle =
    type === 'interview'
      ? 'Synthesizing real-world behavioral, technical, and HR interview scenarios.'
      : 'Laser scanning document structure, extracting verified skills, and benchmarking against role requirements.';

  const displayMessage = message || defaultMessage;
  const displaySubtitle = subtitle || defaultSubtitle;

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2600);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return 94;
        const jump = Math.floor(Math.random() * 5) + 3;
        return Math.min(prev + jump, 94);
      });
    }, 550);

    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % proTips.length);
    }, 4000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearInterval(tipInterval);
    };
  }, [steps.length]);

  return (
    <Card className="mx-auto my-8 max-w-2xl overflow-hidden border-0 bg-white/95 shadow-xl shadow-indigo-500/5 ring-1 ring-slate-200/80 backdrop-blur-md dark:bg-[#0f172a]/95 dark:ring-slate-800 dark:shadow-black/50">
      <CardContent className="flex flex-col items-center p-6 text-center sm:p-10">
        
        {/* ========================================================================= */}
        {/* 1. ANALYZE ANIMATION: IMPROVISED LASER DOCUMENT LINE INSPECTOR */}
        {/* ========================================================================= */}
        {type === 'analyze' && (
          <div className="relative mb-7 w-full max-w-md">
            {/* Ambient Back Glow */}
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-indigo-500/20 to-purple-500/15 blur-xl pointer-events-none" />

            {/* Glassmorphic Document Canvas */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/95 p-5 text-left shadow-lg backdrop-blur-sm dark:border-slate-800/90 dark:bg-slate-900/90">
              
              {/* Active Sweeping Laser Beam with Light Flare */}
              <div className="absolute left-0 right-0 z-20 h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_#22d3ee] animate-laser-sweep pointer-events-none">
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 size-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee] animate-laser-spark" />
              </div>

              {/* Document Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="grid size-7 place-items-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Candidate_Resume.pdf</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Live AI Document Inspector</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-700 dark:text-cyan-400 ring-1 ring-cyan-500/30">
                  <span className="size-1.5 rounded-full bg-cyan-500 animate-ping" />
                  Scanning
                </span>
              </div>

              {/* Document Body Sections (Structured Line Verification) */}
              <div className="mt-4 space-y-3.5">
                
                {/* 1. Summary Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <User className="size-3 text-indigo-500" />
                      Executive Summary & Profile
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" /> Extracted
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                    <div className="h-1.5 w-3/4 rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                  </div>
                </div>

                {/* 2. Technical Skills Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Zap className="size-3 text-cyan-500" />
                      Core Competencies & Keywords
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" /> Verified
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                    <div className="h-1.5 w-4/5 rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                  </div>
                </div>

                {/* 3. Experience & Metrics Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="size-3 text-purple-500" />
                      Work Experience & STAR Metrics
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" /> Benchmarked
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 w-11/12 rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                    <div className="h-1.5 w-4/5 rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                  </div>
                </div>

                {/* 4. Education & Certifications Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="size-3 text-emerald-500" />
                      Education & Credentials
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" /> Validated
                    </span>
                  </div>
                  <div className="h-1.5 w-2/3 rounded-full bg-slate-200/80 dark:bg-slate-700/80" />
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. INTERVIEW ANIMATION: LINEAR-STYLE LIVE ACTIVITY STREAM & ACOUSTIC WAVE */}
        {/* ========================================================================= */}
        {type === 'interview' && (
          <div className="mb-7 flex flex-col items-center">
            {/* Center Acoustic Equalizer Wave & Mic */}
            <div className="relative mb-5 grid size-20 place-items-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <Mic className="size-8 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
              </span>
            </div>

            {/* Live Equalizer Acoustic Bars */}
            <div className="flex items-center gap-1.5 h-8 mb-4">
              <span className="w-1.5 h-6 rounded-full bg-blue-500 animate-soundwave-1" />
              <span className="w-1.5 h-8 rounded-full bg-indigo-500 animate-soundwave-2" />
              <span className="w-1.5 h-5 rounded-full bg-violet-500 animate-soundwave-3" />
              <span className="w-1.5 h-7 rounded-full bg-cyan-500 animate-soundwave-4" />
              <span className="w-1.5 h-6 rounded-full bg-purple-500 animate-soundwave-5" />
              <span className="w-1.5 h-8 rounded-full bg-blue-500 animate-soundwave-2" />
              <span className="w-1.5 h-5 rounded-full bg-indigo-500 animate-soundwave-1" />
            </div>

            {/* Linear-Style Live Action Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
                <span className="size-1.5 rounded-full bg-blue-500 animate-ping" />
                Behavioral STAR
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20">
                <span className="size-1.5 rounded-full bg-purple-500 animate-ping" />
                System Design
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Recruiter Insights
              </span>
            </div>
          </div>
        )}

        {/* Title and Subtitle */}
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
          {displayMessage}
        </h3>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {displaySubtitle}
        </p>

        {/* Progress Bar with smooth animation */}
        <div className="mt-6 w-full max-w-md">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <Loader2 className="size-3.5 animate-spin" />
              {type === 'interview' ? 'Synthesizing questions' : 'Laser scanning resume'}
            </span>
            <span className="font-mono text-slate-900 dark:text-slate-200">{progress}%</span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full w-full animate-shimmer-beam" />
            </div>
          </div>
        </div>

        {/* Live Milestone Steps Sequence (shown for interview/jobs) */}
        {type !== 'analyze' && (
          <div className="mt-7 w-full max-w-md space-y-3 rounded-2xl bg-slate-50/90 dark:bg-[#131d35] p-4 text-left ring-1 ring-slate-200/70 dark:ring-slate-700/60">
            {steps.map((step, idx) => {
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
        )}

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
