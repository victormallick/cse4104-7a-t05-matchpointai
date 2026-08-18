export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="mb-8 flex flex-col items-start justify-between gap-5 sm:mb-10 lg:flex-row lg:items-end">
      <div className="max-w-3xl">
        {eyebrow && (
          <span className="mb-3 inline-flex text-xs font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
