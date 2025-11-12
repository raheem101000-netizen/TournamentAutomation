export class LocalStorage {
  static getItem<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  static getArray<T>(key: string): T[] {
    const data = this.getItem<T[]>(key);
    return data || [];
  }

  static setArray<T>(key: string, value: T[]): void {
    this.setItem(key, value);
  }

  static addToArray<T extends { id: string }>(key: string, item: T): T[] {
    const array = this.getArray<T>(key);
    array.push(item);
    this.setArray(key, array);
    return array;
  }

  static updateInArray<T extends { id: string }>(
    key: string,
    id: string,
    updates: Partial<T>
  ): T[] {
    const array = this.getArray<T>(key);
    const index = array.findIndex(item => item.id === id);
    if (index !== -1) {
      array[index] = { ...array[index], ...updates };
      this.setArray(key, array);
    }
    return array;
  }

  static removeFromArray<T extends { id: string }>(key: string, id: string): T[] {
    const array = this.getArray<T>(key);
    const filtered = array.filter(item => item.id !== id);
    this.setArray(key, filtered);
    return filtered;
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export const StorageKeys = {
  CURRENT_USER: 'current_user',
  PROFILES: 'profiles',
  FRIEND_REQUESTS: 'friend_requests',
  FRIENDSHIPS: 'friendships',
  TROPHIES: 'trophies',
  CHAT_THREADS: 'chat_threads',
  MESSAGES: 'messages',
  DM_REQUESTS: 'dm_requests',
  TOURNAMENTS: 'tournaments',
  NOTIFICATIONS: 'notifications',
  INITIALIZED: 'app_initialized',
} as const;
