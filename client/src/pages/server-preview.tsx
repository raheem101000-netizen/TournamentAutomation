import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Hash, Lock, Megaphone, MessageSquare, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import ChatChannel from "@/components/channels/ChatChannel";
import AnnouncementsChannel from "@/components/channels/AnnouncementsChannel";
import type { Server, Channel } from "@shared/schema";

export default function ServerPreview() {
  const [match, params] = useRoute("/server/:serverId/preview");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const serverId = params?.serverId;
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const { data: server } = useQuery<Server>({
    queryKey: [`/api/servers/${serverId}`],
    enabled: !!serverId,
  });

  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: [`/api/servers/${serverId}/channels`],
    enabled: !!serverId,
  });

  const selectedChannel = channels.find(c => c.id === selectedChannelId) || channels.find(c => !c.isPrivate) || channels[0];

  const joinServerMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !serverId) throw new Error("Missing user or server ID");
      return apiRequest("POST", `/api/servers/${serverId}/members`, { userId: user.id });
    },
    onSuccess: () => {
      toast({
        title: "Joined server",
        description: "You've successfully joined the server.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/servers/${serverId}`] });
      setLocation(`/server/${serverId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  if (!server) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading server...</p>
      </div>
    );
  }

  const publicChannels = channels.filter(c => !c.isPrivate);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 flex-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold truncate">{server.name}</h1>
          </div>
          <Badge variant="outline" className="bg-background/80 backdrop-blur text-xs">
            Preview
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Channels Sidebar */}
        <div className="w-56 border-r flex-shrink-0 overflow-y-auto bg-muted/30">
          <div className="p-3 space-y-4">
            {publicChannels.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
                  Channels
                </h3>
                <div className="space-y-0.5">
                  {publicChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannelId(channel.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                        selectedChannel?.id === channel.id
                          ? "bg-accent text-accent-foreground"
                          : "hover-elevate text-muted-foreground hover:text-foreground"
                      }`}
                      data-testid={`button-channel-${channel.slug}`}
                    >
                      {getChannelIcon(channel.type)}
                      <span className="truncate">{channel.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Channel Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedChannel ? (
            <>
              {/* Channel Header */}
              <div className="border-b p-4 flex items-center gap-2">
                {getChannelIcon(selectedChannel.type)}
                <h2 className="text-lg font-semibold">{selectedChannel.name}</h2>
                {selectedChannel.isPrivate && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>

              {/* Channel Content */}
              <div className="flex-1 overflow-hidden">
                {selectedChannel.type === "chat" && (
                  <div className="p-4 h-full overflow-y-auto">
                    <ChatChannel channelId={selectedChannel.id} isPreview={true} />
                  </div>
                )}
                {selectedChannel.type === "announcements" && (
                  <div className="p-4 h-full overflow-y-auto">
                    <AnnouncementsChannel />
                  </div>
                )}
                {selectedChannel.type === "tournament_dashboard" && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-3">
                      <Lock className="w-10 h-10 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">Join to access Tournament Dashboard</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Select a channel to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Join Button Footer */}
      <div className="border-t p-4 bg-background/95 backdrop-blur">
        <Button
          onClick={() => joinServerMutation.mutate()}
          disabled={joinServerMutation.isPending}
          data-testid="button-join-server"
          className="w-full"
        >
          {joinServerMutation.isPending ? "Joining..." : "Join Server"}
        </Button>
      </div>
    </div>
  );
}
