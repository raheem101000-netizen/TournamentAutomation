import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import type { ChatMessage, Team } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SubmitScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team1: Team | null;
  team2: Team | null;
  matchId: string;
  onSelectWinner: (winnerId: string) => Promise<void>;
}

export default function SubmitScoreDialog({ 
  open, 
  onOpenChange, 
  team1, 
  team2, 
  matchId,
  onSelectWinner,
}: SubmitScoreDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  if (!team1 || !team2) return null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId || !open) return;
    fetch(`/api/matches/${matchId}/messages`)
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(err => console.error("Failed to fetch messages:", err));
  }, [matchId, open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getTeamInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSendMessage = async () => {
    if (isSending || !messageInput.trim() || !user) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/matches/${matchId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageInput.trim(),
          teamId: team1.id,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
      
      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      setMessageInput("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectWinner = async (winnerId: string) => {
    setIsSelectingWinner(true);
    try {
      await onSelectWinner(winnerId);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error selecting winner:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to select winner",
        variant: "destructive",
      });
    } finally {
      setIsSelectingWinner(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl" data-testid="text-match-chat-title">
            Match Chat: {team1.name} vs {team2.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No messages yet. Teams can post updates here.</p>
              ) : (
                messages.map((msg) => {
                  const isTeam1 = msg.teamId === team1.id;
                  const senderName = msg.userId === user?.id ? (user.displayName || user.username || "You") : (msg.teamId === team1.id ? team1.name : team2.name);
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-2 ${msg.userId === user?.id ? 'flex-row-reverse' : ''}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {senderName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col gap-1 max-w-xs ${msg.userId === user?.id ? 'items-end' : ''}`}>
                        <span className="text-xs text-muted-foreground">{senderName}</span>
                        <div className={`rounded-md p-2 ${
                          msg.userId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          {msg.message && <p className="text-sm">{msg.message}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t pt-3 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isSending}
                data-testid="input-chat-message"
              />
              <Button 
                size="icon"
                onClick={handleSendMessage}
                disabled={isSending || !messageInput.trim()}
                data-testid="button-send-message"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t">
          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-chat"
          >
            Close
          </Button>
          <Button 
            onClick={() => handleSelectWinner(team1.id)}
            disabled={isSelectingWinner}
            data-testid="button-team1-wins"
          >
            {isSelectingWinner ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {team1.name} Wins
          </Button>
          <Button 
            onClick={() => handleSelectWinner(team2.id)}
            disabled={isSelectingWinner}
            data-testid="button-team2-wins"
          >
            {isSelectingWinner ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {team2.name} Wins
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
