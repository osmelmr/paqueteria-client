import api from './axios';

export interface Recipient {
  id: string;
  fullName: string;
  idCard: string;
  phone?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const recipientsApi = {
  findAll: () =>
    api.get<PaginatedResponse<Recipient>>('/recipients').then((r) => r.data.data),
  findById: (id: string) => api.get<Recipient>(`/recipients/${id}`).then((r) => r.data),
  create: (dto: { fullName: string; idCard: string; phone?: string }) => api.post<Recipient>('/recipients', dto).then((r) => r.data),
  update: (id: string, dto: { fullName?: string; idCard?: string; phone?: string }) => api.patch<Recipient>(`/recipients/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/recipients/${id}`),
};
