/**
 * Buddy Challenge Loop
 * 
 * Student → Student loop where a student shares a "Beat-my-score" micro-deck.
 * Both get streak shields if friend reaches FVM within 48h.
 */

import { BaseLoop, LoopContext, LoopInvite, LoopReward, LoopResult } from '../core/loops/loop-base.js';
import { ViralLoop, Persona, EventType, RewardType } from '../core/types/index.js';
import { SmartLinkService } from '../services/smart-links/smart-link-service.js';
import { v4 as uuidv4 } from 'uuid';

export interface BuddyChallengeContext extends LoopContext {
  practiceScore?: number;
  practiceSubject?: string;
  practiceSkill?: string;
  challengeDeckId?: string;
}

export class BuddyChallengeLoop extends BaseLoop {
  readonly loopId = ViralLoop.BUDDY_CHALLENGE;
  readonly name = 'Buddy Challenge';
  readonly description = 'Challenge a friend to beat your practice score';
  readonly supportedPersonas = [Persona.STUDENT];

  private smartLinkService: SmartLinkService;
  private readonly BASE_URL = process.env.BASE_URL || 'https://varsitytutors.com';
  private readonly FVM_TIME_WINDOW_HOURS = 48;

  constructor(smartLinkService: SmartLinkService) {
    super();
    this.smartLinkService = smartLinkService;
  }

  async isEligible(context: LoopContext): Promise<boolean> {
    if (!this.validateContext(context)) {
      return false;
    }

    const buddyContext = context as BuddyChallengeContext;
    
    // Must have a practice score to challenge
    if (!buddyContext.practiceScore && !buddyContext.challengeDeckId) {
      return false;
    }

    // Age check for COPPA
    if (buddyContext.age !== undefined && buddyContext.age < 13) {
      // Would need parental consent - for now allow but flag
      return true;
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
    const buddyContext = context as BuddyChallengeContext;
    
    // Generate challenge deck if not provided
    const challengeDeckId = buddyContext.challengeDeckId || this.generateChallengeDeckId(buddyContext);
    
    // Create smart link
    const shortCode = this.createSmartLink(this.smartLinkService, {
      baseUrl: this.BASE_URL,
      userId: context.userId,
      fvmType: 'challenge',
      context: {
        subject: buddyContext.subject || buddyContext.practiceSubject,
        skill: buddyContext.practiceSkill,
        challengeId: challengeDeckId,
        difficulty: this.inferDifficulty(buddyContext.practiceScore),
      },
    });

    const link = this.smartLinkService.resolveLink(shortCode);
    if (!link) {
      throw new Error('Failed to generate smart link');
    }

    const inviteId = uuidv4();
    const expiresAt = new Date(
      Date.now() + this.FVM_TIME_WINDOW_HOURS * 60 * 60 * 1000
    ).toISOString();

    // Log invite event
    await this.logEvent(EventType.INVITE_SENT, context.userId, {
      inviteId,
      shortCode,
      challengeDeckId,
      practiceScore: buddyContext.practiceScore,
    });

    return {
      inviteId,
      link: link.fullUrl,
      shortCode,
      message: `${personalizationData.copy.headline}\n\n${personalizationData.copy.body}\n\n${personalizationData.copy.cta}`,
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
        error: 'Invite has expired',
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
        message: 'Challenge accepted!',
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

    // Check if still within time window
    const createdAt = new Date(link.metadata.createdAt).getTime();
    const now = Date.now();
    const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);

    if (hoursElapsed > this.FVM_TIME_WINDOW_HOURS) {
      return null; // Too late
    }

    // Log FVM event
    await this.logEvent(EventType.FVM_REACHED, inviteeContext.userId, {
      inviteCode,
      referrerId: link.metadata.userId,
      loopId: this.loopId,
      fvmType: 'challenge',
    });

    // Both inviter and invitee get streak shields
    return {
      inviterReward: {
        type: RewardType.STREAK_SHIELD,
        amount: 1,
        description: '1 streak shield for friend completing challenge',
      },
      inviteeReward: {
        type: RewardType.STREAK_SHIELD,
        amount: 1,
        description: '1 streak shield for completing challenge',
      },
      conditions: {
        fvmRequired: true,
        timeWindow: this.FVM_TIME_WINDOW_HOURS,
      },
    };
  }

  /**
   * Generate a challenge deck ID (5-question micro-deck)
   */
  private generateChallengeDeckId(context: BuddyChallengeContext): string {
    // In production, this would create an actual deck in the content system
    // For now, generate a deterministic ID
    const subject = context.subject || context.practiceSubject || 'general';
    const skill = context.practiceSkill || 'practice';
    const hash = `${subject}-${skill}-${context.userId}`;
    return `challenge-${hash.substring(0, 16)}`;
  }

  /**
   * Infer difficulty from score
   */
  private inferDifficulty(score?: number): string {
    if (!score) return 'medium';
    if (score >= 80) return 'hard';
    if (score >= 60) return 'medium';
    return 'easy';
  }
}

