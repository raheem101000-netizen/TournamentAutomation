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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Grid3x3, Repeat } from "lucide-react";
import type { InsertTournament } from "@shared/schema";

interface CreateTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (tournament: InsertTournament & { teamNames: string[] }) => void;
}

export default function CreateTournamentDialog({ 
  open, 
  onOpenChange, 
  onSubmit 
}: CreateTournamentDialogProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"round_robin" | "single_elimination" | "swiss">("single_elimination");
  const [swissRounds, setSwissRounds] = useState(3);
  const [teamInput, setTeamInput] = useState("");
  const [teams, setTeams] = useState<string[]>([]);

  const formats = [
    {
      id: "single_elimination",
      name: "Single Elimination",
      icon: Trophy,
      description: "Teams compete in knockout rounds until one winner remains",
      pros: ["Fast and exciting", "Clear progression", "Best for time-limited events"],
    },
    {
      id: "round_robin",
      name: "Round Robin",
      icon: Repeat,
      description: "Every team plays against every other team",
      pros: ["Fair and comprehensive", "All teams get equal matches", "Best for leagues"],
    },
    {
      id: "swiss",
      name: "Swiss System",
      icon: Grid3x3,
      description: "Teams paired based on performance without elimination",
      pros: ["Balanced competition", "No elimination", "Flexible duration"],
    },
  ];

  const handleAddTeam = () => {
    if (teamInput.trim() && !teams.includes(teamInput.trim())) {
      setTeams([...teams, teamInput.trim()]);
      setTeamInput("");
    }
  };

  const handleRemoveTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSubmit({
      name,
      format: format as any,
      totalTeams: teams.length,
      swissRounds: format === "swiss" ? swissRounds : null,
      teamNames: teams,
    });
    handleReset();
  };

  const handleReset = () => {
    setStep(1);
    setName("");
    setFormat("single_elimination");
    setSwissRounds(3);
    setTeamInput("");
    setTeams([]);
    onOpenChange(false);
  };

  const canProceedStep1 = name.trim().length > 0;
  const canProceedStep2 = true;
  const canSubmit = teams.length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Create Tournament</DialogTitle>
          <DialogDescription>
            Step {step} of 3: {step === 1 ? "Tournament Details" : step === 2 ? "Select Format" : "Add Teams"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                placeholder="e.g., Summer Championship 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-tournament-name"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as any)}>
              <div className="grid gap-4">
                {formats.map((f) => (
                  <Label
                    key={f.id}
                    htmlFor={f.id}
                    className="cursor-pointer"
                  >
                    <Card className={`hover-elevate ${format === f.id ? 'ring-2 ring-primary' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-md">
                              <f.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-display">{f.name}</CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {f.description}
                              </CardDescription>
                            </div>
                          </div>
                          <RadioGroupItem value={f.id} id={f.id} />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {f.pros.map((pro, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {pro}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                ))}
              </div>
            </RadioGroup>

            {format === "swiss" && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="rounds">Number of Rounds</Label>
                <Input
                  id="rounds"
                  type="number"
                  min="1"
                  max="10"
                  value={swissRounds}
                  onChange={(e) => setSwissRounds(parseInt(e.target.value) || 3)}
                  data-testid="input-swiss-rounds"
                />
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team">Add Team</Label>
              <div className="flex gap-2">
                <Input
                  id="team"
                  placeholder="Team name"
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
                  data-testid="input-team-name"
                />
                <Button 
                  onClick={handleAddTeam}
                  data-testid="button-add-team"
                >
                  Add
                </Button>
              </div>
            </div>

            {teams.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Teams ({teams.length})</Label>
                  {teams.length < 2 && (
                    <span className="text-sm text-destructive">Minimum 2 teams required</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {teams.map((team, index) => (
                    <Badge 
                      key={index}
                      variant="secondary"
                      className="pl-3 pr-2 py-1.5 gap-2"
                      data-testid={`badge-team-${index}`}
                    >
                      <Users className="w-3 h-3" />
                      {team}
                      <button
                        onClick={() => handleRemoveTeam(index)}
                        className="ml-1 hover:text-destructive"
                        data-testid={`button-remove-team-${index}`}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)}
              data-testid="button-back"
            >
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
              data-testid="button-next"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              data-testid="button-create-tournament"
            >
              Create Tournament
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
