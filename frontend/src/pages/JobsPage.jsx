import { Bookmark, BriefcaseBusiness, ExternalLink, MapPin, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import { demoJobs } from '../data/demoData';
import { jobsApi } from '../services/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState(demoJobs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.recommendations()
      .then((response) => setJobs(response.data))
      .finally(() => setLoading(false));
  }, []);

  const toggleSaved = (id) => {
    setJobs((current) => current.map((job) =>
      job.id === id ? { ...job, is_saved: !job.is_saved } : job
    ));
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
        <PageHeader title="Job Recommendations" />
        <LoadingState message="Finding roles that match your profile…" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] p-4 pt-20 sm:p-8 lg:p-10 xl:p-12">
      <PageHeader
        eyebrow="Recommended for your profile"
        title="Job Recommendations"
        description="Match scores combine your latest resume strengths with the role's core requirements."
        action={(
          <Badge variant="secondary" className="gap-2 bg-violet-100 px-3 py-2 text-violet-700">
            <Sparkles className="size-3.5" /> {jobs.length} matched roles
          </Badge>
        )}
      />

      <section className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
            <CardContent className="grid gap-5 p-6 sm:grid-cols-[56px_minmax(0,1fr)_90px] sm:items-center xl:grid-cols-[56px_minmax(0,1fr)_100px_auto]">
              <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <BriefcaseBusiness />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-950">{job.job_title}</h2>
                <p className="mt-1 text-sm text-slate-500">{job.company}</p>
                <span className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="size-3.5" /> {job.location || 'Remote / Hybrid'}
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skills?.map((skill) => (
                    <Badge key={skill} variant="outline" className="border-blue-100 bg-blue-50 text-blue-700">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div className="grid text-center">
                <strong className="text-2xl font-bold text-blue-600">{job.match_score}%</strong>
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">match</span>
              </div>
              <div className="flex gap-2 sm:col-start-2 xl:col-start-auto">
                <Button
                  render={<a href={job.job_url || '#'} target="_blank" rel="noreferrer" />}
                  variant="outline"
                  className="text-blue-700"
                >
                  View details <ExternalLink />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={job.is_saved ? 'border-blue-300 bg-blue-50 text-blue-600' : ''}
                  onClick={() => toggleSaved(job.id)}
                  aria-label="Bookmark job"
                >
                  <Bookmark fill={job.is_saved ? 'currentColor' : 'none'} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
