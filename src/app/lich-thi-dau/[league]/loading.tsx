import { Navbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-3 py-6">
        <div className="h-4 w-48 bg-border/20 rounded animate-pulse mb-2" />
        <div className="h-8 w-64 bg-border/40 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-bg-card rounded-lg border border-border p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 bg-border/20 rounded-full animate-pulse" />
                <div className="h-3.5 w-28 bg-border/30 rounded animate-pulse" />
                <div className="h-3.5 w-10 bg-border/20 rounded animate-pulse ml-auto" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-border/20 rounded-full animate-pulse" />
                <div className="h-3.5 w-28 bg-border/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
