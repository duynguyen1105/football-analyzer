export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 xl:px-8">
      <div className="h-4 w-48 bg-border/30 rounded animate-pulse mb-6" />
      <div className="bg-bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 bg-border/20 animate-pulse mx-auto md:mx-0" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 bg-border/30 rounded animate-pulse mx-auto md:mx-0" />
            <div className="h-4 w-32 bg-border/20 rounded animate-pulse mx-auto md:mx-0" />
            <div className="h-20 bg-border/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-card rounded-2xl border border-border p-5">
            <div className="h-4 w-32 bg-border/30 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-border/20 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
          <div className="bg-bg-card rounded-2xl border border-border p-5">
            <div className="h-4 w-24 bg-border/30 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-16 bg-border/20 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-bg-card rounded-2xl border border-border p-5">
            <div className="h-4 w-32 bg-border/30 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-border/20 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
