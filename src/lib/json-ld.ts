import type { Match } from "./types";

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nhận Định Bóng Đá VN",
    url: "https://nhandinhbongdavn.com",
    description: "Nhận định bóng đá trước trận với AI.",
    inLanguage: "vi",
    publisher: {
      "@type": "Organization",
      name: "MatchDay Analyst",
      url: "https://nhandinhbongdavn.com",
    },
  };
}

export function buildSportsEventSchema(match: Match) {
  const statusMap: Record<string, string> = {
    SCHEDULED: "https://schema.org/EventScheduled",
    TIMED: "https://schema.org/EventScheduled",
    LIVE: "https://schema.org/EventScheduled",
    IN_PLAY: "https://schema.org/EventScheduled",
    FINISHED: "https://schema.org/EventScheduled",
    POSTPONED: "https://schema.org/EventPostponed",
    CANCELLED: "https://schema.org/EventCancelled",
    SUSPENDED: "https://schema.org/EventPostponed",
  };

  const startDate = `${match.date}T${match.time}:00+07:00`;

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
    startDate,
    eventStatus: statusMap[match.status] || "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: match.venue || "TBD",
    },
    homeTeam: {
      "@type": "SportsTeam",
      name: match.homeTeam.name,
      logo: match.homeTeam.crest,
    },
    awayTeam: {
      "@type": "SportsTeam",
      name: match.awayTeam.name,
      logo: match.awayTeam.crest,
    },
    organizer: {
      "@type": "SportsOrganization",
      name: match.competition.name,
    },
    url: `https://nhandinhbongdavn.com/match/${match.id}`,
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
