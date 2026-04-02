export default function Loading() {
  return (
    <section>
      <div className="h-5 w-40 bg-border/40 rounded animate-pulse mb-2" />
      <div className="h-4 w-32 bg-border/20 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-3 py-2 border-b border-border">
              <div className="h-4 w-20 bg-border/40 rounded animate-pulse" />
            </div>
            <div className="p-2 space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="h-3 w-4 bg-border/20 rounded animate-pulse" />
                  <div className="w-4 h-4 bg-border/20 rounded animate-pulse" />
                  <div className="h-3 flex-1 bg-border/20 rounded animate-pulse" />
                  <div className="h-3 w-6 bg-border/30 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
