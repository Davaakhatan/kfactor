/**
 * Activity Feed Service
 * 
 * Generates activity feed showing recent achievements, challenges, streaks,
 * and friend activity (privacy-safe).
 */

import { Persona } from '../../core/types/index.js';
import { EventType } from '../../core/types/index.js';

export interface ActivityItem {
  id: string;
  userId: string;
  type: 'achievement' | 'challenge' | 'streak' | 'invite' | 'friend_activity';
  title: string;
  description: string;
  timestamp: string;
  privacySafe: boolean;
  metadata?: {
    subject?: string;
    achievement?: string;
    streakDays?: number;
    friendName?: string; // Anonymous or opted-in only
  };
}

export interface ActivityFeedOptions {
  userId?: string;
  subject?: string;
  limit?: number;
  includeFriendActivity?: boolean;
  privacyMode?: 'anonymous' | 'friends-only' | 'public';
}

export class ActivityFeedService {
  private activities: ActivityItem[] = [];
  private readonly MAX_FEED_SIZE = 1000;

  /**
   * Add an activity to the feed
   */
  addActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): void {
    const item: ActivityItem = {
      ...activity,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    this.activities.push(item);

    // Keep feed size manageable
    if (this.activities.length > this.MAX_FEED_SIZE) {
      this.activities = this.activities.slice(-this.MAX_FEED_SIZE);
    }
  }

  /**
   * Get activity feed for a user
   */
  getFeed(options: ActivityFeedOptions = {}): ActivityItem[] {
    let filtered = [...this.activities];

    // Filter by subject if provided
    if (options.subject) {
      filtered = filtered.filter(
        (item) => item.metadata?.subject === options.subject
      );
    }

    // Filter by privacy mode
    if (options.privacyMode === 'anonymous') {
      filtered = filtered.filter((item) => item.privacySafe);
    } else if (options.privacyMode === 'friends-only' && options.userId) {
      // In production, would check friend connections
      filtered = filtered.filter(
        (item) => item.privacySafe || item.userId === options.userId
      );
    }

    // Exclude friend activity if not requested
    if (!options.includeFriendActivity) {
      filtered = filtered.filter((item) => item.type !== 'friend_activity');
    }

    // Sort by timestamp (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply limit
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Generate activity from event
   */
  generateActivityFromEvent(
    eventType: EventType,
    userId: string,
    persona: Persona,
    metadata: Record<string, unknown> = {}
  ): ActivityItem | null {
    const privacySafe = this.isPrivacySafe(persona, metadata);

    switch (eventType) {
      case EventType.BADGE_EARNED:
      case EventType.ACHIEVEMENT_SPOTLIGHT:
        return {
          userId,
          type: 'achievement',
          title: 'Achievement Unlocked!',
          description: `Earned achievement: ${metadata.achievement || 'New Badge'}`,
          privacySafe,
          metadata: {
            subject: metadata.subject as string,
            achievement: metadata.achievement as string,
          },
        };

      case EventType.INVITE_SENT:
        return {
          userId,
          type: 'invite',
          title: 'Invite Sent',
          description: `Shared ${metadata.loopId || 'an invite'} with a friend`,
          privacySafe,
          metadata: {
            subject: metadata.subject as string,
          },
        };

      case EventType.STREAK_PRESERVED:
        return {
          userId,
          type: 'streak',
          title: 'Streak Maintained!',
          description: `Maintained ${metadata.streakDays || 0}-day streak`,
          privacySafe,
          metadata: {
            streakDays: metadata.streakDays as number,
            subject: metadata.subject as string,
          },
        };

      case EventType.LOOP_TRIGGERED:
        return {
          userId,
          type: 'challenge',
          title: 'Challenge Created',
          description: `Created ${metadata.loopId || 'a challenge'}`,
          privacySafe,
          metadata: {
            subject: metadata.subject as string,
          },
        };

      default:
        return null;
    }
  }

  /**
   * Check if activity is privacy-safe
   */
  private isPrivacySafe(persona: Persona, metadata: Record<string, unknown>): boolean {
    // COPPA compliance: All student activities are privacy-safe by default
    if (persona === Persona.STUDENT) {
      return true;
    }

    // Parents/tutors can opt-in to more visible activities
    // For now, default to privacy-safe
    return true;
  }

  /**
   * Get recent achievements
   */
  getRecentAchievements(limit: number = 10): ActivityItem[] {
    return this.activities
      .filter((item) => item.type === 'achievement')
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  }

  /**
   * Clear feed (for testing)
   */
  clear(): void {
    this.activities = [];
  }
}

