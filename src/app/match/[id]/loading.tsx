export default function MatchLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-64 bg-bg-card rounded animate-pulse mb-6" />

      {/* Match header skeleton */}
      <div className="bg-bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="h-3 w-48 bg-border/50 rounded animate-pulse mx-auto mb-6" />
        <div className="flex items-center justify-between py-4">
          <div className="flex-1 flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-border/30 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-border/50 rounded animate-pulse" />
            <div className="h-3 w-20 bg-border/30 rounded animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-2 px-6">
            <div className="h-3 w-12 bg-border/30 rounded animate-pulse" />
            <div className="h-8 w-16 bg-border/50 rounded animate-pulse" />
            <div className="h-3 w-28 bg-border/30 rounded animate-pulse" />
          </div>
          <div className="flex-1 flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-border/30 rounded-full animate-pulse" />
            <div className="h-5 w-24 bg-border/50 rounded animate-pulse" />
            <div className="h-3 w-20 bg-border/30 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-bg-card rounded-2xl border border-border p-5 h-48 animate-pulse" />
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-bg-card rounded-2xl border border-border p-5 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
