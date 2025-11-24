import { useState, useRef, ChangeEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Plus, Users, Send, ArrowLeft, Edit, Check, X, Image as ImageIcon, Paperclip, Smile, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
}

interface MessageThread {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ThreadMessage {
  id: string;
  threadId: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
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
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [editingAvatar, setEditingAvatar] = useState<Chat | null>(null);
  const [newAvatarEmoji, setNewAvatarEmoji] = useState("");
  const [messageRequests, setMessageRequests] = useState<Chat[]>(mockMessageRequests);
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

  // Fetch messages for selected thread
  const { data: threadMessages = [], isLoading: messagesLoading } = useQuery<ThreadMessage[]>({
    queryKey: ["/api/message-threads", selectedChat?.id, "messages"],
    enabled: !!selectedChat,
  });

  const acceptedChats = threads.map(threadToChat);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!selectedChat) throw new Error("No chat selected");
      
      const response = await fetch(`/api/message-threads/${selectedChat.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
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
      // Refetch messages after sending
      queryClient.invalidateQueries({ 
        queryKey: ["/api/message-threads", selectedChat?.id, "messages"] 
      });
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

  const handleUpdateAvatar = () => {
    if (!editingAvatar || !newAvatarEmoji.trim()) return;
    
    toast({
      title: "Group avatar updated!",
      description: `Changed to ${newAvatarEmoji}`,
    });
    
    setEditingAvatar(null);
    setNewAvatarEmoji("");
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
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto container max-w-lg mx-auto px-4 py-4">
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
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      {!isOwn && (
                        <p className="text-xs text-muted-foreground mb-1 px-3">{msg.username}</p>
                      )}
                      <Card className={`p-3 ${isOwn ? 'bg-primary text-primary-foreground' : ''}`}>
                        <p className="text-sm">{msg.message}</p>
                      </Card>
                      <p className="text-xs text-muted-foreground mt-1 px-3">{formatTime(msg.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        <div className="sticky bottom-0 border-t bg-background">
          <div className="container max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={handleFileUpload}
                data-testid="button-attach-file"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={handleImageUpload}
                data-testid="button-attach-image"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                data-testid="input-message"
              />
              <Button size="icon" variant="ghost" data-testid="button-emoji">
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                data-testid="button-send-message"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
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
          </div>
        </div>
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
            <Button size="icon" variant="ghost" data-testid="button-create-group">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-9"
              data-testid="input-search-messages"
            />
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-2">
        <Tabs defaultValue="accepted" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="accepted" data-testid="tab-accepted">
              Accepted
              {acceptedChats.filter(c => c.unread > 0).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {acceptedChats.reduce((sum, c) => sum + c.unread, 0)}
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

          <TabsContent value="accepted" className="space-y-1">
            {isLoading ? (
              <Card className="p-8 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </Card>
            ) : acceptedChats.length === 0 ? (
              <Card>
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                </div>
              </Card>
            ) : (
              acceptedChats.map((chat) => (
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

      <div className="fixed bottom-16 right-4 z-40">
        <Button
          size="icon"
          className="w-14 h-14 rounded-full shadow-lg"
          data-testid="button-new-message"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

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
              disabled={!newAvatarEmoji.trim()}
              data-testid="button-update-avatar"
            >
              Update Avatar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
