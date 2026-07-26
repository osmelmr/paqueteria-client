import api from './axios';

export interface User {
  id: string;
  username: string;
  fullName?: string;
  email?: string;
  role: string;
  isActive: boolean;
}

export const usersApi = {
  findAll: () => api.get<User[]>('/users').then((r) => r.data),
  findById: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),
  create: (dto: { username: string; password: string; fullName?: string; email?: string; role: string }) =>
    api.post<User>('/users', dto).then((r) => r.data),
  update: (id: string, dto: { fullName?: string; email?: string; role?: string; isActive?: boolean }) =>
    api.patch<User>(`/users/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/users/${id}`),
};
