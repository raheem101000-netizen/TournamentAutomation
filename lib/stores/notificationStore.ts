import { LocalStorage, StorageKeys } from '../storage';
import type { Notification } from '@shared/types';

export class NotificationStore {
  static getAll(userId: string): Notification[] {
    const all = LocalStorage.getArray<Notification>(StorageKeys.NOTIFICATIONS);
    return all
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getUnread(userId: string): Notification[] {
    return this.getAll(userId).filter(n => !n.isRead);
  }

  static markAsRead(notificationId: string): void {
    LocalStorage.updateInArray<Notification>(
      StorageKeys.NOTIFICATIONS,
      notificationId,
      { isRead: true }
    );
  }

  static markAllAsRead(userId: string): void {
    const notifications = this.getAll(userId);
    notifications.forEach(n => {
      if (!n.isRead) {
        this.markAsRead(n.id);
      }
    });
  }

  static delete(notificationId: string): void {
    LocalStorage.removeFromArray(StorageKeys.NOTIFICATIONS, notificationId);
  }
}
