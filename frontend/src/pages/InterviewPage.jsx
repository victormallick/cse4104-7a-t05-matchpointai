import { Bookmark, Check, MessageSquareText, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { demoQuestions } from '../data/demoData';
import { analysisApi } from '../services/api';

const readLatestResult = () => {
  try {
    return JSON.parse(localStorage.getItem('matchpoint_latest_result') || 'null');
  } catch {
    return null;
  }
};

const categoryStyles = {
  technical: 'bg-blue-100 text-blue-600',
  behavioral: 'bg-violet-100 text-violet-600',
  hr: 'bg-emerald-100 text-emerald-600'
};

export default function InterviewPage() {
  const [questions, setQuestions] = useState(demoQuestions);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [saved, setSaved] = useState([]);

  const loadQuestions = async () => {
    setLoading(true);
    const result = readLatestResult();
    try {
      const response = await analysisApi.interview({
        analysis_id: result?.analysis_id,
        missing_skills: result?.missing_skills
      });
      setQuestions(response.data.questions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const toggleSaved = (id) => {
    setSaved((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
        <PageHeader title="Interview Questions" description="Preparing focused questions from your latest skill gaps." />
        <LoadingState message="Generating your mock interview set…" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      <PageHeader
        eyebrow="Practice with purpose"
        title="Interview Questions"
        description="Technical, behavioral, and HR questions based on your latest analysis."
        action={(
          <Button variant="outline" className="h-11" onClick={loadQuestions}>
            <RotateCcw /> Regenerate
          </Button>
        )}
      />

      <Tabs defaultValue="technical" className="gap-6">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 sm:w-fit">
          {Object.entries(questions).map(([category, categoryQuestions]) => (
            <TabsTrigger
              key={category}
              value={category}
              className="h-10 min-w-32 gap-2 px-4 capitalize data-active:bg-blue-600 data-active:text-white"
            >
              <MessageSquareText className="size-4" />
              {category}
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">{categoryQuestions.length}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(questions).map(([category, categoryQuestions]) => (
          <TabsContent value={category} key={category}>
            <div className="mb-5 flex items-center gap-3">
              <span className={`grid size-11 place-items-center rounded-xl ${categoryStyles[category]}`}>
                <MessageSquareText className="size-5" />
              </span>
              <div>
                <h2 className="text-2xl font-bold capitalize text-slate-950">{category} questions</h2>
                <p className="text-sm text-slate-500">{categoryQuestions.length} targeted prompts</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {categoryQuestions.map((question, index) => {
                const practicing = activeQuestion === question.id;
                const isSaved = saved.includes(question.id);
                return (
                  <Card
                    className={`border-0 shadow-sm ring-1 transition ${
                      practicing ? 'bg-blue-50 ring-blue-300' : 'bg-white ring-slate-200/80'
                    }`}
                    key={question.id}
                  >
                    <CardContent className="flex min-h-72 flex-col p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Question {index + 1}</span>
                        <Badge variant="secondary">{question.difficulty}</Badge>
                      </div>
                      <p className="mt-5 text-base font-medium leading-7 text-slate-900">{question.question}</p>
                      {practicing && (
                        <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-blue-100">
                          <strong className="text-xs uppercase tracking-wide text-blue-700">Answer guide</strong>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Use a clear situation, your specific action, and a measurable result. Connect the answer to {question.focus_skill || question.topic}.
                          </p>
                        </div>
                      )}
                      <div className="mt-auto flex gap-2 pt-6">
                        <Button
                          className={practicing ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-blue-600 text-white hover:bg-blue-700'}
                          onClick={() => setActiveQuestion(practicing ? null : question.id)}
                        >
                          {practicing ? <><Check /> Practicing</> : <><Play /> Practice</>}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className={isSaved ? 'border-blue-300 bg-blue-50 text-blue-600' : ''}
                          onClick={() => toggleSaved(question.id)}
                          aria-label="Save question"
                        >
                          <Bookmark fill={isSaved ? 'currentColor' : 'none'} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
