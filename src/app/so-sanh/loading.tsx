export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 xl:px-8">
      <div className="h-6 w-40 bg-border/30 rounded animate-pulse mb-2" />
      <div className="h-4 w-56 bg-border/20 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="h-12 bg-bg-card border border-border rounded-lg animate-pulse" />
        <div className="h-12 bg-bg-card border border-border rounded-lg animate-pulse" />
      </div>
      <div className="bg-bg-card rounded-2xl border border-border h-96 animate-pulse" />
    </div>
  );
}
