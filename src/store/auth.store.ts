import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../api/users.api';
import { authApi, type LoginDto } from '../api/auth.api';
import { setToken, setUser, clearToken, clearUser } from '../api/storage';

const AI_CACHE_KEY = 'paqueteria_ai_extract_cache_v1';

interface AuthState {
  user: User | null;
  token: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionChecked: boolean;
  error: string | null;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
  applyToken: (token: string) => void;
  refreshSession: () => Promise<boolean>;
  restoreSession: () => Promise<boolean>;
  clearSession: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: '',
      isAuthenticated: false,
      isLoading: false,
      sessionChecked: false,
      error: null,

      login: async (dto: LoginDto) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authApi.login(dto);
          setToken(result.accessToken);
          setUser(result.user);
          set({
            user: result.user as User,
            token: result.accessToken,
            isAuthenticated: true,
            isLoading: false,
            sessionChecked: true,
            error: null,
          });
        } catch (err: any) {
          const message = err.response?.data?.message || err.message || 'Error al iniciar sesión';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: () => {
        authApi.logout().catch(() => {});
        useAuthStore.getState().clearSession();
      },

      setAuth: (user: User, token: string) => {
        setToken(token);
        setUser(user);
        set({ user, token, isAuthenticated: true, sessionChecked: true });
      },

      applyToken: (token: string) => {
        setToken(token);
        set({ token, isAuthenticated: true, sessionChecked: true });
      },

      refreshSession: async () => {
        try {
          const result = await authApi.refresh();
          setToken(result.accessToken);
          if (result.user) setUser(result.user);
          set({
            user: (result.user as User | undefined) ?? get().user,
            token: result.accessToken,
            isAuthenticated: true,
            isLoading: false,
            sessionChecked: true,
          });
          return true;
        } catch {
          return false;
        }
      },

      restoreSession: async () => {
        if (get().isAuthenticated) return true;
        set({ isLoading: true });
        const ok = await get().refreshSession();
        set({ sessionChecked: true });
        if (!ok) get().clearSession();
        return ok;
      },

      clearSession: () => {
        clearToken();
        clearUser();
        try {
          window.localStorage.removeItem(AI_CACHE_KEY);
        } catch {
          /* ignore */
        }
        set({
          user: null,
          token: '',
          isAuthenticated: false,
          isLoading: false,
          sessionChecked: true,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'paqueteria-auth',
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<AuthState> | undefined;
        return { user: state?.user ?? null };
      },
      partialize: (state) => ({
        user: state.user,
      }),
    },
  ),
);
