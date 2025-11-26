import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Clock, CheckCircle2, MessageSquare } from "lucide-react";
import type { Match, Team } from "@shared/schema";

interface MatchCardProps {
  match: Match;
  team1?: Team;
  team2?: Team;
  onSubmitScore?: (matchId: string) => void;
  onViewChat?: (matchId: string) => void;
  compact?: boolean;
}

export default function MatchCard({ 
  match, 
  team1, 
  team2, 
  onSubmitScore, 
  onViewChat,
  compact = false 
}: MatchCardProps) {
  const statusColors = {
    pending: "bg-muted text-muted-foreground",
    in_progress: "bg-primary/10 text-primary border-primary/20",
    completed: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  };

  const statusIcons = {
    pending: Clock,
    in_progress: Trophy,
    completed: CheckCircle2,
  };

  const StatusIcon = statusIcons[match.status];

  const getTeamInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const isWinner = (teamId: string | null) => match.winnerId === teamId;

  if (match.isBye) {
    return (
      <Card className="hover-elevate">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {team1 ? getTeamInitials(team1.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-display font-medium">{team1?.name || "TBD"}</p>
                <p className="text-sm text-muted-foreground">Bye - Auto Advance</p>
              </div>
            </div>
            <Badge variant="outline">Bye</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="hover-elevate">
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className={`font-display text-sm truncate ${isWinner(team1?.id || null) ? 'font-semibold' : ''}`}>
                {team1?.name || "TBD"}
              </span>
              {match.status === "completed" && match.team1Score !== null && (
                <span className="font-semibold text-sm">{match.team1Score}</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground px-2">vs</span>
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              {match.status === "completed" && match.team2Score !== null && (
                <span className="font-semibold text-sm">{match.team2Score}</span>
              )}
              <span className={`font-display text-sm truncate ${isWinner(team2?.id || null) ? 'font-semibold' : ''}`}>
                {team2?.name || "TBD"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-elevate overflow-hidden" data-testid={`card-match-${match.id}`}>
      <CardContent className="p-6 overflow-hidden">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={statusColors[match.status]} data-testid={`badge-match-status-${match.id}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {match.status.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-muted-foreground">Round {match.round}</span>
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center overflow-hidden">
            <div className={`flex flex-col items-center gap-2 p-4 rounded-md overflow-hidden ${isWinner(team1?.id || null) ? 'bg-primary/5 ring-2 ring-primary/20' : ''}`}>
              <Avatar className="h-12 w-12">
                <AvatarFallback className={isWinner(team1?.id || null) ? "bg-primary text-primary-foreground" : "bg-muted"}>
                  {team1 ? getTeamInitials(team1.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <p className="font-display font-semibold text-center truncate" data-testid={`text-team1-${match.id}`}>
                {team1?.name || "TBD"}
              </p>
              {match.status === "completed" && match.team1Score !== null && (
                <p className="text-2xl font-bold">{match.team1Score}</p>
              )}
            </div>

            <div className="text-2xl font-bold text-muted-foreground">VS</div>

            <div className={`flex flex-col items-center gap-2 p-4 rounded-md overflow-hidden ${isWinner(team2?.id || null) ? 'bg-primary/5 ring-2 ring-primary/20' : ''}`}>
              <Avatar className="h-12 w-12">
                <AvatarFallback className={isWinner(team2?.id || null) ? "bg-primary text-primary-foreground" : "bg-muted"}>
                  {team2 ? getTeamInitials(team2.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <p className="font-display font-semibold text-center truncate" data-testid={`text-team2-${match.id}`}>
                {team2?.name || "TBD"}
              </p>
              {match.status === "completed" && match.team2Score !== null && (
                <p className="text-2xl font-bold">{match.team2Score}</p>
              )}
            </div>
          </div>

          {match.status !== "completed" && onSubmitScore && (
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={() => onSubmitScore(match.id)}
                data-testid={`button-submit-score-${match.id}`}
              >
                Submit Score
              </Button>
              {onViewChat && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onViewChat(match.id)}
                  data-testid={`button-chat-${match.id}`}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
