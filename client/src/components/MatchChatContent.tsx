import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRef, useEffect, useState } from "react";
import type { ChatMessage } from "@shared/schema";

interface MatchChatContentProps {
  matchId: string;
}

export default function MatchChatContent({ matchId }: MatchChatContentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: initialMessages } = useQuery<ChatMessage[]>({
    queryKey: [`/api/matches/${matchId}/chat`],
    enabled: !!matchId,
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <Card className="flex items-center justify-center h-full p-8">
        <p className="text-center text-muted-foreground">
          No messages yet. Start the conversation!
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((message) => {
          const initials = message.message?.charAt(0).toUpperCase() || "?";
          const timestamp = new Date(message.createdAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          return (
            <div key={message.id} className="flex gap-2">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">Team</span>
                  <span className="text-xs text-muted-foreground">{timestamp}</span>
                </div>
                <p className="text-sm mt-0.5">{message.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
