/**
 * Tutor Spotlight Loop
 * 
 * Tutor → Family/Peers loop where a 5★ session rating triggers a tutor card
 * with invite link and class sampler. Tutor accrues XP/leaderboard perks when joins convert.
 */

import { BaseLoop, LoopContext, LoopInvite, LoopReward, LoopResult } from '../core/loops/loop-base.js';
import { ViralLoop, Persona, EventType, RewardType } from '../core/types/index.js';
import { SmartLinkService } from '../services/smart-links/smart-link-service.js';
import { v4 as uuidv4 } from 'uuid';

export interface TutorSpotlightContext extends LoopContext {
  sessionRating?: number; // 1-5 stars
  sessionId?: string;
  subject?: string;
  tutorName?: string;
  tutorRating?: number;
  classSamplerLink?: string;
}

export class TutorSpotlightLoop extends BaseLoop {
  readonly loopId = ViralLoop.TUTOR_SPOTLIGHT;
  readonly name = 'Tutor Spotlight';
  readonly description = 'Share your expertise and get referral credits';
  readonly supportedPersonas = [Persona.TUTOR];

  private smartLinkService: SmartLinkService;
  private readonly BASE_URL = process.env.BASE_URL || 'https://varsitytutors.com';
  private readonly MIN_RATING = 5; // Only trigger on 5★ ratings
  private readonly FVM_TIME_WINDOW_DAYS = 30; // 30 days for FVM (session booking)

  constructor(smartLinkService: SmartLinkService) {
    super();
    this.smartLinkService = smartLinkService;
  }

  async isEligible(context: LoopContext): Promise<boolean> {
    if (!this.validateContext(context)) {
      return false;
    }

    const tutorContext = context as TutorSpotlightContext;
    
    // Must have a 5★ rating to trigger
    if (!tutorContext.sessionRating || tutorContext.sessionRating < this.MIN_RATING) {
      return false;
    }

    // Must be a tutor
    if (context.persona !== Persona.TUTOR) {
      return false;
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
    const tutorContext = context as TutorSpotlightContext;
    
    // Generate class sampler link if not provided
    const classSamplerLink = tutorContext.classSamplerLink || this.generateClassSamplerLink(tutorContext);
    
    // Create smart link with class sampler
    const shortCode = this.createSmartLink(this.smartLinkService, {
      baseUrl: this.BASE_URL,
      userId: context.userId,
      loopId: this.loopId,
      persona: Persona.TUTOR,
      fvmType: 'session',
      context: {
        subject: tutorContext.subject,
      },
      utmParams: {
        source: 'tutor_referral',
        medium: 'referral',
        campaign: 'tutor_spotlight',
        term: context.userId,
      },
    });

    const link = this.smartLinkService.resolveLink(shortCode);
    if (!link) {
      throw new Error('Failed to generate smart link');
    }

    const inviteId = uuidv4();
    const expiresAt = new Date(
      Date.now() + this.FVM_TIME_WINDOW_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();

    // Build tutor card message
    const tutorName = tutorContext.tutorName || 'Expert Tutor';
    const tutorRating = tutorContext.tutorRating || tutorContext.sessionRating || 5;
    const subject = tutorContext.subject || 'your subject';
    
    const message = `${personalizationData.copy.headline}\n\n${tutorName} (${tutorRating}★) specializes in ${subject}. ${personalizationData.copy.body}\n\n${personalizationData.copy.cta}\n\nClass Sampler: ${classSamplerLink}`;

    // Log invite event
    await this.logEvent(EventType.INVITE_SENT, context.userId, {
      inviteId,
      shortCode,
      sessionId: tutorContext.sessionId,
      sessionRating: tutorContext.sessionRating,
      classSamplerLink,
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
        message: 'Try a class sampler with this tutor!',
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

    // Log FVM event (new family books first session with tutor)
    await this.logEvent(EventType.FVM_REACHED, inviteeContext.userId, {
      inviteCode,
      referrerId: link.metadata.userId,
      loopId: this.loopId,
      fvmType: 'session',
    });

    // Tutor gets XP boost and referral credits
    // New family gets class sampler/benefit
    return {
      inviterReward: {
        type: RewardType.XP_BOOST,
        amount: 200, // Base XP for referral conversion
        description: '200 XP for successful referral (family booked first session)',
      },
      inviteeReward: {
        type: RewardType.CLASS_PASS,
        amount: 1,
        description: '1 class pass to try your first session',
      },
    };
  }

  /**
   * Generate class sampler link
   */
  private generateClassSamplerLink(context: TutorSpotlightContext): string {
    const samplerId = uuidv4().substring(0, 8);
    const subject = context.subject || 'general';
    return `${this.BASE_URL}/class-sampler/${samplerId}?subject=${subject}&ref=${context.userId}`;
  }
}

