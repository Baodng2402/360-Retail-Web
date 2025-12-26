import {create} from 'zustand';

interface AppState {
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const useAppTheme = create<AppState>((set)=> ({
    darkMode: false,
    toggleDarkMode: () => set((state) => ({darkMode: !state.darkMode}))
}));