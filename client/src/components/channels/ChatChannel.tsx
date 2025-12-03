import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, X, Reply, Image as ImageIcon, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ChannelMessage } from "@shared/schema";

interface ChatChannelProps {
  channelId: string;
  isPreview?: boolean;
}

export default function ChatChannel({ channelId, isPreview = false }: ChatChannelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChannelMessage | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  // REST API mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; imageUrl: string | null; replyToId: string | null }) => {
      const response = await apiRequest("POST", `/api/channels/${channelId}/messages`, messageData);
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.json();
    },
    onSuccess: (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      setMessageInput("");
      setReplyingTo(null);
      toast({
        title: "Message sent!",
        description: "Your message has been posted",
      });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;

    // Send message via REST API
    sendMessageMutation.mutate({
      message: messageInput.trim(),
      imageUrl: null,
      replyToId: replyingTo?.id || null,
    });
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

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "File upload feature coming soon",
        description: "File uploads will be available in a future update",
      });
    }
  };

  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      toast({
        title: "Image upload feature coming soon",
        description: "Image uploads will be available in a future update",
      });
    }
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
              className={`flex gap-3 rounded-md p-2 -m-2 ${!isPreview ? 'cursor-pointer hover-elevate' : ''}`}
              data-testid={`message-${message.id}`}
              onClick={() => !isPreview && handleMessageClick(message)}
              onTouchStart={() => !isPreview && handleTouchStart(message)}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => !isPreview && handleMouseDown(message)}
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
          {!isPreview && replyingTo && (
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
          {isPreview ? (
            <div className="w-full p-2 bg-muted rounded-md text-center text-sm text-muted-foreground">
              Join the server to send messages
            </div>
          ) : (
            <form className="flex gap-2" onSubmit={handleSendMessage}>
              <Button 
                size="icon" 
                variant="ghost"
                type="button"
                onClick={handleFileUpload}
                data-testid="button-attach-file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                type="button"
                onClick={handleImageUpload}
                data-testid="button-attach-image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
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
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelected}
            data-testid="input-file-upload"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelected}
            data-testid="input-image-upload"
          />
        </CardContent>
      </Card>
    </div>
  );
}
