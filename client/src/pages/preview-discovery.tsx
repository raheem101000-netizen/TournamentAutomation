import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Users, Trophy, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Server } from "@shared/schema";

const mockServers = [
  {
    id: "1",
    name: "ProGaming League",
    description: "Competitive gaming tournaments for all skill levels",
    logo: null,
    logoFallback: "🎮",
    backgroundImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop",
    members: "12.5K",
    activeTournaments: 5,
    categories: ["Valorant", "CS:GO", "Apex"],
  },
  {
    id: "2",
    name: "Elite Esports",
    description: "Professional esports community and tournaments",
    logo: null,
    logoFallback: "⚔️",
    backgroundImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=200&fit=crop",
    members: "8.2K",
    activeTournaments: 3,
    categories: ["League of Legends", "Dota 2"],
  },
  {
    id: "3",
    name: "Competitive Arena",
    description: "Weekly tournaments with cash prizes",
    logo: null,
    logoFallback: "🔫",
    backgroundImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=200&fit=crop",
    members: "5.7K",
    activeTournaments: 8,
    categories: ["CS:GO", "Rainbow Six"],
  },
  {
    id: "4",
    name: "Battle Royale Hub",
    description: "BR games only - Fortnite, Apex, Warzone",
    logo: null,
    logoFallback: "👑",
    backgroundImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=200&fit=crop",
    members: "15.1K",
    activeTournaments: 12,
    categories: ["Apex Legends", "Fortnite", "Warzone"],
  },
  {
    id: "5",
    name: "Casual Gaming Community",
    description: "Fun tournaments for casual players",
    logo: null,
    logoFallback: "🎯",
    backgroundImage: "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=200&fit=crop",
    members: "20.3K",
    activeTournaments: 6,
    categories: ["All Games", "Mixed"],
  },
];

export default function PreviewDiscovery() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [createServerOpen, setCreateServerOpen] = useState(false);
  const [serverName, setServerName] = useState("");
  const [serverDescription, setServerDescription] = useState("");
  const [selectedGameTags, setSelectedGameTags] = useState<string[]>([]);
  
  const { data: servers, isLoading } = useQuery<Server[]>({
    queryKey: ['/api/mobile-preview/servers'],
  });

  const createServerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/servers`, {
        name: serverName,
        description: serverDescription,
        gameTags: selectedGameTags,
        category: "Gaming",
        ownerId: "user-demo-123",
        isPublic: 1,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Server created!",
        description: "Your server has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mobile-preview/servers'] });
      setCreateServerOpen(false);
      setServerName("");
      setServerDescription("");
      setSelectedGameTags([]);
      // Navigate to the new server
      setLocation(`/server/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create server",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const joinServerMutation = useMutation({
    mutationFn: async (serverId: string) => {
      return await apiRequest('POST', `/api/servers/${serverId}/join`, {
        userId: "user-demo-123", // Mock user ID - would come from auth
      });
    },
    onSuccess: (_data, serverId) => {
      toast({
        title: "Joined server!",
        description: "You've successfully joined the server.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mobile-preview/servers'] });
      // Navigate to the server detail page
      setLocation(`/server/${serverId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join server",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const availableGameTags = [
    "Valorant", "CS:GO", "League of Legends", "Dota 2", 
    "Apex Legends", "Fortnite", "Rocket League", "Overwatch",
    "Call of Duty", "Rainbow Six", "Warzone", "Smite"
  ];

  const handleCreateServer = () => {
    if (!serverName.trim()) {
      toast({
        title: "Server name required",
        description: "Please enter a name for your server.",
        variant: "destructive",
      });
      return;
    }
    createServerMutation.mutate();
  };

  const serverCards = (servers || []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description || "No description",
    logo: s.iconUrl || null,
    logoFallback: s.name.charAt(0),
    backgroundImage: s.backgroundUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop",
    members: s.memberCount ? `${(s.memberCount / 1000).toFixed(1)}K` : "0",
    activeTournaments: 0,
    categories: s.gameTags && s.gameTags.length > 0 ? s.gameTags : ["Gaming"],
  }));

  const displayServers = serverCards.length > 0 ? serverCards : mockServers;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-lg mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Discovery</h1>
            <Button size="sm" onClick={() => setCreateServerOpen(true)} data-testid="button-create-server">
              Create Server
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search servers..."
              className="pl-9"
              data-testid="input-search-servers"
            />
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading servers...</p>
            </div>
          ) : displayServers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground font-semibold">No servers found</p>
              <p className="text-sm text-muted-foreground mt-2">Be the first to create one!</p>
            </div>
          ) : (
            displayServers.map((server) => (
            <Card
              key={server.id}
              className="overflow-hidden hover-elevate cursor-pointer"
              data-testid={`server-card-${server.id}`}
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={server.backgroundImage}
                  alt={server.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-white/30">
                      {server.logo && <AvatarImage src={server.logo} alt={server.name} />}
                      <AvatarFallback className="text-2xl bg-black/40 backdrop-blur-sm text-white">
                        {server.logoFallback || server.logo}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white drop-shadow-lg truncate">
                        {server.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-white/90">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{server.members}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          <span>{server.activeTournaments} active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {server.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {server.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="text-xs"
                      data-testid={`category-${category.toLowerCase()}`}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  data-testid={`button-join-${server.id}`}
                  onClick={() => joinServerMutation.mutate(server.id)}
                  disabled={joinServerMutation.isPending}
                >
                  {joinServerMutation.isPending ? "Joining..." : "Join Server"}
                </Button>
              </CardContent>
            </Card>
          ))
          )}
        </div>
      </main>

      <BottomNavigation />

      {/* Create Server Dialog */}
      <Dialog open={createServerOpen} onOpenChange={setCreateServerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Your Server</DialogTitle>
            <DialogDescription>
              Set up your gaming community in just a few steps
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="server-name">Server Name *</Label>
              <Input
                id="server-name"
                placeholder="Enter server name..."
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                data-testid="input-server-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="server-description">Description</Label>
              <Textarea
                id="server-description"
                placeholder="Tell people what your server is about..."
                value={serverDescription}
                onChange={(e) => setServerDescription(e.target.value)}
                rows={3}
                data-testid="textarea-server-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Game Tags (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {availableGameTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedGameTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover-elevate active-elevate-2"
                    onClick={() => {
                      setSelectedGameTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCreateServerOpen(false)}
                disabled={createServerMutation.isPending}
                data-testid="button-cancel-create"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateServer}
                disabled={createServerMutation.isPending || !serverName.trim()}
                data-testid="button-confirm-create"
              >
                {createServerMutation.isPending ? "Creating..." : "Create Server"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
