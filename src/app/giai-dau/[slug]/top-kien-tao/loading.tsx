export default function Loading() {
  return (
    <section>
      <div className="h-5 w-48 bg-border/40 rounded animate-pulse mb-2" />
      <div className="h-4 w-64 bg-border/20 rounded animate-pulse mb-6" />
      <div className="bg-bg-card rounded-2xl border border-border p-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-border/30">
            <div className="w-8 h-6 bg-border/30 rounded animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-border/20 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-border/30 rounded animate-pulse" />
              <div className="h-3 w-24 bg-border/20 rounded animate-pulse mt-1.5" />
            </div>
            <div className="flex gap-4">
              <div className="h-6 w-8 bg-border/30 rounded animate-pulse" />
              <div className="h-6 w-8 bg-border/20 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
