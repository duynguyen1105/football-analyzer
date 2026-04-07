import { Navbar } from "@/components/Navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-3 py-6 xl:px-6">
        <div className="h-3 w-40 bg-border/20 rounded animate-pulse mb-4" />
        <div className="h-7 w-full bg-border/40 rounded animate-pulse mb-2" />
        <div className="h-7 w-3/4 bg-border/40 rounded animate-pulse mb-3" />
        <div className="flex gap-3 mb-6">
          <div className="h-3 w-24 bg-border/20 rounded animate-pulse" />
          <div className="h-3 w-24 bg-border/20 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-border/20 rounded animate-pulse"
              style={{ width: `${85 + Math.random() * 15}%` }}
            />
          ))}
        </div>
      </main>
    </>
  );
}
