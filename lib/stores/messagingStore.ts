import { nanoid } from 'nanoid';
import { LocalStorage, StorageKeys } from '../storage';
import type { ChatThread, Message, DMRequest } from '@shared/types';
import { ProfileStore } from './profileStore';

export class MessagingStore {
  static getAllThreads(userId: string): ChatThread[] {
    const threads = LocalStorage.getArray<ChatThread>(StorageKeys.CHAT_THREADS);
    return threads
      .filter(t => t.participantIds.includes(userId))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static getThread(threadId: string): ChatThread | null {
    const threads = LocalStorage.getArray<ChatThread>(StorageKeys.CHAT_THREADS);
    return threads.find(t => t.id === threadId) || null;
  }

  static createGroupThread(
    creatorId: string,
    name: string,
    participantIds: string[]
  ): ChatThread {
    const thread: ChatThread = {
      id: nanoid(),
      type: 'group',
      name,
      participantIds: [creatorId, ...participantIds],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    LocalStorage.addToArray(StorageKeys.CHAT_THREADS, thread);
    return thread;
  }

  static createDirectThread(user1Id: string, user2Id: string): ChatThread {
    const areFriends = ProfileStore.areFriends(user1Id, user2Id);

    if (!areFriends) {
      const existingRequest = this.getDMRequest(user1Id, user2Id);
      if (existingRequest) {
        throw new Error('DM request already sent');
      }

      const thread: ChatThread = {
        id: nanoid(),
        type: 'direct',
        participantIds: [user1Id, user2Id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      LocalStorage.addToArray(StorageKeys.CHAT_THREADS, thread);

      const dmRequest: DMRequest = {
        id: nanoid(),
        fromUserId: user1Id,
        toUserId: user2Id,
        threadId: thread.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      LocalStorage.addToArray(StorageKeys.DM_REQUESTS, dmRequest);
      return thread;
    }

    const thread: ChatThread = {
      id: nanoid(),
      type: 'direct',
      participantIds: [user1Id, user2Id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    LocalStorage.addToArray(StorageKeys.CHAT_THREADS, thread);
    return thread;
  }

  static getDMRequests(userId: string): DMRequest[] {
    const requests = LocalStorage.getArray<DMRequest>(StorageKeys.DM_REQUESTS);
    return requests.filter(r => r.toUserId === userId && r.status === 'pending');
  }

  static getDMRequest(fromUserId: string, toUserId: string): DMRequest | null {
    const requests = LocalStorage.getArray<DMRequest>(StorageKeys.DM_REQUESTS);
    return requests.find(
      r => r.fromUserId === fromUserId && r.toUserId === toUserId && r.status === 'pending'
    ) || null;
  }

  static respondToDMRequest(requestId: string, accept: boolean): void {
    const status = accept ? 'accepted' : 'rejected';
    LocalStorage.updateInArray<DMRequest>(StorageKeys.DM_REQUESTS, requestId, { status });
  }

  static getMessages(threadId: string): Message[] {
    const messages = LocalStorage.getArray<Message>(StorageKeys.MESSAGES);
    return messages
      .filter(m => m.threadId === threadId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  static sendMessage(
    threadId: string,
    senderId: string,
    content: string,
    imageUri?: string
  ): Message {
    const message: Message = {
      id: nanoid(),
      threadId,
      senderId,
      content,
      imageUri,
      createdAt: new Date().toISOString(),
      readBy: [senderId],
    };

    LocalStorage.addToArray(StorageKeys.MESSAGES, message);
    
    LocalStorage.updateInArray<ChatThread>(StorageKeys.CHAT_THREADS, threadId, {
      lastMessage: message,
      updatedAt: new Date().toISOString(),
    });

    return message;
  }

  static markMessageAsRead(messageId: string, userId: string): void {
    const messages = LocalStorage.getArray<Message>(StorageKeys.MESSAGES);
    const message = messages.find(m => m.id === messageId);
    
    if (message && !message.readBy.includes(userId)) {
      message.readBy.push(userId);
      LocalStorage.setArray(StorageKeys.MESSAGES, messages);
    }
  }
}
