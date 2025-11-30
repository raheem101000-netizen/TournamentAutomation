import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, X, ChevronLeft, Trophy, Upload as UploadIcon, AlertCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { Match, Team, Tournament } from "@shared/schema";
import type { UploadResult } from "@uppy/core";

const awardAchievementSchema = z.object({
  playerId: z.string().min(1, "Please select a player"),
  title: z.string().min(1, "Achievement title is required").max(50),
  description: z.string().max(200),
  icon: z.string(),
  type: z.string().optional(),
});

interface MatchDetails {
  match: Match;
  tournament: Tournament;
  team1: Team;
  team2: Team;
  team1Players: any[];
  team2Players: any[];
}

interface ThreadMessage {
  id: string;
  threadId: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
  imageUrl?: string;
  avatarUrl?: string;
  displayName?: string;
}

interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
}

export default function TournamentMatch() {
  const [match, params] = useRoute("/tournament/:tournamentId/match/:matchId");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const matchId = params?.matchId;
  const tournamentId = params?.tournamentId;

  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch match details
  const { data: matchDetails, isLoading: matchLoading } = useQuery<MatchDetails>({
    queryKey: [`/api/tournaments/${tournamentId}/matches/${matchId}/details`],
    enabled: !!matchId && !!tournamentId,
  });

  // Fetch current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  // Get or create message thread for this match
  const { data: matchThread, isLoading: threadLoading } = useQuery<any>({
    queryKey: ["/api/matches", matchId, "thread"],
    enabled: !!matchId,
  });

  // Fetch messages for the match thread
  const { data: threadMessages = [], isLoading: messagesLoading } = useQuery<ThreadMessage[]>({
    queryKey: ["/api/message-threads", matchThread?.id, "messages"],
    enabled: !!matchThread && !!matchThread.id,
  });

  const qc = useQueryClient();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threadMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!matchThread?.id) throw new Error("No thread available");
      
      const response = await fetch(`/api/message-threads/${matchThread.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      setMessageInput("");
      toast({ title: "Message sent!" });
      qc.refetchQueries({
        queryKey: ["/api/message-threads", matchThread?.id, "messages"],
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput);
  };

  const handleUpdateScore = async (team: "team1" | "team2") => {
    if (!matchDetails) return;
    
    const score = team === "team1" 
      ? (matchDetails.match.team1Score || 0) + 1 
      : (matchDetails.match.team2Score || 0) + 1;

    try {
      await apiRequest("PATCH", `/api/matches/${matchId}`, {
        [team === "team1" ? "team1Score" : "team2Score"]: score,
        status: "in_progress",
      });
      
      qc.invalidateQueries({
        queryKey: [`/api/tournaments/${tournamentId}/matches/${matchId}/details`],
      });
      
      toast({ title: `${team === "team1" ? "Team 1" : "Team 2"} score updated!` });
    } catch (error: any) {
      toast({
        title: "Error updating score",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (matchLoading || threadLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!matchDetails) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Match not found</p>
            <Button onClick={() => setLocation("/tournament")} className="w-full mt-4">
              Back to Tournaments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { match: m, tournament, team1, team2, team1Players, team2Players } = matchDetails;
  const isTeam1Manager = currentUser?.id === (team1 as any).managerId;
  const isTeam2Manager = currentUser?.id === (team2 as any).managerId;

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation(`/tournament/${tournamentId}`)}
            data-testid="button-back-to-tournament"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
            <p className="text-sm text-muted-foreground">Match Details</p>
          </div>
        </div>

        {/* Match Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              {team1.name} vs {team2.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">{team1.name}</p>
                <p className="text-4xl font-bold">{m.team1Score || 0}</p>
              </div>
              <div className="flex items-center justify-center">
                <Badge variant="outline">Round {m.round}</Badge>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">{team2.name}</p>
                <p className="text-4xl font-bold">{m.team2Score || 0}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold mb-3">{team1.name} Players</p>
                <div className="space-y-2">
                  {team1Players.map((player) => (
                    <div key={player.id} className="text-sm text-muted-foreground">
                      {player.name}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold mb-3">{team2.name} Players</p>
                <div className="space-y-2">
                  {team2Players.map((player) => (
                    <div key={player.id} className="text-sm text-muted-foreground">
                      {player.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {(isTeam1Manager || isTeam2Manager) && (
              <div className="flex gap-2 pt-4">
                {isTeam1Manager && (
                  <Button onClick={() => handleUpdateScore("team1")} className="flex-1">
                    +1 Score ({team1.name})
                  </Button>
                )}
                {isTeam2Manager && (
                  <Button onClick={() => handleUpdateScore("team2")} className="flex-1">
                    +1 Score ({team2.name})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Chat - Using Message Thread System */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-display flex items-center gap-2">
              Match Chat
              <Badge variant="outline" className="font-normal">
                {threadMessages.length} messages
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 p-0 px-6 pb-6">
            <ScrollArea className="h-80 pr-4">
              <div className="space-y-4">
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : threadMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  threadMessages.map((msg) => {
                    const isOwn = msg.userId === currentUser?.id;

                    // Get proper initials
                    const getInitials = () => {
                      const name = (msg as any).displayName?.trim() || msg.username?.trim() || '';
                      if (!name) return 'U';
                      const parts = name.split(' ').filter((p: string) => p);
                      if (parts.length > 1) {
                        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                      }
                      return name.substring(0, 2).toUpperCase();
                    };

                    const senderName = (msg as any).displayName?.trim() || msg.username?.trim() || 'Unknown User';

                    return (
                      <div 
                        key={msg.id} 
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                        data-testid={`message-${msg.id}`}
                      >
                        {msg.userId ? (
                          <Link to={`/profile/${msg.userId}`}>
                            <Avatar className="h-8 w-8 cursor-pointer hover-elevate">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials()}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                        ) : (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                          {msg.userId ? (
                            <Link to={`/profile/${msg.userId}`} className="text-xs text-muted-foreground hover:underline cursor-pointer" data-testid={`user-link-${msg.id}`}>
                              {senderName}
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {senderName}
                            </span>
                          )}
                          {msg.message && (
                            <p className="text-sm text-foreground">{msg.message}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={sendMessageMutation.isPending}
                data-testid="input-message"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !messageInput.trim()}
                data-testid="button-send-message"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
