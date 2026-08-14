import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipientsApi, type Recipient } from '../api/recipients.api';
import { sortByName } from '../utils/sort';

const QUERY_KEY = 'recipients';

export function useRecipients(params?: { search?: string }) {
  return useQuery({
    queryKey: [QUERY_KEY, params?.search ?? ''],
    queryFn: async () => {
      const all: Recipient[] = [];
      let page = 1;
      for (;;) {
        const res = await recipientsApi.findAll({
          page,
          limit: 100,
          search: params?.search,
        });
        all.push(...res.data);
        if (page >= res.totalPages) break;
        page++;
      }
      return sortByName(all, (r) => r.fullName || '');
    },
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
