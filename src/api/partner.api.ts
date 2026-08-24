import api from './axios';
import type { Package, PackageHistoryItem, PackagePagination } from './packages.api';

export type PartnerPackage = Package;
export type PartnerStoryItem = PackageHistoryItem;

export interface PartnerPackagesResult {
  items: PartnerPackage[];
  pagination: PackagePagination;
}

export interface PartnerGuide {
  id: string;
  name: string;
  type?: 'AEREA' | 'MARITIMA';
}

export interface PartnerStats {
  total: number;
  byStatus: { statusId: string; name: string; count: number }[];
}

export interface PartnerQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  guideId?: string;
}

export const partnerApi = {
  getAll: (params?: PartnerQueryParams) =>
    api.get<PartnerPackagesResult>('/partner', { params }).then((r) => r.data),

  getGuides: () =>
    api.get<PartnerGuide[]>('/partner/guides').then((r) => r.data),

  getStats: (params?: { search?: string; guideId?: string }) =>
    api.get<PartnerStats>('/partner/stats', { params }).then((r) => r.data),

  getStory: (packageId: string) =>
    api
      .get<PartnerStoryItem[]>('/partner/story', { params: { packageId } })
      .then((r) => r.data),
};
