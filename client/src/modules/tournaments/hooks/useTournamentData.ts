import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Tournament, Team, Match, ChatMessage } from '@shared/schema';

export function useTournamentData(tournamentId?: string) {
  const { data: tournament, isLoading: tournamentLoading } = useQuery<Tournament>({
    queryKey: ['/api/tournaments', tournamentId],
    enabled: !!tournamentId,
  });

  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['/api/tournaments', tournamentId, 'teams'],
    enabled: !!tournamentId,
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ['/api/tournaments', tournamentId, 'matches'],
    enabled: !!tournamentId,
  });

  return {
    tournament,
    teams,
    matches,
    isLoading: tournamentLoading || teamsLoading || matchesLoading,
  };
}

export function useMatchMessages(matchId?: string) {
  return useQuery<(ChatMessage & { imageUrl?: string })[]>({
    queryKey: ['/api/matches', matchId, 'messages'],
    enabled: !!matchId,
  });
}

export function useUpdateMatch(tournamentId: string) {
  return useMutation({
    mutationFn: async ({ matchId, data }: { matchId: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/matches/${matchId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournamentId, 'matches'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournamentId, 'teams'] });
    },
  });
}

export function useSendMatchMessage(matchId: string | null) {
  return useMutation({
    mutationFn: async ({ message, imageUrl }: { message: string; imageUrl?: string }) => {
      const res = await apiRequest('POST', `/api/matches/${matchId}/messages`, {
        message,
        teamId: '1',
        imageUrl,
        isSystem: 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches', matchId, 'messages'] });
    },
  });
}
