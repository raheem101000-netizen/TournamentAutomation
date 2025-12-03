import { useQuery, useMutation } from "@tanstack/react-query";
import { Trophy, Plus, ArrowLeft, Calendar, Users as UsersIcon, Medal, Star, Award, Target, Shield, Zap, ChevronDown, Check } from "lucide-react";
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
import RichMatchChat from "@/components/RichMatchChat";
import UserProfileModal from "@/components/UserProfileModal";
import ImageUploadField from "@/components/ImageUploadField";
import RegistrationFormBuilder from "@/modules/registration/RegistrationFormBuilder";
import type { Tournament, InsertTournament, Team, Match } from "@shared/schema";
import type { RegistrationFormConfig } from "@/modules/registration/types";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Predefined achievements with fixed icon-title pairs
const predefinedAchievements = [
  { id: "champion", icon: Trophy, color: "text-amber-500", title: "Champion", isEditable: false },
  { id: "runner-up", icon: Medal, color: "text-slate-300", title: "Runner Up", isEditable: false },
  { id: "third-place", icon: Medal, color: "text-amber-700", title: "Third Place", isEditable: false },
  { id: "mvp", icon: Award, color: "text-purple-500", title: "MVP", isEditable: false },
  { id: "top-scorer", icon: Target, color: "text-red-500", title: "", isEditable: true },
  { id: "best-defense", icon: Shield, color: "text-green-500", title: "", isEditable: true },
  { id: "rising-star", icon: Zap, color: "text-yellow-500", title: "", isEditable: true },
];

const awardAchievementSchema = z.object({
  playerId: z.string().min(1, "Please enter a player ID"),
  achievementId: z.string().min(1, "Please select an achievement"),
  customTitle: z.string().max(50).optional(),
  description: z.string().max(200).optional(),
  reward: z.string().min(1, "Reward is required").max(300),
  game: z.string().min(1, "Game is required").max(100),
  region: z.string().min(1, "Region is required").max(100),
});

interface TournamentDashboardChannelProps {
  serverId: string;
}

