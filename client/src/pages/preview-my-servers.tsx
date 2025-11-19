import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Users, Trophy, Server as ServerIcon, Search, Crown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Server } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";

export default function PreviewMyServers() {
  const { user } = useAuth();
  
  // Fetch servers where user is a member
  const { data: memberServersData, isLoading: memberLoading } = useQuery<Server[]>({
    queryKey: [`/api/users/${user?.id}/servers`],
    enabled: !!user?.id,
  });

  const myServers = memberServersData || [];
  
  // Separate servers into owned and member servers
  const ownedServers = myServers.filter(server => server.ownerId === user?.id);
  const memberServers = myServers.filter(server => server.ownerId !== user?.id);
  
  const isLoading = memberLoading;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Servers</h1>
          <Button size="sm" data-testid="button-create-server">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading servers...</p>
          </div>
        ) : myServers.length > 0 ? (
          <div className="space-y-6">
            {/* Servers I Own */}
            {ownedServers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Crown className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Servers I Own ({ownedServers.length})
                  </h2>
                </div>
                {ownedServers.map((server) => (
                  <Link key={server.id} href={`/server/${server.id}`}>
                    <Card
                      className="p-4 hover-elevate cursor-pointer"
                      data-testid={`server-owned-${server.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="text-2xl">{"🎮"}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate mb-1">
                            {server.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{server.memberCount || 0} members</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <Button size="sm" variant="outline" data-testid={`button-manage-${server.id}`}>
                            Manage
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Servers I'm a Member Of */}
            {memberServers.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Users className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Servers I'm a Member Of ({memberServers.length})
                  </h2>
                </div>
                {memberServers.map((server) => (
                  <Link key={server.id} href={`/server/${server.id}`}>
                    <Card
                      className="p-4 hover-elevate cursor-pointer"
                      data-testid={`server-member-${server.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="text-2xl">{"🎮"}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate mb-1">
                            {server.name}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{server.memberCount || 0} members</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <Button size="sm" variant="outline" data-testid={`button-view-${server.id}`}>
                            View
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ServerIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No servers yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Join a server from the Discovery page to get started!
            </p>
            <Link href="/discovery">
              <Button data-testid="button-go-to-discovery">
                <Search className="w-4 h-4 mr-2" />
                Discover Servers
              </Button>
            </Link>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
