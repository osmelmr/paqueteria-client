import api from './axios';

export interface Driver {
  id: string;
  name: string;
  isActive: boolean;
  vehicles?: Array<{ id: string; vehicleId: string; vehicle: { id: string; name: string } }>;
}

export const driversApi = {
  findAll: () => api.get<Driver[]>('/drivers').then((r) => r.data),
  findById: (id: string) => api.get<Driver>(`/drivers/${id}`).then((r) => r.data),
  create: (dto: { name: string }) => api.post<Driver>('/drivers', dto).then((r) => r.data),
  update: (id: string, dto: { name?: string }) => api.patch<Driver>(`/drivers/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/drivers/${id}`),
};
