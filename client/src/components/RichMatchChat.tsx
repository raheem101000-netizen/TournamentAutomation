import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Trophy, ImageIcon, Loader2 } from "lucide-react";
import { useRef, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import UserProfileModal from "./UserProfileModal";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import type { ChatMessage } from "@shared/schema";

interface RichMatchChatProps {
  matchId: string;
  winnerId?: string | null;
  tournamentId?: string;
  team1Name?: string;
  team2Name?: string;
  team1Id?: string;
  team2Id?: string;
}

export default function RichMatchChat({ 
  matchId, 
  winnerId,
  tournamentId,
  team1Name = "Team 1", 
  team2Name = "Team 2",
  team1Id = "",
  team2Id = ""
}: RichMatchChatProps) {
  const [messageInput, setMessageInput] = useState("");
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const { data: threadMessages = [], isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: [`/api/matches/${matchId}/messages`],
    enabled: !!matchId,
  });

  // Extract unique users from thread messages
  const chatUsers = useMemo(() => {
    const userMap = new Map<string, any>();
    threadMessages.forEach((msg) => {
      if (msg.userId && !userMap.has(msg.userId)) {
        userMap.set(msg.userId, {
          id: msg.userId,
          username: msg.username,
          displayName: (msg as any).displayName?.trim() || msg.username,
          avatarUrl: (msg as any).avatarUrl,
        });
      }
    });
    return Array.from(userMap.values());
  }, [threadMessages]);

  // Filter users based on mention query
  const filteredUsers = useMemo(() => {
    if (!mentionQuery) return chatUsers;
    const query = mentionQuery.toLowerCase();
    return chatUsers.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.displayName.toLowerCase().includes(query)
    );
  }, [chatUsers, mentionQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setMessageInput(text);

    // Detect mention: find @ and track what comes after it
    const cursorPos = e.target.selectionStart || text.length;
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const afterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if we're still in the mention (no space after @)
      if (!afterAt.includes(" ")) {
        setMentionIndex(lastAtIndex);
        setMentionQuery(afterAt);
        setMentionOpen(true);
        return;
      }
    }

    setMentionOpen(false);
    setMentionQuery("");
    setMentionIndex(-1);
  };

  const selectMention = (user: any) => {
    if (mentionIndex === -1) return;

    const beforeMention = messageInput.substring(0, mentionIndex);
    const afterMention = messageInput.substring(mentionIndex + mentionQuery.length + 1);
    
    // Insert mention tag in format: @username
    const newMessage = `${beforeMention}@${user.username} ${afterMention}`;
    setMessageInput(newMessage);
    setMentionOpen(false);
    setMentionQuery("");
    setMentionIndex(-1);
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest("POST", `/api/matches/${matchId}/messages`, { 
        message,
        userId: currentUser?.id 
      });
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/messages`] });
    },
  });

  const setWinnerMutation = useMutation({
    mutationFn: async (winnerId: string) => {
      return await apiRequest("POST", `/api/matches/${matchId}/winner`, { winnerId });
    },
    onSuccess: (data, winnerId) => {
      const winnerName = winnerId === team1Id ? team1Name : team2Name;
      toast({
        title: "Winner Selected",
        description: `${winnerName} has been set as the winner!`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/messages`] });
      if (tournamentId) {
        // Immediately update the cache with the new data
        queryClient.setQueryData([`/api/tournaments/${tournamentId}/matches`], (oldData: any) => {
          if (!Array.isArray(oldData)) return oldData;
          return oldData.map((match: any) => 
            match.id === matchId ? { ...match, winnerId, status: 'completed' } : match
          );
        });
        // Invalidate and refetch BOTH matches and teams - teams data changes when winner is selected
        queryClient.refetchQueries({ queryKey: [`/api/tournaments/${tournamentId}/matches`] });
        queryClient.refetchQueries({ queryKey: [`/api/tournaments/${tournamentId}/teams`] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to set winner. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Parse mentions from message text and create interactive elements
  const renderMessageWithMentions = (text: string) => {
    if (!text) return null;
    
    // Regex to find @username mentions
    const mentionRegex = /@([\w-]+)/g;
    const parts: Array<{ type: 'mention' | 'text'; content: string; username?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }
      // Add mention
      parts.push({
        type: 'mention',
        content: match[0],
        username: match[1]
      });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    return parts.length === 0 ? text : (
      <>
        {parts.map((part, idx) => {
          if (part.type === 'text') {
            return part.content;
          } else {
            // Find the user by username
            const mentionedUser = chatUsers.find(u => u.username === part.username);
            return (
              <button
                key={idx}
                onClick={() => {
                  if (mentionedUser) {
                    setSelectedProfileId(mentionedUser.id);
                    setProfileModalOpen(true);
                  }
                }}
                className="bg-primary/10 text-primary hover:bg-primary/20 px-1.5 py-0.5 rounded font-semibold text-sm hover-elevate cursor-pointer"
                data-testid={`mention-${part.username}`}
              >
                {part.content}
              </button>
            );
          }
        })}
      </>
    );
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    // Detect if current user is mentioned
    const mentionRegex = /@([\w-]+)/g;
    let match;
    const mentionedUsernames = new Set<string>();
    
    while ((match = mentionRegex.exec(messageInput)) !== null) {
      mentionedUsernames.add(match[1]);
    }
    
    // Check if current user is mentioned
    const currentUserMentioned = mentionedUsernames.has(currentUser?.username || '');
    
    sendMessageMutation.mutate(messageInput);
    
    // Show notification if user mentions themselves or others are mentioned
    if (mentionedUsernames.size > 0) {
      const mentionedList = Array.from(mentionedUsernames).join(', ');
      toast({
        title: "Mentions Sent",
        description: `You mentioned: @${mentionedList}`,
        variant: "default",
      });
    }
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // Upload image to server
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/api/objects/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.url || uploadData.fileUrl;

      // Send message with image
      await apiRequest("POST", `/api/matches/${matchId}/messages`, {
        message: "",
        imageUrl: imageUrl,
        userId: currentUser?.id
      });

      // Clear input and refresh messages
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      queryClient.invalidateQueries({ queryKey: [`/api/matches/${matchId}/messages`] });
      
      toast({
        title: "Image Uploaded",
        description: "Your image has been shared!",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <Card className="flex flex-col min-h-0 flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="font-display flex items-center gap-2 text-sm">
            Match Chat
            <Badge variant="outline" className="font-normal">
              {threadMessages.length} messages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3 p-0 px-4 pb-4 min-h-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : threadMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                threadMessages.map((msg) => {
                  const isOwn = msg.userId === currentUser?.id;
                  const senderName = (msg as any).displayName?.trim() || msg.username?.trim() || 'Unknown User';
                  
                  const getInitials = () => {
                    const name = (msg as any).displayName?.trim() || msg.username?.trim() || '';
                    if (!name) return 'U';
                    const parts = name.split(' ').filter((p: string) => p);
                    if (parts.length > 1) {
                      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                    }
                    return name.substring(0, 2).toUpperCase();
                  };

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                      data-testid={`message-${msg.id}`}
                    >
                      {msg.userId ? (
                        <button
                          onClick={() => {
                            setSelectedProfileId(msg.userId);
                            setProfileModalOpen(true);
                          }}
                          className="p-0 border-0 bg-transparent cursor-pointer"
                          data-testid={`button-avatar-${msg.id}`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0 cursor-pointer hover-elevate">
                            {(msg as any).avatarUrl && (
                              <AvatarImage src={(msg as any).avatarUrl} alt={senderName} />
                            )}
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials()}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                      ) : (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          {(msg as any).avatarUrl && (
                            <AvatarImage src={(msg as any).avatarUrl} alt={senderName} />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                        {msg.userId ? (
                          <button
                            onClick={() => {
                              setSelectedProfileId(msg.userId);
                              setProfileModalOpen(true);
                            }}
                            className="text-xs text-muted-foreground hover:underline cursor-pointer p-0 border-0 bg-transparent text-left"
                            data-testid={`user-link-${msg.id}`}
                          >
                            {senderName}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {senderName}
                          </span>
                        )}
                        {msg.imageUrl && (
                          <img 
                            src={msg.imageUrl} 
                            alt="Shared image" 
                            className="max-w-full h-auto max-h-60 object-contain rounded-md"
                            data-testid={`img-message-${msg.id}`}
                          />
                        )}
                        {msg.message && (
                          <p className="text-sm text-foreground">{renderMessageWithMentions(msg.message)}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {team1Id && team2Id && (
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Select Winner:</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setWinnerMutation.mutate(team1Id)}
                  disabled={setWinnerMutation.isPending}
                  className="flex-1 text-xs"
                  data-testid="button-team1-wins"
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  {team1Name}
                </Button>
                <Button
                  onClick={() => setWinnerMutation.mutate(team2Id)}
                  disabled={setWinnerMutation.isPending}
                  className="flex-1 text-xs"
                  data-testid="button-team2-wins"
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  {team2Name}
                </Button>
              </div>
            </div>
          )}

          <div className="border-t pt-3 space-y-2">
            <div className="flex gap-2 relative">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={imageInputRef}
                onChange={handleImageSelected}
                data-testid="input-file-upload"
              />
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploadingImage}
                data-testid="button-upload-image"
              >
                {isUploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
              </Button>
              <div className="flex-1 relative">
                <Input
                  placeholder="Type @ to mention... or type a message"
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (mentionOpen && e.key === 'ArrowDown') {
                      e.preventDefault();
                    } else if (e.key === 'Enter' && !e.shiftKey && !mentionOpen) {
                      handleSendMessage();
                    }
                  }}
                  className="w-full h-9"
                  data-testid="input-message"
                />
                {mentionOpen && filteredUsers.length > 0 && (
                  <div className="absolute bottom-full right-0 w-56 mb-2 z-50 border border-border rounded-md bg-background shadow-lg">
                    <Command>
                      <CommandEmpty>No users found</CommandEmpty>
                      <CommandGroup>
                        {filteredUsers.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.username}
                            onSelect={() => selectMention(user)}
                            className="cursor-pointer"
                            data-testid={`mention-option-${user.id}`}
                          >
                            <Avatar className="h-6 w-6 mr-2">
                              {user.avatarUrl && (
                                <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                              )}
                              <AvatarFallback className="text-xs">
                                {user.displayName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{user.displayName}</span>
                              <span className="text-xs text-muted-foreground">@{user.username}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </div>
                )}
              </div>
              <Button 
                size="icon"
                className="h-9 w-9"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserProfileModal 
        userId={selectedProfileId} 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />
    </div>
  );
}
