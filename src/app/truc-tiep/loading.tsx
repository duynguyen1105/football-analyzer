export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="h-6 w-32 bg-border/30 rounded animate-pulse mb-6" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-border/20 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-border/30 rounded animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
                <div className="w-10 h-10 bg-border/20 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
