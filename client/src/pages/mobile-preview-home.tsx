import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Calendar, Users, Trophy, DollarSign, Info } from "lucide-react";
import type { Tournament } from "@shared/schema";

export default function MobilePreviewHome() {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  
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
            className="overflow-hidden hover-elevate"
            data-testid={`tournament-card-${tournament.id}`}
          >
            {/* Tournament Poster Image */}
            <div className="relative aspect-video bg-gradient-to-br from-primary/30 to-primary/10">
              {tournament.imageUrl ? (
                <img 
                  src={tournament.imageUrl} 
                  alt={tournament.name}
                  className="w-full h-full object-cover"
                  data-testid={`tournament-poster-${tournament.id}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Trophy className="h-20 w-20 text-primary opacity-30" />
                </div>
              )}
              
              {/* Prize Overlay */}
              {tournament.prizeReward && (
                <div 
                  className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-1 shadow-lg"
                  data-testid={`tournament-prize-${tournament.id}`}
                >
                  <Trophy className="h-4 w-4" />
                  {tournament.prizeReward}
                </div>
              )}
            </div>

            <CardContent className="p-4">
              {/* Tournament Name & Game */}
              <h3 className="font-bold text-lg mb-1" data-testid={`tournament-name-${tournament.id}`}>
                {tournament.name}
              </h3>
              {tournament.game && (
                <p className="text-sm text-muted-foreground mb-3" data-testid={`tournament-game-${tournament.id}`}>
                  {tournament.game}
                </p>
              )}

              {/* Tournament Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span data-testid={`tournament-teams-${tournament.id}`}>
                    {tournament.totalTeams} teams
                  </span>
                </div>
                
                {tournament.startDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span data-testid={`tournament-date-${tournament.id}`}>
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {tournament.entryFee != null && tournament.entryFee > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span data-testid={`tournament-fee-${tournament.id}`}>
                      ${tournament.entryFee} entry fee
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  data-testid={`button-join-${tournament.id}`}
                >
                  Join Tournament
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedTournament(tournament)}
                  data-testid={`button-details-${tournament.id}`}
                >
                  <Info className="h-4 w-4" />
                </Button>
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

      {/* Tournament Details Modal */}
      <Dialog open={!!selectedTournament} onOpenChange={(open) => !open && setSelectedTournament(null)}>
        <DialogContent data-testid="tournament-details-modal">
          <DialogHeader>
            <DialogTitle data-testid="modal-tournament-name">
              {selectedTournament?.name}
            </DialogTitle>
            <DialogDescription data-testid="modal-tournament-game">
              {selectedTournament?.game}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedTournament?.imageUrl && (
              <img 
                src={selectedTournament.imageUrl} 
                alt={selectedTournament.name}
                className="w-full rounded-md"
              />
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-card rounded-md">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Prize Pool</span>
                </div>
                <span className="text-lg font-bold text-primary">
                  {selectedTournament?.prizeReward || 'TBD'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-card rounded-md">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">Teams</span>
                </div>
                <span>{selectedTournament?.totalTeams}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-card rounded-md">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-semibold">Format</span>
                </div>
                <span className="capitalize">{selectedTournament?.format?.replace('_', ' ')}</span>
              </div>

              {selectedTournament?.startDate && (
                <div className="flex items-center justify-between p-3 bg-card rounded-md">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-semibold">Start Date</span>
                  </div>
                  <span>{new Date(selectedTournament.startDate).toLocaleString()}</span>
                </div>
              )}

              {selectedTournament?.entryFee != null && selectedTournament.entryFee > 0 && (
                <div className="flex items-center justify-between p-3 bg-card rounded-md">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-semibold">Entry Fee</span>
                  </div>
                  <span>${selectedTournament.entryFee}</span>
                </div>
              )}

              {selectedTournament?.organizerName && (
                <div className="flex items-center justify-between p-3 bg-card rounded-md">
                  <span className="font-semibold">Organizer</span>
                  <span>{selectedTournament.organizerName}</span>
                </div>
              )}
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              data-testid="modal-button-join"
            >
              Join Tournament
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
