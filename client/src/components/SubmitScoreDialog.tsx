import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Team } from "@shared/schema";

interface ChatMessage {
  id: string;
  matchId: string;
  message: string;
  imageUrl?: string;
  teamId?: string;
  isSystem: number;
  createdAt: string;
}

interface SubmitScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team1: Team;
  team2: Team;
  matchId?: string;
  onSubmit: (winnerId: string, team1Score: number, team2Score: number) => void;
}

export default function SubmitScoreDialog({ 
  open, 
  onOpenChange, 
  team1, 
  team2,
  matchId,
  onSubmit 
}: SubmitScoreDialogProps) {
  const [winnerId, setWinnerId] = useState("");
  const [team1Score, setTeam1Score] = useState("");
  const [team2Score, setTeam2Score] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const { data: initialMessages } = useQuery<ChatMessage[]>({
    queryKey: [`/api/matches/${matchId}/messages`],
    enabled: !!matchId && open,
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    if (!matchId || !open) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/match?matchId=${matchId}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connected");
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

    setWs(websocket);
    return () => websocket.close();
  }, [matchId, open]);

  const getTeamInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSubmit = () => {
    const score1 = parseInt(team1Score) || 0;
    const score2 = parseInt(team2Score) || 0;
    onSubmit(winnerId, score1, score2);
    handleReset();
  };

  const handleReset = () => {
    setWinnerId("");
    setTeam1Score("");
    setTeam2Score("");
    onOpenChange(false);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !ws) return;
    ws.send(JSON.stringify({ message: messageInput.trim(), imageUrl: null }));
    setMessageInput("");
  };

  const canSubmit = winnerId && team1Score && team2Score;
  
  const getTeamById = (id?: string) => {
    if (id === team1.id) return team1;
    if (id === team2.id) return team2;
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {team1.name} vs {team2.name}
          </DialogTitle>
          <DialogDescription>
            Submit final scores and chat with teams
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="score" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="score">Submit Score</TabsTrigger>
            <TabsTrigger value="chat">Match Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="score" className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team1-score">{team1.name}</Label>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getTeamInitials(team1.name)}
                  </AvatarFallback>
                </Avatar>
                <Input
                  id="team1-score"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={team1Score}
                  onChange={(e) => setTeam1Score(e.target.value)}
                  data-testid="input-team1-score"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team2-score">{team2.name}</Label>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getTeamInitials(team2.name)}
                  </AvatarFallback>
                </Avatar>
                <Input
                  id="team2-score"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={team2Score}
                  onChange={(e) => setTeam2Score(e.target.value)}
                  data-testid="input-team2-score"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Winner</Label>
            <RadioGroup value={winnerId} onValueChange={setWinnerId}>
              <div className="space-y-2">
                <Label
                  htmlFor={team1.id}
                  className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover-elevate"
                >
                  <RadioGroupItem value={team1.id} id={team1.id} data-testid="radio-winner-team1" />
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getTeamInitials(team1.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-display font-medium">{team1.name}</span>
                </Label>

                <Label
                  htmlFor={team2.id}
                  className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover-elevate"
                >
                  <RadioGroupItem value={team2.id} id={team2.id} data-testid="radio-winner-team2" />
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getTeamInitials(team2.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-display font-medium">{team2.name}</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={handleReset}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                data-testid="button-submit-score"
              >
                Submit Result
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4 py-4 h-96">
            <ScrollArea className="flex-1 pr-4 h-80 border rounded-md p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No messages yet
                  </p>
                ) : (
                  messages.map((msg) => {
                    const team = getTeamById(msg.teamId);
                    const isSystem = msg.isSystem === 1;

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <span className="text-xs text-muted-foreground">
                            {msg.message}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className="flex gap-3"
                        data-testid={`message-${msg.id}`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {team ? getTeamInitials(team.name) : "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1 max-w-[70%]">
                          <span className="text-xs text-muted-foreground">
                            {team?.name || "Unknown"}
                          </span>
                          <div className="rounded-md bg-muted p-3">
                            {msg.message && (
                              <p className="text-sm">{msg.message}</p>
                            )}
                          </div>
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
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  messageInput.trim() &&
                  handleSendMessage()
                }
                data-testid="input-chat-message"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
