/**
 * Alive Service
 * 
 * Orchestrates all "alive" layer components: presence, activity feed,
 * leaderboards, and cohort rooms.
 */

import { PresenceService } from '../presence/presence-service.js';
import { ActivityFeedService } from '../activity-feed/activity-feed-service.js';
import { LeaderboardService } from '../leaderboard/leaderboard-service.js';
import { CohortService } from '../cohort/cohort-service.js';
import { Persona } from '../../core/types/index.js';
import { eventBus } from '../../core/events/event-bus.js';
import { EventType } from '../../core/types/index.js';

export interface AliveStatus {
  presence: {
    message: string;
    count: number;
    subject?: string;
  };
  friendsOnline: number;
  recentActivity: number;
  leaderboardRank?: number;
  cohortRooms: number;
}

export class AliveService {
  private presenceService: PresenceService;
  private activityFeedService: ActivityFeedService;
  private leaderboardService: LeaderboardService;
  private cohortService: CohortService;

  constructor(
    presenceService: PresenceService,
    activityFeedService: ActivityFeedService,
    leaderboardService: LeaderboardService,
    cohortService: CohortService
  ) {
    this.presenceService = presenceService;
    this.activityFeedService = activityFeedService;
    this.leaderboardService = leaderboardService;
    this.cohortService = cohortService;

    // Subscribe to events to generate activity feed items
    this.setupEventListeners();
  }

  /**
   * Get complete "alive" status for a user
   */
  getAliveStatus(
    userId: string,
    subject?: string,
    age?: number
  ): AliveStatus {
    const ageBand = age ? this.getAgeBand(age) : undefined;
    const presenceCounts = this.presenceService.getSubjectPresence(subject, ageBand);
    const totalPresence = presenceCounts.reduce((sum, c) => sum + c.count, 0);
    const presenceMessage = this.presenceService.getPresenceMessage(subject, ageBand);

    const friendsOnline = this.presenceService.getFriendsOnline(userId).filter(
      (f) => f.online
    ).length;

    const recentActivity = this.activityFeedService.getFeed({
      subject,
      limit: 10,
    }).length;

    const leaderboardRank = subject
      ? this.leaderboardService.getUserRank(userId, 'practice', subject, ageBand)
      : undefined;

    const cohortRooms = this.cohortService.getUserRooms(userId).length;

    return {
      presence: {
        message: presenceMessage,
        count: totalPresence,
        subject,
      },
      friendsOnline,
      recentActivity,
      leaderboardRank: leaderboardRank || undefined,
      cohortRooms,
    };
  }

  /**
   * Update user presence
   */
  updatePresence(
    userId: string,
    persona: Persona,
    activity: 'practicing' | 'session' | 'studying' | 'reviewing',
    subject?: string,
    metadata?: { topic?: string; grade?: string; age?: number }
  ): void {
    this.presenceService.updatePresence({
      userId,
      persona,
      activity,
      subject,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  /**
   * Get activity feed
   */
  getActivityFeed(options: {
    userId?: string;
    subject?: string;
    limit?: number;
    includeFriendActivity?: boolean;
  }) {
    return this.activityFeedService.getFeed(options);
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(options: {
    subject?: string;
    metric: 'practice' | 'streak' | 'achievements' | 'sessions';
    timeWindow?: 'daily' | 'weekly' | 'monthly' | 'all-time';
    ageBand?: string;
    limit?: number;
  }) {
    return this.leaderboardService.getLeaderboard(options);
  }

  /**
   * Get cohort rooms
   */
  getCohortRooms(userId: string) {
    return this.cohortService.getUserRooms(userId);
  }

  /**
   * Get friends online
   */
  getFriendsOnline(userId: string) {
    return this.presenceService.getFriendsOnline(userId);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    eventBus.subscribe('*' as EventType, async (event) => {
      // Generate activity feed items from events
      // In production, would extract persona from event metadata
      const activity = this.activityFeedService.generateActivityFromEvent(
        event.eventType,
        event.userId,
        Persona.STUDENT, // Default, would come from event
        event.metadata || {}
      );

      if (activity) {
        this.activityFeedService.addActivity(activity);
      }
    });
  }

  /**
   * Get age band
   */
  private getAgeBand(age: number): string {
    if (age < 13) return 'under-13';
    if (age < 18) return '13-17';
    return '18+';
  }
}

