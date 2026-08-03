import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRouteDto }) =>
      routesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteRoute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => routesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
