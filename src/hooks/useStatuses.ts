import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statusesApi } from '../api/statuses.api';
import { sortByName } from '../utils/sort';

const QUERY_KEY = 'statuses';

export function useStatuses() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => sortByName(await statusesApi.findAll(), (s) => s.name),
  });
}

export function useCreateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string }) => statusesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name: string } }) => statusesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => statusesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
