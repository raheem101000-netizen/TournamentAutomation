import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, TrendingUp, Users } from "lucide-react";
import TournamentCard from "@/components/TournamentCard";
import CreateTournamentDialog from "@/components/CreateTournamentDialog";
import ThemeToggle from "@/components/ThemeToggle";
import type { Tournament } from "@shared/schema";

export default function Dashboard() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [tournaments, setTournaments] = useState<(Tournament & { totalMatches?: number; completedMatches?: number })[]>([
    {
      id: "1",
      name: "Summer Championship 2024",
      format: "single_elimination",
      status: "in_progress",
      totalTeams: 8,
      currentRound: 2,
      swissRounds: null,
      createdAt: new Date(),
      totalMatches: 7,
      completedMatches: 3,
    },
    {
      id: "2",
      name: "League Season 5",
      format: "round_robin",
      status: "upcoming",
      totalTeams: 6,
      currentRound: 1,
      swissRounds: null,
      createdAt: new Date(),
      totalMatches: 15,
      completedMatches: 0,
    },
    {
      id: "3",
      name: "Winter Open",
      format: "swiss",
      status: "completed",
      totalTeams: 12,
      currentRound: 4,
      swissRounds: 4,
      createdAt: new Date(),
      totalMatches: 24,
      completedMatches: 24,
    },
  ]);

  const activeTournaments = tournaments.filter(t => t.status === "in_progress").length;
  const totalTeams = tournaments.reduce((sum, t) => sum + t.totalTeams, 0);
  const completedTournaments = tournaments.filter(t => t.status === "completed").length;

  const handleCreateTournament = (data: any) => {
    console.log("Creating tournament:", data);
    
    // Create new tournament object
    const newTournament: Tournament & { totalMatches?: number; completedMatches?: number } = {
      id: `tournament-${Date.now()}`,
      name: data.name,
      format: data.format,
      status: "upcoming",
      totalTeams: data.totalTeams,
      currentRound: 1,
      swissRounds: data.swissRounds,
      createdAt: new Date(),
      totalMatches: 0,
      completedMatches: 0,
    };
    
    // Add to tournaments list
    setTournaments([newTournament, ...tournaments]);
    setShowCreateDialog(false);
  };

  const handleViewTournament = (id: string) => {
    console.log("View tournament:", id);
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
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTeams}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all tournaments
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
      </main>

      <CreateTournamentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateTournament}
      />
    </div>
  );
}
