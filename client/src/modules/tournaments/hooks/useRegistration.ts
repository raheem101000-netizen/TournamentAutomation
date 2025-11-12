import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Tournament } from '@shared/schema';
import type { RegistrationFormConfig, RegistrationFormData } from '@/modules/registration/types';

export function useTournamentRegistration(tournamentId?: string) {
  const { data: tournament, isLoading: tournamentLoading } = useQuery<Tournament>({
    queryKey: ['/api/tournaments', tournamentId],
    enabled: !!tournamentId,
  });

  const { data: registrationConfig, isLoading: configLoading } = useQuery<RegistrationFormConfig>({
    queryKey: [`/api/tournaments/${tournamentId}/registration-config`],
    enabled: !!tournamentId,
  });

  return {
    tournament,
    registrationConfig,
    isLoading: tournamentLoading || configLoading,
  };
}

export function useSubmitRegistration(tournamentId: string, onSuccess: () => void, onError: (error: any) => void) {
  return useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const res = await apiRequest('POST', `/api/tournaments/${data.tournamentId}/registrations`, {
        teamName: data.teamName,
        contactEmail: data.contactEmail,
        responses: JSON.stringify(data.responses),
        paymentProofUrl: data.paymentProofUrl,
        paymentTransactionId: data.paymentTransactionId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/teams`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      onSuccess();
    },
    onError,
  });
}
