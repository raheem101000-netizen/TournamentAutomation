import { useEffect, useState } from 'react';
import { DiscoveryStore } from '../../../lib/stores/discoveryStore';
import type { TournamentPoster } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Users, DollarSign, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DiscoveryPage() {
  const [tournaments, setTournaments] = useState<TournamentPoster[]>([]);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    const all = await DiscoveryStore.getAllTournaments();
    setTournaments(all);
  };

  const getStatusBadge = (status: TournamentPoster['status']) => {
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

  const getFormatLabel = (format: TournamentPoster['format']) => {
    const labels = {
      single_elimination: 'Single Elimination',
      round_robin: 'Round Robin',
      swiss: 'Swiss',
    };
    return labels[format];
  };

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
                <CardHeader>
                  <div className="space-y-2">
                    <CardTitle data-testid={`text-tournament-name-${tournament.id}`}>
                      {tournament.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{tournament.game}</Badge>
                      <Badge variant="outline">{getFormatLabel(tournament.format)}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {tournament.currentTeams}/{tournament.maxTeams} teams
                      </span>
                    </div>
                    {tournament.prizeReward && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{tournament.prizeReward}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(tournament.startDate), { addSuffix: true })}
                      </span>
                    </div>
                    {tournament.entryFee && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{tournament.entryFee} coins</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">
                      by {tournament.organizerName}
                    </span>
                    <Button size="sm" data-testid={`button-view-${tournament.id}`}>
                      View Details
                    </Button>
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
