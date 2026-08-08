import api from './axios';

export interface Municipe {
  id: string;
  name: string;
  header?: boolean;
}

export const municipesApi = {
  findAll: () => api.get<Municipe[]>('/municipes').then((r) => r.data),
  findById: (id: string) => api.get<Municipe>(`/municipes/${id}`).then((r) => r.data),
  create: (dto: { name: string; header?: boolean }) => api.post<Municipe>('/municipes', dto).then((r) => r.data),
  update: (id: string, dto: { name: string; header?: boolean }) => api.patch<Municipe>(`/municipes/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/municipes/${id}`),
};
