import api from './axios';

export interface Vehicle {
  id: string;
  name: string;
  isActive: boolean;
  drivers?: Array<{ id: string; driverId: string; driver: { id: string; name: string } }>;
  _count?: { routes: number };
}

export const vehiclesApi = {
  findAll: () => api.get<Vehicle[]>('/vehicles').then((r) => r.data),
  findById: (id: string) => api.get<Vehicle>(`/vehicles/${id}`).then((r) => r.data),
  create: (dto: { name: string; driverIds?: string[] }) => api.post<Vehicle>('/vehicles', dto).then((r) => r.data),
  update: (id: string, dto: { name?: string; driverIds?: string[] }) => api.patch<Vehicle>(`/vehicles/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
};
