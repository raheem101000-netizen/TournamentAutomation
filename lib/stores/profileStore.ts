import { nanoid } from 'nanoid';
import { LocalStorage, StorageKeys } from '../storage';
import type { UserProfile, FriendRequest, Friendship, Trophy } from '@shared/types';

export class ProfileStore {
  static getCurrentUser(): UserProfile | null {
    return LocalStorage.getItem<UserProfile>(StorageKeys.CURRENT_USER);
  }

  static setCurrentUser(user: UserProfile): void {
    LocalStorage.setItem(StorageKeys.CURRENT_USER, user);
  }

  static updateProfile(updates: Partial<UserProfile>): UserProfile {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No current user found');
    }
    
    const updated = { ...currentUser, ...updates };
    this.setCurrentUser(updated);
    
    LocalStorage.updateInArray<UserProfile>(StorageKeys.PROFILES, currentUser.id, updates);
    
    return updated;
  }

  static getAllProfiles(): UserProfile[] {
    return LocalStorage.getArray<UserProfile>(StorageKeys.PROFILES);
  }

  static getProfileById(id: string): UserProfile | null {
    const profiles = this.getAllProfiles();
    return profiles.find(p => p.id === id) || null;
  }

  static sendFriendRequest(toUserId: string): FriendRequest {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No current user found');
    }

    const request: FriendRequest = {
      id: nanoid(),
      fromUserId: currentUser.id,
      toUserId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    LocalStorage.addToArray(StorageKeys.FRIEND_REQUESTS, request);
    return request;
  }

  static getFriendRequests(userId: string): FriendRequest[] {
    const all = LocalStorage.getArray<FriendRequest>(StorageKeys.FRIEND_REQUESTS);
    return all.filter(r => r.toUserId === userId && r.status === 'pending');
  }

  static getSentRequests(userId: string): FriendRequest[] {
    const all = LocalStorage.getArray<FriendRequest>(StorageKeys.FRIEND_REQUESTS);
    return all.filter(r => r.fromUserId === userId && r.status === 'pending');
  }

  static respondToFriendRequest(requestId: string, accept: boolean): FriendRequest {
    const requests = LocalStorage.getArray<FriendRequest>(StorageKeys.FRIEND_REQUESTS);
    const request = requests.find(r => r.id === requestId);
    
    if (!request) {
      throw new Error('Request not found');
    }

    const status = accept ? 'accepted' : 'rejected';
    LocalStorage.updateInArray<FriendRequest>(
      StorageKeys.FRIEND_REQUESTS,
      requestId,
      { status }
    );

    if (accept) {
      const friendship: Friendship = {
        id: nanoid(),
        user1Id: request.fromUserId,
        user2Id: request.toUserId,
        createdAt: new Date().toISOString(),
      };
      LocalStorage.addToArray(StorageKeys.FRIENDSHIPS, friendship);
    }

    return { ...request, status };
  }

  static getFriends(userId: string): UserProfile[] {
    const friendships = LocalStorage.getArray<Friendship>(StorageKeys.FRIENDSHIPS);
    const profiles = this.getAllProfiles();
    
    const friendIds = friendships
      .filter(f => f.user1Id === userId || f.user2Id === userId)
      .map(f => f.user1Id === userId ? f.user2Id : f.user1Id);
    
    return profiles.filter(p => friendIds.includes(p.id));
  }

  static areFriends(userId1: string, userId2: string): boolean {
    const friendships = LocalStorage.getArray<Friendship>(StorageKeys.FRIENDSHIPS);
    return friendships.some(
      f => (f.user1Id === userId1 && f.user2Id === userId2) ||
           (f.user1Id === userId2 && f.user2Id === userId1)
    );
  }

  static getTrophies(userId: string): Trophy[] {
    const all = LocalStorage.getArray<Trophy>(StorageKeys.TROPHIES);
    return all.filter(t => t.userId === userId);
  }

  static awardTrophy(trophy: Omit<Trophy, 'id'>): Trophy {
    const newTrophy: Trophy = {
      ...trophy,
      id: nanoid(),
    };
    LocalStorage.addToArray(StorageKeys.TROPHIES, newTrophy);
    return newTrophy;
  }
}
