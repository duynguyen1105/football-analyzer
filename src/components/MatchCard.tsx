import Link from "next/link";
import { Match } from "@/lib/mock-data";

function FormBadge({ result }: { result: string }) {
  const cls =
    result === "W"
      ? "badge-w"
      : result === "D"
        ? "badge-d"
        : "badge-l";
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${cls}`}>
      {result}
    </span>
  );
}

export function MatchCard({ match }: { match: Match }) {
  return (
    <Link
      href={`/match/${match.id}`}
      className="block bg-bg-card rounded-xl border border-border hover:border-accent/30 hover:bg-bg-card-hover transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <span className="text-xs text-text-muted">
          {match.leagueFlag} {match.league}
        </span>
        <span className="text-xs text-text-muted">{match.venue}</span>
      </div>

      {/* Main */}
      <div className="px-4 py-5">
        <div className="flex items-center justify-between">
          {/* Home */}
          <div className="flex-1 text-center">
            <div className="flex justify-center mb-2">
              <img src={match.homeLogo} alt={match.homeTeam} className="w-12 h-12 object-contain" loading="lazy" />
            </div>
            <p className="font-semibold text-sm">{match.homeTeam}</p>
            <div className="flex gap-1 justify-center mt-2">
              {match.homeForm.map((r, i) => (
                <FormBadge key={i} result={r} />
              ))}
            </div>
          </div>

          {/* Center */}
          <div className="px-4 text-center">
            <p className="text-2xl font-bold text-text-primary">{match.time}</p>
            <p className="text-xs text-text-muted mt-1">{formatDate(match.date)}</p>
            <div className="mt-3 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium group-hover:bg-accent/20 transition-colors">
              Analyze
            </div>
          </div>

          {/* Away */}
          <div className="flex-1 text-center">
            <div className="flex justify-center mb-2">
              <img src={match.awayLogo} alt={match.awayTeam} className="w-12 h-12 object-contain" loading="lazy" />
            </div>
            <p className="font-semibold text-sm">{match.awayTeam}</p>
            <div className="flex gap-1 justify-center mt-2">
              {match.awayForm.map((r, i) => (
                <FormBadge key={i} result={r} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
