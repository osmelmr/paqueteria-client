import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { municipesApi } from '../api/municipes.api';

const QUERY_KEY = 'municipes';

export function useMunicipes() {
  return useQuery({ queryKey: [QUERY_KEY], queryFn: () => municipesApi.findAll() });
}

export function useCreateMunicipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; header?: boolean }) => municipesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateMunicipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name: string; header?: boolean } }) => municipesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteMunicipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => municipesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
