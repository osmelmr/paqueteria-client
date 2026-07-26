import api from './axios';

export interface Location {
  id: string;
  name: string;
}

export const locationsApi = {
  findAll: () => api.get<Location[]>('/locations').then((r) => r.data),
  findById: (id: string) => api.get<Location>(`/locations/${id}`).then((r) => r.data),
  create: (dto: { name: string }) => api.post<Location>('/locations', dto).then((r) => r.data),
  update: (id: string, dto: { name: string }) => api.patch<Location>(`/locations/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/locations/${id}`),
};
