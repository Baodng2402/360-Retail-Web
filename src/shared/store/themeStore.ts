import { create } from "zustand";

interface ThemeState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  initializeTheme: () => void;
}

const getInitialTheme = (): boolean => {
  if (typeof window === "undefined") return false;

  const savedTheme = localStorage.getItem("darkMode");
  if (savedTheme !== null) {
    return savedTheme === "true";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const useAppTheme = create<ThemeState>((set) => ({
  darkMode: getInitialTheme(),
  toggleDarkMode: () =>
    set((state) => {
      const newDarkMode = !state.darkMode;
      localStorage.setItem("darkMode", String(newDarkMode));
      return { darkMode: newDarkMode };
    }),
  initializeTheme: () => set({ darkMode: getInitialTheme() }),
}));

