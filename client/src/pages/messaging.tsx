import { useEffect, useState } from 'react';
import { MessagingStore } from '../../../lib/stores/messagingStore';
import { ProfileStore } from '../../../lib/stores/profileStore';
import type { ChatThread, Message, UserProfile, DMRequest } from '@shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageCircle, Users, Send, Plus, UserPlus, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ThreadMetadata {
  thread: ChatThread;
  name: string;
  avatarUri?: string;
}

export default function MessagingPage() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [threadMetadata, setThreadMetadata] = useState<ThreadMetadata[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [senderProfiles, setSenderProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [dmRequests, setDmRequests] = useState<DMRequest[]>([]);
  const [requestProfiles, setRequestProfiles] = useState<Map<string, UserProfile>>(new Map());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedThreadId) {
      loadMessages(selectedThreadId);
    }
  }, [selectedThreadId]);

  const loadData = async () => {
    const user = await ProfileStore.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      
      const userFriends = await ProfileStore.getFriends(user.id);
      setFriends(userFriends);

      const requests = await MessagingStore.getDMRequests(user.id);
      setDmRequests(requests);

      const reqProfiles = new Map<string, UserProfile>();
      for (const req of requests) {
        const profile = await ProfileStore.getProfileById(req.fromUserId);
        if (profile) {
          reqProfiles.set(req.fromUserId, profile);
        }
      }
      setRequestProfiles(reqProfiles);

      const userThreads = await MessagingStore.getAllThreads(user.id);
      
      const metadata: ThreadMetadata[] = await Promise.all(
        userThreads.map(async (thread) => {
          let name = 'Direct Message';
          let avatarUri: string | undefined;

          if (thread.type === 'group') {
            name = thread.name || 'Group Chat';
            avatarUri = thread.avatarUri;
          } else {
            const otherUserId = thread.participantIds.find(id => id !== user.id);
            if (otherUserId) {
              const otherUser = await ProfileStore.getProfileById(otherUserId);
              if (otherUser) {
                name = otherUser.displayName;
                avatarUri = otherUser.avatarUri;
              }
            }
          }

          return { thread, name, avatarUri };
        })
      );

      setThreadMetadata(metadata);
    }
  };

  const loadMessages = async (threadId: string) => {
    const threadMessages = await MessagingStore.getMessages(threadId);
    setMessages(threadMessages);

    const profiles = new Map<string, UserProfile>();
    for (const msg of threadMessages) {
      if (!profiles.has(msg.senderId)) {
        const profile = await ProfileStore.getProfileById(msg.senderId);
        if (profile) {
          profiles.set(msg.senderId, profile);
        }
      }
    }
    setSenderProfiles(profiles);
  };

  const handleSendMessage = async () => {
    if (!currentUser || !selectedThreadId || !newMessage.trim()) return;

    await MessagingStore.sendMessage(selectedThreadId, currentUser.id, newMessage.trim());
    setNewMessage('');
    await loadMessages(selectedThreadId);
    await loadData();
  };

  const handleCreateGroup = async () => {
    if (!currentUser || !groupName.trim() || selectedFriends.length === 0) {
      toast({
        title: "Error",
        description: "Please provide a group name and select at least one friend",
        variant: "destructive",
      });
      return;
    }

    try {
      const thread = await MessagingStore.createGroupThread(
        currentUser.id,
        groupName.trim(),
        selectedFriends
      );
      
      setShowNewGroupDialog(false);
      setGroupName('');
      setSelectedFriends([]);
      await loadData();
      setSelectedThreadId(thread.id);
      
      toast({
        title: "Group Created!",
        description: `${groupName} has been created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group chat",
        variant: "destructive",
      });
    }
  };

  const handleRespondToDMRequest = async (requestId: string, accept: boolean) => {
    await MessagingStore.respondToDMRequest(requestId, accept);
    await loadData();
    
    toast({
      title: accept ? "DM Request Accepted" : "DM Request Declined",
      description: accept ? "You can now chat freely" : "Request has been declined",
    });
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const selectedMeta = threadMetadata.find(m => m.thread.id === selectedThreadId);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No user found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {dmRequests.length > 0 && (
        <div className="bg-accent p-4 border-b">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              DM Requests ({dmRequests.length})
            </h3>
            <div className="space-y-2">
              {dmRequests.map((request) => {
                const profile = requestProfiles.get(request.fromUserId);
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between bg-background p-3 rounded-md"
                    data-testid={`dm-request-${request.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatarUri} />
                        <AvatarFallback>{profile?.displayName[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{profile?.displayName || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">wants to send you a message</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleRespondToDMRequest(request.id, true)}
                        data-testid={`button-accept-dm-${request.id}`}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespondToDMRequest(request.id, false)}
                        data-testid={`button-decline-dm-${request.id}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNewGroupDialog(true)}
              data-testid="button-new-group"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {threadMetadata.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center p-4" data-testid="text-no-threads">
                  No conversations yet
                </p>
              ) : (
                <div className="space-y-2">
                  {threadMetadata.map(({ thread, name, avatarUri }) => (
                    <Card
                      key={thread.id}
                      className={`hover-elevate cursor-pointer ${
                        selectedThreadId === thread.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedThreadId(thread.id)}
                      data-testid={`card-thread-${thread.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={avatarUri} />
                            <AvatarFallback>
                              {thread.type === 'group' ? <Users className="h-4 w-4" /> : name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium truncate" data-testid={`text-thread-name-${thread.id}`}>
                                {name}
                              </p>
                              {thread.type === 'group' && (
                                <Badge variant="secondary" className="text-xs">
                                  {thread.participantIds.length}
                                </Badge>
                              )}
                            </div>
                            {thread.lastMessage && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {thread.lastMessage.content}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedMeta ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedMeta.avatarUri} />
                    <AvatarFallback>
                      {selectedMeta.thread.type === 'group' ? <Users className="h-4 w-4" /> : selectedMeta.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold" data-testid="text-selected-thread-name">
                      {selectedMeta.name}
                    </h3>
                    {selectedMeta.thread.type === 'group' && (
                      <p className="text-sm text-muted-foreground">
                        {selectedMeta.thread.participantIds.length} members
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const sender = senderProfiles.get(message.senderId);
                    const isCurrentUser = message.senderId === currentUser.id;

                    return (
                      <div
                        key={message.id}
                        className="flex gap-3"
                        data-testid={`message-${message.id}`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={sender?.avatarUri} />
                          <AvatarFallback>{sender?.displayName[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold">
                              {isCurrentUser ? 'You' : sender?.displayName || 'Unknown'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm" data-testid={`text-message-content-${message.id}`}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <Separator />

              <div className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="icon"
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Group Dialog */}
      <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-new-group">
          <DialogHeader>
            <DialogTitle>Create Group Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                data-testid="input-group-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Select Members</Label>
              <ScrollArea className="h-60 border rounded-md p-4">
                {friends.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">
                    No friends to add
                  </p>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center space-x-3"
                        data-testid={`friend-option-${friend.id}`}
                      >
                        <Checkbox
                          id={`friend-${friend.id}`}
                          checked={selectedFriends.includes(friend.id)}
                          onCheckedChange={() => toggleFriendSelection(friend.id)}
                        />
                        <label
                          htmlFor={`friend-${friend.id}`}
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={friend.avatarUri} />
                            <AvatarFallback>{friend.displayName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{friend.displayName}</p>
                            <p className="text-xs text-muted-foreground">@{friend.username}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewGroupDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedFriends.length === 0}
              data-testid="button-create-group-submit"
            >
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
