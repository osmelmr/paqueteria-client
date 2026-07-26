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
            refreshToken: result.refreshToken,
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
        const state = useAuthStore.getState();
        if (state.refreshToken) {
          authApi.logout(state.refreshToken).catch(() => {});
        }
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

      setAuth: (user: User, token: string, refreshToken: string) => {
        setToken(token);
        setUser(user);
        set({ user, token, refreshToken, isAuthenticated: true });
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
