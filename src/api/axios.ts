import axios from 'axios';
import { getToken, setToken, clearToken, clearUser } from './storage';
import { useAuthStore } from '../store/auth.store';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

const BASE_URL = `${import.meta.env.VITE_API_URL || ''}/api/v1`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${BASE_URL}/auth/refresh`, null, { withCredentials: true })
      .then(({ data }) => {
        const token: string | undefined = data?.accessToken;
        if (!token) throw new Error('No accessToken in refresh response');
        setToken(token);
        return token;
      })
      .catch(() => {
        clearToken();
        clearUser();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = (original?.url ?? '').startsWith('/auth/');

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint
    ) {
      original._retry = true;
      const token = await refreshAccessToken();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        useAuthStore.getState().applyToken(token);
        return api(original);
      }
      useAuthStore.getState().clearSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;
