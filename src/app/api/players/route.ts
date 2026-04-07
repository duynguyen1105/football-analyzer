import {
  getTeamInfo,
  getPlayerInfo,
  getPlayerMatches,
} from "@/lib/football-data";
import { playersSchema, parseSearchParams } from "@/lib/api-validation";

const POSITION_PRIORITY = ["Offence", "Midfield", "Defence", "Goalkeeper"];

function computeAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function pickKeyPlayers(
  squad: { id: number; name: string; position: string; nationality: string; dateOfBirth?: string }[]
): { id: number; name: string; position: string; nationality: string; dateOfBirth?: string }[] {
  const picked: typeof squad = [];

  for (const pos of POSITION_PRIORITY) {
    if (picked.length >= 2) break;
    const candidates = squad.filter(
      (p) => p.position === pos && p.id > 0 && !picked.some((x) => x.id === p.id)
    );
    for (const c of candidates) {
      if (picked.length >= 2) break;
      picked.push(c);
    }
  }

  return picked;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = parseSearchParams(playersSchema, searchParams);
  if (result.error) return result.error;
  const { homeTeamId, awayTeamId } = result.data;

  const homeId = parseInt(homeTeamId, 10);
  const awayId = parseInt(awayTeamId, 10);

  try {
    // 1. Fetch team info for both teams
    const [homeTeam, awayTeam] = await Promise.all([
      getTeamInfo(homeId),
      getTeamInfo(awayId),
    ]);

    if (!homeTeam || !awayTeam) {
      return Response.json(
        { error: "Could not fetch team info" },
        { status: 404 }
      );
    }

    // 2. Pick top 3 key players per team
    const homeKeyPlayers = pickKeyPlayers(homeTeam.squad);
    const awayKeyPlayers = pickKeyPlayers(awayTeam.squad);

    // 3. Fetch player info and stats for each key player
    const fetchPlayerData = async (
      player: { id: number; name: string; position: string; nationality: string; dateOfBirth?: string }
    ) => {
      const [info, stats] = await Promise.all([
        getPlayerInfo(player.id),
        getPlayerMatches(player.id, 10),
      ]);

      const dob = info?.dateOfBirth || player.dateOfBirth || "";

      return {
        id: player.id,
        name: info?.name || player.name,
        position: info?.position || player.position,
        nationality: info?.nationality || player.nationality,
        age: computeAge(dob),
        goals: stats?.goals ?? 0,
        assists: stats?.assists ?? 0,
        matchesPlayed: stats?.matchesPlayed ?? 0,
      };
    };

    // Fetch all player data — sequential per team to respect rate limiter,
    // but both teams' first players can start concurrently via the queue
    const [homePlayers, awayPlayers] = await Promise.all([
      Promise.all(homeKeyPlayers.map(fetchPlayerData)),
      Promise.all(awayKeyPlayers.map(fetchPlayerData)),
    ]);

    const resultData = {
      home: {
        teamName: homeTeam.shortName || homeTeam.name,
        players: homePlayers,
      },
      away: {
        teamName: awayTeam.shortName || awayTeam.name,
        players: awayPlayers,
      },
    };

    return Response.json(resultData, {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    console.error("Failed to fetch player analysis:", error);
    return Response.json(
      { error: "Failed to fetch player data" },
      { status: 500 }
    );
  }
}
