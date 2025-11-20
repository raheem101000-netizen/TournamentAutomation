import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, X, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import type { ChannelMessage } from "@shared/schema";

interface ChatChannelProps {
  channelId: string;
}

export default function ChatChannel({ channelId }: ChatChannelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChannelMessage | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages from API
  const { data: initialMessages } = useQuery<ChannelMessage[]>({
    queryKey: [`/api/channels/${channelId}/messages`],
    enabled: !!channelId,
  });

  // Initialize messages when data is fetched
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    if (!channelId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/channel?channelId=${channelId}`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      console.log('WebSocket connected to channel:', channelId);
    };
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        setMessages(prev => [...prev, data.message]);
      }
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    ws.current = websocket;
    
    return () => {
      websocket.close();
    };
  }, [channelId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !ws.current) return;

    // Only send message content - server extracts userId/username from session
    const messageData = {
      message: messageInput.trim(),
      imageUrl: null,
      replyToId: replyingTo?.id || null,
    };

    ws.current.send(JSON.stringify(messageData));
    setMessageInput("");
    setReplyingTo(null);
  };

  const handleMessageClick = (message: ChannelMessage) => {
    setReplyingTo(message);
  };

  const handleTouchStart = (message: ChannelMessage) => {
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

  const handleMouseDown = (message: ChannelMessage) => {
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

  // Find reply message for display
  const getReplyMessage = (replyToId: string | null) => {
    if (!replyToId) return null;
    return messages.find(m => m.id === replyToId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => {
          const replyMessage = getReplyMessage(message.replyToId);
          const initials = message.username.substring(0, 2).toUpperCase();
          const timestamp = new Date(message.createdAt || Date.now()).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });

          return (
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
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{message.username}</span>
                  <span className="text-xs text-muted-foreground">{timestamp}</span>
                </div>
                {replyMessage && (
                  <div className="flex items-start gap-2 mt-1 mb-1 pl-2 border-l-2 border-primary/40">
                    <Reply className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="text-xs text-muted-foreground min-w-0">
                      <span className="font-semibold">{replyMessage.username}</span>
                      <p className="truncate">{replyMessage.message}</p>
                    </div>
                  </div>
                )}
                <p className="text-sm mt-0.5">{message.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <Card className="mt-auto">
        <CardContent className="p-3">
          {replyingTo && (
            <div className="flex items-center justify-between gap-2 mb-2 p-2 bg-muted rounded-md">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <Reply className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="text-sm min-w-0">
                  <p className="font-semibold text-xs">Replying to {replyingTo.username}</p>
                  <p className="text-muted-foreground truncate text-xs">{replyingTo.message}</p>
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
          <form className="flex gap-2" onSubmit={handleSendMessage}>
            <Input
              placeholder={replyingTo ? `Reply to ${replyingTo.username}...` : "Type a message..."}
              className="flex-1"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
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
