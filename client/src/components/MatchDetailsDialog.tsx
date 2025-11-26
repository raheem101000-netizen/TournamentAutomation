import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
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
import { useAuth } from "@/contexts/AuthContext";
import type { Team, Match } from "@shared/schema";

interface ChatMessage {
  id: string;
  matchId: string;
  message: string;
  imageUrl?: string;
  teamId?: string;
  isSystem: number;
  createdAt: string;
}

interface MatchDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: Match;
  team1: Team;
  team2: Team;
  onSubmitScore: (winnerId: string, team1Score: number, team2Score: number) => void;
}

export default function MatchDetailsDialog({
  open,
  onOpenChange,
  match,
  team1,
  team2,
  onSubmitScore,
}: MatchDetailsDialogProps) {
  const { user } = useAuth();
  const [winnerId, setWinnerId] = useState("");
  const [team1Score, setTeam1Score] = useState("");
  const [team2Score, setTeam2Score] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getTeamInitials = (name: string) => {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  // Fetch messages
  const { data: initialMessages } = useQuery<ChatMessage[]>({
    queryKey: [`/api/matches/${match.id}/messages`],
    enabled: !!match.id,
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
    if (!match.id || !open) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/match?matchId=${match.id}`;
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

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [match.id, open]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !ws) return;

    const messageData = {
      message: messageInput.trim(),
    };

    ws.send(JSON.stringify(messageData));
    setMessageInput("");
  };

  const handleSubmit = () => {
    const score1 = parseInt(team1Score) || 0;
    const score2 = parseInt(team2Score) || 0;
    onSubmitScore(winnerId, score1, score2);
    handleReset();
  };

  const handleReset = () => {
    setWinnerId("");
    setTeam1Score("");
    setTeam2Score("");
    onOpenChange(false);
  };

  const canSubmit = winnerId && team1Score && team2Score;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {team1.name} vs {team2.name}
          </DialogTitle>
          <DialogDescription>
            Manage the match - submit scores or send messages to teams
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="score" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="score">Submit Score</TabsTrigger>
            <TabsTrigger value="chat">Team Chat</TabsTrigger>
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
          </TabsContent>

          <TabsContent value="chat" className="space-y-4 py-4">
            <ScrollArea className="h-80 border rounded-md p-4 space-y-2">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <p className="text-xs text-muted-foreground mb-1">
                        {msg.teamId === team1.id ? team1.name : msg.teamId === team2.id ? team2.name : "System"}
                      </p>
                      <p className="bg-muted p-2 rounded text-foreground break-words">{msg.message}</p>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Send message to teams..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                data-testid="input-chat-message"
              />
              <Button
                size="icon"
                type="submit"
                disabled={!messageInput.trim() || !ws}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset} data-testid="button-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            data-testid="button-submit-score"
          >
            Submit Result
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
