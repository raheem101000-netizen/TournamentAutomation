import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Team } from "@shared/schema";

interface SubmitScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team1: Team;
  team2: Team;
  onSubmit: (winnerId: string, team1Score: number, team2Score: number) => void;
}

export default function SubmitScoreDialog({ 
  open, 
  onOpenChange, 
  team1, 
  team2, 
  onSubmit 
}: SubmitScoreDialogProps) {
  const [winnerId, setWinnerId] = useState("");
  const [team1Score, setTeam1Score] = useState("");
  const [team2Score, setTeam2Score] = useState("");

  const getTeamInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSubmit = () => {
    const score1 = parseInt(team1Score) || 0;
    const score2 = parseInt(team2Score) || 0;
    onSubmit(winnerId, score1, score2);
    handleReset();
  };

  const handleReset = () => {
    setWinnerId("");
    setTeam1Score("");
    setTeam2Score("");
    onOpenChange(false);
  };

  const canSubmit = winnerId && team1Score && team2Score;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Submit Match Result</DialogTitle>
          <DialogDescription>
            Enter the final scores and select the winner
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team1-score">{team1.name}</Label>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getTeamInitials(team1.name)}
                  </AvatarFallback>
                </Avatar>
                <Input
                  id="team1-score"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={team1Score}
                  onChange={(e) => setTeam1Score(e.target.value)}
                  data-testid="input-team1-score"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team2-score">{team2.name}</Label>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getTeamInitials(team2.name)}
                  </AvatarFallback>
                </Avatar>
                <Input
                  id="team2-score"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={team2Score}
                  onChange={(e) => setTeam2Score(e.target.value)}
                  data-testid="input-team2-score"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Winner</Label>
            <RadioGroup value={winnerId} onValueChange={setWinnerId}>
              <div className="space-y-2">
                <Label
                  htmlFor={team1.id}
                  className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover-elevate"
                >
                  <RadioGroupItem value={team1.id} id={team1.id} data-testid="radio-winner-team1" />
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getTeamInitials(team1.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-display font-medium">{team1.name}</span>
                </Label>

                <Label
                  htmlFor={team2.id}
                  className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover-elevate"
                >
                  <RadioGroupItem value={team2.id} id={team2.id} data-testid="radio-winner-team2" />
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getTeamInitials(team2.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-display font-medium">{team2.name}</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleReset}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            data-testid="button-submit-score"
          >
            Submit Result
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
