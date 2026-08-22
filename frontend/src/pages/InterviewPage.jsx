import {
  AlertTriangle,
  BookOpen,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Code2,
  HelpCircle,
  Lightbulb,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  Trash2,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import SkillRoadmapModal from '../components/SkillRoadmapModal';
import { analysisApi } from '../services/api';

const MAX_QUESTIONS_PER_SECTION = 10;

const readLatestResult = () => {
  try {
    return JSON.parse(localStorage.getItem('matchpoint_latest_result') || 'null');
  } catch {
    return null;
  }
};

const getInterviewStorageKey = (result) => {
  const keyPart = result?.analysis_id || result?.resume_id || (result?.job_title ? `${result.job_title}_${result.created_at || ''}` : 'latest');
  return `matchpoint_interview_questions_${keyPart}`;
};

const readSavedQuestions = () => {
  try {
    return JSON.parse(localStorage.getItem('matchpoint_saved_questions') || '[]');
  } catch {
    return [];
  }
};

const categoryMeta = {
  technical: {
    label: 'Technical',
    icon: Code2,
    style: 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
  },
  behavioral: {
    label: 'Behavioral',
    icon: Users,
    style: 'bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400'
  },
  hr: {
    label: 'HR & Culture',
    icon: Briefcase,
    style: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
  },
  saved: {
    label: 'Saved Questions',
    icon: Bookmark,
    style: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'
  }
};

export default function InterviewPage() {
  const location = useLocation();
  const latestResult = location.state?.result || readLatestResult();
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingMore, setGeneratingMore] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [activeCategory, setActiveCategory] = useState('technical');
  const [savedQuestions, setSavedQuestions] = useState(readSavedQuestions);
  const [limitWarning, setLimitWarning] = useState(null);
  const [selectedRoadmapSkill, setSelectedRoadmapSkill] = useState(null);

  const jobTitle = latestResult?.job_title || 'Target Role';
  const company = latestResult?.company || '';
  const focusSkills = latestResult?.missing_skills || latestResult?.missing_keywords || [];

  const persistQuestionsToStorage = (updatedQuestions) => {
    const result = location.state?.result || readLatestResult();
    const storageKey = getInterviewStorageKey(result);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedQuestions));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  };

  const loadQuestions = async (forceRefresh = false) => {
    const result = location.state?.result || readLatestResult();
    const storageKey = getInterviewStorageKey(result);

    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.technical?.length > 0 || parsed.behavioral?.length > 0 || parsed.hr?.length > 0)) {
            setQuestions(parsed);
            if (parsed.technical?.length > 0) setActiveQuestion(parsed.technical[0]);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to parse cached questions', e);
      }
    }

    setLoading(true);
    try {
      const response = await analysisApi.interview({
        analysis_id: result?.analysis_id,
        resume_id: result?.resume_id,
        resume_text: result?.resume_text || '',
        jd_text: result?.jd_text || '',
        job_title: result?.job_title || 'Target Role',
        company: result?.company || '',
        missing_skills: result?.missing_skills || result?.missing_keywords || []
      });

      if (response?.data?.questions) {
        setQuestions(response.data.questions);
        persistQuestionsToStorage(response.data.questions);
        if (response.data.questions.technical?.length > 0) {
          setActiveQuestion(response.data.questions.technical[0]);
        }
      }
    } catch (error) {
      console.error('Interview load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [location.state?.result?.analysis_id, location.state?.result?.resume_id]);

  const handleGenerateMore = async () => {
    const targetCat = activeCategory === 'saved' ? 'technical' : activeCategory;
    const currentCount = questions?.[targetCat]?.length || 0;

    if (currentCount >= MAX_QUESTIONS_PER_SECTION) {
      setLimitWarning(`You have reached the maximum cap of ${MAX_QUESTIONS_PER_SECTION} questions for the ${categoryMeta[targetCat]?.label} section.`);
      setTimeout(() => setLimitWarning(null), 5000);
      return;
    }

    setGeneratingMore(true);
    const result = location.state?.result || readLatestResult();

    const existingList = [
      ...(questions?.technical || []),
      ...(questions?.behavioral || []),
      ...(questions?.hr || [])
    ].map((q) => (typeof q === 'string' ? q : q.question || ''));

    try {
      const response = await analysisApi.interview({
        analysis_id: result?.analysis_id,
        resume_id: result?.resume_id,
        resume_text: result?.resume_text || '',
        jd_text: result?.jd_text || '',
        job_title: result?.job_title || 'Target Role',
        company: result?.company || '',
        missing_skills: result?.missing_skills || result?.missing_keywords || [],
        existing_questions: existingList,
        category: targetCat,
        count: 1
      });

      if (response?.data?.questions) {
        const incoming = response.data.questions;
        setQuestions((prev) => {
          if (!prev) return incoming;

          const appendOne = (currentList = [], incomingList = []) => {
            if (currentList.length >= MAX_QUESTIONS_PER_SECTION) return currentList;
            const list = [...currentList];
            for (const item of incomingList) {
              if (
                list.length < MAX_QUESTIONS_PER_SECTION &&
                !list.some(
                  (existing) =>
                    existing.id === item.id ||
                    existing.question?.trim().toLowerCase() === item.question?.trim().toLowerCase()
                )
              ) {
                list.push(item);
                setActiveQuestion(item);
                break;
              }
            }
            return list;
          };

          const updated = {
            technical: targetCat === 'technical' ? appendOne(prev.technical, incoming.technical) : prev.technical,
            behavioral: targetCat === 'behavioral' ? appendOne(prev.behavioral, incoming.behavioral) : prev.behavioral,
            hr: targetCat === 'hr' ? appendOne(prev.hr, incoming.hr) : prev.hr
          };
          persistQuestionsToStorage(updated);
          return updated;
        });
      }
    } catch (err) {
      console.error('Generate more question error:', err);
    } finally {
      setGeneratingMore(false);
    }
  };

  const isSaved = (questionId) => savedQuestions.some((item) => item.id === questionId);

  const toggleSave = (question) => {
    let updated;
    if (isSaved(question.id)) {
      updated = savedQuestions.filter((item) => item.id !== question.id);
    } else {
      updated = [{ ...question, category: activeCategory }, ...savedQuestions];
    }
    setSavedQuestions(updated);
    try {
      localStorage.setItem('matchpoint_saved_questions', JSON.stringify(updated));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  };

  const handleDeleteQuestion = (questionId, category) => {
    if (category === 'saved') {
      const updated = savedQuestions.filter((item) => item.id !== questionId);
      setSavedQuestions(updated);
      localStorage.setItem('matchpoint_saved_questions', JSON.stringify(updated));
      return;
    }

    setQuestions((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        [category]: prev[category].filter((item) => item.id !== questionId)
      };
      persistQuestionsToStorage(updated);
      return updated;
    });

    if (activeQuestion?.id === questionId) {
      setActiveQuestion(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
        <PageHeader
          eyebrow="AI Question Bank"
          title="Interview Questions"
          description="Generating custom interview questions tailored to your resume and target role…"
        />
        <LoadingState message="Generating tailored mock interview questions with MatchPoint AI…" />
      </div>
    );
  }

  if (!questions || Object.keys(questions).length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
        <PageHeader title="Interview Questions" description="No active mock interview session found." />
        <Card className="border-0 bg-white dark:bg-[#0f172a] p-12 text-center shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800">
          <CardContent className="flex flex-col items-center justify-center">
            <Sparkles className="size-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-950 dark:text-slate-100">No Interview Questions Generated Yet</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Upload a resume on the Analyze page to automatically generate custom mock interview questions based on your resume and target role.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSavedView = activeCategory === 'saved';
  const categoryQuestions = isSavedView ? savedQuestions : questions[activeCategory] || [];
  const activeMeta = categoryMeta[activeCategory] || {
    label: activeCategory,
    icon: MessageSquareText,
    style: 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
  };
  const ActiveCategoryIcon = activeMeta.icon;
  const isCapReached = !isSavedView && (questions[activeCategory]?.length || 0) >= MAX_QUESTIONS_PER_SECTION;

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      {/* Personalized Role & Gaps Banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50/90 to-violet-50/90 dark:from-blue-950/40 dark:to-violet-950/40 p-5 ring-1 ring-blue-200/70 dark:ring-blue-900/60 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              <Sparkles className="size-3.5" /> AI Personalized Interview Question Bank
            </div>
            <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-slate-100">
              Targeting: <span className="text-blue-700 dark:text-blue-400">{jobTitle}</span>{company ? ` at ${company}` : ''}
            </h3>
          </div>
          {focusSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Focus Gaps:</span>
              {focusSkills.slice(0, 4).map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => setSelectedRoadmapSkill(skill)}
                  className="group inline-flex items-center gap-1 bg-white/80 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-violet-300 text-violet-700 text-xs shadow-xs rounded-xl px-2.5 py-1 font-medium cursor-pointer transition active:scale-95"
                  title="Click to view study roadmap"
                >
                  <span>{skill}</span>
                  <BookOpen className="size-2.5 opacity-60 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <PageHeader
        eyebrow="Targeted preparation"
        title="Interview Questions"
        description="Custom technical, behavioral, and HR questions generated from your resume analysis. Click any question to inspect the recruiter's intent, key talking points, and benchmark answers."
        action={(
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadQuestions(true)}
              className="h-11 border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 gap-1.5 font-medium cursor-pointer"
              title="Regenerate all questions from scratch"
            >
              <RefreshCw className="size-4 text-slate-500" />
              <span className="hidden sm:inline">Regenerate All</span>
            </Button>

            <Button
              onClick={handleGenerateMore}
              disabled={generatingMore}
              className="h-11 gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:opacity-95 hover:shadow-indigo-600/30 disabled:opacity-60 cursor-pointer"
            >
              {generatingMore ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>Generate New Question</span>
                </>
              )}
            </Button>
          </div>
        )}
      />

      {limitWarning && (
        <Alert className="mb-6 border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200">
          <AlertTriangle className="size-4 text-amber-600" />
          <AlertDescription className="text-xs font-semibold">{limitWarning}</AlertDescription>
        </Alert>
      )}

      {/* Category Tabs */}
      <div className="mb-6 flex flex-wrap gap-2.5">
        {['technical', 'behavioral', 'hr', 'saved'].map((cat) => {
          const meta = categoryMeta[cat];
          const Icon = meta.icon;
          const count = cat === 'saved' ? savedQuestions.length : questions[cat]?.length || 0;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                const list = cat === 'saved' ? savedQuestions : questions[cat] || [];
                if (list.length > 0) setActiveQuestion(list[0]);
                else setActiveQuestion(null);
              }}
              className={cn(
                'flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 ring-1 ring-slate-200/80 dark:ring-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              )}
            >
              <Icon className="size-3.5" />
              <span>{meta.label}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-black',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Questions Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-fade-in-up">
        {/* Left Questions List (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ActiveCategoryIcon className="size-4 text-blue-600" />
              <span>{activeMeta.label} Questions ({categoryQuestions.length})</span>
            </h3>
            {isCapReached && (
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Cap reached ({MAX_QUESTIONS_PER_SECTION}/{MAX_QUESTIONS_PER_SECTION})
              </span>
            )}
          </div>

          {categoryQuestions.length === 0 ? (
            <Card className="border-0 bg-white dark:bg-[#0f172a] p-8 text-center shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Bookmark className="size-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs text-slate-500">No saved questions in this category yet.</p>
              </CardContent>
            </Card>
          ) : (
            categoryQuestions.map((q, idx) => {
              const isSelected = activeQuestion?.id === q.id;

              return (
                <Card
                  key={q.id || idx}
                  onClick={() => setActiveQuestion(q)}
                  className={cn(
                    'border-0 bg-white dark:bg-[#0f172a] shadow-sm ring-1 transition-all duration-200 cursor-pointer',
                    isSelected
                      ? 'ring-2 ring-blue-600 shadow-md bg-blue-50/20 dark:bg-blue-950/20'
                      : 'ring-slate-200/80 dark:ring-slate-800 hover:ring-blue-300 dark:hover:ring-blue-700/60'
                  )}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-xl text-xs font-bold transition-all",
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                        )}>
                          #{idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-950 dark:text-slate-100 leading-snug">
                            {q.question}
                          </h4>
                          {q.context && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {q.context}
                            </p>
                          )}
                          {q.expected_keywords?.length > 0 && (
                            <div className="mt-2.5 flex flex-wrap gap-1">
                              {q.expected_keywords.slice(0, 3).map((kw) => (
                                <Badge
                                  key={kw}
                                  variant="outline"
                                  className="text-[10px] py-0 px-2 bg-slate-50 dark:bg-[#070d1a] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                                >
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(q);
                          }}
                          className={cn(
                            'p-1.5 rounded-lg text-slate-400 hover:text-amber-500 cursor-pointer transition',
                            isSaved(q.id) && 'text-amber-500'
                          )}
                          title={isSaved(q.id) ? 'Remove Bookmark' : 'Save Question'}
                        >
                          <Bookmark fill={isSaved(q.id) ? 'currentColor' : 'none'} className="size-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(q.id, activeCategory);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer transition"
                          title="Delete Question"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Detail Panel (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Sparkles className="size-4 text-blue-600" />
            <span>Question Deep Dive & Key Strategy</span>
          </h3>

          {activeQuestion ? (
            <Card className="border-0 bg-white dark:bg-[#0f172a] shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800 sticky top-24">
              <CardContent className="p-6 space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Selected Question</span>
                  <h4 className="mt-1 text-base font-bold text-slate-950 dark:text-slate-100 leading-snug">
                    {activeQuestion.question}
                  </h4>
                </div>

                {activeQuestion.context && (
                  <div className="rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 p-4 ring-1 ring-blue-100 dark:ring-blue-900/50">
                    <strong className="text-xs font-bold text-blue-900 dark:text-blue-300 block mb-1">
                      🎯 Recruiter Intent & Why They Ask This:
                    </strong>
                    <p className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                      {activeQuestion.context}
                    </p>
                  </div>
                )}

                {activeQuestion.expected_keywords?.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-600" /> Target Talking Points & Keywords:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeQuestion.expected_keywords.map((kw) => (
                        <Badge key={kw} variant="outline" className="text-xs border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold py-1 px-2.5">
                          ✓ {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Model Answering Framework Guide */}
                <div className="rounded-2xl bg-slate-50 dark:bg-[#070d1a] p-4 ring-1 ring-slate-200/60 dark:ring-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Lightbulb className="size-3.5 text-amber-500" /> Recommended STAR Structure:
                  </span>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
                    <li><strong className="text-slate-800 dark:text-slate-200">Situation & Task:</strong> Briefly set the project background and objective.</li>
                    <li><strong className="text-slate-800 dark:text-slate-200">Action:</strong> Detail your specific tools, workflow decisions, and ownership.</li>
                    <li><strong className="text-slate-800 dark:text-slate-200">Result:</strong> Conclude with a concrete, quantifiable outcome (e.g. +35% lift).</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 bg-white/60 dark:bg-[#0f172a]/60 p-8 text-center ring-1 ring-slate-200/80 dark:ring-slate-800">
              <CardContent className="flex flex-col items-center justify-center p-4">
                <HelpCircle className="size-8 text-slate-400 mb-2" />
                <p className="text-xs text-slate-500">Select any question on the left to inspect its context, target keywords, and strategy.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <SkillRoadmapModal
        skill={selectedRoadmapSkill}
        open={Boolean(selectedRoadmapSkill)}
        onOpenChange={(open) => !open && setSelectedRoadmapSkill(null)}
      />
    </div>
  );
}
