import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, Hash, Volume2, Settings, Users, Trophy, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const channelIcons = {
  "text-default": "📝",
  "announcement": "📢",
  "chat": "💬",
  "threads": "🗂️",
  "voice": "🔊",
  "stage": "🎤",
  "music": "🎧",
  "folder": "📁",
  "bot": "🤖",
  "admin": "🛠️",
  "settings": "⚙️",
  "gaming": "🎮",
  "controller": "🕹️",
  "tournament": "🏆",
  "art": "🎨",
  "photos": "📸",
  "videos": "🎥",
  "music-media": "🎵",
  "rules": "📌",
  "guidelines": "📜",
  "help": "❓",
  "updates": "📣",
  "money": "💰",
  "coins": "🪙",
  "stats": "📊",
  "leaderboard": "📝",
  "welcome": "👋",
  "introductions": "🙋",
  "discussion": "🗣️",
  "events": "🎉",
  "staff": "🔐",
  "moderation": "🛡️",
  "reports": "🚨",
};

const mockServer = {
  name: "ProGaming League",
  logo: "🎮",
  members: "12.5K",
  onlineMembers: "3.2K",
};

const mockChannels = [
  {
    category: "Tournament Dashboard",
    channels: [
      { id: "1", name: "tournament", icon: channelIcons.tournament, type: "tournament", isDefault: true, locked: false },
    ],
  },
  {
    category: "Information",
    channels: [
      { id: "2", name: "announcement", icon: channelIcons.announcement, type: "text", isDefault: true, locked: true },
      { id: "3", name: "rules", icon: channelIcons.rules, type: "text", locked: true },
      { id: "4", name: "updates", icon: channelIcons.updates, type: "text", locked: true },
    ],
  },
  {
    category: "General",
    channels: [
      { id: "5", name: "chat", icon: channelIcons.chat, type: "text", isDefault: true, locked: false },
      { id: "6", name: "introductions", icon: channelIcons.introductions, type: "text", locked: false },
      { id: "7", name: "discussion", icon: channelIcons.discussion, type: "text", locked: false },
    ],
  },
  {
    category: "Voice Channels",
    channels: [
      { id: "8", name: "General Voice", icon: channelIcons.voice, type: "voice", locked: false },
      { id: "9", name: "Team 1", icon: channelIcons.voice, type: "voice", locked: false },
      { id: "10", name: "Team 2", icon: channelIcons.voice, type: "voice", locked: false },
    ],
  },
  {
    category: "Media",
    channels: [
      { id: "11", name: "highlights", icon: channelIcons.videos, type: "text", locked: false },
      { id: "12", name: "screenshots", icon: channelIcons.photos, type: "text", locked: false },
    ],
  },
];

const activeTournament = {
  title: "Summer Championship 2024",
  participants: "64/128",
  prize: "$5,000",
  startDate: "Dec 20, 2024",
};

export default function PreviewServerDetail() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="text-2xl">{mockServer.logo}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold truncate">{mockServer.name}</h1>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{mockServer.onlineMembers} online</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{mockServer.members} members</span>
                </div>
              </div>
            </div>
            <Button size="icon" variant="ghost" data-testid="button-server-settings">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-4">
        <Card className="overflow-hidden" data-testid="tournament-dashboard-preview">
          <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy className="w-16 h-16 text-primary/40" />
            </div>
          </div>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg mb-1">{activeTournament.title}</CardTitle>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">
                    <Trophy className="w-3 h-3 mr-1" />
                    {activeTournament.prize}
                  </Badge>
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    {activeTournament.participants}
                  </Badge>
                </div>
              </div>
              <Button size="sm" data-testid="button-view-tournament">
                View
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Registration closes {activeTournament.startDate}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {mockChannels.map((category, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category.category}
                </h3>
              </div>

              <div className="space-y-1">
                {category.channels.map((channel) => (
                  <Card
                    key={channel.id}
                    className="p-3 hover-elevate cursor-pointer border-0 shadow-none"
                    data-testid={`channel-${channel.name}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xl">
                        {channel.icon}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="font-medium truncate">{channel.name}</span>
                        {channel.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                        {channel.locked && (
                          <Badge variant="outline" className="text-xs">
                            Read-only
                          </Badge>
                        )}
                      </div>
                      {channel.type === "voice" && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>0</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full" variant="outline" data-testid="button-create-channel">
          <Hash className="w-4 h-4 mr-2" />
          Create Channel
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
}
