import api from './axios';

export interface RouteStats {
  id: string;
  name: string;
  description?: string | null;
  departureDate: string;
  vehicleId: string;
  vehicle?: { id: string; name: string } | null;
  _count: { packages: number };
}

export interface Statistics {
  totalAlmacenados: number;
  totalEntregados: number;
  totalGuiasActivas: number;
  totalEnEspera: number;
  ultimasRutas: RouteStats[];
  idAlmacenado?: string | null;
  idEntregado?: string | null;
  idEnEspera?: string | null;
}

export const statisticsApi = {
  main: () => api.get<Statistics>('/statistics').then((r) => r.data),
};
