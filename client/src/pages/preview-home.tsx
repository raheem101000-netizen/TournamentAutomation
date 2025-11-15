import { BottomNavigation } from "@/components/BottomNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, SlidersHorizontal, Share2, Trophy, Coins } from "lucide-react";
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
    participants: "64/128",
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
    participants: "32/64",
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
    participants: "16/32",
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
    participants: "48/96",
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
        <div className="space-y-4">
          {mockPosters.map((poster) => (
            <Card
              key={poster.id}
              className="overflow-hidden hover-elevate cursor-pointer"
              data-testid={`tournament-poster-${poster.id}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={poster.backgroundImage}
                  alt={poster.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Avatar className="w-8 h-8 border-2 border-white/20">
                    <AvatarFallback className="text-lg">{poster.serverLogo}</AvatarFallback>
                  </Avatar>
                  <div className="text-white text-sm font-medium drop-shadow-lg">
                    {poster.serverName}
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm border border-white/20 text-white hover:bg-black/40"
                  data-testid={`button-share-${poster.id}`}
                >
                  <Share2 className="w-4 h-4" />
                </Button>

                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold mb-1 drop-shadow-lg">
                    {poster.title}
                  </h3>
                  <p className="text-sm text-white/90 drop-shadow-lg mb-3">
                    {poster.game}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm font-semibold">{poster.prize}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        <span className="text-sm font-semibold">{poster.entryFee}</span>
                      </div>
                    </div>
                    <Badge className="bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                      {poster.participants}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Starts {poster.startDate}
                </span>
                <Button size="sm" data-testid={`button-register-${poster.id}`}>
                  Register
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
