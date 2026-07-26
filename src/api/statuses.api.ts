import api from './axios';

export interface Status {
  id: string;
  name: string;
}

export const statusesApi = {
  findAll: () => api.get<Status[]>('/statuses').then((r) => r.data),
  findById: (id: string) => api.get<Status>(`/statuses/${id}`).then((r) => r.data),
  create: (dto: { name: string }) => api.post<Status>('/statuses', dto).then((r) => r.data),
  update: (id: string, dto: { name: string }) => api.patch<Status>(`/statuses/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/statuses/${id}`),
};
