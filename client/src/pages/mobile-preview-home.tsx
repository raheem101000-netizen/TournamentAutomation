import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Calendar, Users, Trophy, DollarSign, Star, Info } from "lucide-react";
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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-1" data-testid="page-title">Discover</h1>
      
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold border-b-2 border-foreground inline-block pb-1">
          PROK's
        </h2>
      </div>
      
      {/* Vertical Scrolling Grid: 3 columns on desktop, 3 columns on mobile */}
      <div className="grid grid-cols-3 gap-3">
        {tournaments?.map((tournament) => (
          <Card 
            key={tournament.id}
            className="overflow-hidden hover-elevate"
            data-testid={`tournament-card-${tournament.id}`}
          >
            {/* Portrait Poster Image */}
            <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/30 to-primary/10">
              {tournament.imageUrl ? (
                <img 
                  src={tournament.imageUrl} 
                  alt={tournament.name}
                  className="w-full h-full object-cover"
                  data-testid={`tournament-poster-${tournament.id}`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <Trophy className="h-16 w-16 text-primary opacity-60 mb-2" />
                  <p className="text-xs text-muted-foreground">No Poster</p>
                </div>
              )}
              
              {/* Prize Badge Overlay */}
              {tournament.prizeReward && (
                <div 
                  className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold flex items-center gap-1"
                  data-testid={`tournament-prize-${tournament.id}`}
                >
                  <Trophy className="h-3 w-3" />
                  {tournament.prizeReward}
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="p-3">
              {/* Tournament Title & Time */}
              <div className="text-center mb-3">
                <p className="text-sm font-bold uppercase tracking-wide mb-1" data-testid={`tournament-name-${tournament.id}`}>
                  TOURNAMENT
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span data-testid={`tournament-time-${tournament.id}`}>
                    {tournament.startDate 
                      ? new Date(tournament.startDate).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        }).replace(' ', '').toLowerCase()
                      : '0pm'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2"
                  data-testid={`button-join-${tournament.id}`}
                >
                  Join
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
            </div>
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
        <DialogContent className="max-w-md" data-testid="tournament-details-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl" data-testid="modal-tournament-name">
              {selectedTournament?.name}
            </DialogTitle>
            <DialogDescription data-testid="modal-tournament-game">
              {selectedTournament?.game}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Tournament Poster in Modal */}
            {selectedTournament?.imageUrl ? (
              <img 
                src={selectedTournament.imageUrl} 
                alt={selectedTournament.name}
                className="w-full rounded-md aspect-video object-cover"
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-primary/30 to-primary/10 rounded-md flex items-center justify-center">
                <Trophy className="h-20 w-20 text-primary opacity-30" />
              </div>
            )}

            {/* Tournament Details */}
            <div className="space-y-3">
              {selectedTournament?.prizeReward && (
                <div className="flex items-center justify-between p-3 bg-card rounded-md border">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Prize Pool</span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {selectedTournament.prizeReward}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-card rounded-md border">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">Teams</span>
                </div>
                <span>{selectedTournament?.totalTeams}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-card rounded-md border">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-semibold">Format</span>
                </div>
                <span className="capitalize">{selectedTournament?.format?.replace('_', ' ')}</span>
              </div>

              {selectedTournament?.startDate && (
                <div className="flex items-center justify-between p-3 bg-card rounded-md border">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-semibold">Start Date</span>
                  </div>
                  <span className="text-sm">{new Date(selectedTournament.startDate).toLocaleString()}</span>
                </div>
              )}

              {selectedTournament?.entryFee != null && selectedTournament.entryFee > 0 && (
                <div className="flex items-center justify-between p-3 bg-card rounded-md border">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-semibold">Entry Fee</span>
                  </div>
                  <span>${selectedTournament.entryFee}</span>
                </div>
              )}

              {selectedTournament?.organizerName && (
                <div className="flex items-center justify-between p-3 bg-card rounded-md border">
                  <span className="font-semibold">Organizer</span>
                  <span>{selectedTournament.organizerName}</span>
                </div>
              )}
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex gap-3 pt-2">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                data-testid="modal-button-join"
              >
                Join Tournament
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedTournament(null)}
                data-testid="modal-button-close"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
