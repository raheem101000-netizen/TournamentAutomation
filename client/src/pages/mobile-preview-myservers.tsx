import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Server as ServerIcon, Users, Crown } from "lucide-react";
import { Link } from "wouter";
import type { Server } from "@shared/schema";

export default function MobilePreviewMyServers() {
  const { data: servers = [], isLoading } = useQuery<Server[]>({
    queryKey: ["/api/mobile-preview/servers"],
  });

  if (isLoading) {
    return (
      <div className="p-4 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">My Servers</h1>
        <p className="text-sm text-muted-foreground">Loading servers...</p>
      </div>
    );
  }

  // TODO: Replace with real authentication context (e.g., useUser hook from auth provider)
  const currentUserId = "user-1";

  const ownedServers = servers.filter(s => s.ownerId === currentUserId);
  const memberServers = servers.filter(s => s.ownerId !== currentUserId);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4" data-testid="page-title">My Servers</h1>
      <p className="text-sm text-muted-foreground mb-6" data-testid="page-description">
        Your gaming communities and tournament servers
      </p>

      {ownedServers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Owned Servers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownedServers.map((server) => (
              <Link key={server.id} href={`/server/${server.id}`}>
                <Card 
                  className="hover-elevate active-elevate-2 cursor-pointer transition-all" 
                  data-testid={`card-server-${server.id}`}
                >
                  <CardHeader className="space-y-1 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      {server.iconUrl ? (
                        <img 
                          src={server.iconUrl} 
                          alt={server.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                          <ServerIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {server.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-1">{server.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {server.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{server.memberCount?.toLocaleString()} members</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {memberServers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member Servers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberServers.map((server) => (
              <Link key={server.id} href={`/server/${server.id}`}>
                <Card 
                  className="hover-elevate active-elevate-2 cursor-pointer transition-all" 
                  data-testid={`card-server-${server.id}`}
                >
                  <CardHeader className="space-y-1 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      {server.iconUrl ? (
                        <img 
                          src={server.iconUrl} 
                          alt={server.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                          <ServerIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {server.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-1">{server.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {server.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{server.memberCount?.toLocaleString()} members</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {servers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">No servers found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
