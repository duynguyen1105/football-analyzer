export default function Loading() {
  return (
    <section>
      <div className="h-5 w-40 bg-border/40 rounded animate-pulse mb-2" />
      <div className="h-4 w-56 bg-border/20 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-border/20 rounded animate-pulse" />
                <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
              </div>
              <div className="text-center px-4">
                <div className="h-3 w-16 bg-border/20 rounded animate-pulse mb-1" />
                <div className="h-4 w-12 bg-border/30 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
                <div className="w-10 h-10 bg-border/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-border/20 rounded-lg animate-pulse" />
              <div className="flex-1 h-10 bg-border/20 rounded-lg animate-pulse" />
              <div className="flex-1 h-10 bg-border/20 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
