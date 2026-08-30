import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import {
  routesApi,
  type CreateRouteDto,
  type UpdateRouteDto,
} from '../api/routes.api';

const QUERY_KEY = 'routes';

export function useRoutes() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => routesApi.findAll(),
  });
}

export function useCreateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRouteDto) => routesApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

export function useUpdateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRouteDto }) =>
      routesApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

export function useDeleteRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

export function useConvertRouteHbls() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routesApi.convertHbls(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ['route'] });
    },
  });
}

export function useRouteExcel(routeId: string) {
  return useQuery({
    queryKey: ['route-excel', routeId],
    queryFn: async () => {
      const response = await api.get(`/generate/excel/${routeId}`, {
        responseType: 'blob',
      });
      const disposition = response.headers['content-disposition'] ?? '';
      const match = /filename="?([^"]+)"?/.exec(disposition);
      return {
        blob: response.data as Blob,
        filename: match?.[1] ?? 'paquetes.xlsx',
      };
    },
    enabled: false,
  });
}
