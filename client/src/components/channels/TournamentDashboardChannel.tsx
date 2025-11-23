import { useQuery, useMutation } from "@tanstack/react-query";
import { Trophy, Plus, ArrowLeft, Calendar, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel as FormLabelComponent,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import TournamentCard from "@/components/TournamentCard";
import CreateTournamentDialog from "@/components/CreateTournamentDialog";
import BracketView from "@/components/BracketView";
import StandingsTable from "@/components/StandingsTable";
import MatchCard from "@/components/MatchCard";
import SubmitScoreDialog from "@/components/SubmitScoreDialog";
import ImageUploadField from "@/components/ImageUploadField";
import type { Tournament, InsertTournament, Team, Match } from "@shared/schema";
import type { RegistrationFormConfig } from "@/modules/registration/types";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

const achievementIconOptions = [
  "🏆", "⭐", "🥇", "🎖️", "👑", "🔥", "💎", "🌟", "✨", "🎯", "🏅", "🎪"
];

const awardAchievementSchema = z.object({
  playerId: z.string().min(1, "Please enter a player ID"),
  title: z.string().min(1, "Achievement title is required").max(50),
  description: z.string().max(200),
  icon: z.string().min(1, "Please select an icon"),
});

interface TournamentDashboardChannelProps {
  serverId: string;
}

export default function TournamentDashboardChannel({ serverId }: TournamentDashboardChannelProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAwardAchievementDialogOpen, setIsAwardAchievementDialogOpen] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { toast} = useToast();
  const { user } = useAuth();

  const achievementForm = useForm({
    resolver: zodResolver(awardAchievementSchema),
    defaultValues: {
      playerId: "",
      title: "",
      description: "",
      icon: "🏆",
    },
  });

  const { data: allTournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: InsertTournament & { teamNames: string[]; registrationConfig?: RegistrationFormConfig }) => {
      return apiRequest('POST', '/api/tournaments', data);
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

  const updateTournamentMutation = useMutation({
    mutationFn: async (data: Partial<Tournament>) => {
      return apiRequest('PATCH', `/api/tournaments/${selectedTournamentId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      toast({
        title: "Tournament updated",
        description: "Your tournament has been updated successfully.",
      });
      setIsEditDialogOpen(false);
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
      return apiRequest('POST', `/api/matches/${matchId}/score`, {
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

  const awardAchievementMutation = useMutation({
    mutationFn: async (data: z.infer<typeof awardAchievementSchema>) => {
      return apiRequest("POST", "/api/achievements", {
        userId: data.playerId,
        title: data.title,
        description: data.description || "",
        type: "solo",
        iconUrl: data.icon,
        category: "tournament",
        awardedBy: user?.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Achievement Awarded!",
        description: "The achievement has been awarded successfully.",
      });
      achievementForm.reset();
      setIsAwardAchievementDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${selectedTournament?.organizerId}/achievements`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to award achievement",
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
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)} data-testid="button-edit-tournament">
            Edit
          </Button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedTournament.platform && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Platform</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">{selectedTournament.platform}</div>
                  </CardContent>
                </Card>
              )}
              {selectedTournament.region && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Region</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">{selectedTournament.region}</div>
                  </CardContent>
                </Card>
              )}
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
        <div className="flex gap-2">
          <Button onClick={() => setIsAwardAchievementDialogOpen(true)} variant="outline" data-testid="button-award-achievement">
            <Trophy className="h-4 w-4 mr-2" />
            Award Achievement
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-tournament">
            <Plus className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
        </div>
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

      <EditTournamentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        tournament={selectedTournament}
        onSubmit={(data) => updateTournamentMutation.mutate(data)}
      />

      <AwardAchievementDialog
        open={isAwardAchievementDialogOpen}
        onOpenChange={setIsAwardAchievementDialogOpen}
        form={achievementForm}
        onSubmit={(data) => awardAchievementMutation.mutate(data)}
        isPending={awardAchievementMutation.isPending}
      />
    </div>
  );
}

