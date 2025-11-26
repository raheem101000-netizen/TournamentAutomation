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
import type { Team, ChatMessage } from "@shared/schema";

interface SubmitScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team1: Team;
  team2: Team;
  matchId: string;
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

  // Fetch initial messages
  useEffect(() => {
    if (!matchId || !open) return;
    fetch(`/api/matches/${matchId}/messages`)
      .then(r => r.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Failed to fetch messages:", err));
  }, [matchId, open]);

  // WebSocket connection for live chat
  useEffect(() => {
    if (!matchId || !open) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/match?matchId=${matchId}`;
    
    try {
      const websocket = new WebSocket(wsUrl);

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
    } catch (error) {
      console.error("WebSocket connection error:", error);
    }
  }, [matchId, open]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    setMessageInput("");
    onOpenChange(false);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ message: messageInput.trim(), imageUrl: null }));
    setMessageInput("");
  };

  const canSubmit = winnerId && team1Score && team2Score;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Match: {team1.name} vs {team2.name}</DialogTitle>
          <DialogDescription>
            Submit scores or chat with teams
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="score" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="score">Submit Score</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="score" className="flex-1 overflow-y-auto space-y-6 py-4">
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

          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden py-4">
            <ScrollArea className="flex-1 pr-4 mb-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">No messages yet</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex gap-2 text-xs" data-testid={`message-${msg.id}`}>
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {msg.teamId === team1.id ? getTeamInitials(team1.name) : getTeamInitials(team2.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground block">{msg.teamId === team1.id ? team1.name : team2.name}</span>
                        <p className="text-foreground break-words">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 border-t pt-3">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                data-testid="input-chat-message"
                className="text-sm"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || !ws}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
