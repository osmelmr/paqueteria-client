import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guidesApi, type CreateGuideDto, type UpdateGuideDto } from '../api/guides.api';
import { sortByName } from '../utils/sort';

const QUERY_KEY = 'guides';

export function useGuides() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => sortByName(await guidesApi.findAll(), (g) => g.name || ''),
  });
}

export function useCreateGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateGuideDto) => guidesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateGuideDto }) => guidesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guidesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
