import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Edit, Users, Trophy, Medal, Award, Star, Target, Plus, ArrowRight, Crown, Calendar, Shield, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@shared/schema";

const mockUser = {
  username: "ProGamer2024",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=progamer",
  bio: "Competitive gamer | Tournament organizer | Always looking for new teammates",
  friendCount: 247,
  level: 42,
};

const mockTeams = [
  {
    id: "1",
    name: "Shadow Wolves",
    logo: "🐺",
    playerCount: 5,
    owner: "@ProGamer2024",
    bio: "Competitive Valorant team looking to dominate the esports scene. We practice daily and compete in major tournaments.",
    players: [
      { username: "ProGamer2024", position: "IGL", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=progamer" },
      { username: "NinjaKid", position: "Duelist", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ninja" },
      { username: "SniperElite", position: "Sentinel", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sniper" },
      { username: "FlashBang", position: "Controller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=flash" },
      { username: "TacticalG", position: "Initiator", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tactical" },
    ],
    achievements: [
      { icon: Trophy, title: "Regional Champions", color: "text-amber-500" },
      { icon: Medal, title: "Top 5 Finish", color: "text-slate-500" },
      { icon: Star, title: "Undefeated Streak", color: "text-blue-500" },
    ],
    tournaments: [
      { name: "Summer Championship 2024", result: "1st Place - $5,000" },
      { name: "Midnight Masters", result: "3rd Place - $1,000" },
      { name: "Winter Showdown", result: "Semifinals" },
    ],
  },
  {
    id: "2",
    name: "Storm Breakers",
    logo: "⚡",
    playerCount: 4,
    owner: "@ProGamer2024",
    bio: "CS:GO squad focused on tactical gameplay and team coordination.",
    players: [
      { username: "ProGamer2024", position: "AWPer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=progamer" },
      { username: "QuickShot", position: "Entry Fragger", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=quick" },
      { username: "CalmPlay", position: "Support", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=calm" },
      { username: "BombMaster", position: "Lurker", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bomb" },
    ],
    achievements: [
      { icon: Medal, title: "Runner Up", color: "text-slate-500" },
      { icon: Trophy, title: "Best Team Coordination", color: "text-purple-500" },
    ],
    tournaments: [
      { name: "Winter Showdown", result: "2nd Place - $1,500" },
    ],
  },
];

export default function PreviewAccount() {
  const [, setLocation] = useLocation();
  const [selectedTeam, setSelectedTeam] = useState<typeof mockTeams[0] | null>(null);
  const [viewingUser, setViewingUser] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null);
  const [serverNotFound, setServerNotFound] = useState(false);

  const { user: authUser } = useAuth();

  const currentUser = authUser ? {
    username: authUser.username,
    avatarUrl: authUser.avatarUrl || undefined,
    bio: authUser.bio || "No bio yet",
    level: authUser.level || 1,
    friendCount: mockUser.friendCount, // Not in schema, use mock
    displayName: authUser.displayName || authUser.username,
  } : mockUser;

  // Check if viewing own profile or another user's profile
  const isOwnProfile = viewingUser === null;
  const displayUser = viewingUser || currentUser.username;
  // For own profile, use authUser?.id; for viewing others, we'd need to look up their ID
  // For now, achievements only show on own profile since we need user ID
  const achievementsUserId = isOwnProfile ? authUser?.id : null;

  const { data: userAchievements = [] } = useQuery<any[]>({
    queryKey: [`/api/users/${achievementsUserId}/achievements`],
    enabled: !!achievementsUserId,
  });

  const getAchievementIcon = (iconUrl: string) => {
    const iconMap: { [key: string]: any } = {
      "champion": Trophy,
      "runner-up": Medal,
      "third-place": Medal,
      "mvp": Award,
      "top-scorer": Target,
      "best-defense": Shield,
      "rising-star": Zap,
    };
    return iconMap[iconUrl] || Trophy;
  };

  const getAchievementColor = (iconUrl: string) => {
    const colorMap: { [key: string]: string } = {
      "champion": "text-amber-500",
      "runner-up": "text-slate-300",
      "third-place": "text-amber-700",
      "mvp": "text-purple-500",
      "top-scorer": "text-red-500",
      "best-defense": "text-green-500",
      "rising-star": "text-yellow-500",
    };
    return colorMap[iconUrl] || "text-muted-foreground";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{isOwnProfile ? "Profile" : `@${displayUser}`}</h1>
          <div className="flex items-center gap-2">
            {isOwnProfile && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setViewingUser("NinjaKid")}
                  data-testid="button-demo-visitor"
                >
                  View as Visitor
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setLocation("/account/settings")}
                  data-testid="button-settings"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </>
            )}
            {!isOwnProfile && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setViewingUser(null)} 
                data-testid="button-back-to-profile"
              >
                Back to My Profile
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-lg mx-auto px-4 py-4 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {!authUser ? (
                <div className="py-8">
                  <p className="text-muted-foreground">Loading profile...</p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-primary/20">
                      <AvatarImage src={currentUser.avatarUrl || undefined} />
                      <AvatarFallback>{currentUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
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
                      <h2 className="text-2xl font-bold">{currentUser.username}</h2>
                      <Badge variant="secondary">Lv. {currentUser.level ?? 1}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{currentUser.friendCount ?? 0} friends</span>
                    </div>

                    <p className="text-sm text-muted-foreground px-4">
                      {currentUser.bio || "No bio yet"}
                    </p>
                  </div>
                </>
              )}

              {isOwnProfile ? (
                <Button variant="outline" className="w-full" data-testid="button-edit-profile">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2 w-full">
                  <Button variant="default" className="flex-1" data-testid="button-add-friend">
                    <Users className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                  <Button variant="outline" className="flex-1" data-testid="button-message">
                    Message
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Teams</h3>
            {isOwnProfile && (
              <Button 
                size="sm" 
                onClick={() => setLocation("/create-team")}
                data-testid="button-create-team"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {mockTeams.map((team) => (
              <Card
                key={team.id}
                className="hover-elevate cursor-pointer"
                onClick={() => setSelectedTeam(team)}
                data-testid={`team-card-${team.id}`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-col items-center text-center">
                    <div className="text-5xl mb-2">{team.logo}</div>
                    <h4 className="font-semibold text-sm line-clamp-1">{team.name}</h4>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{team.playerCount} players</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {userAchievements && userAchievements.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Achievements</h3>
            <div className="grid grid-cols-3 gap-3">
              {userAchievements.map((achievement: any) => {
                const IconComponent = getAchievementIcon(achievement.iconUrl);
                const colorClass = getAchievementColor(achievement.iconUrl);
                return (
                  <Card 
                    key={achievement.id} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => setSelectedAchievement(achievement)}
                    data-testid={`achievement-card-${achievement.id}`}
                  >
                    <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                      <IconComponent className={`w-8 h-8 ${colorClass}`} />
                      <div className="w-full">
                        <p className="font-semibold text-sm line-clamp-2">{achievement.title}</p>
                        {achievement.serverName ? (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-xs h-auto p-0 mt-1 line-clamp-1 text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (achievement.serverId) {
                                setLocation(`/server/${achievement.serverId}`);
                              }
                            }}
                            data-testid={`button-server-link-${achievement.id}`}
                          >
                            {achievement.serverName}
                          </Button>
                        ) : (
                          <p className="text-xs text-destructive mt-1">Server no longer exists</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

      </main>

      <BottomNavigation />

      {/* Achievement Details Modal */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {selectedAchievement && (
            <div className="space-y-6">
              <DialogHeader className="space-y-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  {(() => {
                    const IconComponent = getAchievementIcon(selectedAchievement.iconUrl);
                    const colorClass = getAchievementColor(selectedAchievement.iconUrl);
                    return <IconComponent className={`w-12 h-12 ${colorClass}`} />;
                  })()}
                  <DialogTitle className="text-2xl">{selectedAchievement.title}</DialogTitle>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {selectedAchievement.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Description</h4>
                    <p className="text-sm">{selectedAchievement.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground">Earned</h4>
                    <p className="text-sm">
                      {selectedAchievement.achievedAt
                        ? new Date(selectedAchievement.achievedAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground">Category</h4>
                    <p className="text-sm capitalize">{selectedAchievement.category || "N/A"}</p>
                  </div>
                </div>

                {selectedAchievement.serverName && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Server</h4>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedAchievement(null);
                        setLocation(`/server/${selectedAchievement.serverId}`);
                      }}
                      data-testid="button-visit-server"
                    >
                      Visit {selectedAchievement.serverName}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {selectedAchievement.awardedBy && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground">Awarded By</h4>
                    <p className="text-sm text-muted-foreground">@{selectedAchievement.awardedBy}</p>
                  </div>
                )}

                {selectedAchievement.createdAt && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground">Awarded On</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(selectedAchievement.createdAt).toLocaleDateString()} at{" "}
                      {new Date(selectedAchievement.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Team Modal */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          {selectedTeam && (
            <div className="space-y-6">
              <DialogHeader className="space-y-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="text-7xl">{selectedTeam.logo}</div>
                  <div>
                    <DialogTitle className="text-2xl mb-1">{selectedTeam.name}</DialogTitle>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Crown className="w-4 h-4" />
                      <span>{selectedTeam.owner}</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground">Bio</h4>
                  <p className="text-sm">{selectedTeam.bio}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Player Roster</h4>
                  <div className="space-y-2">
                    {selectedTeam.players.map((player, idx) => (
                      <Card 
                        key={idx} 
                        className="p-3 hover-elevate cursor-pointer"
                        onClick={() => {
                          setSelectedTeam(null);
                          setViewingUser(player.username);
                        }}
                        data-testid={`player-${player.username}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={player.avatar} />
                              <AvatarFallback>{player.username[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">@{player.username}</p>
                              <p className="text-xs text-muted-foreground">{player.position}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Team Achievements</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedTeam.achievements.map((achievement, idx) => {
                      const Icon = achievement.icon;
                      return (
                        <Card key={idx} className="p-3">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <Icon className={`w-8 h-8 ${achievement.color}`} />
                            <p className="text-xs font-medium line-clamp-2">
                              {achievement.title}
                            </p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Tournaments Played</h4>
                  <div className="space-y-2">
                    {selectedTeam.tournaments.map((tournament, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{tournament.name}</p>
                          <p className="text-xs text-muted-foreground">{tournament.result}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
