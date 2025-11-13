import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { Tournament } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Calendar, Users, DollarSign, Trophy, Loader2, X, Share2, LogIn, ClipboardList, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { RegistrationStore } from '../../../lib/stores/registrationStore';
import { MessagingStore } from '../../../lib/stores/messagingStore';
import { ProfileStore } from '../../../lib/stores/profileStore';
import type { ChatThread, UserProfile } from '@shared/types';

interface ThreadOption {
  thread: ChatThread;
  displayName: string;
}

export default function DiscoveryPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [gameFilter, setGameFilter] = useState<string>('all');
  const [prizeFilter, setPrizeFilter] = useState<string>('all');
  const [registeredTournamentIds, setRegisteredTournamentIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [availableThreads, setAvailableThreads] = useState<ThreadOption[]>([]);

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = await ProfileStore.getCurrentUser();
    if (user) {
      setCurrentUserId(user.id);
      
      // Load registered tournaments
      const registrations = await RegistrationStore.getUserRegistrations(user.id);
      setRegisteredTournamentIds(registrations.map(r => r.tournamentId));

      // Seed mock registration if needed
      await RegistrationStore.seedMockData(user.id);
      const updatedRegs = await RegistrationStore.getUserRegistrations(user.id);
      setRegisteredTournamentIds(updatedRegs.map(r => r.tournamentId));

      // Load threads for sharing
      const threads = await MessagingStore.getAllThreads(user.id);
      const threadOptions: ThreadOption[] = await Promise.all(
        threads.map(async (thread) => {
          let displayName = 'Unknown';
          if (thread.type === 'group') {
            displayName = thread.name || 'Group Chat';
          } else {
            const otherUserId = thread.participantIds.find(id => id !== user.id);
            if (otherUserId) {
              const otherUser = await ProfileStore.getProfileById(otherUserId);
              if (otherUser) {
                displayName = otherUser.displayName;
              }
            }
          }
          return { thread, displayName };
        })
      );
      setAvailableThreads(threadOptions);
    }
  };

  const handleJoinClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setShowJoinDialog(true);
  };

  const handleDetailsClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setShowDetailsDialog(true);
  };

  const handleShareClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setShowShareDialog(true);
  };

  const handleJoinServerNow = () => {
    if (selectedTournament) {
      navigate(`/tournament/${selectedTournament.id}`);
      setShowJoinDialog(false);
      toast({
        title: "Joined Server!",
        description: `You've entered ${selectedTournament.name}. Explore the community!`,
      });
    }
  };

  const handleCompleteRegistration = () => {
    if (selectedTournament) {
      setShowJoinDialog(false);
      navigate(`/register/${selectedTournament.id}`);
    }
  };

  const handleShareToThread = async (threadId: string) => {
    if (!selectedTournament || !currentUserId) return;

    try {
      await MessagingStore.forwardTournamentToThread(
        threadId,
        currentUserId,
        selectedTournament.id,
        selectedTournament.name
      );
      
      toast({
        title: "Shared!",
        description: `${selectedTournament.name} has been shared to the chat`,
      });
      setShowShareDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share tournament",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Tournament['status']) => {
    const variants = {
      upcoming: { variant: 'default' as const, label: 'Upcoming' },
      in_progress: { variant: 'default' as const, label: 'Live' },
      completed: { variant: 'secondary' as const, label: 'Completed' },
    };
    const config = variants[status];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getFormatLabel = (format: Tournament['format']) => {
    const labels = {
      single_elimination: 'Single Elimination',
      round_robin: 'Round Robin',
      swiss: 'Swiss',
    };
    return labels[format];
  };

  // Filter tournaments
  const filteredTournaments = tournaments.filter(t => {
    const matchesGame = gameFilter === 'all' || t.game === gameFilter;
    const matchesPrize = prizeFilter === 'all' || 
      (prizeFilter === 'prize' && t.prizeReward) ||
      (prizeFilter === 'no-prize' && !t.prizeReward);
    return matchesGame && matchesPrize;
  });

  const registeredTournaments = tournaments.filter(t => 
    registeredTournamentIds.includes(t.id)
  );

  const uniqueGames = Array.from(new Set(tournaments.map(t => t.game).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const TournamentCard = ({ tournament }: { tournament: Tournament }) => (
    <Card
      key={tournament.id}
      className="hover-elevate overflow-hidden"
      data-testid={`card-tournament-${tournament.id}`}
    >
      {tournament.imageUrl && (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={tournament.imageUrl}
            alt={tournament.name}
            className="w-full h-full object-cover"
            data-testid={`img-tournament-${tournament.id}`}
          />
          <div className="absolute top-4 right-4">
            {getStatusBadge(tournament.status)}
          </div>
        </div>
      )}
      <CardHeader>
        <div className="space-y-2">
          <CardTitle data-testid={`text-tournament-name-${tournament.id}`}>
            {tournament.name}
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {tournament.game && <Badge variant="outline">{tournament.game}</Badge>}
            <Badge variant="outline">{getFormatLabel(tournament.format)}</Badge>
            {!tournament.imageUrl && <div className="absolute top-4 right-4">{getStatusBadge(tournament.status)}</div>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {tournament.totalTeams} teams
            </span>
          </div>
          {tournament.prizeReward && (
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{tournament.prizeReward}</span>
            </div>
          )}
          {tournament.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(tournament.startDate), { addSuffix: true })}
              </span>
            </div>
          )}
          {tournament.entryFee !== null && tournament.entryFee !== undefined && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {tournament.entryFee > 0 ? `${tournament.entryFee} coins` : 'Free'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2">
          {tournament.organizerName && (
            <span className="text-sm text-muted-foreground">
              by {tournament.organizerName}
            </span>
          )}
          <div className="flex gap-2 flex-wrap">
            <Button 
              size="sm" 
              variant="ghost"
              data-testid={`button-share-${tournament.id}`}
              onClick={() => handleShareClick(tournament)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            {tournament.status === 'upcoming' && (
              <Button 
                size="sm" 
                data-testid={`button-join-${tournament.id}`}
                onClick={() => handleJoinClick(tournament)}
              >
                Join
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              data-testid={`button-view-${tournament.id}`}
              onClick={() => handleDetailsClick(tournament)}
            >
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Search className="h-8 w-8" />
            Discover Tournaments
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={gameFilter} onValueChange={setGameFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-game-filter">
                <SelectValue placeholder="All Games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                {uniqueGames.map(game => (
                  <SelectItem key={game} value={game!}>{game}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={prizeFilter} onValueChange={setPrizeFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-prize-filter">
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="prize">Prize Events</SelectItem>
                <SelectItem value="no-prize">Non-Prize Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all" data-testid="tab-all-events">
              All Events
            </TabsTrigger>
            <TabsTrigger value="registered" data-testid="tab-registered-events">
              My Registered Events ({registeredTournaments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {filteredTournaments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground" data-testid="text-no-tournaments">
                    No tournaments match your filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="registered" className="space-y-6">
            {registeredTournaments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    You haven't registered for any tournaments yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registeredTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Join Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-join">
          <DialogHeader>
            <DialogTitle>Join {selectedTournament?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Choose how you'd like to join this tournament:
            </p>
            <div className="space-y-3">
              <Button
                className="w-full justify-start gap-3"
                size="lg"
                onClick={handleJoinServerNow}
                data-testid="button-join-server-now"
              >
                <LogIn className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Join Server Now</div>
                  <div className="text-xs text-muted-foreground">
                    Enter immediately and explore the community
                  </div>
                </div>
              </Button>
              <Button
                className="w-full justify-start gap-3"
                variant="outline"
                size="lg"
                onClick={handleCompleteRegistration}
                data-testid="button-complete-registration"
              >
                <ClipboardList className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Complete Registration First</div>
                  <div className="text-xs text-muted-foreground">
                    Fill in team info and payment, then enter
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-2xl" data-testid="dialog-details">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setShowDetailsDialog(false)}
            data-testid="button-close-details"
          >
            <X className="h-4 w-4" />
          </Button>
          {selectedTournament && (
            <div className="space-y-6 pt-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedTournament.name}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {getStatusBadge(selectedTournament.status)}
                  {selectedTournament.game && <Badge variant="outline">{selectedTournament.game}</Badge>}
                  <Badge variant="outline">{getFormatLabel(selectedTournament.format)}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Teams</p>
                  <p className="text-lg font-semibold">{selectedTournament.totalTeams}</p>
                </div>
                {selectedTournament.prizeReward && (
                  <div>
                    <p className="text-sm text-muted-foreground">Prize</p>
                    <p className="text-lg font-semibold">{selectedTournament.prizeReward}</p>
                  </div>
                )}
                {selectedTournament.entryFee !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Entry Fee</p>
                    <p className="text-lg font-semibold">
                      {selectedTournament.entryFee > 0 ? `$${selectedTournament.entryFee}` : 'Free'}
                    </p>
                  </div>
                )}
                {selectedTournament.organizerName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Organizer</p>
                    <p className="text-lg font-semibold">{selectedTournament.organizerName}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Format</p>
                <p className="text-base">{getFormatLabel(selectedTournament.format)}</p>
              </div>

              {selectedTournament.startDate && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Start Date</p>
                  <p className="text-base">
                    {formatDistanceToNow(new Date(selectedTournament.startDate), { addSuffix: true })}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-share">
          <DialogHeader>
            <DialogTitle>Share Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Share "{selectedTournament?.name}" to:
            </p>
            {availableThreads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No conversations available. Start a chat first!
              </p>
            ) : (
              <ScrollArea className="h-60">
                <div className="space-y-2">
                  {availableThreads.map(({ thread, displayName }) => (
                    <Button
                      key={thread.id}
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => handleShareToThread(thread.id)}
                      data-testid={`button-share-thread-${thread.id}`}
                    >
                      {thread.type === 'group' ? <Users className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                      {displayName}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
