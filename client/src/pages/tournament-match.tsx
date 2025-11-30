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

const achievementIconOptions = [
  "🏆", "⭐", "🥇", "🎖️", "👑", "🔥", "💎", "🌟", "✨", "🎯", "🏅", "🎪"
];

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

interface ChatMessage {
  id: string;
  matchId: string;
  teamId?: string;
  userId?: string;
  username?: string | null;
  displayName?: string | null;
  message?: string | null;
  imageUrl?: string | null;
  isSystem: number;
  createdAt: string;
  avatarUrl?: string;
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
  const [messageImage, setMessageImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const objectPathRef = useRef<string | null>(null);

  // Fetch match details
  const { data: matchDetails, isLoading: matchLoading } = useQuery<MatchDetails>({
    queryKey: [`/api/tournaments/${tournamentId}/matches/${matchId}/details`],
    enabled: !!matchId && !!tournamentId,
  });

  // Fetch current user
  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  // Fetch messages for this match - with short staleTime to ensure fresh data
  const { data: messagesData = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/matches", matchId, "messages"],
    enabled: !!matchId,
    queryFn: async () => {
      if (!matchId) return [];
      const response = await fetch(`/api/matches/${matchId}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    staleTime: 1000, // 1 second stale time so WebSocket refetch works immediately
  });

  const qc = useQueryClient();

  useEffect(() => {
    if (Array.isArray(messagesData)) {
      setMessages(messagesData);
    }
  }, [messagesData]);

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
          // Force immediate refetch to get new message with userId enrichment
          qc.refetchQueries({
            queryKey: ["/api/matches", matchId, "messages"],
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
  }, [matchId, toast, qc]);

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

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const url = `/api/matches/${matchId}/messages`;
      const body = {
        userId: currentUser?.id,
        username: currentUser?.username,
        ...messageData,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: () => {
      setMessageInput("");
      setMessageImage(null);
      toast({
        title: "Message sent!",
      });
      qc.invalidateQueries({
        queryKey: ["/api/matches", matchId, "messages"],
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !messageImage) return;

    const messageData: any = {};
    if (messageInput.trim()) {
      messageData.message = messageInput.trim();
    }
    if (messageImage) {
      messageData.imageUrl = messageImage;
    }

    sendMessageMutation.mutate(messageData);
  };

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    objectPathRef.current = data.objectPath;
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      setIsUploadingImage(true);
      try {
        const uploadedObjectPath = objectPathRef.current;
        
        if (!uploadedObjectPath) {
          throw new Error("No object path available");
        }
        
        const response = await apiRequest("POST", "/api/objects/normalize", {
          objectPath: uploadedObjectPath
        });
        
        if (!response.ok) {
          throw new Error("Failed to process uploaded image");
        }
        
        const data = await response.json();
        setMessageImage(data.objectPath);
        
        toast({
          title: "Image uploaded",
          description: "Image ready to send",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload image",
          variant: "destructive",
        });
      } finally {
        setIsUploadingImage(false);
      }
    }
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
          <CardHeader className="pb-4">
            <CardTitle className="font-display flex items-center gap-2">
              Match Chat
              <Badge variant="outline" className="font-normal">
                {messages.length} messages
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 p-0 px-6 pb-6 min-h-0">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg: ChatMessage) => {
                  const isOwn = msg.userId === currentUser?.id;
                  const isSystem = false;

                  // Get proper initials (e.g., "Eli" -> "EL", "Raheem" -> "RA", "John Doe" -> "JD")
                  const getInitials = () => {
                    // Use enriched displayName first, fallback to username, then message username
                    const name = (msg as any).displayName?.trim() || msg.username?.trim() || '';
                    if (!name) return 'U';
                    const parts = name.split(' ').filter((p: string) => p);
                    if (parts.length > 1) {
                      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                    }
                    return name.substring(0, 2).toUpperCase();
                  };

                  // Get sender name to display
                  const senderName = (msg as any).displayName?.trim() || msg.username?.trim() || 'Unknown User';
                  const senderUsername = msg.username?.trim() || '';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <Badge variant="outline" className="gap-2 py-1">
                          <AlertCircle className="w-3 h-3" />
                          {msg.message}
                        </Badge>
                      </div>
                    );
                  }

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
                        {msg.imageUrl && (
                          <img 
                            src={msg.imageUrl} 
                            alt="Shared image" 
                            className="max-w-full h-auto max-h-60 object-contain rounded-md"
                            data-testid={`img-message-${msg.id}`}
                          />
                        )}
                        {msg.message && (
                          <p className="text-sm text-foreground">{msg.message}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              </div>
            </ScrollArea>

            <div className="space-y-2">
              {messageImage && (
                <div className="relative inline-block">
                  <img 
                    src={messageImage} 
                    alt="Preview" 
                    className="max-h-32 rounded-md border"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => setMessageImage(null)}
                    data-testid="button-remove-image"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={10485760}
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleUploadComplete}
                  buttonClassName="h-9 px-3"
                >
                  <ImageIcon className="h-4 w-4" />
                </ObjectUploader>
                <Input
                  placeholder="Type a message or attach an image..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e as any)}
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button 
                  size="icon" 
                  onClick={(e) => handleSendMessage(e as any)}
                  disabled={!messageInput.trim() || isUploadingImage || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
