/**
 * API-Football does not provide shortName or tla (3-letter abbreviation).
 * This module maps API-Football team IDs to short names and TLAs
 * for the 5 tracked European leagues.
 */

const TEAM_MAP: Record<number, { shortName: string; tla: string }> = {
  // ── Premier League (id: 39) ──
  33: { shortName: "Man United", tla: "MUN" },
  34: { shortName: "Newcastle", tla: "NEW" },
  35: { shortName: "Bournemouth", tla: "BOU" },
  36: { shortName: "Fulham", tla: "FUL" },
  38: { shortName: "Watford", tla: "WAT" },
  39: { shortName: "Wolves", tla: "WOL" },
  40: { shortName: "Liverpool", tla: "LIV" },
  41: { shortName: "Southampton", tla: "SOU" },
  42: { shortName: "Arsenal", tla: "ARS" },
  45: { shortName: "Everton", tla: "EVE" },
  46: { shortName: "Leicester", tla: "LEI" },
  47: { shortName: "Tottenham", tla: "TOT" },
  48: { shortName: "West Ham", tla: "WHU" },
  49: { shortName: "Chelsea", tla: "CHE" },
  50: { shortName: "Man City", tla: "MCI" },
  51: { shortName: "Brighton", tla: "BHA" },
  52: { shortName: "Crystal Palace", tla: "CRY" },
  55: { shortName: "Brentford", tla: "BRE" },
  57: { shortName: "Ipswich", tla: "IPS" },
  62: { shortName: "Sheffield Utd", tla: "SHU" },
  63: { shortName: "Leeds", tla: "LEE" },
  65: { shortName: "Nottm Forest", tla: "NFO" },
  66: { shortName: "Aston Villa", tla: "AVL" },
  71: { shortName: "Norwich", tla: "NOR" },
  1359: { shortName: "Luton", tla: "LUT" },

  // ── La Liga (id: 140) ──
  529: { shortName: "Barcelona", tla: "BAR" },
  530: { shortName: "Atlético", tla: "ATM" },
  531: { shortName: "Athletic", tla: "ATH" },
  532: { shortName: "Valencia", tla: "VAL" },
  533: { shortName: "Villarreal", tla: "VIL" },
  536: { shortName: "Sevilla", tla: "SEV" },
  537: { shortName: "Mallorca", tla: "MLL" },
  538: { shortName: "Celta Vigo", tla: "CEL" },
  540: { shortName: "Espanyol", tla: "ESP" },
  541: { shortName: "Real Madrid", tla: "RMA" },
  542: { shortName: "Real Sociedad", tla: "RSO" },
  543: { shortName: "Real Betis", tla: "BET" },
  546: { shortName: "Getafe", tla: "GET" },
  547: { shortName: "Girona", tla: "GIR" },
  548: { shortName: "Real Valladolid", tla: "VLL" },
  715: { shortName: "Granada", tla: "GRA" },
  720: { shortName: "Las Palmas", tla: "LPA" },
  723: { shortName: "Almería", tla: "ALM" },
  727: { shortName: "Osasuna", tla: "OSA" },
  728: { shortName: "Rayo Vallecano", tla: "RAY" },
  798: { shortName: "Mallorca", tla: "MLL" },
  724: { shortName: "Cádiz", tla: "CAD" },
  797: { shortName: "Alavés", tla: "ALA" },
  545: { shortName: "Leganés", tla: "LEG" },

  // ── Serie A (id: 135) ──
  487: { shortName: "Lazio", tla: "LAZ" },
  488: { shortName: "Sassuolo", tla: "SAS" },
  489: { shortName: "AC Milan", tla: "MIL" },
  490: { shortName: "Cagliari", tla: "CAG" },
  491: { shortName: "Napoli", tla: "NAP" },
  492: { shortName: "Torino", tla: "TOR" },
  494: { shortName: "Udinese", tla: "UDI" },
  495: { shortName: "Genoa", tla: "GEN" },
  496: { shortName: "Juventus", tla: "JUV" },
  497: { shortName: "AS Roma", tla: "ROM" },
  498: { shortName: "Sampdoria", tla: "SAM" },
  499: { shortName: "Atalanta", tla: "ATA" },
  500: { shortName: "Bologna", tla: "BOL" },
  502: { shortName: "Fiorentina", tla: "FIO" },
  503: { shortName: "Inter", tla: "INT" },
  504: { shortName: "Verona", tla: "VER" },
  505: { shortName: "Empoli", tla: "EMP" },
  511: { shortName: "Lecce", tla: "LEC" },
  514: { shortName: "Frosinone", tla: "FRO" },
  515: { shortName: "Como", tla: "COM" },
  517: { shortName: "Venezia", tla: "VEN" },
  1579: { shortName: "Monza", tla: "MON" },
  867: { shortName: "Parma", tla: "PAR" },

  // ── Bundesliga (id: 78) ──
  157: { shortName: "Bayern", tla: "FCB" },
  159: { shortName: "Hertha BSC", tla: "BSC" },
  160: { shortName: "Freiburg", tla: "SCF" },
  161: { shortName: "Wolfsburg", tla: "WOB" },
  162: { shortName: "Werder Bremen", tla: "SVW" },
  163: { shortName: "Gladbach", tla: "BMG" },
  164: { shortName: "Augsburg", tla: "FCA" },
  165: { shortName: "Dortmund", tla: "BVB" },
  167: { shortName: "Hoffenheim", tla: "TSG" },
  168: { shortName: "Bayer 04", tla: "B04" },
  169: { shortName: "Eintracht", tla: "SGE" },
  170: { shortName: "Stuttgart", tla: "VFB" },
  171: { shortName: "Mainz 05", tla: "M05" },
  172: { shortName: "Union Berlin", tla: "FCU" },
  173: { shortName: "RB Leipzig", tla: "RBL" },
  174: { shortName: "Köln", tla: "KOE" },
  176: { shortName: "Bochum", tla: "BOC" },
  178: { shortName: "Heidenheim", tla: "HDH" },
  182: { shortName: "St. Pauli", tla: "STP" },
  192: { shortName: "Holstein Kiel", tla: "KIE" },
  181: { shortName: "Darmstadt", tla: "D98" },

  // ── Ligue 1 (id: 61) ──
  77: { shortName: "Angers", tla: "SCO" },
  78: { shortName: "Bordeaux", tla: "BOR" },
  79: { shortName: "Lille", tla: "LIL" },
  80: { shortName: "Lyon", tla: "OL" },
  81: { shortName: "Marseille", tla: "OM" },
  82: { shortName: "Montpellier", tla: "MHP" },
  83: { shortName: "Nantes", tla: "NAN" },
  84: { shortName: "Nice", tla: "NIC" },
  85: { shortName: "PSG", tla: "PSG" },
  91: { shortName: "Monaco", tla: "MON" },
  93: { shortName: "Reims", tla: "REI" },
  94: { shortName: "Rennes", tla: "REN" },
  95: { shortName: "Strasbourg", tla: "RCS" },
  96: { shortName: "Toulouse", tla: "TFC" },
  97: { shortName: "Lorient", tla: "LOR" },
  98: { shortName: "Saint-Étienne", tla: "STE" },
  99: { shortName: "Auxerre", tla: "AUX" },
  106: { shortName: "Stade Brest", tla: "SB29" },
  108: { shortName: "Le Havre", tla: "HAC" },
  116: { shortName: "Lens", tla: "RCL" },
  1063: { shortName: "Clermont", tla: "CF63" },
};

/** Strip common club suffixes for fallback shortName */
function deriveName(name: string): string {
  return name
    .replace(/\s*(FC|CF|SC|AC|AS|SS|SSC|US|SV|TSG|VfB|VfL|1\.\s*FC|1\.\s*FSV)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim() || name;
}

export function getShortName(teamId: number, fullName: string): string {
  return TEAM_MAP[teamId]?.shortName ?? deriveName(fullName);
}

export function getTla(teamId: number, fullName: string): string {
  return TEAM_MAP[teamId]?.tla ?? (fullName.replace(/[^A-Z]/g, "").slice(0, 3) || fullName.slice(0, 3).toUpperCase());
}