interface EditTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: Tournament | undefined;
  onSubmit: (data: Partial<Tournament>) => void;
}

function EditTournamentDialog({ open, onOpenChange, tournament, onSubmit }: EditTournamentDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prizeReward, setPrizeReward] = useState("");
  const [entryFee, setEntryFee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [platform, setPlatform] = useState("");
  const [region, setRegion] = useState("");

  useEffect(() => {
    if (tournament && open) {
      setName(tournament.name || "");
      setGame(tournament.game || "");
      setImageUrl(tournament.imageUrl || "");
      setPrizeReward(tournament.prizeReward || "");
      setEntryFee(tournament.entryFee || "");
      setStartDate(tournament.startDate ? new Date(tournament.startDate).toISOString().slice(0, 16) : "");
      setEndDate(tournament.endDate ? new Date(tournament.endDate).toISOString().slice(0, 16) : "");
      setPlatform(tournament.platform || "");
      setRegion(tournament.region || "");
    }
  }, [tournament, open]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: "Name required",
        description: "Tournament name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit({
      name: trimmedName,
      game: game.trim() || null,
      imageUrl: imageUrl.trim() || null,
      prizeReward: prizeReward.trim() || null,
      entryFee: entryFee.trim() || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      platform: platform.trim() || null,
      region: region.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tournament</DialogTitle>
          <DialogDescription>
            Update tournament details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Tournament Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-edit-tournament-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-game">Game</Label>
            <Input
              id="edit-game"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              data-testid="input-edit-tournament-game"
            />
          </div>
          <ImageUploadField
            label="Tournament Poster"
            value={imageUrl}
            onChange={setImageUrl}
            placeholder="https://example.com/poster.jpg"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-prizeReward">Prize Pool</Label>
              <Input
                id="edit-prizeReward"
                placeholder="e.g., $1,000, No Prize, TBA"
                value={prizeReward}
                onChange={(e) => setPrizeReward(e.target.value)}
                data-testid="input-edit-tournament-prize"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-entryFee">Entry Fee</Label>
              <Input
                id="edit-entryFee"
                placeholder="e.g., FREE, $5, ₦1000"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                data-testid="input-edit-tournament-entry-fee"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Start Date & Time</Label>
              <Input
                id="edit-startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-edit-tournament-start-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endDate">End Date & Time</Label>
              <Input
                id="edit-endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-edit-tournament-end-date"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-platform">Platform</Label>
              <Input
                id="edit-platform"
                placeholder="e.g., PC, Xbox, PlayStation"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                data-testid="input-edit-tournament-platform"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-region">Region</Label>
              <Input
                id="edit-region"
                placeholder="e.g., NA, EU, APAC"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                data-testid="input-edit-tournament-region"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} data-testid="button-save-tournament">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AwardAchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onSubmit: (data: z.infer<typeof awardAchievementSchema>) => void;
  isPending: boolean;
}

function AwardAchievementDialog({ 
  open, 
  onOpenChange, 
  form, 
  onSubmit, 
  isPending 
}: AwardAchievementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Award Achievement</DialogTitle>
          <DialogDescription>
            Recognize a player for their outstanding performance
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Player ID */}
            <FormField
              control={form.control}
              name="playerId"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabelComponent>Player ID/Username</FormLabelComponent>
                  <FormControl>
                    <Input
                      placeholder="Enter player's ID or username"
                      {...field}
                      data-testid="input-achievement-player-id"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Icon Selection */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabelComponent>Icon</FormLabelComponent>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-achievement-icon">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {achievementIconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          <span className="text-lg">{icon}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabelComponent>Title</FormLabelComponent>
                  <FormControl>
                    <Input
                      placeholder="e.g., MVP, Top Scorer"
                      {...field}
                      data-testid="input-achievement-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabelComponent>Description (Optional)</FormLabelComponent>
                  <FormControl>
                    <Input
                      placeholder="Why they earned this achievement"
                      {...field}
                      data-testid="input-achievement-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit-achievement">
                {isPending ? "Awarding..." : "Award Achievement"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
