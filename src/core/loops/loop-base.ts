/**
 * Base Loop Interface
 * 
 * All viral loops implement this interface to ensure consistent behavior.
 */

import { Persona, ViralLoop, EventType } from '../types/index.js';
import { SmartLinkService, SmartLinkConfig } from '../../services/smart-links/smart-link-service.js';
import { eventBus } from '../events/event-bus.js';

export interface LoopContext {
  userId: string;
  persona: Persona;
  subject?: string;
  age?: number;
  grade?: string;
  metadata?: Record<string, unknown>;
}

export interface LoopInvite {
  inviteId: string;
  inviteeId?: string; // If known
  link: string;
  shortCode: string;
  message: string;
  channel: string;
  expiresAt?: string;
}

export interface LoopReward {
  inviterReward: {
    type: string;
    amount: number;
    description: string;
  };
  inviteeReward?: {
    type: string;
    amount: number;
    description: string;
  };
  conditions?: {
    fvmRequired?: boolean;
    timeWindow?: number; // hours
  };
}

export interface LoopResult {
  success: boolean;
  invite?: LoopInvite;
  reward?: LoopReward;
  error?: string;
}

export abstract class BaseLoop {
  abstract readonly loopId: ViralLoop;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly supportedPersonas: Persona[];

  /**
   * Check if loop is eligible for this context
   */
  abstract isEligible(context: LoopContext): Promise<boolean>;

  /**
   * Generate invite for this loop
   */
  abstract generateInvite(
    context: LoopContext,
    personalizationData: {
      copy: { headline: string; body: string; cta: string };
      channel: string;
    }
  ): Promise<LoopInvite>;

  /**
   * Process when invitee joins
   */
  abstract processJoin(
    inviteCode: string,
    inviteeContext: LoopContext
  ): Promise<LoopResult>;

  /**
   * Process when FVM is reached
   */
  abstract processFVM(
    inviteCode: string,
    inviteeContext: LoopContext
  ): Promise<LoopReward | null>;

  /**
   * Create smart link for this loop
   */
  protected createSmartLink(
    smartLinkService: SmartLinkService,
    config: {
      baseUrl: string;
      userId: string;
      referrerId?: string;
      fvmType: 'practice' | 'ai_tutor' | 'session' | 'challenge';
      context?: {
        subject?: string;
        skill?: string;
        difficulty?: string;
        challengeId?: string;
      };
    }
  ): string {
    const link = smartLinkService.generateLink({
      baseUrl: config.baseUrl,
      userId: config.userId,
      referrerId: config.referrerId,
      loopId: this.loopId,
      persona: config.userId.startsWith('student') ? Persona.STUDENT : 
               config.userId.startsWith('parent') ? Persona.PARENT : Persona.TUTOR,
      fvmType: config.fvmType,
      context: config.context,
      utmParams: {
        source: 'viral_growth',
        medium: 'referral',
        campaign: this.loopId,
      },
    });

    return link.shortCode;
  }

  /**
   * Log event to event bus
   */
  protected async logEvent(
    eventType: EventType,
    userId: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    await eventBus.publish({
      eventType,
      userId,
      timestamp: new Date().toISOString(),
      metadata: {
        loopId: this.loopId,
        ...metadata,
      },
    });
  }

  /**
   * Validate context
   */
  protected validateContext(context: LoopContext): boolean {
    if (!this.supportedPersonas.includes(context.persona)) {
      return false;
    }
    return true;
  }
}

