import { useQuery, useMutation } from "@tanstack/react-query";
import { Trophy, Plus, ArrowLeft, Calendar, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TournamentCard from "@/components/TournamentCard";
import CreateTournamentDialog from "@/components/CreateTournamentDialog";
import BracketView from "@/components/BracketView";
import StandingsTable from "@/components/StandingsTable";
import MatchCard from "@/components/MatchCard";
import SubmitScoreDialog from "@/components/SubmitScoreDialog";
import type { Tournament, InsertTournament, Team, Match } from "@shared/schema";
import type { RegistrationFormConfig } from "@/modules/registration/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface TournamentDashboardChannelProps {
  serverId: string;
}

export default function TournamentDashboardChannel({ serverId }: TournamentDashboardChannelProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { toast} = useToast();

  const { data: allTournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: InsertTournament & { teamNames: string[]; registrationConfig?: RegistrationFormConfig }) => {
      return apiRequest('/api/tournaments', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      toast({
        title: "Tournament created",
        description: "Your tournament has been created successfully.",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: selectedTournamentTeams = [] } = useQuery<Team[]>({
    queryKey: [`/api/tournaments/${selectedTournamentId}/teams`],
    enabled: !!selectedTournamentId,
  });

  const { data: selectedTournamentMatches = [] } = useQuery<Match[]>({
    queryKey: [`/api/tournaments/${selectedTournamentId}/matches`],
    enabled: !!selectedTournamentId,
  });

  const serverTournaments = allTournaments.filter(t => t.serverId === serverId);
  const upcomingTournaments = serverTournaments.filter(t => t.status === "upcoming");
  const inProgressTournaments = serverTournaments.filter(t => t.status === "in_progress");
  const completedTournaments = serverTournaments.filter(t => t.status === "completed");

  const selectedTournament = allTournaments.find(t => t.id === selectedTournamentId);
  const selectedMatch = selectedTournamentMatches.find(m => m.id === selectedMatchId);

  const submitScoreMutation = useMutation({
    mutationFn: async ({ matchId, winnerId, team1Score, team2Score }: { matchId: string; winnerId: string; team1Score: number; team2Score: number }) => {
      return apiRequest(`/api/matches/${matchId}/score`, 'POST', {
        winnerId,
        team1Score,
        team2Score
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${selectedTournamentId}/matches`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${selectedTournamentId}/teams`] });
      toast({
        title: "Score submitted",
        description: "Match result has been recorded.",
      });
      setSelectedMatchId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewTournament = (id: string) => {
    setSelectedTournamentId(id);
  };

  const handleBackToList = () => {
    setSelectedTournamentId(null);
  };

  const handleMatchClick = (matchId: string) => {
    setSelectedMatchId(matchId);
  };

  const handleSubmitScore = (winnerId: string, team1Score: number, team2Score: number) => {
    if (selectedMatchId) {
      submitScoreMutation.mutate({ matchId: selectedMatchId, winnerId, team1Score, team2Score });
    }
  };

  const getTeamById = (id: string | null) => {
    return selectedTournamentTeams.find(t => t.id === id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">Loading tournaments...</p>
      </div>
    );
  }

  // Show tournament detail view
  if (selectedTournamentId && selectedTournament) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBackToList} data-testid="button-back-to-list">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-xl font-bold">{selectedTournament.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={selectedTournament.status === "upcoming" ? "secondary" : "default"}>
                  {selectedTournament.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-muted-foreground">{selectedTournament.game}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bracket">Bracket</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Format</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {selectedTournament.format.replace('_', ' ')}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedTournament.totalTeams}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prize Pool</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedTournament.prizeReward || 'TBD'}</div>
                </CardContent>
              </Card>
            </div>

            {selectedTournament.startDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg">
                    {new Date(selectedTournament.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bracket">
            {selectedTournamentMatches.length > 0 ? (
              <BracketView
                matches={selectedTournamentMatches}
                teams={selectedTournamentTeams}
                format={selectedTournament.format}
              />
            ) : (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">
                  No matches scheduled yet
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="standings">
            {selectedTournamentTeams.length > 0 ? (
              <StandingsTable teams={selectedTournamentTeams} />
            ) : (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">
                  No teams registered yet
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="matches">
            {selectedTournamentMatches.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click on a match to submit scores
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTournamentMatches.map((match) => (
                    <div key={match.id} onClick={() => handleMatchClick(match.id)} className="cursor-pointer">
                      <MatchCard
                        match={match}
                        team1={getTeamById(match.team1Id)}
                        team2={getTeamById(match.team2Id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">
                  No matches scheduled yet
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="teams">
            {selectedTournamentTeams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTournamentTeams.map((team) => (
                  <Card key={team.id}>
                    <CardHeader>
                      <CardTitle>{team.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Wins:</span>{' '}
                          <span className="font-semibold">{team.wins || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Losses:</span>{' '}
                          <span className="font-semibold">{team.losses || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Points:</span>{' '}
                          <span className="font-semibold">{team.points || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">
                  No teams registered yet
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {selectedMatch && getTeamById(selectedMatch.team1Id) && getTeamById(selectedMatch.team2Id) && (
          <SubmitScoreDialog
            open={!!selectedMatchId}
            onOpenChange={(open) => !open && setSelectedMatchId(null)}
            team1={getTeamById(selectedMatch.team1Id)!}
            team2={getTeamById(selectedMatch.team2Id)!}
            onSubmit={handleSubmitScore}
          />
        )}
      </div>
    );
  }

  // Show tournament list view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Tournament Dashboard</h2>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-tournament">
          <Plus className="h-4 w-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">
            Upcoming ({upcomingTournaments.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress" data-testid="tab-in-progress">
            In Progress ({inProgressTournaments.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            Completed ({completedTournaments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {upcomingTournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No upcoming tournaments</p>
              <p className="text-xs text-muted-foreground mt-1">Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} onView={handleViewTournament} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="mt-4">
          {inProgressTournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No tournaments in progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} onView={handleViewTournament} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {completedTournaments.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No completed tournaments</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} onView={handleViewTournament} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateTournamentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={(data) => createTournamentMutation.mutate({ ...data, serverId })}
      />
    </div>
  );
}
