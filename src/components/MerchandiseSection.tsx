"use client";

const TEAM_SEARCH_KEYWORDS: Record<string, string> = {
  "Manchester United": "áo manchester united chính hãng",
  "Manchester City": "áo manchester city chính hãng",
  "Arsenal": "áo arsenal chính hãng",
  "Liverpool": "áo liverpool chính hãng",
  "Chelsea": "áo chelsea chính hãng",
  "Tottenham": "áo tottenham chính hãng",
  "Barcelona": "áo barcelona chính hãng",
  "Real Madrid": "áo real madrid chính hãng",
  "Atletico Madrid": "áo atletico madrid chính hãng",
  "AC Milan": "áo ac milan chính hãng",
  "Inter": "áo inter milan chính hãng",
  "Juventus": "áo juventus chính hãng",
  "Bayern Munich": "áo bayern munich chính hãng",
  "Borussia Dortmund": "áo dortmund chính hãng",
  "PSG": "áo paris saint germain chính hãng",
};

function getShopeeUrl(teamName: string): string {
  const keyword = TEAM_SEARCH_KEYWORDS[teamName] || `áo ${teamName} chính hãng`;
  return `https://shopee.vn/search?keyword=${encodeURIComponent(keyword)}`;
}

export function MerchandiseSection({
  homeTeam,
  awayTeam,
}: {
  homeTeam: { name: string; shortName: string; crest: string };
  awayTeam: { name: string; shortName: string; crest: string };
}) {
  const teams = [homeTeam, awayTeam].filter(
    (t) => TEAM_SEARCH_KEYWORDS[t.name] || TEAM_SEARCH_KEYWORDS[t.shortName]
  );

  if (teams.length === 0) return null;

  return (
    <div className="bg-bg-card rounded-2xl border border-border p-4">
      <p className="text-[9px] text-text-muted uppercase tracking-wide mb-2">Sản phẩm liên quan</p>
      <div className="space-y-2">
        {teams.map((team) => (
          <a
            key={team.name}
            href={getShopeeUrl(team.name) || getShopeeUrl(team.shortName)}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-primary/50 transition-colors group"
          >
            <img src={team.crest} alt="" className="w-8 h-8 object-contain shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium group-hover:text-accent transition-colors">
                Áo đấu {team.shortName}
              </p>
              <p className="text-[10px] text-text-muted">Xem trên Shopee</p>
            </div>
            <svg className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        ))}
      </div>
      <p className="text-[9px] text-text-muted/60 mt-2">* Liên kết đối tác — chúng tôi có thể nhận hoa hồng từ các giao dịch mua hàng</p>
    </div>
  );
}
