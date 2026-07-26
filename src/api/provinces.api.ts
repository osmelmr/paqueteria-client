import api from './axios';

export interface Province {
  id: string;
  name: string;
}

export const provincesApi = {
  findAll: () => api.get<Province[]>('/provinces').then((r) => r.data),
  findById: (id: string) => api.get<Province>(`/provinces/${id}`).then((r) => r.data),
  create: (dto: { name: string }) => api.post<Province>('/provinces', dto).then((r) => r.data),
  update: (id: string, dto: { name: string }) => api.patch<Province>(`/provinces/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/provinces/${id}`),
};
