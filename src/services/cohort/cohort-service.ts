/**
 * Cohort Service
 * 
 * Manages virtual study groups (cohort rooms) with presence indicators.
 */

import { Persona } from '../../core/types/index.js';

export interface CohortRoom {
  roomId: string;
  name: string;
  subject: string;
  description?: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  metadata?: {
    grade?: string;
    ageBand?: string;
    topic?: string;
  };
}

export interface CohortPresence {
  roomId: string;
  activeMembers: string[];
  totalMembers: number;
  presenceCount: number;
}

export class CohortService {
  private rooms: Map<string, CohortRoom> = new Map();
  private roomPresence: Map<string, Set<string>> = new Map(); // roomId -> Set of userIds

  /**
   * Create a cohort room
   */
  createRoom(room: Omit<CohortRoom, 'roomId' | 'createdAt'>): CohortRoom {
    const roomId = crypto.randomUUID();
    const newRoom: CohortRoom = {
      ...room,
      roomId,
      createdAt: new Date().toISOString(),
    };

    this.rooms.set(roomId, newRoom);
    this.roomPresence.set(roomId, new Set());

    return newRoom;
  }

  /**
   * Join a cohort room
   */
  joinRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }

    if (!room.members.includes(userId)) {
      room.members.push(userId);
    }

    const presence = this.roomPresence.get(roomId) || new Set();
    presence.add(userId);
    this.roomPresence.set(roomId, presence);

    return true;
  }

  /**
   * Leave a cohort room
   */
  leaveRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }

    const presence = this.roomPresence.get(roomId);
    if (presence) {
      presence.delete(userId);
    }

    return true;
  }

  /**
   * Get room presence
   */
  getRoomPresence(roomId: string): CohortPresence | null {
    const room = this.rooms.get(roomId);
    if (!room) {
      return null;
    }

    const activeMembers = Array.from(this.roomPresence.get(roomId) || []);
    
    return {
      roomId,
      activeMembers,
      totalMembers: room.members.length,
      presenceCount: activeMembers.length,
    };
  }

  /**
   * Get rooms for a user
   */
  getUserRooms(userId: string): CohortRoom[] {
    return Array.from(this.rooms.values()).filter((room) =>
      room.members.includes(userId)
    );
  }

  /**
   * Get rooms by subject
   */
  getRoomsBySubject(subject: string): CohortRoom[] {
    return Array.from(this.rooms.values()).filter(
      (room) => room.subject === subject
    );
  }

  /**
   * Update presence in room
   */
  updatePresence(roomId: string, userId: string, isActive: boolean): void {
    const presence = this.roomPresence.get(roomId);
    if (!presence) {
      return;
    }

    if (isActive) {
      presence.add(userId);
    } else {
      presence.delete(userId);
    }
  }

  /**
   * Get room
   */
  getRoom(roomId: string): CohortRoom | null {
    return this.rooms.get(roomId) || null;
  }
}

