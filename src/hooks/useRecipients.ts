import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipientsApi } from '../api/recipients.api';
import { sortByName } from '../utils/sort';

const QUERY_KEY = 'recipients';

export function useRecipients() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () =>
      sortByName(
        await recipientsApi.findAll({ page: 1, limit: 100 }),
        (r) => r.fullName || '',
      ),
  });
}

export function useCreateRecipient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { fullName: string; idCard: string; phone?: string }) => recipientsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateRecipient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { fullName?: string; idCard?: string; phone?: string } }) => recipientsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteRecipient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recipientsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
