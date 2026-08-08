import api from './axios';

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResult {
  user: {
    id: string;
    email?: string;
    username: string;
    fullName?: string;
    role: string;
  };
  accessToken: string;
  refreshToken?: string;
}

interface RefreshResult {
  accessToken: string;
  user?: LoginResult['user'];
}

let refreshPromise: Promise<RefreshResult> | null = null;

export const authApi = {
  login: (dto: LoginDto) =>
    api.post<LoginResult>('/auth/login', dto).then((r) => r.data),

  refresh: () => {
    if (!refreshPromise) {
      refreshPromise = api
        .post<RefreshResult>('/auth/refresh')
        .then((r) => r.data)
        .finally(() => {
          refreshPromise = null;
        });
    }
    return refreshPromise;
  },

  logout: () => api.post('/auth/logout'),
};
