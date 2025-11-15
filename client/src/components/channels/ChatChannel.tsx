import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatChannel() {
  const messages = [
    {
      id: "1",
      author: "Player1",
      content: "Anyone up for a tournament this weekend?",
      timestamp: "10:30 AM",
      initials: "P1",
    },
    {
      id: "2",
      author: "GamerPro",
      content: "I'm in! What game?",
      timestamp: "10:32 AM",
      initials: "GP",
    },
    {
      id: "3",
      author: "Player1",
      content: "Thinking CS:GO or Valorant",
      timestamp: "10:33 AM",
      initials: "P1",
    },
    {
      id: "4",
      author: "eSportsKing",
      content: "Valorant sounds good to me",
      timestamp: "10:35 AM",
      initials: "EK",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-lg font-semibold">General Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-3" data-testid={`message-${message.id}`}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {message.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{message.author}</span>
                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
              </div>
              <p className="text-sm mt-0.5">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="mt-auto">
        <CardContent className="p-3">
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input
              placeholder="Type a message..."
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button size="icon" type="submit" data-testid="button-send-message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
