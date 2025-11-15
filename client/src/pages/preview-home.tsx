import { useState } from "react";
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

const mockPosters = [
  {
    id: "1",
    title: "Summer Championship 2024",
    game: "Valorant",
    serverName: "ProGaming League",
    serverLogo: "🎮",
    backgroundImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop",
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
    backgroundImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop",
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
    backgroundImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=600&fit=crop",
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
    backgroundImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&h=600&fit=crop",
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
  const [detailsModal, setDetailsModal] = useState<typeof mockPosters[0] | null>(null);
  const [joinModal, setJoinModal] = useState<typeof mockPosters[0] | null>(null);

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

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Badge variant="default" className="whitespace-nowrap" data-testid="filter-all">
              All Games
            </Badge>
            <Badge variant="outline" className="whitespace-nowrap" data-testid="filter-valorant">
              Valorant
            </Badge>
            <Badge variant="outline" className="whitespace-nowrap" data-testid="filter-lol">
              League of Legends
            </Badge>
            <Badge variant="outline" className="whitespace-nowrap" data-testid="filter-csgo">
              CS:GO
            </Badge>
            <Badge variant="outline" className="whitespace-nowrap" data-testid="filter-apex">
              Apex Legends
            </Badge>
          </div>
        </div>
      </header>

      <main className="container max-w-md mx-auto px-4 py-4">
        <div className="space-y-6">
          {mockPosters.map((poster) => (
            <Card
              key={poster.id}
              className="overflow-hidden hover-elevate cursor-pointer max-w-sm mx-auto"
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

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
                  <div className="mb-4">
                    <Avatar className="w-16 h-16 mx-auto border-4 border-white/30">
                      <AvatarFallback className="text-3xl bg-black/40 backdrop-blur-sm text-white">
                        {poster.serverLogo}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="text-sm font-semibold text-white/80 mb-2 tracking-wider uppercase">
                    {poster.serverName}
                  </div>
                  
                  <h2 className="text-4xl font-black mb-3 drop-shadow-2xl leading-tight">
                    {poster.title}
                  </h2>
                  
                  <div className="text-lg font-semibold text-white/90 mb-6">
                    {poster.game}
                  </div>

                  <div className="flex flex-col gap-4 w-full max-w-xs">
                    <div className="flex items-center justify-center gap-6">
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

                    <div className="flex items-center justify-center gap-4 text-sm">
                      <Badge className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-1">
                        {poster.participants} Players
                      </Badge>
                      <span className="text-white/80">Starts {poster.startDate}</span>
                    </div>

                    <div className="flex items-center justify-center gap-6">
                      <Button 
                        size="lg" 
                        className="bg-green-600 text-white hover:bg-green-700 font-bold px-20"
                        onClick={() => setJoinModal(poster)}
                        data-testid={`button-join-${poster.id}`}
                      >
                        Join
                      </Button>
                      <Button 
                        size="icon"
                        variant="outline"
                        className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 rounded-full w-9 h-9"
                        onClick={() => setDetailsModal(poster)}
                        data-testid={`button-details-${poster.id}`}
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
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
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Go to Sign-Up Page</p>
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
