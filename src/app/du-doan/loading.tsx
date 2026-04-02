export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 xl:px-8">
      <div className="h-6 w-48 bg-border/30 rounded animate-pulse mb-2" />
      <div className="h-4 w-64 bg-border/20 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-bg-card rounded-xl border border-border p-4 h-20 animate-pulse" />
        ))}
      </div>
      <div className="bg-bg-card rounded-xl border border-border h-64 animate-pulse" />
    </div>
  );
}
