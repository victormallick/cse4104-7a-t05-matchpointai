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
    const extension = selected.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(extension)) {
      setError('Choose a PDF or DOCX resume.');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('The resume must be 10 MB or smaller.');
      return;
    }
    setFile(selected);
    setError('');
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
      const upload = await analysisApi.upload(file, user.id);
      const analysis = await analysisApi.analyze({
        user_id: user.id,
        resume_id: upload.data.resume_id,
        ...form
      });
      const analysisData = analysis.data;
      localStorage.setItem('matchpoint_latest_result', JSON.stringify(analysisData));

      try {
        const existingHistory = JSON.parse(localStorage.getItem('matchpoint_history') || '[]');
        const updatedHistory = [
          analysisData,
          ...existingHistory.filter((item) => item.analysis_id !== analysisData.analysis_id)
        ];
        localStorage.setItem('matchpoint_history', JSON.stringify(updatedHistory));
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
        <LoadingState message="Building your ATS and skill-gap report…" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      <PageHeader
        eyebrow="Resume analysis"
        title="Analyze Resume"
        description="Upload Resume → Paste Job Description → Analyze with AI"
      />
      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="grid gap-6 xl:grid-cols-[minmax(360px,0.95fr)_minmax(460px,1.05fr)]" onSubmit={handleSubmit}>
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80 dark:bg-[#0f172a] dark:ring-slate-800">
          <CardContent className="p-5 sm:p-7">
            <div
              className={cn(
                'grid min-h-[390px] cursor-pointer place-items-center content-center rounded-2xl border-2 border-dashed p-8 text-center transition',
                dragging && 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40',
                file
                  ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-700/60 dark:bg-emerald-950/20'
                  : 'border-blue-200 bg-blue-50/70 hover:-translate-y-0.5 hover:border-blue-500 dark:border-blue-900/60 dark:bg-blue-950/30 dark:hover:border-blue-500 dark:hover:bg-blue-950/40'
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
                  <span className="grid size-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"><FileCheck2 /></span>
                  <h3 className="mt-5 max-w-full truncate text-lg font-bold text-slate-950 dark:text-slate-100">{file.name}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024).toFixed(1)} KB · Ready to analyze</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-5 dark:border-slate-700 dark:hover:bg-slate-800"
                    onClick={(event) => { event.stopPropagation(); setFile(null); }}
                  >
                    <X /> Remove
                  </Button>
                </>
              ) : (
                <>
                  <span className="grid size-16 place-items-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"><UploadCloud /></span>
                  <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-slate-100">Upload PDF/DOCX resume</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Drag your file here or browse from your device</p>
                  <Button type="button" variant="outline" className="mt-5 border-blue-200 text-blue-700 dark:border-blue-700/60 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50">Browse files</Button>
                </>
              )}
            </div>
            <div className="mt-5 flex gap-3 rounded-xl bg-slate-50 dark:bg-[#131d35] p-4 ring-1 ring-slate-100 dark:ring-slate-800">
              <FileText className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                <strong className="text-slate-700 dark:text-slate-200">AI ATS Evaluation.</strong> Your resume is processed securely to score keyword alignment, detect skill gaps, and generate customized interview questions.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
          <CardContent className="grid gap-5 p-5 sm:p-7">
            <div className="grid gap-2">
              <Label htmlFor="job-title">Job title</Label>
              <Input
                id="job-title"
                className="h-11 bg-slate-50"
                placeholder="e.g. Full-Stack Software Engineer (or your target role)"
                value={form.job_title}
                onChange={(event) => setForm({ ...form, job_title: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="company">Company</Label>
                <span className="text-xs text-slate-400">Optional</span>
              </div>
              <Input
                id="company"
                className="h-11 bg-slate-50"
                placeholder="e.g. NovaLabs, Google, or leave blank"
                value={form.company}
                onChange={(event) => setForm({ ...form, company: event.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="job-description">Job description</Label>
                <span className="text-xs text-slate-400">Optional</span>
              </div>
              <Textarea
                id="job-description"
                className="min-h-56 resize-y bg-slate-50 text-sm"
                placeholder="Paste target job description to match specific keywords, or leave blank for a general ATS & resume quality audit..."
                value={form.jd_text}
                onChange={(event) => setForm({ ...form, jd_text: event.target.value })}
              />
            </div>
            <p className="text-xs leading-5 text-slate-500">
              MatchPoint AI checks formatting, impact metrics, missing skills, and ATS alignment.
            </p>
            <Button type="submit" className="h-11 w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/20">
              Analyze with AI <Sparkles />
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
