import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '../api/statistics.api';

const QUERY_KEY = 'statistics';

export function useStatistics() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => statisticsApi.main(),
    refetchInterval: 60_000,
  });
}
