import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Users, LayoutGrid, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import BracketView from "@/components/BracketView";
import StandingsTable from "@/components/StandingsTable";
import MatchCard from "@/components/MatchCard";
import SubmitScoreDialog from "@/components/SubmitScoreDialog";
import MatchChatPanel from "@/components/MatchChatPanel";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Tournament, Team, Match, ChatMessage } from "@shared/schema";

export default function TournamentDetail() {
  const [, params] = useRoute("/tournament/:id");
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const { data: tournament, isLoading: tournamentLoading } = useQuery<Tournament>({
    queryKey: ["/api/tournaments", params?.id],
    enabled: !!params?.id,
  });

  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/tournaments", params?.id, "teams"],
    enabled: !!params?.id,
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ["/api/tournaments", params?.id, "matches"],
    enabled: !!params?.id,
  });

  const { data: chatMessages = [] } = useQuery<(ChatMessage & { imageUrl?: string })[]>({
    queryKey: ["/api/matches", selectedMatch?.id, "messages"],
    enabled: !!selectedMatch?.id,
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ matchId, data }: { matchId: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/matches/${matchId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", params?.id, "matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", params?.id, "teams"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ matchId, message, imageUrl }: { matchId: string; message: string; imageUrl?: string }) => {
      const res = await apiRequest("POST", `/api/matches/${matchId}/messages`, { 
        message, 
        teamId: "1", 
        imageUrl, 
        isSystem: 0 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches", selectedMatch?.id, "messages"] });
    },
  });

  const isLoading = tournamentLoading || teamsLoading || matchesLoading;

  const getTeamById = (id: string | null) => teams.find(t => t.id === id);

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
            <Button onClick={() => navigate("/")} data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmitScore = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setShowScoreDialog(true);
    }
  };

  const handleViewChat = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setShowChatPanel(true);
    }
  };

  const handleScoreSubmit = (winnerId: string, team1Score: number, team2Score: number) => {
    if (selectedMatch) {
      updateMatchMutation.mutate({
        matchId: selectedMatch.id,
        data: {
          winnerId,
          team1Score,
          team2Score,
          status: "completed",
        },
      });
    }
    setShowScoreDialog(false);
  };

  const handleSendMessage = (message: string, image?: File) => {
    if (selectedMatch) {
      let imageUrl: string | undefined;
      if (image) {
        imageUrl = URL.createObjectURL(image);
      }
      sendMessageMutation.mutate({
        matchId: selectedMatch.id,
        message,
        imageUrl,
      });
    }
  };

  const formatLabels = {
    round_robin: "Round Robin",
    single_elimination: "Single Elimination",
    swiss: "Swiss System",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-bold">{tournament.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {formatLabels[tournament.format]}
                </Badge>
                <span className="text-xs text-muted-foreground">{tournament.totalTeams} teams</span>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bracket" data-testid="tab-bracket">
              <Trophy className="w-4 h-4 mr-2" />
              Bracket
            </TabsTrigger>
            <TabsTrigger value="standings" data-testid="tab-standings">
              <Users className="w-4 h-4 mr-2" />
              Standings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Matches</p>
                    <p className="text-3xl font-bold mt-1">{matches.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold mt-1">
                      {matches.filter(m => m.status === "completed").length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-3xl font-bold mt-1">
                      {matches.filter(m => m.status === "in_progress").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold">Active Matches</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matches
                  .filter(m => m.status === "in_progress")
                  .map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      team1={getTeamById(match.team1Id)}
                      team2={getTeamById(match.team2Id)}
                      onSubmitScore={handleSubmitScore}
                      onViewChat={handleViewChat}
                    />
                  ))}
              </div>
            </div>

            {matches.filter(m => m.status === "completed").length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display text-xl font-semibold">Completed Matches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matches
                    .filter(m => m.status === "completed")
                    .map(match => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        team1={getTeamById(match.team1Id)}
                        team2={getTeamById(match.team2Id)}
                      />
                    ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bracket">
            <BracketView
              matches={matches}
              teams={teams}
              format={tournament.format}
              onMatchClick={(matchId) => console.log('Match clicked:', matchId)}
            />
          </TabsContent>

          <TabsContent value="standings">
            <StandingsTable teams={teams} />
          </TabsContent>
        </Tabs>
      </main>

      {selectedMatch && showScoreDialog && (
        <SubmitScoreDialog
          open={showScoreDialog}
          onOpenChange={setShowScoreDialog}
          team1={getTeamById(selectedMatch.team1Id)!}
          team2={getTeamById(selectedMatch.team2Id)!}
          onSubmit={(winnerId, team1Score, team2Score) => {
            console.log('Score submitted:', { winnerId, team1Score, team2Score });
            setShowScoreDialog(false);
          }}
        />
      )}

      {selectedMatch && showChatPanel && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl h-[600px]">
            <div className="mb-4 flex justify-end">
              <Button 
                variant="ghost" 
                onClick={() => setShowChatPanel(false)}
                data-testid="button-close-chat"
              >
                Close
              </Button>
            </div>
            <MatchChatPanel
              messages={chatMessages}
              teams={teams}
              currentTeamId="1"
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
