import api from './axios';
import type { Package, PackageHistoryItem } from './packages.api';

export type PartnerPackage = Package;
export type PartnerStoryItem = PackageHistoryItem;

export const partnerApi = {
  getAll: () =>
    api.get<PartnerPackage[]>('/partner').then((r) => r.data),

  getStory: (packageId: string) =>
    api
      .get<PartnerStoryItem[]>('/partner/story', { params: { packageId } })
      .then((r) => r.data),
};
