import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, Users, Send, ArrowLeft, Edit, Check, X, Image as ImageIcon, Paperclip, Smile, Loader2, AlertCircle, Trophy, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  avatar?: string;
  groupImage?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  members: number;
  matchId?: string; // If present, this is a match chat using chatMessages API
}

interface MessageThread {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  matchId?: string; // If present, this is a match chat
}

interface ThreadMessage {
  id: string;
  threadId: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
  imageUrl?: string;
  avatarUrl?: string;
  displayName?: string;
}

interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
}

const mockMessageRequests: Chat[] = [
  {
    id: "req-1",
    name: "Sarah Johnson",
    isGroup: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    lastMessage: "Hey! Want to join our tournament team?",
    timestamp: "5m ago",
    unread: 0,
    members: 0,
  },
  {
    id: "req-2",
    name: "Elite Gamers Group",
    isGroup: true,
    groupImage: "⚡",
    lastMessage: "Invitation to join Elite Gamers",
    timestamp: "1h ago",
    unread: 0,
    members: 12,
  },
];

const mockMessages = [
  {
    id: "msg-1",
    sender: "Alex",
    content: "Ready for tonight's match?",
    timestamp: "2m ago",
    isOwn: false,
  },
  {
    id: "msg-2",
    sender: "You",
    content: "Yeah! What time are we starting?",
    timestamp: "1m ago",
    isOwn: true,
  },
  {
    id: "msg-3",
    sender: "Sarah",
    content: "I think 8 PM EST",
    timestamp: "30s ago",
    isOwn: false,
  },
];

