import { Navbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="h-3 w-48 bg-border/30 rounded animate-pulse mb-6" />
        <div className="bg-bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-border/20 rounded-full animate-pulse mx-auto mb-2" />
              <div className="h-5 w-20 bg-border/30 rounded animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-border/40 rounded animate-pulse" />
            <div className="text-center">
              <div className="w-16 h-16 bg-border/20 rounded-full animate-pulse mx-auto mb-2" />
              <div className="h-5 w-20 bg-border/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="h-7 w-64 bg-border/40 rounded animate-pulse mb-6" />
        <div className="bg-bg-card rounded-xl border border-border p-5 mb-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-border/20 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
