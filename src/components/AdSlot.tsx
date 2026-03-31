// Placeholder for Google AdSense — replace with real ad code in production
export function AdSlot({
  size = "banner",
  className = "",
}: {
  size?: "banner" | "rectangle" | "leaderboard";
  className?: string;
}) {
  const dimensions: Record<string, string> = {
    banner: "h-[90px]",
    rectangle: "h-[250px]",
    leaderboard: "h-[90px]",
  };

  return (
    <div
      className={`w-full ${dimensions[size]} rounded-xl border border-dashed border-border/50 bg-bg-secondary/50 flex items-center justify-center ${className}`}
    >
      <span className="text-xs text-text-muted/40">AD SPACE — {size.toUpperCase()}</span>
    </div>
  );
}
