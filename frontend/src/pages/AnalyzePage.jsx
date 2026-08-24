import { AlertCircle, FileCheck2, FileText, Sparkles, UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { analysisApi } from '../services/api';
import { getUserHistory, setLatestResult, setUserHistory } from '../utils/storage';

export default function AnalyzePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    job_title: '',
    company: '',
    jd_text: ''
  });
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const chooseFile = (selected) => {
    if (!selected) return;
    const name = selected.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
      setError('Only PDF and DOCX documents are supported.');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('The resume must be 10 MB or smaller.');
      return;
    }
    setFile(selected);
    setError('');
  };

  const clearFile = () => {
    setFile(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Upload your PDF or DOCX resume first.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const upload = await analysisApi.upload(file, user?.id || 'demo-user');
      const analysis = await analysisApi.analyze({
        user_id: user?.id || 'demo-user',
        resume_id: upload.data?.resume_id,
        ...form
      });
      const analysisData = {
        ...analysis.data,
        user_id: user?.id || 'demo-user'
      };
      setLatestResult(analysisData, user?.id);

      try {
        const existingHistory = getUserHistory(user?.id);
        const updatedHistory = [
          analysisData,
          ...existingHistory.filter((item) => (item.analysis_id || item.id) !== (analysisData.analysis_id || analysisData.id))
        ];
        setUserHistory(updatedHistory, user?.id);
      } catch (err) {
        console.warn('Local history save error:', err);
      }

      navigate('/result', { state: { result: analysisData } });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
        <PageHeader title="Analyzing your resume" description="Upload complete. MatchPoint AI is comparing your experience with the target role." />
        <LoadingState type="analyze" message="Building your ATS and skill-gap report…" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      <PageHeader
        eyebrow="Resume Analysis"
        title="Analyze Resume"
        description="Upload Resume → Paste Job Description → Generate ATS Score & STAR Optimizer"
      />

      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="grid gap-6 xl:grid-cols-[minmax(360px,0.95fr)_minmax(460px,1.05fr)]" onSubmit={handleSubmit}>
        <Card className="border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
          <CardContent className="p-5 sm:p-7">
            <div
              className={cn(
                'grid min-h-[390px] cursor-pointer place-items-center content-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200',
                dragging && 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40 scale-[1.01]',
                file
                  ? 'border-emerald-400 bg-emerald-50/50 dark:border-emerald-700/60 dark:bg-emerald-950/20'
                  : 'border-blue-200 bg-blue-50/60 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/30 dark:hover:border-blue-500 dark:hover:bg-blue-950/40'
              )}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInput.current?.click()}
            >
              <input
                ref={fileInput}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                hidden
                onChange={(event) => chooseFile(event.target.files[0])}
              />
              {file ? (
                <>
                  <div className="relative">
                    <span className="grid size-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-md shadow-emerald-500/20 dark:bg-emerald-950/60 dark:text-emerald-400"><FileCheck2 className="size-8" /></span>
                    <span className="absolute -bottom-1 -right-1 flex size-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex size-4 rounded-full bg-emerald-500"></span>
                    </span>
                  </div>
                  <h3 className="mt-5 max-w-full truncate text-lg font-bold text-slate-950 dark:text-slate-100">{file.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                      {file.name.endsWith('.docx') ? 'DOCX Document' : 'PDF Document'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB · Ready to Analyze
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-5 border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                    onClick={(event) => { event.stopPropagation(); setFile(null); setActivePreset(null); }}
                  >
                    <X className="size-4 mr-1" /> Remove
                  </Button>
                </>
              ) : (
                <>
                  <span className="grid size-16 place-items-center rounded-2xl bg-blue-100 text-blue-600 shadow-md shadow-blue-500/20 dark:bg-blue-900/40 dark:text-blue-400"><UploadCloud className="size-8" /></span>
                  <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-slate-100">Upload PDF or DOCX resume</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Drag your file here or browse from your device</p>
                  <Button type="button" variant="outline" className="mt-5 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700/60 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 cursor-pointer">Browse files</Button>
                </>
              )}
            </div>
            <div className="mt-5 flex gap-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-4 ring-1 ring-blue-200/70 dark:from-blue-950/40 dark:to-indigo-950/40 dark:ring-blue-900/60">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-xs leading-5 text-slate-700 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-slate-100">Versatile AI Calibration:</strong> Your mock interview questions, skill-gap analysis, and live job search engines are dynamically customized based on your target <strong>Job Title</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0f172a]">
          <CardContent className="grid gap-5 p-5 sm:p-7">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="job-title" className="text-slate-800 dark:text-slate-200 font-semibold">Target Job Title</Label>
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Drives Interview & Jobs Hub</span>
              </div>
              <Input
                id="job-title"
                className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                placeholder="e.g. Senior Full-Stack Developer, Growth Marketing Lead, Product Manager..."
                value={form.job_title}
                onChange={(event) => setForm({ ...form, job_title: event.target.value })}
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                💡 <strong>Reminder:</strong> Mock interview questions, target competencies, and live career recommendations will be tailored to this role. Keep it flexible or specific to your target path.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="company" className="text-slate-800 dark:text-slate-200 font-semibold">Company</Label>
                <span className="text-xs text-slate-400">Optional</span>
              </div>
              <Input
                id="company"
                className="h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                placeholder="e.g. CloudGrid Solutions, Google, or leave blank"
                value={form.company}
                onChange={(event) => setForm({ ...form, company: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="job-description" className="text-slate-800 dark:text-slate-200 font-semibold">Job description</Label>
                <span className="text-xs text-slate-400">Optional</span>
              </div>
              <Textarea
                id="job-description"
                className="min-h-48 resize-y bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100"
                placeholder="Paste target job description to match specific keywords, or leave blank for a general ATS & resume quality audit..."
                value={form.jd_text}
                onChange={(event) => setForm({ ...form, jd_text: event.target.value })}
              />
            </div>
            <Button
              type="submit"
              className="h-12 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-lg shadow-blue-600/25 cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all"
            >
              Analyze with AI <Sparkles className="size-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
