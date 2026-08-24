import { useQuery } from '@tanstack/react-query';
import { partnerApi, type PartnerQueryParams } from '../api/partner.api';

export function usePartnerPackages(params?: PartnerQueryParams) {
  return useQuery({
    queryKey: ['partner-packages', params],
    queryFn: () => partnerApi.getAll(params),
  });
}

export function usePartnerGuides() {
  return useQuery({
    queryKey: ['partner-guides'],
    queryFn: () => partnerApi.getGuides(),
  });
}

export function usePartnerStats(params?: { search?: string; guideId?: string }) {
  return useQuery({
    queryKey: ['partner-stats', params],
    queryFn: () => partnerApi.getStats(params),
  });
}

export function usePartnerStory(packageId: string, enabled = true) {
  return useQuery({
    queryKey: ['partner-story', packageId],
    queryFn: () => partnerApi.getStory(packageId),
    enabled: !!packageId && enabled,
  });
}
