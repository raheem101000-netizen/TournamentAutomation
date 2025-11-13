import { useEffect, useState } from 'react';
import { ProfileStore } from '../../../lib/stores/profileStore';
import type { UserProfile, Trophy } from '@shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Trophy as TrophyIcon } from 'lucide-react';

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [friendCount, setFriendCount] = useState<number>(0);
  const [mutualFriends, setMutualFriends] = useState<UserProfile[]>([]);
  const [trophies, setTrophies] = useState<Trophy[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await ProfileStore.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const allFriends = await ProfileStore.getFriends(user.id);
      setFriendCount(allFriends.length);
      const mutuals = await ProfileStore.getMutualFriends(user.id, user.id);
      setMutualFriends(mutuals);
      setTrophies(await ProfileStore.getTrophies(user.id));
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No user found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card data-testid="card-user-profile">
          <CardHeader>
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24" data-testid="img-avatar">
                <AvatarImage src={currentUser.avatarUri} alt={currentUser.displayName} />
                <AvatarFallback>{currentUser.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-3xl" data-testid="text-display-name">
                  {currentUser.displayName}
                </CardTitle>
                <p className="text-muted-foreground" data-testid="text-username">
                  @{currentUser.username}
                </p>
                {currentUser.bio && (
                  <p className="mt-4 text-foreground" data-testid="text-bio">
                    {currentUser.bio}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card data-testid="card-friends">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Friends ({friendCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mutualFriends.length === 0 ? (
              <p className="text-muted-foreground text-sm" data-testid="text-no-mutual-friends">
                No mutual friends to display
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Showing mutual friends only
                </p>
                {mutualFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-4"
                    data-testid={`card-mutual-friend-${friend.id}`}
                  >
                    <Avatar>
                      <AvatarImage src={friend.avatarUri} alt={friend.displayName} />
                      <AvatarFallback>{friend.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium" data-testid={`text-friend-name-${friend.id}`}>
                        {friend.displayName}
                      </p>
                      <p className="text-sm text-muted-foreground">@{friend.username}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Mutual Friend
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-trophies">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrophyIcon className="h-5 w-5" />
              Trophies ({trophies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trophies.length === 0 ? (
              <p className="text-muted-foreground text-sm" data-testid="text-no-trophies">
                No trophies yet
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trophies.map((trophy) => (
                  <Card
                    key={trophy.id}
                    className="hover-elevate"
                    data-testid={`card-trophy-${trophy.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{trophy.iconUrl}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold" data-testid={`text-trophy-title-${trophy.id}`}>
                            {trophy.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {trophy.description}
                          </p>
                          <Separator className="my-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>By {trophy.awardedBy}</span>
                            <Badge variant="secondary" className="text-xs">
                              {new Date(trophy.awardedAt).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
