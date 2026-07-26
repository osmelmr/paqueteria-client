import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        applyTheme(next);
        set({ theme: next });
      },
      setTheme: (theme: Theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    {
      name: 'paqueteria-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme);
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          applyTheme(prefersDark ? 'dark' : 'light');
        }
      },
    },
  ),
);
