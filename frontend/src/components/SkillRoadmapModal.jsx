import { useEffect } from 'react';
import { BookOpen, CheckCircle2, ExternalLink, Lightbulb, Sparkles, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const SKILL_DATABASE = {
  docker: {
    category: 'DevOps & Containers',
    overview: 'Containerization standard to package applications with their dependencies for consistent deployments across dev and prod.',
    whyRecruitersCare: 'Modern teams require developers to run containerized microservices and write clean Dockerfiles.',
    docsUrl: 'https://docs.docker.com/get-started/',
    roadmapUrl: 'https://roadmap.sh/devops',
    topInterviewConcepts: [
      'Differences between a Docker Image vs. Container',
      'Multi-stage builds to minimize production image size',
      'Docker Compose for multi-container orchestration'
    ],
    resumeTip: 'Add a project bullet: "Containerized frontend and backend services using multi-stage Dockerfiles and Docker Compose."'
  },
  redis: {
    category: 'Caching & In-Memory Storage',
    overview: 'In-memory key-value data structure store used as a high-performance database, cache, and message broker.',
    whyRecruitersCare: 'Critical for optimizing database read loads, managing active sessions, and rate-limiting high-traffic endpoints.',
    docsUrl: 'https://redis.io/docs/latest/',
    roadmapUrl: 'https://roadmap.sh/backend',
    topInterviewConcepts: [
      'Cache-aside vs. Write-through caching strategies',
      'TTL (Time-to-Live) and cache eviction policies (LRU/LFU)',
      'Redis Pub/Sub vs. Message Queues'
    ],
    resumeTip: 'Add a bullet: "Implemented Redis caching layer for top-query endpoints, reducing PostgreSQL read latency by 45%."'
  },
  kubernetes: {
    category: 'Container Orchestration',
    overview: 'Production-grade container orchestration system for automating application deployment, scaling, and management.',
    whyRecruitersCare: 'Standard cloud infrastructure for enterprise microservices and auto-scaling workloads.',
    docsUrl: 'https://kubernetes.io/docs/home/',
    roadmapUrl: 'https://roadmap.sh/devops',
    topInterviewConcepts: [
      'Pods, Deployments, and ReplicaSets lifecycle',
      'Cluster Services (ClusterIP vs NodePort vs LoadBalancer)',
      'ConfigMaps & Secrets management'
    ],
    resumeTip: 'Mention deployment familiarity: "Configured Kubernetes Deployment manifests and horizontal pod autoscalers (HPA)."'
  },
  typescript: {
    category: 'Language & Type Safety',
    overview: 'Strongly typed programming language that builds on JavaScript, giving you better tooling and error prevention.',
    whyRecruitersCare: 'Drastically reduces runtime production crashes in large, collaborative engineering teams.',
    docsUrl: 'https://www.typescriptlang.org/docs/',
    roadmapUrl: 'https://roadmap.sh/typescript',
    topInterviewConcepts: [
      'Interfaces vs. Type Aliases & Generics',
      'Union types, Type Narrowing, and Discriminated Unions',
      'Strict null checks and utility types (Pick, Omit, Partial)'
    ],
    resumeTip: 'Highlight typing rigor: "Migrated JavaScript codebase to TypeScript with strict type checking, cutting runtime bug reports by 30%."'
  },
  graphql: {
    category: 'API Architecture',
    overview: 'Query language for APIs that lets clients request exactly the data they need, eliminating over-fetching.',
    whyRecruitersCare: 'Enables high-efficiency data fetching for complex frontend and mobile client applications.',
    docsUrl: 'https://graphql.org/learn/',
    roadmapUrl: 'https://roadmap.sh/graphql',
    topInterviewConcepts: [
      'Resolvers and the N+1 database problem (DataLoader)',
      'Queries vs. Mutations vs. Subscriptions',
      'Schema definition language (SDL) and type definitions'
    ],
    resumeTip: 'Add: "Designed GraphQL schemas and optimized Apollo server resolvers using DataLoader caching."'
  },
  postgresql: {
    category: 'Relational Database',
    overview: 'Powerful, open-source object-relational database system with advanced indexing, JSON support, and ACID compliance.',
    whyRecruitersCare: 'Industry standard relational database for reliable, scalable transactional persistence.',
    docsUrl: 'https://www.postgresql.org/docs/',
    roadmapUrl: 'https://roadmap.sh/postgresql-dba',
    topInterviewConcepts: [
      'B-Tree and GIN Indexing optimization (EXPLAIN ANALYZE)',
      'Database normalization and foreign key constraints',
      'Connection pooling (PgBouncer) and transactions (ACID)'
    ],
    resumeTip: 'Demonstrate scale: "Designed PostgreSQL relational schemas with foreign key constraints and B-Tree indexes for fast querying."'
  },
  jest: {
    category: 'Automated Testing',
    overview: 'JavaScript testing framework with a focus on simplicity, support for mocking, code coverage, and snapshot testing.',
    whyRecruitersCare: 'Demonstrates engineering maturity and ensures features do not break on subsequent code commits.',
    docsUrl: 'https://jestjs.io/docs/getting-started',
    roadmapUrl: 'https://roadmap.sh/qa',
    topInterviewConcepts: [
      'Unit testing vs. Integration testing vs. E2E',
      'Mocking APIs, timers, and dependencies (jest.mock)',
      'Coverage thresholds (branch, function, line coverage)'
    ],
    resumeTip: 'Quantify test coverage: "Authored 50+ Jest unit and integration test suites, maintaining >85% code coverage across core APIs."'
  },
  aws: {
    category: 'Cloud & Infrastructure',
    overview: 'Comprehensive, evolving cloud computing platform provided by Amazon offering IaaS and PaaS services.',
    whyRecruitersCare: 'Most deployed cloud infrastructure in modern tech companies for storage (S3), compute (EC2/Lambda), and routing.',
    docsUrl: 'https://docs.aws.amazon.com/',
    roadmapUrl: 'https://roadmap.sh/aws',
    topInterviewConcepts: [
      'S3 bucket policies and pre-signed URLs for secure uploads',
      'Serverless computing with AWS Lambda and API Gateway',
      'IAM roles, policies, and principle of least privilege'
    ],
    resumeTip: 'Highlight cloud experience: "Deployed containerized services onto AWS and configured S3 buckets for secure asset storage."'
  }
};

const getSkillMeta = (skillName = '') => {
  const clean = skillName.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, data] of Object.entries(SKILL_DATABASE)) {
    if (clean.includes(key) || key.includes(clean)) {
      return { name: skillName, ...data };
    }
  }
  return {
    name: skillName,
    category: 'Technical Proficiency',
    overview: `${skillName} is a core requirement listed in the target job description.`,
    whyRecruitersCare: `Recruiters look for ${skillName} experience to ensure immediate productivity on team projects.`,
    docsUrl: `https://www.google.com/search?q=${encodeURIComponent(skillName + ' official documentation')}`,
    roadmapUrl: 'https://roadmap.sh',
    topInterviewConcepts: [
      `Core architecture and fundamental patterns of ${skillName}`,
      `Common performance bottlenecks and best practices in ${skillName}`,
      `Integration with existing frontend and backend workflows`
    ],
    resumeTip: `Build a portfolio project demonstrating hands-on usage of ${skillName} and quantify the results.`
  };
};

