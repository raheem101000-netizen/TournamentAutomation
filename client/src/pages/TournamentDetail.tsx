import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Users, LayoutGrid } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import BracketView from "@/components/BracketView";
import StandingsTable from "@/components/StandingsTable";
import MatchCard from "@/components/MatchCard";
import SubmitScoreDialog from "@/components/SubmitScoreDialog";
import MatchChatPanel from "@/components/MatchChatPanel";
import type { Tournament, Team, Match, ChatMessage } from "@shared/schema";

export default function TournamentDetail() {
  const [activeTab, setActiveTab] = useState("overview");
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const tournament: Tournament = {
    id: "1",
    name: "Summer Championship 2024",
    format: "single_elimination",
    status: "in_progress",
    totalTeams: 4,
    currentRound: 1,
    swissRounds: null,
    createdAt: new Date(),
  };

  const teams: Team[] = [
    { id: "1", name: "Alpha Squad", tournamentId: "1", wins: 2, losses: 0, points: 6 },
    { id: "2", name: "Beta Force", tournamentId: "1", wins: 2, losses: 0, points: 6 },
    { id: "3", name: "Charlie Warriors", tournamentId: "1", wins: 1, losses: 1, points: 3 },
    { id: "4", name: "Delta Legends", tournamentId: "1", wins: 0, losses: 2, points: 0 },
  ];

  const matches: Match[] = [
    {
      id: "sf1",
      tournamentId: "1",
      team1Id: "1",
      team2Id: "4",
      winnerId: "1",
      round: 2,
      status: "completed",
      team1Score: 21,
      team2Score: 15,
      isBye: 0,
    },
    {
      id: "sf2",
      tournamentId: "1",
      team1Id: "2",
      team2Id: "3",
      winnerId: "2",
      round: 2,
      status: "completed",
      team1Score: 19,
      team2Score: 17,
      isBye: 0,
    },
    {
      id: "final",
      tournamentId: "1",
      team1Id: "1",
      team2Id: "2",
      winnerId: null,
      round: 1,
      status: "in_progress",
      team1Score: null,
      team2Score: null,
      isBye: 0,
    },
  ];

  const chatMessages: ChatMessage[] = [
    {
      id: "1",
      matchId: "final",
      teamId: null,
      message: "Match started",
      isSystem: 1,
      createdAt: new Date(),
    },
    {
      id: "2",
      matchId: "final",
      teamId: "1",
      message: "GL HF everyone!",
      isSystem: 0,
      createdAt: new Date(),
    },
    {
      id: "3",
      matchId: "final",
      teamId: "2",
      message: "Good luck!",
      isSystem: 0,
      createdAt: new Date(),
    },
  ];

  const getTeamById = (id: string | null) => teams.find(t => t.id === id);

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
              onClick={() => console.log('Go back')}
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
              onSendMessage={(message) => console.log('Send message:', message)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
