import { BottomNavigation } from "@/components/BottomNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Plus, Users, Image as ImageIcon, Paperclip } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockChats = [
  {
    id: "1",
    name: "Team Alpha Squad",
    isGroup: true,
    groupImage: "👥",
    lastMessage: "Ready for tonight's match?",
    timestamp: "2m ago",
    unread: 3,
    members: 5,
  },
  {
    id: "2",
    name: "Tournament Organizers",
    isGroup: true,
    groupImage: "🏆",
    lastMessage: "Prize pool confirmed!",
    timestamp: "15m ago",
    unread: 0,
    members: 8,
  },
  {
    id: "3",
    name: "John Smith",
    isGroup: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    lastMessage: "GG! Want to team up again?",
    timestamp: "1h ago",
    unread: 1,
    members: 0,
  },
  {
    id: "4",
    name: "Practice Group",
    isGroup: true,
    groupImage: "🎮",
    lastMessage: "Sarah sent an image",
    timestamp: "3h ago",
    unread: 0,
    members: 4,
  },
  {
    id: "5",
    name: "Emma Wilson",
    isGroup: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    lastMessage: "Thanks for the tips!",
    timestamp: "Yesterday",
    unread: 0,
    members: 0,
  },
];

export default function PreviewMessages() {
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
        <div className="space-y-1">
          {mockChats.map((chat) => (
            <Card
              key={chat.id}
              className="p-4 hover-elevate cursor-pointer border-0 shadow-none"
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
                      {chat.isGroup && (
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
          ))}
        </div>
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
    </div>
  );
}
