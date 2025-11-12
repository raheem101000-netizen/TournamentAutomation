import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { Tournament } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Users, DollarSign, Trophy, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DiscoveryPage() {
  const [, navigate] = useLocation();

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ['/api/tournaments'],
  });

  const handleViewDetails = (tournamentId: string) => {
    navigate(`/tournament/${tournamentId}`);
  };

  const handleJoinTournament = (tournamentId: string) => {
    navigate(`/register/${tournamentId}`);
  };

  const getStatusBadge = (status: Tournament['status']) => {
    const variants = {
      upcoming: { variant: 'default' as const, label: 'Upcoming' },
      in_progress: { variant: 'default' as const, label: 'Live' },
      completed: { variant: 'secondary' as const, label: 'Completed' },
    };
    const config = variants[status];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getFormatLabel = (format: Tournament['format']) => {
    const labels = {
      single_elimination: 'Single Elimination',
      round_robin: 'Round Robin',
      swiss: 'Swiss',
    };
    return labels[format];
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Search className="h-8 w-8" />
            Discover Tournaments
          </h1>
        </div>

        {tournaments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground" data-testid="text-no-tournaments">
                No tournaments available
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournaments.map((tournament) => (
              <Card
                key={tournament.id}
                className="hover-elevate overflow-hidden"
                data-testid={`card-tournament-${tournament.id}`}
              >
                {tournament.imageUrl && (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={tournament.imageUrl}
                      alt={tournament.name}
                      className="w-full h-full object-cover"
                      data-testid={`img-tournament-${tournament.id}`}
                    />
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(tournament.status)}
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="space-y-2">
                    <CardTitle data-testid={`text-tournament-name-${tournament.id}`}>
                      {tournament.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      {tournament.game && <Badge variant="outline">{tournament.game}</Badge>}
                      <Badge variant="outline">{getFormatLabel(tournament.format)}</Badge>
                      {!tournament.imageUrl && <div className="absolute top-4 right-4">{getStatusBadge(tournament.status)}</div>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {tournament.totalTeams} teams
                      </span>
                    </div>
                    {tournament.prizeReward && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{tournament.prizeReward}</span>
                      </div>
                    )}
                    {tournament.startDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(tournament.startDate), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                    {tournament.entryFee && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{tournament.entryFee} coins</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    {tournament.organizerName && (
                      <span className="text-sm text-muted-foreground">
                        by {tournament.organizerName}
                      </span>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {tournament.status === 'upcoming' && (
                        <Button 
                          size="sm" 
                          data-testid={`button-join-${tournament.id}`}
                          onClick={() => handleJoinTournament(tournament.id)}
                        >
                          Join
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        data-testid={`button-view-${tournament.id}`}
                        onClick={() => handleViewDetails(tournament.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
