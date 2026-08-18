import {
  AlertTriangle,
  ArrowRight,
  Award,
  Briefcase,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Layers,
  Lightbulb,
  MessageSquare,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import PageHeader from '../components/PageHeader';

const readStoredResult = () => {
  try {
    return JSON.parse(localStorage.getItem('matchpoint_latest_result') || 'null');
  } catch {
    return null;
  }
};

export default function ResultPage() {
  const location = useLocation();
  const result = location.state?.result || readStoredResult();

  const [copiedIndex, setCopiedIndex] = useState(null);
  const [selectedBulletIndex, setSelectedBulletIndex] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  const rawScore = result?.ats_score ?? result?.match_score ?? 0;
  const isInvalid = result?.is_valid_resume === false || rawScore === 0 || Boolean(result?.document_warning);
  const targetScore = isInvalid ? 0 : rawScore;

  // Smooth score tick-up animation
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(easeOut * targetScore));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetScore]);

  const handleCopyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  if (!result) {
    return (
      <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
        <PageHeader title="AI Analysis Result" description="No active resume analysis found." />
        <Card className="border-0 bg-white dark:bg-[#0f172a] p-12 text-center shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800">
          <CardContent className="flex flex-col items-center justify-center">
            <Sparkles className="size-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-950 dark:text-slate-100">No Analysis Result Available</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Upload a resume on the Analyze page to view your live ATS score, detected skill gaps, and AI bullet rewrites.
            </p>
            <Button render={<Link to="/analyze" />} className="mt-6 bg-blue-600 px-6 text-white hover:bg-blue-700">
              Go to Analyze Resume <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const suggestions = result.improvement_suggestions || [];
  const bullets = result.improved_bullets || [
    {
      original: 'Worked on digital marketing campaigns and managed content creation.',
      improved: 'Spearheaded multi-channel content marketing campaigns across GA4 and HubSpot, increasing organic lead generation by 48% and reducing turnaround by 35%.'
    },
    {
      original: 'Handled SEO and social media ad performance for company products.',
      improved: 'Engineered comprehensive technical SEO architecture and Meta paid funnels, scaling monthly search visibility by 3x and achieving a 4.2% average conversion rate.'
    }
  ];

  const isLowScore = targetScore < 40 || isInvalid;
  const isModerateScore = !isInvalid && targetScore >= 40 && targetScore < 75;
  const isHighScore = !isInvalid && targetScore >= 75;

  const scoreTitle = isInvalid
    ? 'Non-Resume / Excluded'
    : targetScore >= 90
    ? 'Top Tier ATS Match'
    : isHighScore
    ? 'Strong Match'
    : isModerateScore
    ? 'Promising Start'
    : 'Low ATS Alignment';

  const scoreDescription = isInvalid
    ? 'This document was excluded from ATS qualification scoring because standard candidate resume sections were missing.'
    : targetScore >= 90
    ? 'Outstanding resume alignment! Your quantifiable metrics, active verbs, and technical keywords place you in the top 5% of candidate profiles.'
    : isHighScore
    ? 'Your experience and technical keywords align closely with the target job requirements.'
    : isModerateScore
    ? 'Solid baseline. Adding the missing tools and quantifiable results below will boost your score significantly.'
    : 'Significant gaps detected between your document and the job description requirements.';

  // Radial HUD calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      {/* Non-Resume / Document Warning Alert Banner */}
      {isInvalid && (
        <div className="mb-6 flex items-start gap-3.5 rounded-3xl border border-rose-300 bg-rose-50/95 dark:border-rose-900/70 dark:bg-rose-950/50 p-6 text-rose-950 dark:text-rose-200 shadow-sm">
          <AlertTriangle className="size-6 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="flex-1 text-sm leading-relaxed">
            <strong className="font-bold block text-rose-950 dark:text-rose-100 text-base">
              Non-Resume Document Detected — 0% ATS Score
            </strong>
            <p className="mt-1 text-rose-800 dark:text-rose-300">
              {result.document_warning || 'The uploaded file does not contain standard candidate resume sections (work experience, skills, or education).'}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Button
                render={<Link to="/analyze" />}
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs gap-1.5 px-4 py-2 cursor-pointer"
              >
                Upload Genuine Resume <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        eyebrow={result.company ? `${result.job_title || 'Target role'} · ${result.company}` : (result.job_title || 'Target role')}
        title="AI Resume Analysis Result"
        description={result.summary || 'Your comprehensive ATS match report, keyword gap analysis, and tailored bullet point rewrites.'}
        action={(
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "gap-1.5 px-3.5 py-2 font-semibold text-xs rounded-xl",
                isInvalid
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300"
                  : isHighScore
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
              )}
            >
              <Sparkles className="size-3.5" />
              <span>{isInvalid ? 'Excluded (Non-Resume)' : 'Analysis Verified'}</span>
            </Badge>
          </div>
        )}
      />

      {/* Top Hero Section: Radial HUD Score & Gap Analysis */}
      <section className="mb-10 grid gap-6 xl:grid-cols-[minmax(380px,0.8fr)_minmax(480px,1.2fr)]">
        {/* Radial HUD Score Card */}
        <Card className="border-0 bg-white dark:bg-[#0f172a] shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 size-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

          <CardContent className="p-7 sm:p-8 flex flex-col sm:flex-row items-center gap-8">
            {/* Animated Radial SVG Dial */}
            <div className="relative size-44 shrink-0 grid place-items-center">
              <svg className="size-full -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-100 dark:text-slate-800/80 fill-none"
                />

                {/* Animated Gradient Match Arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="url(#scoreGradient)"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out fill-none"
                />

                {/* SVG Gradients */}
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    {isInvalid ? (
                      <>
                        <stop offset="0%" stopColor="#F43F5E" />
                        <stop offset="100%" stopColor="#E11D48" />
                      </>
                    ) : isHighScore ? (
                      <>
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="50%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </>
                    ) : isModerateScore ? (
                      <>
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#3B82F6" />
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#EF4444" />
                      </>
                    )}
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Counter & Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-black tracking-tight text-slate-950 dark:text-slate-100">
                  {animatedScore}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Match Score
                </span>
              </div>
            </div>

            {/* Score Text & Details */}
            <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge
                  className={cn(
                    "text-[11px] font-bold py-0.5 px-2.5 rounded-lg border-0",
                    isHighScore
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                      : isModerateScore
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                  )}
                >
                  <Award className="size-3 mr-1 inline" />
                  {scoreTitle}
                </Badge>
                {targetScore >= 90 && (
                  <Badge className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-0">
                    ★ Top 5% Applicant
                  </Badge>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-950 dark:text-slate-100">
                MatchPoint AI Assessment
              </h2>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {scoreDescription}
              </p>

              <div className="pt-2">
                <Progress value={animatedScore} className="h-2 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gap Analysis Card */}
        <Card className="border-0 bg-white dark:bg-[#0f172a] shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800">
          <CardHeader className="flex-row items-start justify-between p-7 pb-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
                Target Competency Breakdown
              </span>
              <CardTitle className="mt-1 text-xl font-bold text-slate-950 dark:text-slate-100">
                Matched Stack & Identified Gaps
              </CardTitle>
            </div>
            <span className="grid size-10 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Target className="size-5" />
            </span>
          </CardHeader>

          <CardContent className="p-7 pt-3 space-y-5">
            {/* Matched Skills / Keywords */}
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" /> Matched Skills & Strengths
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(result.matched_skills || result.skills || ['Core Domain Experience', 'Project Ownership', 'Problem Solving']).slice(0, 8).map((kw) => (
                  <Badge key={kw} variant="outline" className="text-xs border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
                    ✓ {kw}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Missing Skills / Terms */}
            {result.missing_skills?.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="size-3.5" /> High-Value Missing Terms (Add to Resume)
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.missing_skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 font-medium">
                      + {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Interactive Before vs. After Bullet Point Optimizer Studio */}
      <section className="mb-10">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Zap className="size-3.5 text-amber-500" /> Interactive Rewrite Studio
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-100">
              Before vs. After Bullet Point Optimizer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              See how transforming vague statements into quantified STAR achievements boosts ATS visibility.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-[#131d35] p-1.5 ring-1 ring-slate-200/70 dark:ring-slate-800 w-fit">
            {bullets.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedBulletIndex(i)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer",
                  selectedBulletIndex === i
                    ? "bg-white dark:bg-[#0b1222] text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                Bullet #{i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Bullet Comparison Card */}
        {bullets[selectedBulletIndex] && (
          <Card className="border-0 bg-white dark:bg-[#0f172a] shadow-md ring-1 ring-slate-200/80 dark:ring-slate-800 overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1.2fr]">
                {/* Before Box */}
                <div className="flex flex-col justify-between rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="grid size-6 place-items-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold">
                        ✕
                      </span>
                      <strong className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                        Original Draft (Unquantified)
                      </strong>
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 font-sans italic">
                      "{bullets[selectedBulletIndex].original}"
                    </p>
                  </div>

                  <div className="text-[11px] text-rose-700/80 dark:text-rose-400 flex items-center gap-1 font-medium">
                    <span>Lacks active action verbs & measurable metrics</span>
                  </div>
                </div>

                {/* Middle Transformation Arrow */}
                <div className="flex items-center justify-center">
                  <span className="grid size-10 place-items-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 shadow-sm ring-1 ring-blue-200/60 dark:ring-blue-900/60">
                    <ArrowRight className="size-5 rotate-90 lg:rotate-0" />
                  </span>
                </div>

                {/* After / Improved Box */}
                <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-blue-50/80 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/30 border border-emerald-200/80 dark:border-emerald-800/60 p-6 space-y-4 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="grid size-6 place-items-center rounded-lg bg-emerald-600 text-white text-xs font-bold">
                          ✓
                        </span>
                        <strong className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          AI Optimized Rewrite (STAR & Metric-Backed)
                        </strong>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleCopyBullet(bullets[selectedBulletIndex].improved, selectedBulletIndex)}
                        className={cn(
                          "h-8 px-3 text-xs font-semibold rounded-xl cursor-pointer gap-1.5 transition",
                          copiedIndex === selectedBulletIndex
                            ? "bg-emerald-600 text-white"
                            : "bg-white dark:bg-[#0b1222] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                        )}
                      >
                        {copiedIndex === selectedBulletIndex ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        <span>{copiedIndex === selectedBulletIndex ? 'Copied!' : 'Copy'}</span>
                      </Button>
                    </div>

                    <p className="text-sm sm:text-base font-semibold leading-relaxed text-slate-900 dark:text-slate-100">
                      "{bullets[selectedBulletIndex].improved}"
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5">
                      ✓ Strong Action Verb
                    </span>
                    <span className="rounded-md bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 px-2 py-0.5">
                      ✓ Tool Stack Integrated
                    </span>
                    <span className="rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-2 py-0.5">
                      ✓ Quantified Outcome Lift
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* AI Improvement Suggestions Grid */}
      <section className="mb-10">
        <div className="mb-4">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
            Strategic Action Plan
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-100">
            AI Recommended Improvements
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {suggestions.map((suggestion, index) => (
            <Card key={suggestion.title || index} className="relative border-0 bg-white dark:bg-[#0f172a] shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800 hover:ring-blue-300 dark:hover:ring-blue-700/60 transition">
              <CardContent className="min-h-48 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                      <Lightbulb className="size-4.5" />
                    </span>
                    <span className="text-2xl font-black text-slate-200 dark:text-slate-800">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-950 dark:text-slate-100 text-base leading-snug">
                    {suggestion.title || 'Improvement Recommendation'}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {suggestion.detail || suggestion.improved || suggestion}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Navigation Next Step Action Bar */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button
          render={<Link to="/interview" state={{ result }} />}
          className="h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 font-semibold text-xs text-white shadow-md shadow-blue-600/20 hover:opacity-95 cursor-pointer gap-2"
        >
          <MessageSquare className="size-4" />
          <span>Prepare Interview Questions</span>
          <ArrowRight className="size-3.5" />
        </Button>

        <Button
          render={<Link to="/jobs" state={{ result }} />}
          variant="outline"
          className="h-11 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-6 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer gap-2"
        >
          <Briefcase className="size-4 text-blue-600" />
          <span>Explore Matched Jobs (BD & Abroad)</span>
        </Button>
      </div>
    </div>
  );
}
