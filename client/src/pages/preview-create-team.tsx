import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, X, Plus, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const mockFollowers = [
  { username: "NinjaKid", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ninja" },
  { username: "SniperElite", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sniper" },
  { username: "FlashBang", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=flash" },
  { username: "TacticalG", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tactical" },
  { username: "QuickShot", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=quick" },
  { username: "CalmPlay", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=calm" },
  { username: "BombMaster", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bomb" },
];

interface TeamPlayer {
  username: string;
  avatar: string;
  position: string;
}

export default function PreviewCreateTeam() {
  const [, setLocation] = useLocation();
  const [teamLogo, setTeamLogo] = useState("🐺");
  const [teamName, setTeamName] = useState("");
  const [teamBio, setTeamBio] = useState("");
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  const addPlayer = (username: string, avatar: string) => {
    if (!players.find(p => p.username === username)) {
      setPlayers([...players, { username, avatar, position: "" }]);
      setShowAddPlayer(false);
    }
  };

  const removePlayer = (username: string) => {
    setPlayers(players.filter(p => p.username !== username));
  };

  const updatePosition = (username: string, position: string) => {
    setPlayers(players.map(p => 
      p.username === username ? { ...p, position } : p
    ));
  };

  const emojiOptions = ["🐺", "⚡", "🔥", "👑", "🦁", "🐉", "⚔️", "🎯", "💎", "🌟"];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button 
            size="icon" 
            variant="ghost"
            onClick={() => setLocation("/account")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Create Team</h1>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <Label>Team Logo</Label>
              <div className="flex flex-col items-center space-y-3">
                <div className="text-8xl">{teamLogo}</div>
                <div className="grid grid-cols-5 gap-2">
                  {emojiOptions.map((emoji) => (
                    <Button
                      key={emoji}
                      variant={teamLogo === emoji ? "default" : "outline"}
                      className="text-2xl h-12 w-12 p-0"
                      onClick={() => setTeamLogo(emoji)}
                      data-testid={`emoji-${emoji}`}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="Enter team name..."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                data-testid="input-team-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-bio">Team Bio</Label>
              <Textarea
                id="team-bio"
                placeholder="Describe your team..."
                value={teamBio}
                onChange={(e) => setTeamBio(e.target.value)}
                rows={4}
                data-testid="input-team-bio"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Team Players</Label>
            <Button 
              size="sm"
              onClick={() => setShowAddPlayer(true)}
              data-testid="button-add-player"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </div>

          {players.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-sm text-muted-foreground text-center">
                  No players added yet. Click "Add Player" to start building your roster.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {players.map((player) => (
                <Card key={player.username}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 mt-1">
                        <AvatarImage src={player.avatar} />
                        <AvatarFallback>{player.username[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <p className="font-semibold text-sm">@{player.username}</p>
                        <Input
                          placeholder="Assign position (e.g., IGL, Duelist, AWPer)..."
                          value={player.position}
                          onChange={(e) => updatePosition(player.username, e.target.value)}
                          data-testid={`input-position-${player.username}`}
                        />
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="shrink-0"
                        onClick={() => removePlayer(player.username)}
                        data-testid={`button-remove-${player.username}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Button 
          className="w-full" 
          size="lg"
          disabled={!teamName || players.length === 0}
          onClick={() => setLocation("/account")}
          data-testid="button-create-team-submit"
        >
          Create Team
        </Button>
      </main>

      <BottomNavigation />

      {/* Add Player Modal */}
      <Dialog open={showAddPlayer} onOpenChange={setShowAddPlayer}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Player</DialogTitle>
            <DialogDescription>
              Search and add players from your followers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search followers..."
                className="pl-9"
                data-testid="input-search-players"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {mockFollowers.map((follower) => {
                const alreadyAdded = players.find(p => p.username === follower.username);
                return (
                  <Card
                    key={follower.username}
                    className={`p-3 ${alreadyAdded ? 'opacity-50' : 'hover-elevate cursor-pointer'}`}
                    onClick={() => !alreadyAdded && addPlayer(follower.username, follower.avatar)}
                    data-testid={`follower-${follower.username}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={follower.avatar} />
                          <AvatarFallback>{follower.username[0]}</AvatarFallback>
                        </Avatar>
                        <p className="font-semibold text-sm">@{follower.username}</p>
                      </div>
                      {alreadyAdded && (
                        <Badge variant="secondary" className="text-xs">Added</Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
