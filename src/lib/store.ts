import { create } from "zustand";

interface AppState {
  lang: "vi" | "en";
  leagueFilter: string | null;
  setLang: (lang: "vi" | "en") => void;
  setLeagueFilter: (code: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  lang: "vi",
  leagueFilter: null,
  setLang: (lang) => set({ lang }),
  setLeagueFilter: (code) => set({ leagueFilter: code }),
}));
