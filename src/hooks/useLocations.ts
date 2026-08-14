import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '../api/locations.api';
import { sortByName } from '../utils/sort';

const QUERY_KEY = 'locations';

export function useLocations() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => sortByName(await locationsApi.findAll(), (l) => l.name),
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string }) => locationsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name: string } }) => locationsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => locationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
