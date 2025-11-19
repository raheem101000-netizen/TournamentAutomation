import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, X, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  initials: string;
  replyTo?: {
    author: string;
    content: string;
  };
};

export default function ChatChannel() {
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const messages: Message[] = [
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
      replyTo: {
        author: "Player1",
        content: "Anyone up for a tournament this weekend?",
      },
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

  const handleMessageClick = (message: Message) => {
    setReplyingTo(message);
  };

  const handleTouchStart = (message: Message) => {
    longPressTimer.current = setTimeout(() => {
      setReplyingTo(message);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseDown = (message: Message) => {
    longPressTimer.current = setTimeout(() => {
      setReplyingTo(message);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-lg font-semibold">General Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className="flex gap-3 cursor-pointer hover-elevate rounded-md p-2 -m-2" 
            data-testid={`message-${message.id}`}
            onClick={() => handleMessageClick(message)}
            onTouchStart={() => handleTouchStart(message)}
            onTouchEnd={handleTouchEnd}
            onMouseDown={() => handleMouseDown(message)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {message.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{message.author}</span>
                <span className="text-xs text-muted-foreground">{message.timestamp}</span>
              </div>
              {message.replyTo && (
                <div className="flex items-start gap-2 mt-1 mb-1 pl-2 border-l-2 border-primary/40">
                  <Reply className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="text-xs text-muted-foreground min-w-0">
                    <span className="font-semibold">{message.replyTo.author}</span>
                    <p className="truncate">{message.replyTo.content}</p>
                  </div>
                </div>
              )}
              <p className="text-sm mt-0.5">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="mt-auto">
        <CardContent className="p-3">
          {replyingTo && (
            <div className="flex items-center justify-between gap-2 mb-2 p-2 bg-muted rounded-md">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <Reply className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="text-sm min-w-0">
                  <p className="font-semibold text-xs">Replying to {replyingTo.author}</p>
                  <p className="text-muted-foreground truncate text-xs">{replyingTo.content}</p>
                </div>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 flex-shrink-0"
                onClick={() => setReplyingTo(null)}
                data-testid="button-cancel-reply"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input
              placeholder={replyingTo ? `Reply to ${replyingTo.author}...` : "Type a message..."}
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
