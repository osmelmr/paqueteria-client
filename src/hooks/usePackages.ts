import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { packagesApi, type PackageFilters, type PaginationParams, type CreatePackageDto, type UpdatePackageDto, type BulkUpsertDto } from '../api/packages.api';

const QUERY_KEY = 'packages';
const HISTORY_KEY = 'package-history';

function invalidatePackageQueries(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: [QUERY_KEY] });
  qc.invalidateQueries({ queryKey: [HISTORY_KEY] });
}

export function usePackages(filters?: PackageFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, filters, pagination],
    queryFn: () => packagesApi.findAll({ ...filters, ...pagination }),
  });
}

export function usePackage(id: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => packagesApi.findById(id),
    enabled: !!id && enabled,
  });
}

export function usePackageHistory(id: string, enabled = true) {
  return useQuery({
    queryKey: ['package-history', id],
    queryFn: () => packagesApi.getHistory(id),
    enabled: !!id && enabled,
  });
}

export function useCheckHbls() {
  return useMutation({
    mutationFn: (hbls: string[]) => packagesApi.checkHbls(hbls),
  });
}

export function usePackagesExcel() {
  return useMutation({
    mutationFn: async (hbls: string[]) => {
      const response = await api.post('/generate/excel-packages', { hbls }, {
        responseType: 'blob',
      });
      const disposition = response.headers['content-disposition'] ?? '';
      const match = /filename="?([^"]+)"?/.exec(disposition);
      return {
        blob: response.data as Blob,
        filename: match?.[1] ?? 'paquetes.xlsx',
      };
    },
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePackageDto) => packagesApi.create(dto),
    onSuccess: () => invalidatePackageQueries(qc),
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePackageDto }) => packagesApi.update(id, dto),
    onSuccess: () => invalidatePackageQueries(qc),
  });
}

export function useUpdatePackageStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statusId, locationId, statusDate }: { id: string; statusId: string; locationId?: string; statusDate?: string }) =>
      packagesApi.updateStatus(id, statusId, locationId, statusDate),
    onSuccess: () => invalidatePackageQueries(qc),
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => packagesApi.delete(id),
    onSuccess: () => invalidatePackageQueries(qc),
  });
}

export function useDeletePackageHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ packageId, historyId }: { packageId: string; historyId: string }) =>
      packagesApi.deleteHistory(packageId, historyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [HISTORY_KEY] }),
  });
}

export function useBulkCreatePackages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hbls, statusId, locationId }: { hbls: string[]; statusId: string; locationId: string }) =>
      packagesApi.bulkCreate(hbls, statusId, locationId),
    onSuccess: () => invalidatePackageQueries(qc),
  });
}

export function useBulkUpsertPackages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkUpsertDto) => packagesApi.bulkUpsert(dto),
    onSuccess: () => invalidatePackageQueries(qc),
  });
}
