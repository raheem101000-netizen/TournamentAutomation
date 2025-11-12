import { useEffect, useState } from 'react';
import { MessagingStore } from '../../../lib/stores/messagingStore';
import { ProfileStore } from '../../../lib/stores/profileStore';
import type { ChatThread, Message, UserProfile } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Users, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MessagingPage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
    }
  }, [selectedThread]);

  const loadData = () => {
    const user = ProfileStore.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const userThreads = MessagingStore.getAllThreads(user.id);
      setThreads(userThreads);
    }
  };

  const loadMessages = (threadId: string) => {
    const threadMessages = MessagingStore.getMessages(threadId);
    setMessages(threadMessages);
  };

  const handleSendMessage = () => {
    if (!currentUser || !selectedThread || !newMessage.trim()) return;

    MessagingStore.sendMessage(selectedThread.id, currentUser.id, newMessage.trim());
    setNewMessage('');
    loadMessages(selectedThread.id);
    loadData();
  };

  const getThreadName = (thread: ChatThread): string => {
    if (thread.type === 'group') {
      return thread.name || 'Group Chat';
    }
    if (currentUser) {
      const otherUserId = thread.participantIds.find(id => id !== currentUser.id);
      if (otherUserId) {
        const otherUser = ProfileStore.getProfileById(otherUserId);
        return otherUser?.displayName || 'Direct Message';
      }
    }
    return 'Direct Message';
  };

  const getThreadAvatar = (thread: ChatThread): string | undefined => {
    if (thread.type === 'group') {
      return thread.avatarUri;
    }
    if (currentUser) {
      const otherUserId = thread.participantIds.find(id => id !== currentUser.id);
      if (otherUserId) {
        const otherUser = ProfileStore.getProfileById(otherUserId);
        return otherUser?.avatarUri;
      }
    }
    return undefined;
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No user found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {threads.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center p-4" data-testid="text-no-threads">
                No conversations yet
              </p>
            ) : (
              <div className="space-y-2">
                {threads.map((thread) => (
                  <Card
                    key={thread.id}
                    className={`hover-elevate cursor-pointer ${
                      selectedThread?.id === thread.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedThread(thread)}
                    data-testid={`card-thread-${thread.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={getThreadAvatar(thread)} />
                          <AvatarFallback>
                            {thread.type === 'group' ? <Users className="h-4 w-4" /> : getThreadName(thread)[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate" data-testid={`text-thread-name-${thread.id}`}>
                              {getThreadName(thread)}
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
        {selectedThread ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={getThreadAvatar(selectedThread)} />
                  <AvatarFallback>
                    {selectedThread.type === 'group' ? <Users className="h-4 w-4" /> : getThreadName(selectedThread)[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold" data-testid="text-selected-thread-name">
                    {getThreadName(selectedThread)}
                  </h3>
                  {selectedThread.type === 'group' && (
                    <p className="text-sm text-muted-foreground">
                      {selectedThread.participantIds.length} members
                    </p>
                  )}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const sender = ProfileStore.getProfileById(message.senderId);
                  const isCurrentUser = message.senderId === currentUser.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                      data-testid={`message-${message.id}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={sender?.avatarUri} />
                        <AvatarFallback>{sender?.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 ${isCurrentUser ? 'text-right' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {isCurrentUser ? 'You' : sender?.displayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <Card className={isCurrentUser ? 'bg-primary text-primary-foreground' : ''}>
                          <CardContent className="p-3">
                            <p className="text-sm" data-testid={`text-message-content-${message.id}`}>
                              {message.content}
                            </p>
                          </CardContent>
                        </Card>
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
  );
}
