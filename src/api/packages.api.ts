import api from './axios';

export type GuideType = 'AEREA' | 'MARITIMA';

export interface PackageFilters {
  status?: string;
  provinceId?: string;
  provinceIds?: string[];
  municipeId?: string;
  header?: boolean;
  hbl?: string;
  recipientId?: string;
  guideId?: string;
  search?: string;
  alert?: boolean;
  statusDate?: string;
  locationId?: string;
  agencyId?: string;
  guideType?: GuideType;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PackageQueryParams extends PackageFilters, Partial<PaginationParams> {}

export interface PackagePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedPackages<T> {
  items: T[];
  hbls: string[];
  pagination: PackagePagination;
}

export interface PackageGuide {
  id: string;
  name: string;
  type: GuideType;
  agencyId?: string | null;
  agency?: { id: string; name: string } | null;
}

export interface PackageRecipient {
  id: string;
  fullName: string | null;
  idCard: string | null;
  phone: string | null;
}

export interface PackageReference {
  id: string;
  name: string;
}

export interface Package {
  id: string;
  guide?: PackageGuide | null;
  recipient?: PackageRecipient | null;
  province?: PackageReference | null;
  municipe?: PackageReference | null;
  weight?: number | string | null;
  status: { name: string; id?: string };
  location?: { name: string; id?: string } | null;
  alert?: boolean | null;
  alertDescription?: string | null;
  hbls: { hblCode: string }[];
  address?: string | null;
  content?: string | null;
  arrivalDate?: string | null;
  anotations?: string | null;
  statusId?: string;
  provinceId?: string;
  municipeId?: string;
  locationId?: string;
  agencyId?: string;
  guideId?: string;
  recipientId?: string;
  createdAt?: string;
  updatedAt?: string;
  statuses?: PackageHistoryItem[];
}

export interface CreatePackageDto {
  guideId?: string;
  recipientId?: string;
  provinceId?: string;
  municipeId?: string;
  address?: string;
  weight?: number;
  content?: string;
  arrivalDate?: string;
  statusDate?: string;
  statusId: string;
  locationId: string;
  anotations?: string;
  alert?: boolean;
  alertDescription?: string;
  hbls?: string[];
}

export interface UpdatePackageDto extends Partial<CreatePackageDto> {
  statusId?: string;
}

export interface CheckHblsResult {
  found: Package[];
  notFound: string[];
}

export interface PackageHistoryItem {
  id: string;
  packageId: string;
  statusId: string;
  locationId: string | null;
  createdAt: string;
  status?: { id: string; name: string } | null;
  location?: { id: string; name: string } | null;
}

export const packagesApi = {
  findAll: (params?: PackageQueryParams) =>
    api
      .get<PaginatedPackages<Package>>('/packages', { params })
      .then((r) => r.data),

  findById: (id: string) =>
    api.get<Package>(`/packages/${id}`).then((r) => r.data),

  findByHbl: (hbl: string) =>
    api.get(`/packages/by-hbl/${hbl}`).then((r) => r.data),

  checkHbls: (hbls: string[]) =>
    api.post<CheckHblsResult>('/packages/check-hbls', { hbls }).then((r) => r.data),

  create: (dto: CreatePackageDto) =>
    api.post('/packages', dto).then((r) => r.data),

  update: (id: string, dto: UpdatePackageDto) =>
    api.patch(`/packages/${id}`, dto).then((r) => r.data),

  updateStatus: (id: string, statusId: string, locationId?: string, statusDate?: string) =>
    api.patch(`/packages/${id}/status`, { statusId, locationId, statusDate }).then((r) => r.data),

  getHistory: (id: string) =>
    api.get<PackageHistoryItem[]>(`/packages/${id}/history`).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/packages/${id}`),
};