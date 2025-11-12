import { useQuery } from '@tanstack/react-query';
import type { Tournament } from '@shared/schema';

export function useTournaments() {
  return useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });
}
