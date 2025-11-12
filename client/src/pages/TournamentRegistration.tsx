import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import RegistrationFlow from "@/modules/registration/RegistrationFlow";
import type { Tournament } from "@shared/schema";
import type { RegistrationFormConfig, RegistrationFormData } from "@/modules/registration/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TournamentRegistration() {
  const [, params] = useRoute("/register/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: tournament, isLoading: tournamentLoading } = useQuery<Tournament>({
    queryKey: ["/api/tournaments", params?.id],
    enabled: !!params?.id,
  });

  const { data: registrationConfig, isLoading: configLoading } = useQuery<RegistrationFormConfig>({
    queryKey: [`/api/tournaments/${params?.id}/registration-config`],
    enabled: !!params?.id,
  });

  const submitRegistrationMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const res = await apiRequest("POST", `/api/tournaments/${data.tournamentId}/registrations`, {
        teamName: data.teamName,
        contactEmail: data.contactEmail,
        responses: JSON.stringify(data.responses),
        paymentProofUrl: data.paymentProofUrl,
        paymentTransactionId: data.paymentTransactionId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${params?.id}/teams`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "Registration Submitted!",
        description: "Your registration has been submitted successfully.",
      });
      navigate(`/tournament/${params?.id}`);
    },
    onError: (error: any) => {
      const message = error.message || "There was an error submitting your registration. Please try again.";
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const isLoading = tournamentLoading || configLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Tournament not found</h2>
            <Button onClick={() => navigate("/discover")} data-testid="button-back-discover">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Discovery
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!registrationConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Registration Not Available</h2>
            <p className="text-muted-foreground">
              This tournament does not have a registration form configured yet.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/discover")} data-testid="button-back-discover">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Discovery
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(`/tournament/${params?.id}`)} 
                data-testid="button-view-tournament"
              >
                View Tournament
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/discover")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-bold">Register for {tournament.name}</h1>
            <p className="text-sm text-muted-foreground">Complete the form to join this tournament</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <RegistrationFlow
          config={registrationConfig}
          tournamentId={tournament.id}
          tournamentName={tournament.name}
          onSubmit={(data) => submitRegistrationMutation.mutate(data)}
        />
      </main>
    </div>
  );
}
