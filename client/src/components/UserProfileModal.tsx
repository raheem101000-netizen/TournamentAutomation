import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { getAchievementIcon, getAchievementColor } from "@/lib/achievement-utils";
import { useState, useEffect } from "react";

interface UserProfileModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
}

export default function UserProfileModal({ userId, open, onOpenChange }: UserProfileModalProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isFriendRequestSent, setIsFriendRequestSent] = useState(false);

  const { data: profileData } = useQuery<UserProfile>({
    queryKey: ["/api/users", userId],
    enabled: !!userId && open,
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<any[]>({
    queryKey: [`/api/users/${userId}/achievements`],
    enabled: !!userId && open,
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/users/${userId}/achievements`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Reset friend request state when modal closes
  useEffect(() => {
    if (!open) {
      setIsFriendRequestSent(false);
    }
  }, [open]);

  const handleAddFriend = async () => {
    if (!profileData || !currentUser) return;
    
    try {
      const response = await fetch("/api/friend-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: profileData.id,
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to send friend request");
      
      setIsFriendRequestSent(true);
      toast({
        title: "Friend request sent!",
        description: `Request sent to ${profileData.displayName || profileData.username}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    }
  };

  const handleMessageProfile = async () => {
    if (!profileData) return;
    
    try {
      const response = await fetch("/api/message-threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName: profileData.displayName || profileData.username,
          participantAvatar: profileData.avatarUrl,
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to create message thread");
      
      onOpenChange(false);
      toast({
        title: "Message thread opened",
        description: `Chat with ${profileData.displayName || profileData.username}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open message thread",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-50" style={{ zIndex: 50 }}>
        {profileData ? (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
            </DialogHeader>
            
            {/* Profile Header */}
            <div className="flex gap-4 items-start">
              <Avatar className="w-20 h-20">
                {profileData.avatarUrl && (
                  <AvatarImage src={profileData.avatarUrl} alt={profileData.displayName || profileData.username} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {profileData.displayName?.[0]?.toUpperCase() || profileData.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profileData.displayName || profileData.username}</h2>
                <p className="text-sm text-muted-foreground">@{profileData.username}</p>
                {profileData.email && (
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {currentUser?.id !== userId && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleMessageProfile} 
                  className="flex-1"
                  data-testid="button-message-profile-user"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button 
                  onClick={handleAddFriend} 
                  disabled={isFriendRequestSent}
                  variant={isFriendRequestSent ? "secondary" : "outline"}
                  className="flex-1"
                  data-testid="button-add-friend-profile"
                >
                  {isFriendRequestSent ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Requested
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Friend
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Bio */}
            {profileData.bio && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Bio</h3>
                <p className="text-sm text-foreground">{profileData.bio}</p>
              </div>
            )}

            {/* Achievements */}
            {!achievementsLoading && achievements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Achievements</h3>
                <div className="grid grid-cols-1 gap-3">
                  {achievements.map((achievement: any) => {
                    const IconComponent = getAchievementIcon(achievement.iconUrl);
                    const colorClass = getAchievementColor(achievement.iconUrl);
                    return (
                      <div key={achievement.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
                          <IconComponent className={`w-5 h-5 ${colorClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">{achievement.title}</h4>
                          {achievement.game && <p className="text-xs text-muted-foreground">{achievement.game}</p>}
                          {achievement.serverName && <p className="text-xs text-muted-foreground">{achievement.serverName}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!achievementsLoading && achievements.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No achievements yet</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
