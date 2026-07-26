import api from './axios';

export interface Guide {
  id: string;
  externalRef: string;
  agencyId?: string;
  agency?: { id: string; name: string } | null;
  uploadedAt?: string;
}

export const guidesApi = {
  findAll: () => api.get<Guide[]>('/guides').then((r) => r.data),
  findById: (id: string) => api.get<Guide>(`/guides/${id}`).then((r) => r.data),
  create: (dto: { externalRef: string; agencyId: string }) => api.post<Guide>('/guides', dto).then((r) => r.data),
  update: (id: string, dto: { externalRef?: string; agencyId?: string }) => api.patch<Guide>(`/guides/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/guides/${id}`),
};
