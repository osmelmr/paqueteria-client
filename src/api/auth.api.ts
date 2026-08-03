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

export const authApi = {
  login: (dto: LoginDto) =>
    api.post<LoginResult>('/auth/login', dto).then((r) => r.data),

  refresh: () =>
    api.post<{ accessToken: string }>('/auth/refresh').then((r) => r.data),

  logout: () => api.post('/auth/logout'),
};
