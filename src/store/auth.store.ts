import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../api/users.api';
import { authApi, type LoginDto } from '../api/auth.api';
import { setToken, setUser, clearToken, clearUser } from '../api/storage';

interface AuthState {
  user: User | null;
  token: string;
  refreshToken: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (dto: LoginDto) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  applyToken: (token: string) => void;
  refreshSession: () => Promise<boolean>;
  clearSession: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: '',
      refreshToken: '',
      isAuthenticated: false,
      isLoading: false,
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
            refreshToken: result.refreshToken ?? '',
            isAuthenticated: true,
            isLoading: false,
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

      setAuth: (user: User, token: string, refreshToken: string) => {
        setToken(token);
        setUser(user);
        set({ user, token, refreshToken, isAuthenticated: true });
      },

      applyToken: (token: string) => {
        setToken(token);
        set({ token, isAuthenticated: true });
      },

      refreshSession: async () => {
        try {
          const { accessToken } = await authApi.refresh();
          setToken(accessToken);
          set({ token: accessToken, isAuthenticated: true });
          return true;
        } catch {
          return false;
        }
      },

      clearSession: () => {
        clearToken();
        clearUser();
        set({
          user: null,
          token: '',
          refreshToken: '',
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'paqueteria-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setToken(state.token);
          if (state.user) setUser(state.user);
        }
      },
    },
  ),
);
