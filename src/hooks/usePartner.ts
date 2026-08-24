import { useQuery } from '@tanstack/react-query';
import { partnerApi } from '../api/partner.api';

export function usePartnerPackages() {
  return useQuery({
    queryKey: ['partner-packages'],
    queryFn: () => partnerApi.getAll(),
  });
}

export function usePartnerStory(packageId: string, enabled = true) {
  return useQuery({
    queryKey: ['partner-story', packageId],
    queryFn: () => partnerApi.getStory(packageId),
    enabled: !!packageId && enabled,
  });
}
