import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi, type Vehicle } from '../api/vehicles.api';
import { sortByName } from '../utils/sort';

const QUERY_KEY = 'vehicles';

export function useVehicles() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => sortByName(await vehiclesApi.findAll(), (v) => v.name),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; driverIds?: string[] }) =>
      vehiclesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name?: string; driverIds?: string[] } }) =>
      vehiclesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export type { Vehicle };
