import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agenciesApi } from '../api/agencies.api';

const QUERY_KEY = 'agencies';

export function useAgencies() {
  return useQuery({ queryKey: [QUERY_KEY], queryFn: () => agenciesApi.findAll() });
}

export function useCreateAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string }) => agenciesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name: string } }) => agenciesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteAgency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agenciesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
