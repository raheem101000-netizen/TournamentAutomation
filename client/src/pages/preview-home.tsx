import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, SlidersHorizontal, Share2, Trophy, Coins, Clock, Users, Monitor, MapPin, Shield, Info, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Tournament } from "@shared/schema";
import { format } from "date-fns";

const mockPosters = [
  {
    id: "1",
    title: "Summer Championship 2024",
    game: "Valorant",
    serverName: "ProGaming League",
    serverLogo: "🎮",
    backgroundImage: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&h=1200&fit=crop",
    prize: "$5,000",
    entryFee: "$25",
    startDate: "Dec 20, 2024",
    startTime: "6:00 PM EST",
    participants: "64/128",
    format: "Single Elimination",
    platform: "PC",
    region: "North America",
    rankReq: "Gold+",
  },
  {
    id: "2",
    title: "Midnight Masters",
    game: "League of Legends",
    serverName: "Elite Esports",
    serverLogo: "⚔️",
    backgroundImage: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&h=1200&fit=crop",
    prize: "$10,000",
    entryFee: "Free",
    startDate: "Dec 18, 2024",
    startTime: "8:00 PM EST",
    participants: "32/64",
    format: "Best of 3",
    platform: "PC",
    region: "EU West",
    rankReq: "Platinum+",
  },
  {
    id: "3",
    title: "Winter Showdown",
    game: "CS:GO",
    serverName: "Competitive Arena",
    serverLogo: "🔫",
    backgroundImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=1200&fit=crop",
    prize: "$2,500",
    entryFee: "$10",
    startDate: "Dec 22, 2024",
    startTime: "3:00 PM EST",
    participants: "16/32",
    format: "Swiss System",
    platform: "PC",
    region: "Global",
    rankReq: "Any Rank",
  },
  {
    id: "4",
    title: "Apex Legends Cup",
    game: "Apex Legends",
    serverName: "Battle Royale Hub",
    serverLogo: "👑",
    backgroundImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=1200&fit=crop",
    prize: "$7,500",
    entryFee: "$15",
    startDate: "Dec 25, 2024",
    startTime: "5:00 PM EST",
    participants: "48/96",
    format: "Battle Royale",
    platform: "Cross-Platform",
    region: "Americas",
    rankReq: "Diamond+",
  },
];

