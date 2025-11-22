import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, X, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Match, Team, Tournament } from "@shared/schema";

interface MatchDetails {
  match: Match;
  tournament: Tournament;
  team1: Team;
  team2: Team;
  team1Players: any[];
  team2Players: any[];
}

interface ChatMessage {
  id: string;
  matchId: string;
  message: string;
  imageUrl?: string;
  userId?: string;
  username?: string;
  isSystem: number;
  createdAt: string;
}

export default function TournamentMatch() {
  const [match, params] = useRoute("/tournament/:tournamentId/match/:matchId");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const matchId = params?.matchId;
  const tournamentId = params?.tournamentId;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch match details
  const { data: matchDetails, isLoading: matchLoading } = useQuery<MatchDetails>({
    queryKey: [`/api/tournaments/${tournamentId}/matches/${matchId}/details`],
    enabled: !!matchId && !!tournamentId,
  });

  // Fetch messages
  const { data: initialMessages } = useQuery<ChatMessage[]>({
    queryKey: [`/api/matches/${matchId}/messages`],
    enabled: !!matchId,
  });

  // Initialize messages
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    if (!matchId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/match?matchId=${matchId}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connected to match:", matchId);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message") {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect. Retrying...",
        variant: "destructive",
      });
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [matchId, toast]);

  const closeMatchMutation = useMutation({
    mutationFn: async () => {
      if (!matchId) throw new Error("Match ID required");
      return await apiRequest("PATCH", `/api/matches/${matchId}`, {
        status: "completed",
      });
    },
    onSuccess: () => {
      toast({
        title: "Match Closed",
        description: "The match has been closed successfully.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close match",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !ws) return;

    const messageData = {
      message: messageInput.trim(),
      imageUrl: null,
    };

    ws.send(JSON.stringify(messageData));
    setMessageInput("");
  };

  if (matchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading match...</p>
      </div>
    );
  }

  if (!matchDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Match not found</p>
      </div>
    );
  }

  const { match: matchData, tournament, team1, team2, team1Players = [], team2Players = [] } = matchDetails;
  const isOrganizer = tournament.organizerId === user?.id;
  const isTeam1Manager = team1Players?.some((p: any) => p.userId === user?.id);
  const isTeam2Manager = team2Players?.some((p: any) => p.userId === user?.id);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setLocation("/")}
                data-testid="button-back"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{tournament.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Round {matchData.round}
                </p>
              </div>
            </div>
            {isOrganizer && matchData.status === "in_progress" && (
              <Button
                variant="destructive"
                onClick={() => closeMatchMutation.mutate()}
                disabled={closeMatchMutation.isPending}
                data-testid="button-close-match"
              >
                {closeMatchMutation.isPending ? "Closing..." : "Close Match"}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Player - Team 1 */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="text-center">
                <h2 className="text-lg font-bold">{team1.name}</h2>
                <Badge variant="secondary" className="mt-2">
                  {team1.wins}W - {team1.losses}L
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-lg">
                    {team1.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Separator />
              <div className="space-y-2 text-center">
                <p className="text-2xl font-bold text-primary">
                  {matchData.team1Score ?? "-"}
                </p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              {isTeam1Manager && (
                <Badge className="w-full justify-center">You</Badge>
              )}
            </CardContent>
          </Card>

          {/* Center - Match Info & VS */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center pb-3">
              <CardTitle>VS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Match Status</p>
                <Badge
                  variant={
                    matchData.status === "completed" ? "default" : "secondary"
                  }
                >
                  {matchData.status === "pending"
                    ? "Pending"
                    : matchData.status === "in_progress"
                      ? "In Progress"
                      : "Completed"}
                </Badge>
              </div>
              <Separator />
              {isOrganizer && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Match Organizer
                  </p>
                  <Badge variant="outline">Organizer</Badge>
                </div>
              )}
              <Separator />
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">Round</p>
                <p className="text-xl font-bold">{matchData.round}</p>
              </div>
            </CardContent>
          </Card>

          {/* Right Player - Team 2 */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="text-center">
                <h2 className="text-lg font-bold">{team2.name}</h2>
                <Badge variant="secondary" className="mt-2">
                  {team2.wins}W - {team2.losses}L
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-lg">
                    {team2.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Separator />
              <div className="space-y-2 text-center">
                <p className="text-2xl font-bold text-primary">
                  {matchData.team2Score ?? "-"}
                </p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              {isTeam2Manager && (
                <Badge className="w-full justify-center">You</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Match Chat */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Match Chat</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Team managers and organizer only
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 h-96">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg) => {
                const initials = (msg.username || "U")
                  .substring(0, 2)
                  .toUpperCase();
                const timestamp = new Date(msg.createdAt).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }
                );

                return (
                  <div
                    key={msg.id}
                    className="flex gap-3"
                    data-testid={`message-${msg.id}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold">
                          {msg.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {timestamp}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{msg.message}</p>
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Message attachment"
                          className="mt-2 rounded max-w-xs max-h-48 object-cover"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {(isTeam1Manager || isTeam2Manager || isOrganizer) ? (
              <form className="flex gap-2 pt-3 border-t" onSubmit={handleSendMessage}>
                <Input
                  placeholder="Send a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  data-testid="input-match-message"
                />
                <Button
                  size="icon"
                  type="submit"
                  disabled={!messageInput.trim() || !ws}
                  data-testid="button-send-match-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-2">
                Only team managers and organizer can send messages
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
