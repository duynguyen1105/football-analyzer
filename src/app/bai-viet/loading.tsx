import { Navbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-3 py-6 xl:px-6">
        <div className="h-3 w-32 bg-border/20 rounded animate-pulse mb-4" />
        <div className="h-7 w-56 bg-border/40 rounded animate-pulse mb-1" />
        <div className="h-4 w-72 bg-border/20 rounded animate-pulse mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-bg-card rounded-xl border border-border p-4"
            >
              <div className="h-3 w-20 bg-border/20 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-border/30 rounded animate-pulse mb-1.5" />
              <div className="h-4 w-3/4 bg-border/30 rounded animate-pulse mb-3" />
              <div className="h-3 w-full bg-border/20 rounded animate-pulse mb-1" />
              <div className="h-3 w-5/6 bg-border/20 rounded animate-pulse mb-3" />
              <div className="flex gap-1.5">
                <div className="h-4 w-16 bg-border/20 rounded-full animate-pulse" />
                <div className="h-4 w-16 bg-border/20 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
