import { Navbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-3 py-6 xl:px-6">
        <div className="h-7 w-72 bg-border/40 rounded animate-pulse mb-1" />
        <div className="h-4 w-48 bg-border/20 rounded animate-pulse mb-6" />

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              {/* League header skeleton */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-6 h-6 bg-border/20 rounded-full animate-pulse" />
                <div className="h-5 w-32 bg-border/30 rounded animate-pulse" />
              </div>

              {/* Table skeleton */}
              <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
                {[...Array(4)].map((_, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between px-3 py-3 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
                      <div className="w-5 h-5 bg-border/20 rounded-full animate-pulse" />
                    </div>
                    <div className="h-5 w-12 bg-border/30 rounded animate-pulse mx-3" />
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-5 h-5 bg-border/20 rounded-full animate-pulse" />
                      <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