export default function TournamentDashboardChannel({ serverId }: TournamentDashboardChannelProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAwardAchievementDialogOpen, setIsAwardAchievementDialogOpen] = useState(false);
  const [isCreateMatchDialogOpen, setIsCreateMatchDialogOpen] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedTeam1Id, setSelectedTeam1Id] = useState<string | null>(null);
  const [selectedTeam2Id, setSelectedTeam2Id] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showMatchChat, setShowMatchChat] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { toast} = useToast();
  const { user } = useAuth();

  const achievementForm = useForm({
    resolver: zodResolver(awardAchievementSchema),
    defaultValues: {
      playerId: "",
      achievementId: "champion",
      customTitle: "",
      description: "",
      reward: "",
      game: "",
      region: "",
    },
  });

  const { data: allTournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: InsertTournament & { teamNames: string[]; registrationConfig?: RegistrationFormConfig; serverId?: string }) => {
      console.log('[MUTATION-CREATE] Tournament data to send:', {
        name: data.name,
        game: data.game,
        format: data.format,
        hasRegistrationConfig: !!data.registrationConfig,
        registrationConfigSteps: data.registrationConfig?.steps?.length || 0,
        registrationConfigData: JSON.stringify(data.registrationConfig, null, 2)
      });
      const tournament = await apiRequest('POST', '/api/tournaments', data);
      
      // Auto-generate fixtures based on format
      if (tournament && data.teamNames.length > 0) {
        try {
          await apiRequest('POST', `/api/tournaments/${tournament.id}/generate-fixtures`, {
            format: data.format,
            teamNames: data.teamNames,
          });
          console.log('[MUTATION-CREATE] Fixtures auto-generated for tournament:', tournament.id);
        } catch (fixtureError) {
          console.warn('[MUTATION-CREATE] Failed to auto-generate fixtures:', fixtureError);
        }
      }
      
      return tournament;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      toast({
        title: "Tournament created",
        description: "Your tournament has been created successfully with auto-generated fixtures.",
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

  const { data: registrationConfig } = useQuery<RegistrationFormConfig>({
    queryKey: [`/api/tournaments/${selectedTournamentId}/registration/config`],
    enabled: !!selectedTournamentId,
  });

  const { data: registrations = [] } = useQuery<any[]>({
    queryKey: [`/api/tournaments/${selectedTournamentId}/registrations`],
    enabled: !!selectedTournamentId,
  });

  const updateRegistrationConfigMutation = useMutation({
    mutationFn: async (config: RegistrationFormConfig) => {
      console.log('[MUTATION] Starting save for tournament:', selectedTournamentId);
      console.log('[MUTATION] Config payload:', JSON.stringify(config, null, 2));
      try {
        const result = await apiRequest('PUT', `/api/tournaments/${selectedTournamentId}/registration/config`, config);
        console.log('[MUTATION] Backend response:', result);
        return result;
      } catch (err) {
        console.error('[MUTATION] API call failed:', err);
        throw err;
      }
    },
    onSuccess: () => {
      console.log('[MUTATION] Success - invalidating cache');
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${selectedTournamentId}/registration/config`] });
      toast({
        title: "Registration saved",
        description: "Registration steps updated successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('[MUTATION] Error callback:', error);
      toast({
        title: "Error saving registration",
        description: error.message,
        variant: "destructive",
      });
    },
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

  const createCustomMatchMutation = useMutation({
    mutationFn: async ({ team1Id, team2Id }: { team1Id: string; team2Id: string }) => {
      return apiRequest('POST', `/api/tournaments/${selectedTournamentId}/matches/custom`, {
        team1Id,
        team2Id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${selectedTournamentId}/matches`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${selectedTournamentId}/teams`] });
      toast({
        title: "Match created",
        description: "New match has been created successfully.",
      });
      setSelectedTeam1Id(null);
      setSelectedTeam2Id(null);
      setIsCreateMatchDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const selectWinnerMutation = useMutation({
    mutationFn: async ({ matchId, winnerId }: { matchId: string; winnerId: string }) => {
      return apiRequest('POST', `/api/matches/${matchId}/winner`, {
        winnerId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${selectedTournamentId}/matches`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${selectedTournamentId}/teams`] });
      toast({
        title: "Winner recorded",
        description: "Match result has been saved. Use the Participants tab to manually eliminate teams.",
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
      // Look up the achievement details
      const achievement = predefinedAchievements.find(a => a.id === data.achievementId);
      if (!achievement) {
        throw new Error("Invalid achievement selected");
      }
      
      // Use custom title if editable and provided, otherwise use default
      const finalTitle = achievement.isEditable && data.customTitle ? data.customTitle : achievement.title;
      
      return apiRequest("POST", "/api/achievements", {
        userId: data.playerId,
        serverId: serverId,
        title: finalTitle,
        description: data.description || "",
        reward: data.reward || "",
        game: data.game || "",
        region: data.region || "",
        type: "solo",
        iconUrl: achievement.id,
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
    setActiveTab("overview");
  };

  const handleBackToList = () => {
    setSelectedTournamentId(null);
    setActiveTab("overview");
  };

  const handleMatchClick = (matchId: string) => {
    setSelectedMatchId(matchId);
    setShowMatchChat(true);
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto inline-flex flex-row flex-nowrap bg-transparent p-0 gap-2">
            <TabsTrigger value="overview" className="whitespace-nowrap rounded-md border border-border px-3 py-2">Overview</TabsTrigger>
            <TabsTrigger value="bracket" className="whitespace-nowrap rounded-md border border-border px-3 py-2">Bracket</TabsTrigger>
            <TabsTrigger value="standings" className="whitespace-nowrap rounded-md border border-border px-3 py-2">Standings</TabsTrigger>
            <TabsTrigger value="match-chat" className="whitespace-nowrap rounded-md border border-border px-3 py-2">Match Chat</TabsTrigger>
            <TabsTrigger value="registrations" className="whitespace-nowrap rounded-md border border-border px-3 py-2">Registrations</TabsTrigger>
            <TabsTrigger value="participants" className="whitespace-nowrap rounded-md border border-border px-3 py-2">Participants</TabsTrigger>
            <TabsTrigger value="teams" className="whitespace-nowrap rounded-md border border-border px-3 py-2">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Format</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base font-bold capitalize">
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
                  <div className="text-base font-bold">{selectedTournament.totalTeams === -1 ? "Unlimited" : selectedTournament.totalTeams}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prize Pool</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-base font-bold">{selectedTournament.prizeReward || 'TBD'}</div>
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
                    <div className="text-sm font-semibold">{selectedTournament.platform}</div>
                  </CardContent>
                </Card>
              )}
              {selectedTournament.region && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Region</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-semibold">{selectedTournament.region}</div>
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
                  <p className="text-sm">
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

          <TabsContent value="match-chat" className="space-y-4">
            {selectedTournamentMatches.length > 0 ? (
              showMatchChat && selectedMatch ? (
                // Full match chat view with back button
                <div className="space-y-3 min-h-[600px] flex flex-col">
                  <div className="flex items-center gap-3 border-b pb-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowMatchChat(false)}
                      data-testid="button-back-to-fixtures"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <h3 className="font-semibold">{getTeamById(selectedMatch.team1Id)?.name || 'Team 1'} vs {getTeamById(selectedMatch.team2Id)?.name || 'Team 2'}</h3>
                      <p className="text-xs text-muted-foreground">Round {selectedMatch.round} • Status: {selectedMatch.status}{selectedMatch.winnerId ? ` • Winner: ${getTeamById(selectedMatch.winnerId)?.name || 'Unknown'}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden min-h-0">
                    {selectedMatch && (
                      <RichMatchChat 
                        matchId={selectedMatch.id}
                        winnerId={selectedMatch.winnerId}
                        tournamentId={selectedTournamentId}
                        team1Name={getTeamById(selectedMatch.team1Id)?.name || 'Team 1'}
                        team2Name={getTeamById(selectedMatch.team2Id)?.name || 'Team 2'}
                        team1Id={selectedMatch.team1Id || ''}
                        team2Id={selectedMatch.team2Id || ''}
                      />
                    )}
                  </div>
                </div>
              ) : (
                // Grid of match fixture cards
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Click a fixture to view chat</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedTournamentMatches.map((match) => {
                      const team1 = getTeamById(match.team1Id);
                      const team2 = getTeamById(match.team2Id);
                      return (
                        <button
                          key={match.id}
                          onClick={() => {
                            handleMatchClick(match.id);
                            setShowMatchChat(true);
                          }}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedMatchId === match.id
                              ? 'bg-accent text-accent-foreground border-accent'
                              : 'bg-card border-border hover:border-primary/50 hover-elevate'
                          }`}
                          data-testid={`button-match-${match.id}`}
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="font-semibold text-sm truncate">{team1?.name || 'Team 1'}</div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">vs</div>
                            <div className="font-semibold text-sm truncate">{team2?.name || 'Team 2'}</div>
                          </div>
                          <div className="text-xs text-muted-foreground text-center">Round {match.round}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">
                  No matches scheduled yet. Matches will be auto-generated when teams register.
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


          <TabsContent value="registrations">
            {registrations.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {registrations.length} registration{registrations.length !== 1 ? 's' : ''}
                </p>
                <div className="space-y-2">
                  {registrations.map((reg) => {
                    // Get header field value from responses or use teamName as fallback
                    let headerValue = reg.teamName;
                    if (registrationConfig?.headerFieldId && reg.responses) {
                      const headerResponse = reg.responses.find((r: any) => r.fieldId === registrationConfig.headerFieldId);
                      if (headerResponse) {
                        headerValue = headerResponse.value;
                      }
                    }
                    
                    return (
                      <Card key={reg.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                          <div className="flex items-center gap-3 flex-1">
                            {reg.userAvatar && (
                              <img 
                                src={reg.userAvatar} 
                                alt={reg.userUsername}
                                className="w-10 h-10 rounded-full object-cover"
                                data-testid={`img-avatar-${reg.userId}`}
                              />
                            )}
                            <div className="flex-1">
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-base font-semibold"
                                onClick={() => {
                                  // Navigate to user profile
                                  window.location.href = `/profile/${reg.userId}`;
                                }}
                                data-testid={`button-view-profile-${reg.userId}`}
                              >
                                @{reg.userUsername}
                              </Button>
                              <p className="text-sm text-muted-foreground">
                                {headerValue}
                              </p>
                            </div>
                          </div>
                          <Badge variant={
                            reg.status === 'approved' ? 'default' : 
                            reg.status === 'submitted' ? 'secondary' : 
                            'outline'
                          }>
                            {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                          </Badge>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">
                  No registrations yet
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="participants">
            {selectedTournamentTeams.length > 0 ? (
              <div className="space-y-4">
                <Button 
                  onClick={() => setIsCreateMatchDialogOpen(true)} 
                  data-testid="button-create-custom-match"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Match
                </Button>
                <p className="text-sm text-muted-foreground">
                  {selectedTournamentTeams.filter(t => !t.isRemoved).length} active participants
                </p>
                <div className="space-y-2">
                  {selectedTournamentTeams.map((team) => (
                    <Card key={team.id} className={team.isRemoved ? "opacity-50" : ""}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <div>
                          <CardTitle className="text-base">{team.name}</CardTitle>
                          {team.isRemoved && (
                            <Badge variant="destructive" className="mt-1">Eliminated</Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{team.wins}W</Badge>
                          <Badge variant="outline">{team.losses}L</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 flex-wrap">
                          {!team.isRemoved && (
                            <>
                              <Button 
                                size="sm" 
                                variant={selectedTeam1Id === team.id ? "default" : "outline"}
                                onClick={() => setSelectedTeam1Id(selectedTeam1Id === team.id ? null : team.id)}
                                data-testid={`button-select-team1-${team.id}`}
                              >
                                {selectedTeam1Id === team.id ? <Check className="h-4 w-4 mr-1" /> : ""}
                                Select 1
                              </Button>
                              <Button 
                                size="sm" 
                                variant={selectedTeam2Id === team.id ? "default" : "outline"}
                                onClick={() => setSelectedTeam2Id(selectedTeam2Id === team.id ? null : team.id)}
                                data-testid={`button-select-team2-${team.id}`}
                              >
                                {selectedTeam2Id === team.id ? <Check className="h-4 w-4 mr-1" /> : ""}
                                Select 2
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  // Update team to set isRemoved
                                  apiRequest('PATCH', `/api/teams/${team.id}`, {
                                    isRemoved: 1,
                                  }).then(() => {
                                    queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${selectedTournamentId}/teams`] });
                                    toast({
                                      title: "Team eliminated",
                                      description: `${team.name} has been eliminated from the tournament.`,
                                    });
                                  }).catch((error) => {
                                    toast({
                                      title: "Error",
                                      description: error.message,
                                      variant: "destructive",
                                    });
                                  });
                                }}
                                data-testid={`button-eliminate-${team.id}`}
                              >
                                Eliminate
                              </Button>
                            </>
                          )}
                          {team.isRemoved && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // Restore team
                                apiRequest('PATCH', `/api/teams/${team.id}`, {
                                  isRemoved: 0,
                                }).then(() => {
                                  queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${selectedTournamentId}/teams`] });
                                  toast({
                                    title: "Team restored",
                                    description: `${team.name} has been restored to the tournament.`,
                                  });
                                }).catch((error) => {
                                  toast({
                                    title: "Error",
                                    description: error.message,
                                    variant: "destructive",
                                  });
                                });
                              }}
                              data-testid={`button-restore-${team.id}`}
                            >
                              Restore
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">
                  No teams registered yet
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

        <Dialog open={isCreateMatchDialogOpen} onOpenChange={setIsCreateMatchDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Match</DialogTitle>
              <DialogDescription>
                Select two participants to create a new match
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Team 1</Label>
                <Select value={selectedTeam1Id || ""} onValueChange={setSelectedTeam1Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team 1" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTournamentTeams
                      .filter(t => !t.isRemoved && t.id !== selectedTeam2Id)
                      .map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Team 2</Label>
                <Select value={selectedTeam2Id || ""} onValueChange={setSelectedTeam2Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team 2" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTournamentTeams
                      .filter(t => !t.isRemoved && t.id !== selectedTeam1Id)
                      .map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateMatchDialogOpen(false)}
                data-testid="button-cancel-create-match"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  if (selectedTeam1Id && selectedTeam2Id) {
                    createCustomMatchMutation.mutate({ team1Id: selectedTeam1Id, team2Id: selectedTeam2Id });
                  }
                }}
                disabled={!selectedTeam1Id || !selectedTeam2Id || createCustomMatchMutation.isPending}
                data-testid="button-confirm-create-match"
              >
                {createCustomMatchMutation.isPending ? "Creating..." : "Create Match"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
        <div className="flex flex-col gap-2">
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
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="upcoming" data-testid="tab-upcoming">
            Upcoming ({upcomingTournaments.length})
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
        onSubmit={(data) => {
          console.log('[DASHBOARD] CreateTournamentDialog onSubmit called with:', {
            name: data.name,
            format: data.format,
            hasRegistrationConfig: !!data.registrationConfig,
            registrationSteps: data.registrationConfig?.steps?.length || 0
          });
          createTournamentMutation.mutate({ ...data, serverId });
        }}
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

      <UserProfileModal 
        userId={selectedProfileId} 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
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

            {/* Achievement Selection */}
            <FormField
              control={form.control}
              name="achievementId"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabelComponent>Achievement</FormLabelComponent>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-achievement">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {predefinedAchievements.map(({ id, icon: IconComponent, color, title }) => {
                        return (
                          <SelectItem key={id} value={id}>
                            <div className="flex items-center gap-2">
                              <IconComponent className={`w-4 h-4 ${color}`} />
                              <span>{title}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Title for Editable Achievements */}
            {(() => {
              const selectedAchievement = predefinedAchievements.find(
                a => a.id === form.watch("achievementId")
              );
              return selectedAchievement?.isEditable ? (
                <FormField
                  control={form.control}
                  name="customTitle"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabelComponent>Achievement Title</FormLabelComponent>
                      <FormControl>
                        <Input
                          placeholder="e.g., Top Scorer, Best Defender, Rising Star, or any custom name"
                          {...field}
                          data-testid="input-custom-achievement-title"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a custom title for this achievement
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null;
            })()}

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

            {/* Reward */}
            <FormField
              control={form.control}
              name="reward"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabelComponent>Reward</FormLabelComponent>
                  <FormControl>
                    <Input
                      placeholder="e.g., $500 Prize Pool, Trophy, In-game rewards"
                      {...field}
                      data-testid="input-achievement-reward"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Game */}
            <FormField
              control={form.control}
              name="game"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabelComponent>Game</FormLabelComponent>
                  <FormControl>
                    <Input
                      placeholder="e.g., Valorant, Counter-Strike 2, League of Legends"
                      {...field}
                      data-testid="input-achievement-game"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Region */}
            <FormField
              control={form.control}
              name="region"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabelComponent>Region</FormLabelComponent>
                  <FormControl>
                    <Input
                      placeholder="e.g., NA, EU, APAC, Global"
                      {...field}
                      data-testid="input-achievement-region"
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
