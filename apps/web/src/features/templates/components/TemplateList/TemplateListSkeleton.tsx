export function TemplateListSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm"
      aria-label="Loading templates"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-3 border-b border-border p-4 last:border-b-0 md:grid-cols-[1.4fr_0.8fr_0.7fr_0.6fr_0.7fr_1fr]"
        >
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <div key={cellIndex} className="h-4 animate-pulse rounded bg-surface-2" />
          ))}
        </div>
      ))}
    </div>
  );
}
