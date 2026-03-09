import { create } from "zustand";

export type Language = "vi" | "en";

interface LanguageState {
  language: Language;
  setLanguage: (lng: Language) => void;
  initializeLanguage: () => void;
}

const STORAGE_KEY = "360-retail-language";

const getInitialLanguage = (): Language => {
  if (typeof window === "undefined") {
    return "vi";
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "vi" || saved === "en") {
    return saved;
  }

  const browserLang =
    window.navigator.language || window.navigator.languages?.[0] || "vi";
  if (browserLang.toLowerCase().startsWith("en")) return "en";
  return "vi";
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (lng) => {
    window.localStorage.setItem(STORAGE_KEY, lng);
    set({ language: lng });
  },
  initializeLanguage: () => {
    const lng = getInitialLanguage();
    window.localStorage.setItem(STORAGE_KEY, lng);
    set({ language: lng });
  },
}));

