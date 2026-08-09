import { useQuery } from '@tanstack/react-query';
import { routesApi, type Route } from '../api/routes.api';

export function useRoute(routeId?: string) {
  return useQuery<Route>({
    queryKey: ['route', routeId],
    queryFn: () => routesApi.findById(routeId ?? ''),
    enabled: Boolean(routeId),
  });
}
