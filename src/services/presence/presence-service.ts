/**
 * Presence Service
 * 
 * Tracks real-time presence of users learning, showing "alive" activity.
 * Provides presence signals like "28 peers practicing Algebra now".
 */

import { Persona } from '../../core/types/index.js';

export interface PresenceEntry {
  userId: string;
  persona: Persona;
  subject?: string;
  activity: 'practicing' | 'session' | 'studying' | 'reviewing';
  timestamp: string;
  metadata?: {
    topic?: string;
    grade?: string;
    age?: number;
  };
}

export interface PresenceCount {
  subject?: string;
  count: number;
  activity: string;
  ageBand?: string; // For COPPA compliance
}

export interface FriendPresence {
  userId: string;
  online: boolean;
  currentActivity?: string;
  subject?: string;
  lastSeen?: string;
}

export class PresenceService {
  private activePresence: Map<string, PresenceEntry> = new Map();
  private readonly PRESENCE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  private friendConnections: Map<string, Set<string>> = new Map(); // userId -> Set of friendIds

  /**
   * Update user presence
   */
  updatePresence(entry: PresenceEntry): void {
    this.activePresence.set(entry.userId, {
      ...entry,
      timestamp: new Date().toISOString(),
    });

    // Auto-cleanup old entries (in production, would use TTL)
    this.cleanupStalePresence();
  }

  /**
   * Remove user presence
   */
  removePresence(userId: string): void {
    this.activePresence.delete(userId);
  }

  /**
   * Get presence count for a subject
   */
  getSubjectPresence(subject?: string, ageBand?: string): PresenceCount[] {
    const now = Date.now();
    const activeEntries = Array.from(this.activePresence.values()).filter(
      (entry) => {
        const entryTime = new Date(entry.timestamp).getTime();
        const isActive = now - entryTime < this.PRESENCE_TIMEOUT_MS;
        
        if (!isActive) {
          this.activePresence.delete(entry.userId);
          return false;
        }

        // Filter by subject if provided
        if (subject && entry.subject !== subject) {
          return false;
        }

        // Filter by age band for COPPA compliance
        if (ageBand && entry.metadata?.age) {
          const entryAgeBand = this.getAgeBand(entry.metadata.age);
          if (entryAgeBand !== ageBand) {
            return false;
          }
        }

        return true;
      }
    );

    // Group by activity
    const activityGroups = new Map<string, number>();
    activeEntries.forEach((entry) => {
      const key = entry.activity;
      activityGroups.set(key, (activityGroups.get(key) || 0) + 1);
    });

    const counts: PresenceCount[] = [];
    activityGroups.forEach((count, activity) => {
      counts.push({
        subject,
        count,
        activity,
        ageBand,
      });
    });

    return counts;
  }

  /**
   * Get presence message (e.g., "28 peers practicing Algebra now")
   */
  getPresenceMessage(subject?: string, ageBand?: string): string {
    const counts = this.getSubjectPresence(subject, ageBand);
    
    if (counts.length === 0) {
      return subject 
        ? `Start practicing ${subject}!`
        : 'Start learning!';
    }

    const totalCount = counts.reduce((sum, c) => sum + c.count, 0);
    const activity = counts[0].activity;
    
    const activityText = this.formatActivity(activity);
    const subjectText = subject ? ` ${subject}` : '';
    const ageText = ageBand ? ` (${ageBand})` : '';
    
    return `${totalCount} peer${totalCount !== 1 ? 's' : ''} ${activityText}${subjectText} now${ageText}`;
  }

  /**
   * Add friend connection
   */
  addFriend(userId: string, friendId: string): void {
    if (!this.friendConnections.has(userId)) {
      this.friendConnections.set(userId, new Set());
    }
    this.friendConnections.get(userId)!.add(friendId);

    // Bidirectional (in production, would handle separately)
    if (!this.friendConnections.has(friendId)) {
      this.friendConnections.set(friendId, new Set());
    }
    this.friendConnections.get(friendId)!.add(userId);
  }

  /**
   * Get friends online
   */
  getFriendsOnline(userId: string): FriendPresence[] {
    const friends = this.friendConnections.get(userId) || new Set();
    const now = Date.now();
    const friendsOnline: FriendPresence[] = [];

    friends.forEach((friendId) => {
      const presence = this.activePresence.get(friendId);
      if (presence) {
        const entryTime = new Date(presence.timestamp).getTime();
        const isOnline = now - entryTime < this.PRESENCE_TIMEOUT_MS;

        if (isOnline) {
          friendsOnline.push({
            userId: friendId,
            online: true,
            currentActivity: presence.activity,
            subject: presence.subject,
            lastSeen: presence.timestamp,
          });
        } else {
          // Remove stale presence
          this.activePresence.delete(friendId);
          friendsOnline.push({
            userId: friendId,
            online: false,
            lastSeen: presence.timestamp,
          });
        }
      } else {
        friendsOnline.push({
          userId: friendId,
          online: false,
        });
      }
    });

    return friendsOnline;
  }

  /**
   * Get all active users
   */
  getActiveUsers(): PresenceEntry[] {
    this.cleanupStalePresence();
    return Array.from(this.activePresence.values());
  }

  /**
   * Cleanup stale presence entries
   */
  private cleanupStalePresence(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    this.activePresence.forEach((entry, userId) => {
      const entryTime = new Date(entry.timestamp).getTime();
      if (now - entryTime >= this.PRESENCE_TIMEOUT_MS) {
        toRemove.push(userId);
      }
    });

    toRemove.forEach((userId) => this.activePresence.delete(userId));
  }

  /**
   * Get age band for COPPA compliance
   */
  private getAgeBand(age: number): string {
    if (age < 13) return 'under-13';
    if (age < 18) return '13-17';
    return '18+';
  }

  /**
   * Format activity for display
   */
  private formatActivity(activity: string): string {
    const formats: Record<string, string> = {
      practicing: 'practicing',
      session: 'in sessions',
      studying: 'studying',
      reviewing: 'reviewing',
    };
    return formats[activity] || activity;
  }
}

