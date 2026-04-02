export default function Loading() {
  return (
    <section>
      <div className="h-5 w-48 bg-border/40 rounded animate-pulse mb-2" />
      <div className="h-4 w-64 bg-border/20 rounded animate-pulse mb-6" />
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 bg-bg-card rounded-lg border border-border p-3">
            <div className="w-5 h-5 bg-border/20 rounded animate-pulse" />
            <div className="h-4 flex-1 bg-border/20 rounded animate-pulse" />
            <div className="h-4 w-12 bg-border/30 rounded animate-pulse" />
            <div className="h-4 flex-1 bg-border/20 rounded animate-pulse" />
            <div className="w-5 h-5 bg-border/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
