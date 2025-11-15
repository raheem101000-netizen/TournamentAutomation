import { BottomNavigation } from "@/components/BottomNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, SlidersHorizontal, Share2, Trophy, Coins, Clock, Users, Monitor, MapPin, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

      <main className="container max-w-lg mx-auto px-4 py-4">
        <div className="space-y-6">
          {mockPosters.map((poster) => (
            <Card
              key={poster.id}
              className="overflow-hidden hover-elevate cursor-pointer"
              data-testid={`tournament-poster-${poster.id}`}
            >
              <div className="relative h-[450px] overflow-hidden">
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

                  <div className="flex flex-col gap-4 w-full max-w-sm">
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

                    <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-md p-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-white/80">
                          <Clock className="w-4 h-4" />
                          <span>Start Time</span>
                        </div>
                        <span className="font-semibold">{poster.startDate} • {poster.startTime}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-white/80">
                          <Users className="w-4 h-4" />
                          <span>Players</span>
                        </div>
                        <span className="font-semibold">{poster.participants}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-white/80">
                          <Trophy className="w-4 h-4" />
                          <span>Format</span>
                        </div>
                        <span className="font-semibold">{poster.format}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-white/80">
                          <Monitor className="w-4 h-4" />
                          <span>Platform</span>
                        </div>
                        <span className="font-semibold">{poster.platform}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-white/80">
                          <MapPin className="w-4 h-4" />
                          <span>Region</span>
                        </div>
                        <span className="font-semibold">{poster.region}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-white/80">
                          <Shield className="w-4 h-4" />
                          <span>Rank Req.</span>
                        </div>
                        <span className="font-semibold">{poster.rankReq}</span>
                      </div>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full bg-white text-black hover:bg-white/90 font-bold text-lg"
                      data-testid={`button-register-${poster.id}`}
                    >
                      Register Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
