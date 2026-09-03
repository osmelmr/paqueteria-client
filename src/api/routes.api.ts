import api from './axios';
import type { Vehicle } from './vehicles.api';
import type { PackageItem } from '../types';

export interface Route {
  id: string;
  name: string;
  description?: string | null;
  departureDate?: string;
  vehicleId: string;
  vehicle?: Vehicle | null;
  drivers?: Array<{ id: string; driverId: string; driver: { id: string; name: string } }>;
  packages?: PackageItem[];
  notFound?: string | null;
}

export interface CreateRouteDto {
  name: string;
  description?: string;
  departureDate: string;
  vehicleId: string;
  hbls: string[];
  driverIds?: string[];
  notFound?: string[];
}

export interface UpdateRouteDto {
  name?: string;
  description?: string;
  departureDate?: string;
  vehicleId?: string;
  hbls?: string[];
  driverIds?: string[];
  notFound?: string[];
}

export interface CreateRouteResult {
  route: Route;
  notFound: string[];
  totalHbls: number;
  foundPackages: number;
}

export const routesApi = {
  findAll: () => api.get<Route[]>('/routes').then((r) => r.data),
  findById: (id: string) => api.get<Route>(`/routes/${id}`).then((r) => r.data),
  create: (dto: CreateRouteDto) => api.post<CreateRouteResult>('/routes', dto).then((r) => r.data),
  update: (id: string, dto: UpdateRouteDto) => api.patch<Route>(`/routes/${id}`, dto).then((r) => r.data),
  delete: (id: string) => api.delete(`/routes/${id}`),
};
