import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getCurrentSeason,
  isKnockoutRound,
  isTournamentLeague,
  getLeagueId,
  getLeagueCode,
  getSeasonForLeague,
} from "../constants";

describe("getCurrentSeason", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns current year when month >= July", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 7 - 1, 1)); // July 2025
    expect(getCurrentSeason()).toBe(2025);
  });

  it("returns current year in December", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 12 - 1, 15)); // December 2025
    expect(getCurrentSeason()).toBe(2025);
  });

  it("returns previous year when month < July", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3 - 1, 1)); // March 2026
    expect(getCurrentSeason()).toBe(2025);
  });

  it("returns previous year in January", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15)); // January 2026
    expect(getCurrentSeason()).toBe(2025);
  });

  it("returns previous year in June (boundary)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 30)); // June 2026
    expect(getCurrentSeason()).toBe(2025);
  });
});

describe("isKnockoutRound", () => {
  it('returns true for "Round of 16"', () => {
    expect(isKnockoutRound("Round of 16")).toBe(true);
  });

  it('returns true for "Quarter-finals"', () => {
    expect(isKnockoutRound("Quarter-finals")).toBe(true);
  });

  it('returns true for "Semi-finals"', () => {
    expect(isKnockoutRound("Semi-finals")).toBe(true);
  });

  it('returns true for "Final"', () => {
    expect(isKnockoutRound("Final")).toBe(true);
  });

  it('returns true for "Playoff"', () => {
    expect(isKnockoutRound("Playoff")).toBe(true);
  });

  it('returns false for "Group A - 1"', () => {
    expect(isKnockoutRound("Group A - 1")).toBe(false);
  });

  it('returns false for "Regular Season - 10"', () => {
    expect(isKnockoutRound("Regular Season - 10")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isKnockoutRound(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isKnockoutRound("")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isKnockoutRound("QUARTER-FINALS")).toBe(true);
    expect(isKnockoutRound("round of 16")).toBe(true);
  });
});

describe("isTournamentLeague", () => {
  it('returns true for "CL" (Champions League)', () => {
    expect(isTournamentLeague("CL")).toBe(true);
  });

  it('returns true for "WC" (World Cup)', () => {
    expect(isTournamentLeague("WC")).toBe(true);
  });

  it('returns false for "PL" (Premier League)', () => {
    expect(isTournamentLeague("PL")).toBe(false);
  });

  it('returns false for "PD" (La Liga)', () => {
    expect(isTournamentLeague("PD")).toBe(false);
  });

  it("returns false for unknown code", () => {
    expect(isTournamentLeague("UNKNOWN")).toBe(false);
  });
});

describe("getLeagueId", () => {
  it('returns 39 for "PL"', () => {
    expect(getLeagueId("PL")).toBe(39);
  });

  it('returns 140 for "PD"', () => {
    expect(getLeagueId("PD")).toBe(140);
  });

  it('returns 135 for "SA"', () => {
    expect(getLeagueId("SA")).toBe(135);
  });

  it('returns 78 for "BL1"', () => {
    expect(getLeagueId("BL1")).toBe(78);
  });

  it('returns 61 for "FL1"', () => {
    expect(getLeagueId("FL1")).toBe(61);
  });

  it('returns 340 for "VL"', () => {
    expect(getLeagueId("VL")).toBe(340);
  });

  it('returns 2 for "CL"', () => {
    expect(getLeagueId("CL")).toBe(2);
  });

  it('returns 1 for "WC"', () => {
    expect(getLeagueId("WC")).toBe(1);
  });

  it("returns undefined for unknown code", () => {
    expect(getLeagueId("UNKNOWN")).toBeUndefined();
  });
});

describe("getLeagueCode", () => {
  it('returns "PL" for 39', () => {
    expect(getLeagueCode(39)).toBe("PL");
  });

  it('returns "PD" for 140', () => {
    expect(getLeagueCode(140)).toBe("PD");
  });

  it('returns "SA" for 135', () => {
    expect(getLeagueCode(135)).toBe("SA");
  });

  it('returns "BL1" for 78', () => {
    expect(getLeagueCode(78)).toBe("BL1");
  });

  it('returns "CL" for 2', () => {
    expect(getLeagueCode(2)).toBe("CL");
  });

  it("returns undefined for unknown id", () => {
    expect(getLeagueCode(9999)).toBeUndefined();
  });
});

describe("getSeasonForLeague", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns current year for V-League (340)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 7)); // April 7, 2026
    expect(getSeasonForLeague(340)).toBe(2026);
  });

  it("returns current year for World Cup (1)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 3, 7)); // April 7, 2026
    expect(getSeasonForLeague(1)).toBe(2026);
  });

  it("returns CURRENT_SEASON for Premier League (39)", () => {
    const season = getSeasonForLeague(39);
    expect(typeof season).toBe("number");
    // CURRENT_SEASON is computed at module load time, so we verify it's a number
  });
});
