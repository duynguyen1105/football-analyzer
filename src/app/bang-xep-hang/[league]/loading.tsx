import { Navbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-3 py-6">
        <div className="h-4 w-48 bg-border/20 rounded animate-pulse mb-2" />
        <div className="h-8 w-64 bg-border/40 rounded animate-pulse mb-6" />
        <div className="bg-bg-card rounded-lg border border-border p-4">
          <div className="space-y-3">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3.5 w-5 bg-border/20 rounded animate-pulse" />
                <div className="w-5 h-5 bg-border/20 rounded animate-pulse" />
                <div className="h-3.5 flex-1 bg-border/20 rounded animate-pulse" />
                <div className="h-3.5 w-8 bg-border/20 rounded animate-pulse" />
                <div className="h-3.5 w-8 bg-border/30 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
