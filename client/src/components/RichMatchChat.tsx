import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trophy, ImageIcon, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import UserProfileModal from "./UserProfileModal";
import type { ChatMessage } from "@shared/schema";

interface RichMatchChatProps {
  matchId: string;
  tournamentId?: string;
  team1Name?: string;
  team2Name?: string;
  team1Id?: string;
  team2Id?: string;
}

export default function RichMatchChat({ 
  matchId, 
  tournamentId,
  team1Name = "Team 1", 
  team2Name = "Team 2",
  team1Id = "",
  team2Id = ""
}: RichMatchChatProps) {
  const [messageInput, setMessageInput] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const { data: threadMessages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: [`/api/matches/${matchId}/messages`],
    enabled: !!matchId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("POST", `/api/matches/${matchId}/messages`, { message });
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/messages`] });
    },
  });

  const setWinnerMutation = useMutation({
    mutationFn: async (winnerId: string) => {
      return await apiRequest("POST", `/api/matches/${matchId}/winner`, { winnerId });
    },
    onSuccess: (data, winnerId) => {
      const winnerName = winnerId === team1Id ? team1Name : team2Name;
      toast({
        title: "Winner Selected",
        description: `${winnerName} has been set as the winner!`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/messages`] });
      if (tournamentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournamentId}/matches`] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to set winner. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput);
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Placeholder for image upload
      console.log("Image selected:", file.name);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <Card className="flex flex-col min-h-0 flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="font-display flex items-center gap-2 text-sm">
            Match Chat
            <Badge variant="outline" className="font-normal">
              {threadMessages.length} messages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3 p-0 px-4 pb-4 min-h-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : threadMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                threadMessages.map((msg) => {
                  const isOwn = msg.userId === currentUser?.id;
                  const senderName = (msg as any).displayName?.trim() || msg.username?.trim() || 'Unknown User';
                  
                  const getInitials = () => {
                    const name = (msg as any).displayName?.trim() || msg.username?.trim() || '';
                    if (!name) return 'U';
                    const parts = name.split(' ').filter((p: string) => p);
                    if (parts.length > 1) {
                      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                    }
                    return name.substring(0, 2).toUpperCase();
                  };

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                      data-testid={`message-${msg.id}`}
                    >
                      {msg.userId ? (
                        <button
                          onClick={() => {
                            setSelectedProfileId(msg.userId);
                            setProfileModalOpen(true);
                          }}
                          className="p-0 border-0 bg-transparent cursor-pointer"
                          data-testid={`button-avatar-${msg.id}`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0 cursor-pointer hover-elevate">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                      ) : (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                        {msg.userId ? (
                          <button
                            onClick={() => {
                              setSelectedProfileId(msg.userId);
                              setProfileModalOpen(true);
                            }}
                            className="text-xs text-muted-foreground hover:underline cursor-pointer p-0 border-0 bg-transparent text-left"
                            data-testid={`user-link-${msg.id}`}
                          >
                            {senderName}
                          </button>
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

          {team1Id && team2Id && (
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Select Winner:</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setWinnerMutation.mutate(team1Id)}
                  disabled={setWinnerMutation.isPending}
                  className="flex-1 text-xs"
                  data-testid="button-team1-wins"
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  {team1Name}
                </Button>
                <Button
                  onClick={() => setWinnerMutation.mutate(team2Id)}
                  disabled={setWinnerMutation.isPending}
                  className="flex-1 text-xs"
                  data-testid="button-team2-wins"
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  {team2Name}
                </Button>
              </div>
            </div>
          )}

          <div className="border-t pt-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={imageInputRef}
                onChange={handleImageSelected}
                data-testid="input-file-upload"
              />
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9"
                onClick={() => imageInputRef.current?.click()}
                data-testid="button-upload-image"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 h-9"
                data-testid="input-message"
              />
              <Button 
                size="icon"
                className="h-9 w-9"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserProfileModal 
        userId={selectedProfileId} 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />
    </div>
  );
}
