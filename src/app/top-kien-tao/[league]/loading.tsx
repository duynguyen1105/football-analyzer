export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="h-4 w-48 bg-border/30 rounded animate-pulse mb-4" />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-border/20 rounded-lg animate-pulse" />
        <div>
          <div className="h-6 w-36 bg-border/40 rounded animate-pulse" />
          <div className="h-4 w-24 bg-border/20 rounded animate-pulse mt-1" />
        </div>
      </div>
      <div className="bg-bg-card rounded-2xl border border-border p-5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-border/30">
            <div className="w-8 h-6 bg-border/30 rounded animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-border/20 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-border/30 rounded animate-pulse" />
              <div className="h-3 w-24 bg-border/20 rounded animate-pulse mt-1.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
