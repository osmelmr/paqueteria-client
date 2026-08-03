import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi, type Driver } from '../api/drivers.api';

const QUERY_KEY = 'drivers';

export function useDrivers() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => driversApi.findAll(),
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string }) => driversApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name?: string } }) =>
      driversApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => driversApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export type { Driver };
