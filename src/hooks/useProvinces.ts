import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { provincesApi } from '../api/provinces.api';

const QUERY_KEY = 'provinces';

export function useProvinces() {
  return useQuery({ queryKey: [QUERY_KEY], queryFn: () => provincesApi.findAll() });
}

export function useCreateProvince() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string }) => provincesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateProvince() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { name: string } }) => provincesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteProvince() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => provincesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
