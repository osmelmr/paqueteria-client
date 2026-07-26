import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { packagesApi, type PackageFilters, type CreatePackageDto, type UpdatePackageDto } from '../api/packages.api';

const QUERY_KEY = 'packages';

export function usePackages(filters?: PackageFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => packagesApi.findAll(filters),
  });
}

export function usePackage(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => packagesApi.findById(id),
    enabled: !!id,
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePackageDto) => packagesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePackageDto }) => packagesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdatePackageStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statusId, locationId }: { id: string; statusId: string; locationId?: string }) =>
      packagesApi.updateStatus(id, statusId, locationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => packagesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
