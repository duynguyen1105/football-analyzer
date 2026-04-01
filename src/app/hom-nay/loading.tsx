import { Navbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-3 py-6">
        <div className="h-7 w-64 bg-border/40 rounded animate-pulse mb-1" />
        <div className="h-4 w-40 bg-border/20 rounded animate-pulse mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-border/20 rounded-full animate-pulse" />
                  <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
                </div>
                <div className="h-4 w-10 bg-border/30 rounded animate-pulse" />
                <div className="flex items-center gap-3">
                  <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
                  <div className="w-8 h-8 bg-border/20 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="h-2 bg-border/20 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
