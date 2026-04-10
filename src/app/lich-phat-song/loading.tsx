import { Navbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-3 py-6">
        <div className="h-7 w-72 bg-border/40 rounded animate-pulse mb-1" />
        <div className="h-4 w-40 bg-border/20 rounded animate-pulse mb-6" />

        <div className="space-y-6">
          {[...Array(3)].map((_, slotIdx) => (
            <div key={slotIdx}>
              <div className="h-4 w-24 bg-border/30 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-3 w-24 bg-border/20 rounded animate-pulse" />
                      <div className="h-4 w-12 bg-border/30 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-border/20 rounded-full animate-pulse" />
                        <div className="h-4 w-20 bg-border/30 rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-4 bg-border/10 rounded animate-pulse" />
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-20 bg-border/30 rounded animate-pulse" />
                        <div className="w-6 h-6 bg-border/20 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-5 w-12 bg-border/20 rounded-full animate-pulse" />
                      <div className="h-5 w-16 bg-border/20 rounded-full animate-pulse" />
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
