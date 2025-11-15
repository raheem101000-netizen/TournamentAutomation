import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Edit, Users, Trophy, Medal, Award, Star, Target } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockUser = {
  username: "ProGamer2024",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=progamer",
  bio: "Competitive gamer | Tournament organizer | Always looking for new teammates",
  friendCount: 247,
  level: 42,
};

const mockAchievements = [
  {
    id: "1",
    title: "First Victory",
    description: "Win your first tournament",
    icon: Trophy,
    earned: true,
    type: "solo",
    rarity: "common",
  },
  {
    id: "2",
    title: "Champion",
    description: "Win 10 tournaments",
    icon: Medal,
    earned: true,
    type: "solo",
    rarity: "rare",
  },
  {
    id: "3",
    title: "Team Player",
    description: "Win 5 team tournaments",
    icon: Users,
    earned: true,
    type: "team",
    rarity: "rare",
  },
  {
    id: "4",
    title: "Legendary",
    description: "Win 50 tournaments",
    icon: Award,
    earned: false,
    type: "solo",
    rarity: "legendary",
  },
  {
    id: "5",
    title: "Perfect Score",
    description: "Win a tournament without losing a single match",
    icon: Star,
    earned: true,
    type: "solo",
    rarity: "epic",
  },
  {
    id: "6",
    title: "Tournament Master",
    description: "Organize 20 successful tournaments",
    icon: Target,
    earned: false,
    type: "solo",
    rarity: "epic",
  },
];

const rarityColors: Record<string, string> = {
  common: "bg-slate-500/20 text-slate-700 dark:text-slate-300",
  rare: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  epic: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  legendary: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
};

export default function PreviewAccount() {
  const earnedAchievements = mockAchievements.filter(a => a.earned);
  const lockedAchievements = mockAchievements.filter(a => !a.earned);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button size="icon" variant="ghost" data-testid="button-settings">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={mockUser.avatar} />
                  <AvatarFallback>PG</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full"
                  data-testid="button-edit-avatar"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 w-full">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-bold">{mockUser.username}</h2>
                  <Badge variant="secondary">Lv. {mockUser.level}</Badge>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{mockUser.friendCount} friends</span>
                </div>

                <p className="text-sm text-muted-foreground px-4">
                  {mockUser.bio}
                </p>
              </div>

              <Button variant="outline" className="w-full" data-testid="button-edit-profile">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Achievements</h3>
            <Badge variant="secondary">
              {earnedAchievements.length}/{mockAchievements.length}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Earned</h4>
              <div className="grid grid-cols-3 gap-3">
                {earnedAchievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <Card
                      key={achievement.id}
                      className={`p-4 hover-elevate cursor-pointer ${rarityColors[achievement.rarity]}`}
                      data-testid={`achievement-${achievement.id}`}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <Icon className="w-8 h-8" />
                        <div className="space-y-1">
                          <p className="text-xs font-semibold line-clamp-2">
                            {achievement.title}
                          </p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {achievement.type}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Locked</h4>
              <div className="grid grid-cols-3 gap-3">
                {lockedAchievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <Card
                      key={achievement.id}
                      className="p-4 opacity-50 grayscale"
                      data-testid={`achievement-locked-${achievement.id}`}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <Icon className="w-8 h-8" />
                        <div className="space-y-1">
                          <p className="text-xs font-semibold line-clamp-2">
                            {achievement.title}
                          </p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {achievement.type}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Click on any achievement to view details and progress
            </p>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
