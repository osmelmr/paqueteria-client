import { useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi, type BulkAiEntities, type BulkStatusUpdate, type ResolveAlertDto } from '../api/business.api';

export function useProcessBulkAi() {
  return useMutation({
    mutationFn: (entities: BulkAiEntities) => businessApi.processBulkAi(entities),
  });
}

export function useUpdateStatusBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkStatusUpdate) => businessApi.updateStatusBulk(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packages'] }),
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ packageId, dto }: { packageId: string; dto: ResolveAlertDto }) =>
      businessApi.resolveAlert(packageId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packages'] }),
  });
}