export default function SkillRoadmapModal({ skill, open, onOpenChange }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onOpenChange?.(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open || !skill) return null;
  const meta = getSkillMeta(skill);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-scale-in"
        onClick={() => onOpenChange?.(false)}
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0f172a] sm:p-7 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute right-5 top-5 grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer transition"
        >
          <X className="size-4.5" />
        </button>

        <div className="text-left space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 font-semibold text-xs border-0">
              Missing Gap Action Plan
            </Badge>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{meta.category}</span>
          </div>

          <h2 className="text-2xl font-black text-slate-950 dark:text-slate-100 flex items-center gap-2">
            <span>{meta.name}</span>
            <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
          </h2>

          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {meta.overview}
          </p>
        </div>

        <div className="mt-4 space-y-4 text-left">
          {/* Why recruiters care */}
          <div className="rounded-2xl bg-blue-50/80 p-4 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:ring-blue-900/50">
            <strong className="text-xs font-bold text-blue-900 dark:text-blue-300 block mb-1">
              🎯 Why Recruiters Expect This:
            </strong>
            <p className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
              {meta.whyRecruitersCare}
            </p>
          </div>

          {/* Top interview concepts to study */}
          <div className="space-y-2">
            <strong className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <Lightbulb className="size-4 text-amber-500" /> Key Concepts to Study Before Your Interview:
            </strong>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {meta.topInterviewConcepts.map((concept, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <span>{concept}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How to add to resume */}
          <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/70 dark:bg-[#131d35] dark:ring-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              📝 Recommended Resume Bullet Formulation:
            </span>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 italic">
              "{meta.resumeTip}"
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <a
            href={meta.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <BookOpen className="size-3.5" /> Official Docs <ExternalLink className="size-3" />
          </a>

          <a
            href={meta.roadmapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            🗺️ Career Roadmap <ExternalLink className="size-3" />
          </a>

          <Button
            size="sm"
            onClick={() => onOpenChange?.(false)}
            className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Got It
          </Button>
        </div>
      </div>
    </div>
  );
}
