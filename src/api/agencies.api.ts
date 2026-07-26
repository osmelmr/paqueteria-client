import api from './axios';

export interface Agency {
  id: string;
  name: string;
}

export const agenciesApi = {
  findAll: () => api.get<Agency[]>('/agencies').then((r) => r.data),
  findById: (id: string) => api.get<Agency>(`/agencies/${id}`).then((r) => r.data),
  create: (dto: { name: string }) => api.post<Agency>('/agencies', dto).then((r) => r.data),
  update: (id: string, dto: { name: string }) => api.patch<Agency>(`/agencies/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/agencies/${id}`),
};
