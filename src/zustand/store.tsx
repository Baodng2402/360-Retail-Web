import { create } from "zustand";

interface AppState {
  darkMode: boolean;
  toggleDarkMode: () => void;
  initializeTheme: () => void;
}

// Helper to get initial theme from localStorage or system preference
const getInitialTheme = (): boolean => {
  if (typeof window === "undefined") return false;

  // Check localStorage first
  const savedTheme = localStorage.getItem("darkMode");
  if (savedTheme !== null) {
    return savedTheme === "true";
  }

  // Fall back to system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const useAppTheme = create<AppState>((set) => ({
  darkMode: getInitialTheme(),
  toggleDarkMode: () =>
    set((state) => {
      const newDarkMode = !state.darkMode;
      // Save to localStorage
      localStorage.setItem("darkMode", String(newDarkMode));
      return { darkMode: newDarkMode };
    }),
  initializeTheme: () => set({ darkMode: getInitialTheme() }),
}));
