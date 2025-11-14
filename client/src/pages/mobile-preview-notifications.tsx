import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Trophy, UserPlus, Info } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { Notification } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "match_result":
      return <Trophy className="h-5 w-5" />;
    case "friend_request":
      return <UserPlus className="h-5 w-5" />;
    case "tournament_alert":
      return <Bell className="h-5 w-5" />;
    default:
      return <Info className="h-5 w-5" />;
  }
};

export default function MobilePreviewNotifications() {
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/mobile-preview/notifications"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" data-testid="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6" data-testid="page-title">Notifications</h1>
      <p className="text-muted-foreground mb-8" data-testid="page-description">
        Stay updated with your latest alerts
      </p>
      
      <div className="space-y-4">
        {notifications?.map((notification) => (
          <Card 
            key={notification.id}
            className={`hover-elevate cursor-pointer ${
              !notification.isRead ? 'bg-accent/50' : ''
            }`}
            data-testid={`notification-${notification.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div 
                  className={`p-2 rounded-full ${
                    notification.type === 'match_result' 
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : notification.type === 'friend_request'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : notification.type === 'tournament_alert'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                  data-testid={`notification-icon-${notification.id}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold" data-testid={`notification-title-${notification.id}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted-foreground" data-testid={`notification-timestamp-${notification.id}`}>
                      {notification.timestamp ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid={`notification-message-${notification.id}`}>
                    {notification.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!notifications || notifications.length === 0 && (
        <div className="text-center py-12" data-testid="no-notifications-message">
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      )}
    </div>
  );
}
