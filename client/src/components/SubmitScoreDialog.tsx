import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Image as ImageIcon, X, Loader2 } from "lucide-react";
import type { ChatMessage, Team } from "@shared/schema";

interface SubmitScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team1: Team | null;
  team2: Team | null;
  matchId: string;
}

export default function SubmitScoreDialog({ 
  open, 
  onOpenChange, 
  team1, 
  team2, 
  matchId
}: SubmitScoreDialogProps) {
  if (!team1 || !team2) return null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async () => {
    if (isSending || (!messageInput.trim() && !selectedImage)) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('message', messageInput.trim());
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`/api/matches/${matchId}/messages`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      setMessageInput("");
      handleRemoveImage();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Match Chat: {team1.name} vs {team2.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No messages yet. Upload proof here.</p>
              ) : (
                messages.map((msg) => {
                  const isTeam1 = msg.teamId === team1.id;
                  const teamName = isTeam1 ? team1.name : team2.name;
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-2 ${isTeam1 ? 'flex-row-reverse' : ''}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getTeamInitials(teamName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col gap-1 max-w-xs ${isTeam1 ? 'items-end' : ''}`}>
                        <span className="text-xs text-muted-foreground">{teamName}</span>
                        <div className={`rounded-md p-2 ${
                          isTeam1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
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
            {imagePreview && (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-24 rounded-md border"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                  onClick={handleRemoveImage}
                  data-testid="button-remove-image"
                >
                  <X className="w-2 h-2" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageSelect}
                data-testid="input-file-upload"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                data-testid="button-upload-image"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Input
                placeholder="Type a message or attach an image..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isSending}
                data-testid="input-chat-message"
              />
              <Button 
                size="icon"
                onClick={handleSendMessage}
                disabled={isSending || (!messageInput.trim() && !selectedImage)}
                data-testid="button-send-message"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
