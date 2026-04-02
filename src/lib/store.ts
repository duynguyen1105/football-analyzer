import { create } from "zustand";

interface AppState {
  lang: "vi" | "en";
  leagueFilter: string | null;
  favoriteTeams: number[];
  showFavoritesOnly: boolean;
  setLang: (lang: "vi" | "en") => void;
  setLeagueFilter: (code: string | null) => void;
  toggleFavoriteTeam: (teamId: number) => void;
  setShowFavoritesOnly: (show: boolean) => void;
}

function loadFavorites(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("favorite-teams") || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(ids: number[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("favorite-teams", JSON.stringify(ids));
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  lang: "vi",
  leagueFilter: null,
  favoriteTeams: loadFavorites(),
  showFavoritesOnly: false,
  setLang: (lang) => set({ lang }),
  setLeagueFilter: (code) => set({ leagueFilter: code }),
  toggleFavoriteTeam: (teamId) => {
    const current = get().favoriteTeams;
    const next = current.includes(teamId)
      ? current.filter((id) => id !== teamId)
      : [...current, teamId];
    saveFavorites(next);
    set({ favoriteTeams: next });
  },
  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),
}));
