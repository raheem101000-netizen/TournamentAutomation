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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, Upload, X } from "lucide-react";
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

  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadPreview(null);
      }
    }
  };

  const handleSendMessage = async () => {
    if (isSending || (!messageInput.trim() && !uploadedFile) || !user) return;

    setIsSending(true);
    try {
      let imageUrl: string | undefined = undefined;

      // Handle file upload if present
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        const uploadResponse = await fetch('/api/objects/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url || uploadResult.fileUrl;
      }

      const response = await fetch(`/api/matches/${matchId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageInput.trim(),
          imageUrl,
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
      setUploadedFile(null);
      setUploadPreview(null);
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

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No messages yet. Teams can post updates here.</p>
              ) : (
                messages.map((msg) => {
                  const senderName = msg.senderDisplayName || (msg.userId === user?.id ? (user?.displayName || user?.username || "You") : "Unknown");
                  const isCurrentUser = msg.userId === user?.id;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                      data-testid={`message-${msg.id}`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {senderName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex flex-col gap-1 max-w-2xl ${isCurrentUser ? 'items-end' : ''}`}>
                        <span className="text-xs text-muted-foreground">{senderName}</span>
                        <div className={`rounded-md p-2 ${
                          isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="Uploaded file" className="max-w-lg max-h-96 rounded mb-2 object-contain" />
                          )}
                          {msg.message && <p className="text-sm">{msg.message}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t pt-3 space-y-2">
            {uploadPreview && (
              <div className="relative">
                <img src={uploadPreview} alt="Preview" className="max-h-32 rounded" />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => {
                    setUploadedFile(null);
                    setUploadPreview(null);
                  }}
                  data-testid="button-remove-upload"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            {uploadedFile && !uploadPreview && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                <span>{uploadedFile.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 ml-auto"
                  onClick={() => {
                    setUploadedFile(null);
                    setUploadPreview(null);
                  }}
                  data-testid="button-remove-upload"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file-upload"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                data-testid="button-upload-file"
              >
                <Upload className="w-4 h-4" />
              </Button>
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
                disabled={isSending || (!messageInput.trim() && !uploadedFile)}
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
