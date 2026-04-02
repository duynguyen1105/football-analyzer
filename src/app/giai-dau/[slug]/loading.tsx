export default function Loading() {
  return (
    <div>
      {/* Standings skeleton */}
      <section className="mb-8">
        <div className="h-5 w-32 bg-border/40 rounded animate-pulse mb-3" />
        <div className="bg-bg-card rounded-xl border border-border p-4">
          <div className="space-y-2.5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3.5 w-5 bg-border/20 rounded animate-pulse" />
                <div className="w-4 h-4 bg-border/20 rounded animate-pulse" />
                <div className="h-3.5 flex-1 bg-border/20 rounded animate-pulse" />
                <div className="h-3.5 w-6 bg-border/20 rounded animate-pulse" />
                <div className="h-3.5 w-6 bg-border/30 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Matches skeleton */}
      <section>
        <div className="h-5 w-48 bg-border/40 rounded animate-pulse mb-3" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
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
    </div>
  );
}
