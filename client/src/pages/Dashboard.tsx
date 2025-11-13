import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, TrendingUp, Users, Loader2 } from "lucide-react";
import TournamentCard from "@/components/TournamentCard";
import CreateTournamentDialog from "@/components/CreateTournamentDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Tournament } from "@shared/schema";
import { RegistrationStore } from "../../../lib/stores/registrationStore";

export default function Dashboard() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [, navigate] = useLocation();
  const [totalUniqueTeams, setTotalUniqueTeams] = useState(0);

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/tournaments", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      setShowCreateDialog(false);
    },
  });

  useEffect(() => {
    loadUniqueTeamCount();
  }, [tournaments]);

  const loadUniqueTeamCount = async () => {
    const uniqueTeamIds = await RegistrationStore.getUniqueTeamIds();
    setTotalUniqueTeams(uniqueTeamIds.length);
  };

  const activeTournaments = tournaments.filter(t => t.status === "in_progress").length;
  const completedTournaments = tournaments.filter(t => t.status === "completed").length;

  const handleCreateTournament = (data: any) => {
    createTournamentMutation.mutate(data);
  };

  const handleViewTournament = (id: string) => {
    navigate(`/tournament/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">Tournament Manager</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground mt-1">Manage and track your tournaments</p>
          </div>
          <Button 
            size="lg"
            onClick={() => setShowCreateDialog(true)}
            data-testid="button-create-tournament"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Tournament
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
              <Trophy className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTournaments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Teams</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUniqueTeams}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Distinct teams registered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTournaments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tournaments finished
              </p>
            </CardContent>
          </Card>
        </div>

        {tournaments.filter(t => t.status === "in_progress").length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-semibold">Active Tournaments</h3>
              <Badge>{tournaments.filter(t => t.status === "in_progress").length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments
                .filter(t => t.status === "in_progress")
                .map(tournament => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onView={handleViewTournament}
                  />
                ))}
            </div>
          </div>
        )}

        {tournaments.filter(t => t.status === "upcoming").length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-semibold">Upcoming Tournaments</h3>
              <Badge variant="outline">{tournaments.filter(t => t.status === "upcoming").length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments
                .filter(t => t.status === "upcoming")
                .map(tournament => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onView={handleViewTournament}
                  />
                ))}
            </div>
          </div>
        )}

        {tournaments.filter(t => t.status === "completed").length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-semibold">Completed Tournaments</h3>
              <Badge variant="secondary">{tournaments.filter(t => t.status === "completed").length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments
                .filter(t => t.status === "completed")
                .map(tournament => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onView={handleViewTournament}
                  />
                ))}
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : tournaments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No tournaments yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first tournament to get started</p>
              <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-tournament">
                <Plus className="w-4 h-4 mr-2" />
                Create Tournament
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </main>

      <CreateTournamentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateTournament}
      />
    </div>
  );
}
