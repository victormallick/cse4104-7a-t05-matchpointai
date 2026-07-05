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
    job_title: 'Frontend Software Engineer',
    company: 'NovaLabs',
    jd_text: 'We are looking for a Frontend Software Engineer with experience in React, TypeScript, REST APIs, Jest, Docker, CI/CD, Agile delivery, Git, and cloud deployment. The candidate should build accessible responsive interfaces and collaborate with backend engineers.'
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
      localStorage.setItem('matchpoint_latest_result', JSON.stringify(analysis.data));
      navigate('/result', { state: { result: analysis.data } });
    } catch (requestError) {
      setError(requestError.message);
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
        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
          <CardContent className="p-5 sm:p-7">
            <div
              className={cn(
                'grid min-h-[390px] cursor-pointer place-items-center content-center rounded-2xl border-2 border-dashed p-8 text-center transition',
                dragging && 'border-blue-600 bg-blue-50',
                file
                  ? 'border-emerald-300 bg-emerald-50/60'
                  : 'border-blue-200 bg-blue-50/70 hover:-translate-y-0.5 hover:border-blue-500'
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
                  <span className="grid size-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600"><FileCheck2 /></span>
                  <h3 className="mt-5 max-w-full truncate text-lg font-bold text-slate-950">{file.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB · Ready to analyze</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-5"
                    onClick={(event) => { event.stopPropagation(); setFile(null); }}
                  >
                    <X /> Remove
                  </Button>
                </>
              ) : (
                <>
                  <span className="grid size-16 place-items-center rounded-2xl bg-blue-100 text-blue-600"><UploadCloud /></span>
                  <h3 className="mt-5 text-lg font-bold text-slate-950">Upload PDF/DOCX resume</h3>
                  <p className="mt-1 text-sm text-slate-500">Drag your file here or browse from your device</p>
                  <Button type="button" variant="outline" className="mt-5 border-blue-200 text-blue-700">Browse files</Button>
                </>
              )}
            </div>
            <div className="mt-5 flex gap-3 rounded-xl bg-slate-50 p-4">
              <FileText className="mt-0.5 size-4 shrink-0 text-blue-600" />
              <p className="text-xs leading-5 text-slate-500">
                <strong className="text-slate-700">Private by design.</strong> Demo mode parses the document in memory and does not upload it to paid AI services.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
          <CardContent className="grid gap-5 p-5 sm:p-7">
            <div className="grid gap-2">
              <Label htmlFor="job-title">Job title</Label>
              <Input id="job-title" className="h-11 bg-slate-50" value={form.job_title} onChange={(event) => setForm({ ...form, job_title: event.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" className="h-11 bg-slate-50" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="job-description">Job description</Label>
              <Textarea
                id="job-description"
                className="min-h-64 resize-y bg-slate-50"
                value={form.jd_text}
                onChange={(event) => setForm({ ...form, jd_text: event.target.value })}
                minLength="30"
                required
              />
            </div>
            <p className="text-xs leading-5 text-slate-500">
              MatchPoint AI checks responsibilities, skills, keywords, and ATS alignment.
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
