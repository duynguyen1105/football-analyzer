import { Navbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-3 py-4">
        <div className="h-6 w-52 bg-border/40 rounded animate-pulse mb-1" />
        <div className="h-3.5 w-72 bg-border/20 rounded animate-pulse mb-4" />
        <div className="flex flex-wrap gap-1.5 mb-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-border/20 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-bg-card rounded-lg border border-border">
              <div className="px-3 py-1.5 border-b border-border/50">
                <div className="h-3 w-24 bg-border/30 rounded animate-pulse" />
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-border/20 rounded-full animate-pulse" />
                  <div className="h-3.5 w-28 bg-border/30 rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-border/20 rounded-full animate-pulse" />
                  <div className="h-3.5 w-28 bg-border/30 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
