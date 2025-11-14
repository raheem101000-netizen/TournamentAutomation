import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trophy } from "lucide-react";
import type { Tournament } from "@shared/schema";

export default function MobilePreviewHome() {
  const { data: tournaments, isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" data-testid="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4" data-testid="page-title">Tournaments</h1>
      <p className="text-sm text-muted-foreground mb-6" data-testid="page-description">
        Discover and join exciting gaming tournaments
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tournaments?.map((tournament) => (
          <Card 
            key={tournament.id} 
            className="hover-elevate cursor-pointer"
            data-testid={`tournament-card-${tournament.id}`}
          >
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg flex items-center justify-center">
              <Trophy className="h-16 w-16 text-primary opacity-50" data-testid={`tournament-icon-${tournament.id}`} />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2" data-testid={`tournament-name-${tournament.id}`}>
                {tournament.name}
              </h3>
              {tournament.game && (
                <p className="text-sm text-muted-foreground mb-2" data-testid={`tournament-game-${tournament.id}`}>
                  {tournament.game}
                </p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground" data-testid={`tournament-teams-${tournament.id}`}>
                  {tournament.totalTeams} teams
                </span>
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tournament.status === 'upcoming' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                  data-testid={`tournament-status-${tournament.id}`}
                >
                  {tournament.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!tournaments || tournaments.length === 0 && (
        <div className="text-center py-12" data-testid="no-tournaments-message">
          <p className="text-muted-foreground">No tournaments available</p>
        </div>
      )}
    </div>
  );
}
