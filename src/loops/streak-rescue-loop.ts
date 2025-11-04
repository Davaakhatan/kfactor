/**
 * Streak Rescue Loop
 * 
 * Student → Student loop where a student at risk of losing their streak
 * can "phone-a-friend" to co-practice. Both get streak shields.
 */

import { BaseLoop, LoopContext, LoopInvite, LoopReward, LoopResult } from '../core/loops/loop-base.js';
import { ViralLoop, Persona, EventType, RewardType } from '../core/types/index.js';
import { SmartLinkService } from '../services/smart-links/smart-link-service.js';
import { v4 as uuidv4 } from 'uuid';

export interface StreakRescueContext extends LoopContext {
  currentStreak: number;
  streakExpiresAt: string; // ISO timestamp
  hoursUntilExpiry?: number;
  subject?: string;
  practiceTopic?: string;
}

export class StreakRescueLoop extends BaseLoop {
  readonly loopId = ViralLoop.STREAK_RESCUE;
  readonly name = 'Streak Rescue';
  readonly description = 'Phone-a-friend to save your streak';
  readonly supportedPersonas = [Persona.STUDENT];

  private smartLinkService: SmartLinkService;
  private readonly BASE_URL = process.env.BASE_URL || 'https://varsitytutors.com';
  private readonly STREAK_RISK_WINDOW_HOURS = 24;

  constructor(smartLinkService: SmartLinkService) {
    super();
    this.smartLinkService = smartLinkService;
  }

  async isEligible(context: LoopContext): Promise<boolean> {
    if (!this.validateContext(context)) {
      return false;
    }

    const streakContext = context as StreakRescueContext;
    
    // Must have an active streak
    if (!streakContext.currentStreak || streakContext.currentStreak < 1) {
      return false;
    }

    // Must be within risk window (24 hours of expiration)
    const expiresAt = new Date(streakContext.streakExpiresAt).getTime();
    const now = Date.now();
    const hoursUntilExpiry = (expiresAt - now) / (1000 * 60 * 60);

    if (hoursUntilExpiry > this.STREAK_RISK_WINDOW_HOURS || hoursUntilExpiry < 0) {
      return false; // Not at risk yet or already expired
    }

    return true;
  }

  async generateInvite(
    context: LoopContext,
    personalizationData: {
      copy: { headline: string; body: string; cta: string };
      channel: string;
    }
  ): Promise<LoopInvite> {
    const streakContext = context as StreakRescueContext;
    
    // Create co-practice link
    const shortCode = this.createSmartLink(this.smartLinkService, {
      baseUrl: this.BASE_URL,
      userId: context.userId,
      fvmType: 'practice',
      context: {
        subject: streakContext.subject,
        skill: streakContext.practiceTopic,
      },
    });

    const link = this.smartLinkService.resolveLink(shortCode);
    if (!link) {
      throw new Error('Failed to generate smart link');
    }

    const inviteId = uuidv4();
    const expiresAt = streakContext.streakExpiresAt; // Expires when streak would

    // Build urgent message
    const hoursLeft = streakContext.hoursUntilExpiry || 
      (new Date(streakContext.streakExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60);
    const urgencyMessage = `I need help! My ${streakContext.currentStreak}-day streak expires in ${Math.ceil(hoursLeft)} hours! `;

    const message = `${personalizationData.copy.headline}\n\n${urgencyMessage}${personalizationData.copy.body}\n\n${personalizationData.copy.cta}`;

    // Log invite event
    await this.logEvent(EventType.INVITE_SENT, context.userId, {
      inviteId,
      shortCode,
      currentStreak: streakContext.currentStreak,
      hoursUntilExpiry: hoursLeft,
      streakExpiresAt: streakContext.streakExpiresAt,
    });

    return {
      inviteId,
      link: link.fullUrl,
      shortCode,
      message,
      channel: personalizationData.channel,
      expiresAt,
    };
  }

  async processJoin(
    inviteCode: string,
    inviteeContext: LoopContext
  ): Promise<LoopResult> {
    const link = this.smartLinkService.resolveLink(inviteCode);
    if (!link) {
      return {
        success: false,
        error: 'Invalid invite code',
      };
    }

    // Check expiration
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return {
        success: false,
        error: 'Streak rescue invitation has expired',
      };
    }

    // Log join event
    await this.logEvent(EventType.INVITE_OPENED, inviteeContext.userId, {
      inviteCode,
      referrerId: link.metadata.userId,
      loopId: this.loopId,
    });

    // Track click
    this.smartLinkService.trackClick(inviteCode, {
      timestamp: new Date().toISOString(),
      deviceId: inviteeContext.userId,
    });

    return {
      success: true,
      invite: {
        inviteId: link.metadata.userId,
        inviteeId: inviteeContext.userId,
        link: link.deepLink,
        shortCode: inviteCode,
        message: 'Help your friend save their streak!',
        channel: 'in_app',
      },
    };
  }

  async processFVM(
    inviteCode: string,
    inviteeContext: LoopContext
  ): Promise<LoopReward | null> {
    const link = this.smartLinkService.resolveLink(inviteCode);
    if (!link) {
      return null;
    }

    // Check if still within rescue window
    const expiresAt = link.expiresAt ? new Date(link.expiresAt).getTime() : Date.now() + 86400000;
    if (Date.now() > expiresAt) {
      return null; // Too late, streak already expired
    }

    // Log FVM event (friend completes practice session)
    await this.logEvent(EventType.FVM_REACHED, inviteeContext.userId, {
      inviteCode,
      referrerId: link.metadata.userId,
      loopId: this.loopId,
      fvmType: 'practice',
    });

    // Both get streak shields
    return {
      inviterReward: {
        type: RewardType.STREAK_SHIELD,
        amount: 1,
        description: '1 streak shield for friend helping save your streak',
      },
      inviteeReward: {
        type: RewardType.STREAK_SHIELD,
        amount: 1,
        description: '1 streak shield for helping a friend',
      },
      conditions: {
        fvmRequired: true,
        timeWindow: this.STREAK_RISK_WINDOW_HOURS,
      },
    };
  }
}

