import { Navbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-3 py-6">
        <div className="h-7 w-64 bg-border/40 rounded animate-pulse mb-1" />
        <div className="h-4 w-80 bg-border/20 rounded animate-pulse mb-6" />

        <div className="space-y-8">
          {[...Array(3)].map((_, leagueIdx) => (
            <div key={leagueIdx}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-border/30 rounded-full animate-pulse" />
                <div className="h-5 w-32 bg-border/30 rounded animate-pulse" />
              </div>
              <div className="bg-bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border/30">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-border/20 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-border/30 rounded animate-pulse" />
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-20 bg-border/20 rounded animate-pulse" />
                        <div className="h-3 w-4 bg-border/10 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-border/20 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-3 w-16 bg-border/20 rounded animate-pulse shrink-0" />
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
