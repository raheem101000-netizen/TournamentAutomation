import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, Hash, Settings, Trophy, Megaphone, MessageSquare, Lock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import type { Server, Tournament, Channel } from "@shared/schema";
import AnnouncementsChannel from "@/components/channels/AnnouncementsChannel";
import ChatChannel from "@/components/channels/ChatChannel";
import TournamentDashboardChannel from "@/components/channels/TournamentDashboardChannel";

const getChannelIcon = (type: string) => {
  switch (type) {
    case "announcements":
      return <Megaphone className="h-4 w-4" />;
    case "chat":
      return <MessageSquare className="h-4 w-4" />;
    case "tournament_dashboard":
      return <Trophy className="h-4 w-4" />;
    default:
      return <Hash className="h-4 w-4" />;
  }
};

export default function PreviewServerDetail() {
  const [match, params] = useRoute("/server/:serverId");
  const serverId = params?.serverId;
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const currentUserId = "user-demo-123"; // TODO: Replace with real auth

  const { data: server, isLoading: serverLoading } = useQuery<Server>({
    queryKey: [`/api/servers/${serverId}`],
    enabled: !!serverId,
  });

  const { data: channels = [], isLoading: channelsLoading } = useQuery<Channel[]>({
    queryKey: [`/api/servers/${serverId}/channels`],
    enabled: !!serverId,
  });

  const { data: tournaments } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  // Filter tournaments for this server
  const serverTournaments = tournaments?.filter(t => t.serverId === serverId) || [];
  const activeTournament = serverTournaments[0]; // Get first active tournament

  const publicChannels = channels.filter(c => !c.isPrivate).sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  const privateChannels = channels.filter(c => c.isPrivate).sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  const selectedChannel = channels.find(c => c.id === selectedChannelId) || channels[0];

  if (serverLoading || channelsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading server...</p>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Server not found</p>
      </div>
    );
  }

  // If a channel is selected, show channel content
  if (selectedChannelId && selectedChannel) {
    return (
      <div className="flex flex-col min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setSelectedChannelId(null)}
                data-testid="button-back-to-channels"
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getChannelIcon(selectedChannel.type)}
                  <h1 className="text-lg font-bold truncate">{selectedChannel.name}</h1>
                  {selectedChannel.isPrivate && (
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container max-w-lg mx-auto px-4 py-4 flex-1">
          {selectedChannel.type === "tournament_dashboard" && (
            <TournamentDashboardChannel serverId={serverId!} />
          )}
          {selectedChannel.type === "announcements" && (
            <AnnouncementsChannel />
          )}
          {selectedChannel.type === "chat" && (
            <ChatChannel />
          )}
        </main>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="text-2xl">{"🎮"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold truncate">{server.name}</h1>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{server.memberCount || 0} members</span>
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
        {activeTournament && (
          <Card className="overflow-hidden" data-testid="tournament-dashboard-preview">
            <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-background">
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="w-16 h-16 text-primary/40" />
              </div>
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg mb-1">{activeTournament.name}</CardTitle>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">
                      {activeTournament.format}
                    </Badge>
                    <Badge variant="outline">
                      {activeTournament.status}
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
                {activeTournament.game || "Gaming Tournament"}
              </p>
            </CardContent>
          </Card>
        )}
        
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Welcome to {server.name}! {server.description}
          </p>
        </div>

        <div className="space-y-4">
          {/* Public Channels */}
          {publicChannels.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Channels
                </h3>
              </div>
              <div className="space-y-1">
                {publicChannels.map((channel) => (
                  <Card
                    key={channel.id}
                    className="p-3 hover-elevate cursor-pointer border-0 shadow-none"
                    onClick={() => setSelectedChannelId(channel.id)}
                    data-testid={`channel-${channel.slug}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">
                        {getChannelIcon(channel.type)}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="font-medium truncate">{channel.name}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Private Channels (owner only) */}
          {privateChannels.length > 0 && server.ownerId === currentUserId && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Private
                </h3>
              </div>
              <div className="space-y-1">
                {privateChannels.map((channel) => (
                  <Card
                    key={channel.id}
                    className="p-3 hover-elevate cursor-pointer border-0 shadow-none"
                    onClick={() => setSelectedChannelId(channel.id)}
                    data-testid={`channel-${channel.slug}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">
                        {getChannelIcon(channel.type)}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="font-medium truncate">{channel.name}</span>
                        <Lock className="h-3 w-3 ml-auto text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
