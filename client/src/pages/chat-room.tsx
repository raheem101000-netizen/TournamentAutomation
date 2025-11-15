import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  matchId: string;
  teamId?: string;
  message: string;
  imageUrl?: string;
  isSystem: number;
  createdAt: string;
}

export default function ChatRoom() {
  const { matchId } = useParams<{ matchId: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch initial messages
  const { data: initialMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/matches", matchId, "messages"],
    enabled: !!matchId,
  });

  // Set up WebSocket connection
  useEffect(() => {
    if (!matchId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/chat?matchId=${matchId}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connected");
    };

    websocket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // Handle both REST and WebSocket message formats
        const message = payload.type === "new_message" ? payload.message : payload;
        setMessages((prev) => [...prev, message]);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat",
        variant: "destructive",
      });
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [matchId, toast]);

  // Load initial messages
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const messageData = {
      matchId,
      message: newMessage,
      teamId: "user-team-id", // In real app, get from auth context
    };

    ws.send(JSON.stringify(messageData));
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 h-screen flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle>Match Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.isSystem ? "justify-center" : ""
                  }`}
                  data-testid={`message-${msg.id}`}
                >
                  {!msg.isSystem && (
                    <Avatar>
                      <AvatarFallback>
                        {msg.teamId?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`flex-1 ${
                      msg.isSystem ? "text-center text-muted-foreground italic" : ""
                    }`}
                  >
                    {!msg.isSystem && (
                      <div className="text-sm font-medium mb-1">
                        Team {msg.teamId}
                      </div>
                    )}
                    <div
                      className={`${
                        msg.isSystem
                          ? ""
                          : "bg-muted p-3 rounded-lg"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Attached"
                          className="mt-2 rounded max-w-xs"
                        />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                data-testid="input-message"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN}
                size="icon"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
