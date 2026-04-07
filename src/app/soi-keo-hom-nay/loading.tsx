import { Navbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-3 py-6 xl:px-6">
        {/* Breadcrumb skeleton */}
        <div className="h-3 w-32 bg-border/20 rounded animate-pulse mb-4" />

        {/* Title skeleton */}
        <div className="h-7 w-80 bg-border/40 rounded animate-pulse mb-1" />
        <div className="h-4 w-48 bg-border/20 rounded animate-pulse mb-6" />

        {/* League groups */}
        {[...Array(3)].map((_, g) => (
          <div key={g} className="mb-8">
            {/* League header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-border/20 rounded-full animate-pulse" />
              <div className="h-5 w-36 bg-border/30 rounded animate-pulse" />
            </div>

            {/* Match cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-bg-card rounded-xl border border-border p-4"
                >
                  {/* Teams row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-border/20 rounded-full animate-pulse" />
                      <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-10 bg-border/20 rounded animate-pulse" />
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-24 bg-border/30 rounded animate-pulse" />
                      <div className="w-10 h-10 bg-border/20 rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* Odds row */}
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1 h-10 bg-border/10 rounded-lg animate-pulse" />
                    <div className="flex-1 h-10 bg-border/10 rounded-lg animate-pulse" />
                    <div className="flex-1 h-10 bg-border/10 rounded-lg animate-pulse" />
                  </div>

                  {/* Prediction bar */}
                  <div className="h-2 bg-border/20 rounded-full animate-pulse mb-2" />
                  <div className="flex gap-3">
                    <div className="h-3 w-12 bg-border/10 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-border/10 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
