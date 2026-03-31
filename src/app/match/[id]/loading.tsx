import { Navbar } from "@/components/Navbar";

export default function MatchLoading() {
  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3 w-16 bg-border/30 rounded animate-pulse" />
          <div className="h-3 w-2 bg-border/20 rounded animate-pulse" />
          <div className="h-3 w-24 bg-border/30 rounded animate-pulse" />
          <div className="h-3 w-2 bg-border/20 rounded animate-pulse" />
          <div className="h-3 w-32 bg-border/40 rounded animate-pulse" />
        </div>

        {/* Match header skeleton */}
        <div className="bg-bg-card rounded-2xl border border-border p-6 mb-6">
          {/* Competition + venue */}
          <div className="flex justify-center mb-2">
            <div className="h-3 w-48 bg-border/30 rounded animate-pulse" />
          </div>

          <div className="flex items-center justify-between py-4">
            {/* Home team */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="w-20 h-20 bg-border/20 rounded-full animate-pulse" />
              <div className="h-5 w-20 bg-border/40 rounded animate-pulse" />
              <div className="h-3 w-16 bg-border/20 rounded animate-pulse" />
            </div>

            {/* Center: time/score */}
            <div className="px-6 flex flex-col items-center gap-2">
              <div className="h-3 w-10 bg-border/20 rounded animate-pulse" />
              <div className="h-9 w-16 bg-border/40 rounded animate-pulse" />
              <div className="h-3 w-28 bg-border/20 rounded animate-pulse" />
            </div>

            {/* Away team */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="w-20 h-20 bg-border/20 rounded-full animate-pulse" />
              <div className="h-5 w-20 bg-border/40 rounded animate-pulse" />
              <div className="h-3 w-16 bg-border/20 rounded animate-pulse" />
            </div>
          </div>

          {/* Form badges placeholder */}
          <div className="flex gap-6 justify-center mt-3">
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-7 h-7 bg-border/20 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-7 h-7 bg-border/20 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prediction skeleton */}
            <div className="bg-bg-card rounded-2xl border border-border p-5">
              <div className="h-4 w-36 bg-border/40 rounded animate-pulse mb-4" />
              <div className="flex gap-2 mb-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="h-7 w-12 bg-border/40 rounded animate-pulse" />
                    <div className="h-3 w-8 bg-border/20 rounded animate-pulse" />
                    <div className="h-2 w-full bg-border/20 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="flex gap-4 pt-3 border-t border-border/50">
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="h-5 w-10 bg-border/40 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-border/20 rounded animate-pulse" />
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                  <div className="h-5 w-10 bg-border/40 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-border/20 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* H2H skeleton */}
            <div className="bg-bg-card rounded-2xl border border-border p-5">
              <div className="h-4 w-32 bg-border/40 rounded animate-pulse mb-4" />
              <div className="flex gap-2 mb-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex-1 p-3 rounded-xl bg-border/10 flex flex-col items-center gap-1">
                    <div className="h-7 w-6 bg-border/40 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-border/20 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-9 bg-bg-primary/50 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="bg-bg-card rounded-2xl border border-border p-5">
              <div className="h-4 w-32 bg-border/40 rounded animate-pulse mb-4" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <div className="h-3 w-6 bg-border/30 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-border/20 rounded animate-pulse" />
                      <div className="h-3 w-6 bg-border/30 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-1">
                      <div className="flex-1 h-2 bg-border/20 rounded-full animate-pulse" />
                      <div className="flex-1 h-2 bg-border/20 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Standings skeleton */}
            <div className="bg-bg-card rounded-2xl border border-border p-5">
              <div className="h-4 w-24 bg-border/40 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-3 w-4 bg-border/20 rounded animate-pulse" />
                    <div className="w-3.5 h-3.5 bg-border/20 rounded animate-pulse" />
                    <div className="h-3 flex-1 bg-border/20 rounded animate-pulse" />
                    <div className="h-3 w-6 bg-border/20 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Coaches skeleton */}
            <div className="bg-bg-card rounded-2xl border border-border p-5">
              <div className="h-4 w-28 bg-border/40 rounded animate-pulse mb-3" />
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-border/20 rounded animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3.5 w-28 bg-border/30 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-border/20 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scorers skeleton */}
            <div className="bg-bg-card rounded-2xl border border-border p-5">
              <div className="h-4 w-40 bg-border/40 rounded animate-pulse mb-3" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-3.5 w-24 bg-border/30 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-border/20 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-12 bg-border/30 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
