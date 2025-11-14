import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function MobilePreviewMyServers() {
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4" data-testid="page-title">My Servers</h1>
      <p className="text-sm text-muted-foreground mb-6" data-testid="page-description">
        Your gaming communities and tournaments
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card data-testid="card-upcoming-matches">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No upcoming matches scheduled</p>
          </CardContent>
        </Card>

        <Card data-testid="card-my-teams">
          <CardHeader>
            <CardTitle>My Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">You haven't joined any teams yet</p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-tournaments">
          <CardHeader>
            <CardTitle>Active Tournaments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No active tournament participation</p>
          </CardContent>
        </Card>

        <Card data-testid="card-match-history">
          <CardHeader>
            <CardTitle>Match History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No match history available</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
