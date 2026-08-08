import axios from 'axios';
import { getToken, setToken, clearToken, clearUser } from './storage';
import { authApi } from './auth.api';
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
  paramsSerializer: {
    serialize: (params) => {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(params ?? {})) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          if (value.length > 0) search.set(key, value.join(','));
        } else {
          search.set(key, String(value));
        }
      }
      return search.toString();
    },
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { accessToken } = await authApi.refresh();
    setToken(accessToken);
    return accessToken;
  } catch {
    clearToken();
    clearUser();
    return null;
  }
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