export default function PreviewHome() {
  const { toast } = useToast();
  const [detailsModal, setDetailsModal] = useState<typeof mockPosters[0] | null>(null);
  const [joinModal, setJoinModal] = useState<typeof mockPosters[0] | null>(null);

  const { data: tournaments, isLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  const registerTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      return await apiRequest('POST', `/api/tournaments/${tournamentId}/registrations`, {
        teamName: "Demo Team", // Would come from user input
        contactEmail: "demo@example.com",
        participantNames: ["Player 1", "Player 2"],
      });
    },
    onSuccess: () => {
      toast({
        title: "Successfully registered!",
        description: "You've joined the tournament.",
      });
      setJoinModal(null);
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const tournamentPosters = (tournaments || []).map((t) => ({
    id: t.id,
    title: t.name,
    game: t.game || "Tournament",
    serverName: t.organizerName || "Gaming Server",
    serverLogo: t.game?.charAt(0) || "🎮",
    backgroundImage: t.imageUrl || "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&h=1200&fit=crop",
    prize: t.prizeReward || "TBD",
    entryFee: t.entryFee ? `$${t.entryFee}` : "Free",
    startDate: t.startDate ? format(new Date(t.startDate), "MMM dd, yyyy") : "TBD",
    startTime: t.startDate ? format(new Date(t.startDate), "h:mm a") : "TBD",
    participants: `${t.totalTeams || 0}/${t.totalTeams || 0}`,
    format: t.format === "round_robin" ? "Round Robin" : t.format === "single_elimination" ? "Single Elimination" : "Swiss System",
    platform: "PC",
    region: "Global",
    rankReq: "Any Rank",
  }));

  const displayPosters = tournamentPosters.length > 0 ? tournamentPosters : mockPosters;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-lg mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Tournaments</h1>
            <Button size="icon" variant="ghost" data-testid="button-notifications">
              <Trophy className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tournaments..."
                className="pl-9"
                data-testid="input-search-tournaments"
              />
            </div>
            <Button size="icon" variant="outline" data-testid="button-filters">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
            <Badge variant="default" className="whitespace-nowrap text-xs px-3" data-testid="filter-all">
              All Games
            </Badge>
            <Badge variant="outline" className="whitespace-nowrap text-xs px-3" data-testid="filter-valorant">
              Valorant
            </Badge>
            <Badge variant="outline" className="whitespace-nowrap text-xs px-3" data-testid="filter-lol">
              League of Legends
            </Badge>
            <Badge variant="outline" className="whitespace-nowrap text-xs px-3" data-testid="filter-csgo">
              CS:GO
            </Badge>
            <Badge variant="outline" className="whitespace-nowrap text-xs px-3" data-testid="filter-apex">
              Apex Legends
            </Badge>
          </div>
        </div>
      </header>

      <main className="px-3 py-4">
        <div className="space-y-6 max-w-sm mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading tournaments...</p>
            </div>
          ) : displayPosters.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground font-semibold">No tournaments available</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for upcoming events!</p>
            </div>
          ) : (
            displayPosters.map((poster) => (
            <Card
              key={poster.id}
              className="overflow-hidden hover-elevate cursor-pointer w-full"
              data-testid={`tournament-poster-${poster.id}`}
            >
              <div className="relative h-[600px] overflow-hidden">
                <img
                  src={poster.backgroundImage}
                  alt={poster.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
                
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-black/50"
                  data-testid={`button-share-${poster.id}`}
                >
                  <Share2 className="w-4 h-4" />
                </Button>

                <div className="absolute inset-0 flex flex-col justify-between text-center text-white px-4 py-8">
                  <button
                    className="flex flex-col items-center gap-1.5 cursor-pointer hover-elevate active-elevate-2 p-2 rounded-lg mx-auto"
                    onClick={() => alert('Navigate to server')}
                    data-testid={`button-server-${poster.id}`}
                  >
                    <Avatar className="w-16 h-16 border-4 border-white/30">
                      <AvatarFallback className="text-2xl bg-black/40 backdrop-blur-sm text-white">
                        {poster.serverLogo}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-xs font-semibold text-white/90 tracking-wider uppercase">
                      {poster.serverName}
                    </div>
                  </button>

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-black mb-3 drop-shadow-2xl leading-tight">
                        {poster.title}
                      </h2>
                      
                      <div className="text-lg font-semibold text-white/90">
                        {poster.game}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-10">
                      <div className="flex flex-col items-center">
                        <Trophy className="w-6 h-6 mb-1" />
                        <span className="text-2xl font-bold">{poster.prize}</span>
                        <span className="text-xs text-white/70">Prize Pool</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Coins className="w-6 h-6 mb-1" />
                        <span className="text-2xl font-bold">{poster.entryFee}</span>
                        <span className="text-xs text-white/70">Entry Fee</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Badge className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-1.5 mx-auto">
                        {poster.participants} Players
                      </Badge>
                      <span className="text-white/80 text-sm">Starts {poster.startDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      size="lg" 
                      className="bg-green-600 text-white hover:bg-green-700 font-bold px-6 flex-1"
                      onClick={() => setJoinModal(poster)}
                      data-testid={`button-join-${poster.id}`}
                    >
                      Join Tournament
                    </Button>
                    <Button 
                      size="icon"
                      variant="outline"
                      className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 rounded-full shrink-0"
                      onClick={() => setDetailsModal(poster)}
                      data-testid={`button-details-${poster.id}`}
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
          )}
        </div>
      </main>

      <BottomNavigation />

      {/* Details Modal */}
      <Dialog open={!!detailsModal} onOpenChange={() => setDetailsModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">{detailsModal?.title}</DialogTitle>
            <DialogDescription>{detailsModal?.game}</DialogDescription>
          </DialogHeader>
          
          {detailsModal && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="text-2xl">{detailsModal.serverLogo}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{detailsModal.serverName}</p>
                  <p className="text-sm text-muted-foreground">Tournament Host</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Prize Pool</p>
                  <p className="text-xl font-bold text-green-600">{detailsModal.prize}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Entry Fee</p>
                  <p className="text-xl font-bold">{detailsModal.entryFee}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Start Time</span>
                  </div>
                  <span className="font-semibold text-sm">{detailsModal.startDate} • {detailsModal.startTime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Players</span>
                  </div>
                  <span className="font-semibold text-sm">{detailsModal.participants}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">Format</span>
                  </div>
                  <span className="font-semibold text-sm">{detailsModal.format}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Monitor className="w-4 h-4" />
                    <span className="text-sm">Platform</span>
                  </div>
                  <span className="font-semibold text-sm">{detailsModal.platform}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Region</span>
                  </div>
                  <span className="font-semibold text-sm">{detailsModal.region}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Rank Requirement</span>
                  </div>
                  <span className="font-semibold text-sm">{detailsModal.rankReq}</span>
                </div>
              </div>

              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                onClick={() => {
                  setDetailsModal(null);
                  setJoinModal(detailsModal);
                }}
                data-testid="button-join-from-details"
              >
                Join Tournament
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Join Options Modal */}
      <Dialog open={!!joinModal} onOpenChange={() => setJoinModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join Tournament</DialogTitle>
            <DialogDescription>
              Choose how you'd like to join {joinModal?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <Button
              className="w-full justify-between h-auto py-4 px-4"
              variant="outline"
              data-testid="button-join-server"
              onClick={() => {
                if (joinModal?.id) {
                  registerTournamentMutation.mutate(joinModal.id);
                }
              }}
              disabled={registerTournamentMutation.isPending}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Join Server & Tournament</p>
                  <p className="text-xs text-muted-foreground">
                    Join {joinModal?.serverName} and register
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </Button>

            <Button
              className="w-full justify-between h-auto py-4 px-4"
              variant="outline"
              data-testid="button-signup-page"
              onClick={() => {
                if (joinModal?.id) {
                  registerTournamentMutation.mutate(joinModal.id);
                }
              }}
              disabled={registerTournamentMutation.isPending}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">{registerTournamentMutation.isPending ? "Registering..." : "Go to Sign-Up Page"}</p>
                  <p className="text-xs text-muted-foreground">
                    View full tournament details & register
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
