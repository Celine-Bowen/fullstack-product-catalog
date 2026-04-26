export function SectionHeader({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-normal text-teal-700 dark:text-teal-300">{eyebrow}</p> : null}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <h1 className="max-w-3xl text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl dark:text-slate-50">{title}</h1>
        {children}
      </div>
    </div>
  );
}
