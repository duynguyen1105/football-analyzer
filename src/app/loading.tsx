export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="h-8 w-48 bg-bg-card rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-72 bg-bg-card rounded-lg animate-pulse mb-6" />
      <div className="flex gap-2 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-28 bg-bg-card rounded-full animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-bg-card rounded-xl border border-border animate-pulse" />
        ))}
      </div>
    </div>
  );
}
