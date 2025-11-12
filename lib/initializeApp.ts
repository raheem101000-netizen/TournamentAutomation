import { LocalStorage, StorageKeys } from './storage';
import {
  seedProfiles,
  seedFriendships,
  seedTrophies,
  seedChatThreads,
  seedMessages,
  seedTournaments,
  seedNotifications,
  currentUserId,
} from './seedData';

export function initializeApp() {
  const isInitialized = LocalStorage.getItem(StorageKeys.INITIALIZED);
  
  if (isInitialized) {
    return;
  }

  LocalStorage.setArray(StorageKeys.PROFILES, seedProfiles);
  LocalStorage.setItem(StorageKeys.CURRENT_USER, seedProfiles[0]);
  LocalStorage.setArray(StorageKeys.FRIENDSHIPS, seedFriendships);
  LocalStorage.setArray(StorageKeys.TROPHIES, seedTrophies);
  LocalStorage.setArray(StorageKeys.CHAT_THREADS, seedChatThreads);
  LocalStorage.setArray(StorageKeys.MESSAGES, seedMessages);
  LocalStorage.setArray(StorageKeys.TOURNAMENTS, seedTournaments);
  LocalStorage.setArray(StorageKeys.NOTIFICATIONS, seedNotifications);
  LocalStorage.setArray(StorageKeys.FRIEND_REQUESTS, []);
  LocalStorage.setArray(StorageKeys.DM_REQUESTS, []);

  LocalStorage.setItem(StorageKeys.INITIALIZED, true);
  
  console.log('App initialized with seed data for user:', currentUserId);
}