function threadToChat(thread: MessageThread): Chat {
  return {
    id: thread.id,
    name: thread.participantName,
    isGroup: true,
    groupImage: thread.participantAvatar || "💬",
    lastMessage: thread.lastMessage,
    timestamp: formatTime(thread.lastMessageTime),
    unread: thread.unreadCount,
    members: 0,
    matchId: thread.matchId, // Pass through matchId if present
  };
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

export default function PreviewMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [editingAvatar, setEditingAvatar] = useState<Chat | null>(null);
  const [newAvatarEmoji, setNewAvatarEmoji] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [messageRequests, setMessageRequests] = useState<Chat[]>(mockMessageRequests);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  // Fetch message threads from API
  const { data: threads = [], isLoading } = useQuery<MessageThread[]>({
    queryKey: ["/api/message-threads"],
  });

  // Fetch match details when viewing a match chat
  const { data: matchDetails } = useQuery<any>({
    queryKey: ["match-details", selectedChat?.matchId || "none"],
    enabled: !!selectedChat?.matchId,
    queryFn: async () => {
      if (!selectedChat?.matchId) return null;
      const response = await fetch(`/api/matches/${selectedChat.matchId}`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Fetch profile data when viewing profile modal
  const { data: previewProfileData } = useQuery<any>({
    queryKey: ["/api/users/username", selectedProfileId],
    enabled: !!selectedProfileId && profileModalOpen,
    queryFn: async () => {
      if (!selectedProfileId) return null;
      const response = await fetch(`/api/users/${selectedProfileId}`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Auto-select match chat if matchId is in URL query
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const matchIdParam = params.get("matchId");
    
    if (matchIdParam && threads.length > 0 && !selectedChat) {
      const matchThread = threads.find(t => t.matchId === matchIdParam);
      if (matchThread) {
        const chat = threadToChat(matchThread);
        setSelectedChat(chat);
      }
    }
  }, [threads, location, selectedChat]);

  // Fetch messages for selected thread or match
  // If selectedChat has a matchId, fetch from match API, otherwise from thread API
  const { data: threadMessages = [], isLoading: messagesLoading } = useQuery<any[]>({
    queryKey: selectedChat?.matchId 
      ? ["/api/matches", selectedChat.matchId, "messages"]
      : ["/api/message-threads", selectedChat?.id, "messages"],
    enabled: !!selectedChat,
    queryFn: async () => {
      if (!selectedChat) return [];
      
      const url = selectedChat.matchId
        ? `/api/matches/${selectedChat.matchId}/messages`
        : `/api/message-threads/${selectedChat.id}/messages`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
  });

  const acceptedChats = threads.map(threadToChat);
  
  // Separate personal chats from match chats
  const personalChats = acceptedChats.filter(chat => !chat.matchId);
  const matchChats = acceptedChats.filter(chat => !!chat.matchId);
  
  // Filter chats based on search term
  const filteredPersonalChats = personalChats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredMatchChats = matchChats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!selectedChat) throw new Error("No chat selected");
      
      // Use correct API endpoint based on chat type
      const url = selectedChat.matchId
        ? `/api/matches/${selectedChat.matchId}/messages`
        : `/api/message-threads/${selectedChat.id}/messages`;
      
      // For match chat, include userId and username
      const body = selectedChat.matchId
        ? { 
            userId: currentUser?.id,
            username: currentUser?.username,
            message 
          }
        : { message };
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setMessageInput("");
      toast({
        title: "Message sent!",
      });
      // Refetch messages after sending - use correct queryKey based on chat type
      if (selectedChat?.matchId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/matches", selectedChat.matchId, "messages"] 
        });
      } else {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/message-threads", selectedChat?.id, "messages"] 
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "File upload coming soon",
        description: "File uploads will be available in a future update",
      });
    }
  };

  const setWinnerMutation = useMutation({
    mutationFn: async (winnerId: string) => {
      if (!selectedChat?.matchId) throw new Error("No match selected");
      const response = await fetch(`/api/matches/${selectedChat.matchId}/winner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId }),
      });
      if (!response.ok) throw new Error("Failed to set winner");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Winner selected!" });
      queryClient.invalidateQueries({ queryKey: ["match-details", selectedChat?.matchId] });
      queryClient.invalidateQueries({ queryKey: ["/api/message-threads"] });
      
      // Invalidate Dashboard caches for this tournament to keep standings in sync
      if (matchDetails?.tournamentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${matchDetails.tournamentId}/teams`] });
        queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${matchDetails.tournamentId}/matches`] });
      }
      
      setSelectedChat(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const closeMatchChatMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChat?.id) throw new Error("No chat selected");
      const response = await fetch(`/api/message-threads/${selectedChat.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to close match chat");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Match chat closed!" });
      queryClient.invalidateQueries({ queryKey: ["/api/message-threads"] });
      setSelectedChat(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      toast({
        title: "Image upload coming soon",
        description: "Image uploads will be available in a future update",
      });
    }
  };

  const handleAcceptRequest = (request: Chat) => {
    setMessageRequests(prev => prev.filter(r => r.id !== request.id));
    toast({
      title: "Message request accepted",
      description: `You can now chat with ${request.name}`,
    });
  };

  const handleDeclineRequest = (request: Chat) => {
    setMessageRequests(prev => prev.filter(r => r.id !== request.id));
    toast({
      title: "Message request declined",
      variant: "destructive",
    });
  };

  const updateAvatarMutation = useMutation({
    mutationFn: async (avatar: string) => {
      if (!editingAvatar) throw new Error("No group selected");
      
      const response = await fetch(`/api/message-threads/${editingAvatar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantAvatar: avatar }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Group avatar updated!",
        description: `Changed to ${newAvatarEmoji}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/message-threads"] });
      setEditingAvatar(null);
      setNewAvatarEmoji("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update group avatar",
        variant: "destructive",
      });
    },
  });

  const handleUpdateAvatar = () => {
    if (!editingAvatar || !newAvatarEmoji.trim()) return;
    updateAvatarMutation.mutate(newAvatarEmoji);
  };

  const createGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch("/api/message-threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          participantName: name,
          participantAvatar: "💬",
          lastMessage: "",
          unreadCount: 0,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create group");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Group chat created!",
        description: `${newGroupName} has been created`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/message-threads"] });
      setNewGroupName("");
      setShowCreateGroup(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create group chat",
        variant: "destructive",
      });
    },
  });

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createGroupMutation.mutate(newGroupName);
  };

  // Conversation view
  if (selectedChat) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedChat(null)}
                data-testid="button-back-to-messages"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="relative cursor-pointer" onClick={() => selectedChat.isGroup && setEditingAvatar(selectedChat)}>
                <Avatar className="w-10 h-10">
                  {selectedChat.isGroup ? (
                    <AvatarFallback className="text-xl bg-primary/10">
                      {selectedChat.groupImage}
                    </AvatarFallback>
                  ) : (
                    <AvatarImage src={selectedChat.avatar} />
                  )}
                </Avatar>
                {selectedChat.isGroup && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Edit className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h2 className="font-semibold">{selectedChat.name}</h2>
                {selectedChat.isGroup && (
                  <p className="text-xs text-muted-foreground">{selectedChat.members} members</p>
                )}
              </div>
              {selectedChat?.matchId && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => closeMatchChatMutation.mutate()}
                  disabled={closeMatchChatMutation.isPending}
                  data-testid="button-close-match-chat"
                  title="Close match chat"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
          <Card className="flex flex-col min-h-0">
            <CardHeader className="pb-4">
              <CardTitle className="font-display flex items-center gap-2">
                Match Chat
                <Badge variant="outline" className="font-normal">
                  {threadMessages.length} messages
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 p-0 px-6 pb-6 min-h-0">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : threadMessages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      threadMessages.map((msg) => {
                        const isOwn = msg.userId === currentUser?.id;
                        const isSystem = false;

                        // Get proper initials (e.g., "Eli" -> "EL", "Raheem" -> "RA", "John Doe" -> "JD")
                        const getInitials = () => {
                          // Use enriched displayName first, fallback to username, then message username
                          const name = (msg as any).displayName?.trim() || msg.username?.trim() || '';
                          if (!name) return 'U';
                          const parts = name.split(' ').filter((p: string) => p);
                          if (parts.length > 1) {
                            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                          }
                          return name.substring(0, 2).toUpperCase();
                        };

                        // Get sender name to display
                        const senderName = (msg as any).displayName?.trim() || msg.username?.trim() || 'Unknown User';
                        const senderUsername = msg.username?.trim() || '';

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
                            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
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
                                <Avatar className="h-8 w-8 cursor-pointer hover-elevate">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getInitials()}
                                  </AvatarFallback>
                                </Avatar>
                              </button>
                            ) : (
                              <Avatar className="h-8 w-8">
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
                                <p className="text-sm text-foreground">{msg.message}</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                {/* Winner Selection for Match Chats - Available for all matches (including completed for round-robin/swiss formats) */}
                {selectedChat?.matchId && matchDetails && (
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Select Winner:</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setWinnerMutation.mutate(matchDetails.team1Id)}
                        disabled={setWinnerMutation.isPending}
                        className="flex-1"
                        data-testid="button-team1-wins"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        {matchDetails.team1Name || "Team 1"}
                      </Button>
                      <Button
                        onClick={() => setWinnerMutation.mutate(matchDetails.team2Id)}
                        disabled={setWinnerMutation.isPending}
                        className="flex-1"
                        data-testid="button-team2-wins"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        {matchDetails.team2Name || "Team 2"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {imageInputRef.current?.files?.[0] && (
                    <div className="relative inline-block">
                      <img 
                        src={URL.createObjectURL(imageInputRef.current.files[0])} 
                        alt="Preview" 
                        className="max-h-32 rounded-md border"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => {
                          if (imageInputRef.current) {
                            imageInputRef.current.value = '';
                          }
                        }}
                        data-testid="button-remove-image"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
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
                      onClick={() => imageInputRef.current?.click()}
                      data-testid="button-upload-image"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Type a message or attach an image..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1"
                      data-testid="input-message"
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
            </CardContent>
          </Card>
        </main>

        {/* Profile Preview Modal - Inside conversation view */}
        <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
          <DialogContent className="z-50" style={{ zIndex: 50 }}>
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
            </DialogHeader>
            {previewProfileData ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="w-24 h-24">
                    {previewProfileData.avatarUrl && (
                      <AvatarImage src={previewProfileData.avatarUrl} alt={previewProfileData.displayName || previewProfileData.username} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {previewProfileData.displayName?.[0]?.toUpperCase() || previewProfileData.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-semibold text-foreground">{previewProfileData.displayName || previewProfileData.username}</h3>
                    {previewProfileData.displayName && (
                      <p className="text-sm text-muted-foreground">@{previewProfileData.username}</p>
                    )}
                  </div>
                </div>
                
                <Link to={`/profile/${selectedProfileId}`}>
                  <Button className="w-full" data-testid="button-visit-profile">
                    Visit Profile
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main messages list view
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-lg mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Messages</h1>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setShowCreateGroup(true)}
              data-testid="button-create-group-header"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-messages"
            />
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-2">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="personal" data-testid="tab-personal">
              Personal
              {personalChats.filter(c => c.unread > 0).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {personalChats.reduce((sum, c) => sum + c.unread, 0)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="matches" data-testid="tab-matches">
              Match Chats
              {matchChats.filter(c => c.unread > 0).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {matchChats.reduce((sum, c) => sum + c.unread, 0)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">
              Requests
              {messageRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {messageRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-1">
            {isLoading ? (
              <Card className="p-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </Card>
            ) : filteredPersonalChats.length === 0 ? (
              <Card>
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "No personal messages match your search" : "No personal messages yet"}
                  </p>
                </div>
              </Card>
            ) : (
              filteredPersonalChats.map((chat) => (
                <Card
                  key={chat.id}
                  className="p-4 hover-elevate cursor-pointer border-0 shadow-none"
                  onClick={() => setSelectedChat(chat)}
                  data-testid={`chat-${chat.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        {chat.isGroup ? (
                          <AvatarFallback className="text-2xl bg-primary/10">
                            {chat.groupImage}
                          </AvatarFallback>
                        ) : (
                          <AvatarImage src={chat.avatar} />
                        )}
                      </Avatar>
                      {chat.unread > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {chat.unread}
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {chat.name}
                          </h3>
                          {chat.isGroup && chat.members > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              {chat.members}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {chat.timestamp}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${chat.unread > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="matches" className="space-y-1">
            {isLoading ? (
              <Card className="p-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </Card>
            ) : filteredMatchChats.length === 0 ? (
              <Card>
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "No match chats match your search" : "No match chats yet"}
                  </p>
                </div>
              </Card>
            ) : (
              filteredMatchChats.map((chat) => (
                <Card
                  key={chat.id}
                  className="p-4 hover-elevate cursor-pointer border-0 shadow-none"
                  onClick={() => setSelectedChat(chat)}
                  data-testid={`match-chat-${chat.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="text-2xl bg-primary/10">
                        ⚔️
                      </AvatarFallback>
                    </Avatar>
                    {chat.unread > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {chat.unread}
                      </Badge>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {chat.timestamp}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${chat.unread > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-1">
            {messageRequests.length === 0 ? (
              <Card>
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No message requests</p>
                </div>
              </Card>
            ) : (
              messageRequests.map((request) => (
                <Card
                  key={request.id}
                  className="p-4 border-0 shadow-none"
                  data-testid={`request-${request.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      {request.isGroup ? (
                        <AvatarFallback className="text-2xl bg-primary/10">
                          {request.groupImage}
                        </AvatarFallback>
                      ) : (
                        <AvatarImage src={request.avatar} />
                      )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {request.name}
                        </h3>
                        {request.isGroup && (
                          <Badge variant="secondary" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {request.members}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 truncate">
                        {request.lastMessage}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAcceptRequest(request)}
                          data-testid={`button-accept-${request.id}`}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleDeclineRequest(request)}
                          data-testid={`button-decline-${request.id}`}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />

      {/* Edit Group Avatar Dialog */}
      <Dialog open={!!editingAvatar} onOpenChange={() => {
        setEditingAvatar(null);
        setNewAvatarEmoji("");
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Group Avatar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-4xl bg-primary/10">
                  {newAvatarEmoji || editingAvatar?.groupImage}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-muted-foreground">{editingAvatar?.name}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter emoji</label>
              <Input
                placeholder="Enter an emoji (e.g., 🎮, ⚡, 👑)"
                value={newAvatarEmoji}
                onChange={(e) => setNewAvatarEmoji(e.target.value.slice(0, 2))}
                maxLength={2}
                className="text-center text-2xl"
                data-testid="input-new-avatar"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {["🎮", "⚡", "👑", "🏆", "🔥", "💎", "⚔️", "🎯"].map((emoji) => (
                <Button
                  key={emoji}
                  variant="outline"
                  className="text-2xl h-12"
                  onClick={() => setNewAvatarEmoji(emoji)}
                  data-testid={`button-emoji-${emoji}`}
                >
                  {emoji}
                </Button>
              ))}
            </div>

            <Button
              className="w-full"
              onClick={handleUpdateAvatar}
              disabled={!newAvatarEmoji.trim() || updateAvatarMutation.isPending}
              data-testid="button-update-avatar"
            >
              {updateAvatarMutation.isPending ? "Updating..." : "Update Avatar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Group Chat Dialog */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Group Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name</label>
              <Input
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                data-testid="input-group-name"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || createGroupMutation.isPending}
              data-testid="button-create-group-confirm"
            >
              {createGroupMutation.isPending ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
