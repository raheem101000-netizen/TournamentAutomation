import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, AlertCircle } from "lucide-react";
import type { ChatMessage, Team } from "@shared/schema";

interface MatchChatPanelProps {
  messages: ChatMessage[];
  teams: Team[];
  currentTeamId?: string;
  onSendMessage: (message: string) => void;
}

export default function MatchChatPanel({ 
  messages, 
  teams, 
  currentTeamId, 
  onSendMessage 
}: MatchChatPanelProps) {
  const [input, setInput] = useState("");

  const getTeamById = (id: string | null) => teams.find(t => t.id === id);
  const getTeamInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="font-display flex items-center gap-2">
          Match Chat
          <Badge variant="outline" className="font-normal">
            {messages.length} messages
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-0 px-6 pb-6">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((msg) => {
              const team = getTeamById(msg.teamId);
              const isSystem = msg.isSystem === 1;
              const isCurrentTeam = msg.teamId === currentTeamId;

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
                  className={`flex gap-3 ${isCurrentTeam ? 'flex-row-reverse' : ''}`}
                  data-testid={`message-${msg.id}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {team ? getTeamInitials(team.name) : "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-[70%] ${isCurrentTeam ? 'items-end' : ''}`}>
                    <span className="text-xs text-muted-foreground">
                      {team?.name || "Unknown"}
                    </span>
                    <div 
                      className={`rounded-md px-3 py-2 ${
                        isCurrentTeam 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            data-testid="input-chat-message"
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
