import { useEffect, useState } from 'react';
import { NotificationStore } from '../../../lib/stores/notificationStore';
import { ProfileStore } from '../../../lib/stores/profileStore';
import type { Notification } from '@shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageCircle, UserPlus, Trophy, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const user = ProfileStore.getCurrentUser();
    if (user) {
      setCurrentUserId(user.id);
      const userNotifications = NotificationStore.getAll(user.id);
      setNotifications(userNotifications);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    NotificationStore.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    NotificationStore.markAllAsRead(currentUserId);
    loadNotifications();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      message: MessageCircle,
      friend_request: UserPlus,
      tournament_invite: Trophy,
      match_update: AlertCircle,
    };
    const Icon = icons[type];
    return <Icon className="h-5 w-5" />;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="default" data-testid="badge-unread-count">
                {unreadCount}
              </Badge>
            )}
          </h1>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              data-testid="button-mark-all-read"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground" data-testid="text-no-notifications">
                No notifications yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`hover-elevate ${!notification.isRead ? 'border-primary' : ''}`}
                data-testid={`card-notification-${notification.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${!notification.isRead ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4
                            className="font-semibold"
                            data-testid={`text-notification-title-${notification.id}`}
                          >
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.body}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            data-testid={`button-mark-read-${notification.id}`}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
