import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Users, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server, Tournament } from "@shared/schema";

export default function ServerPreview() {
  const [match, params] = useRoute("/server/:serverId/preview");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const serverId = params?.serverId;

  const { data: server } = useQuery<Server>({
    queryKey: [`/api/servers/${serverId}`],
    enabled: !!serverId,
  });

  const { data: tournaments = [] } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  const serverTournaments = tournaments.filter(t => t.serverId === serverId);

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

  if (!server) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading server...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold flex-1">Preview: {server.name}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Server Info */}
        <Card>
          <CardHeader>
            <CardTitle>{server.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {server.backgroundImageUrl && (
              <img
                src={server.backgroundImageUrl}
                alt={server.name}
                className="w-full h-48 rounded-md object-cover"
              />
            )}
            <p className="text-muted-foreground">{server.description || "No description"}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{server.memberCount || 0} members</span>
            </div>
            <Button
              onClick={() => joinServerMutation.mutate()}
              disabled={joinServerMutation.isPending}
              data-testid="button-join-server"
              className="w-full"
            >
              Join Server
            </Button>
          </CardContent>
        </Card>

        {/* Tournaments */}
        {serverTournaments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Tournaments ({serverTournaments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {serverTournaments.map(tournament => (
                <div key={tournament.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-semibold">{tournament.name}</p>
                    <p className="text-sm text-muted-foreground">{tournament.game || "No game specified"}</p>
                  </div>
                  <Badge variant={
                    tournament.status === "upcoming" ? "secondary" :
                    tournament.status === "in_progress" ? "default" :
                    "outline"
                  }>
                    {tournament.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
