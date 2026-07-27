import api from './axios';

export interface PackageFilters {
  status?: string;
  provinceId?: string;
  municipeId?: string;
  isOrphan?: boolean;
  hbl?: string;
  recipientId?: string;
  guideId?: string;
  search?: string;
  alert?: boolean;
}

export interface CreatePackageDto {
  guideId?: string;
  recipientId?: string;
  provinceId?: string;
  address?: string;
  weight?: number;
  content?: string;
  arrivalDate?: string;
  statusId: string;
  locationId?: string;
  isOrphan?: boolean;
  anotations?: string;
  alert?: boolean;
  alertDescription?: string;
  hbls?: string[];
}

export interface UpdatePackageDto extends Partial<CreatePackageDto> {
  statusId?: string;
}

export const packagesApi = {
  findAll: (filters?: PackageFilters) =>
    api.get('/packages', { params: filters }).then((r) => r.data),

  findById: (id: string) =>
    api.get(`/packages/${id}`).then((r) => r.data),

  findByHbl: (hbl: string) =>
    api.get(`/packages/by-hbl/${hbl}`).then((r) => r.data),

  create: (dto: CreatePackageDto) =>
    api.post('/packages', dto).then((r) => r.data),

  update: (id: string, dto: UpdatePackageDto) =>
    api.patch(`/packages/${id}`, dto).then((r) => r.data),

  updateStatus: (id: string, statusId: string, locationId?: string) =>
    api.patch(`/packages/${id}/status`, { statusId, locationId }).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/packages/${id}`),
};
