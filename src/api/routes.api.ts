import api from './axios';
import type { Vehicle } from './vehicles.api';
import type { PackageItem } from '../types';

export interface Route {
  id: string;
  name: string;
  description?: string | null;
  departureDate?: string;
  vehicle?: Vehicle | null;
  packages?: PackageItem[];
}

export interface CreateRouteDto {
  name: string;
  description?: string;
  departureDate?: string;
  vehicleId: string;
  hbls: string[];
}

export interface UpdateRouteDto {
  name?: string;
  description?: string;
  departureDate?: string;
  vehicleId?: string;
  hbls?: string[];
}

export const routesApi = {
  findAll: () => api.get<Route[]>('/routes').then((r) => r.data),
  findById: (id: string) => api.get<Route>(`/routes/${id}`).then((r) => r.data),
  create: (dto: CreateRouteDto) => api.post<Route>('/routes', dto).then((r) => r.data),
  update: (id: string, dto: UpdateRouteDto) => api.patch<Route>(`/routes/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/routes/${id}`),
};
