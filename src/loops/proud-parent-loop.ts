/**
 * Proud Parent Loop
 * 
 * Parent → Parent loop where weekly recap or progress milestone generates
 * a privacy-safe reel + invite link. Both families get class passes.
 */

import { BaseLoop, LoopContext, LoopInvite, LoopReward, LoopResult } from '../core/loops/loop-base.js';
import { ViralLoop, Persona, EventType, RewardType } from '../core/types/index.js';
import { SmartLinkService } from '../services/smart-links/smart-link-service.js';
import { v4 as uuidv4 } from 'uuid';

export interface ProudParentContext extends LoopContext {
  milestoneType?: 'weekly_recap' | 'progress_milestone' | 'achievement';
  childProgress?: {
    subject?: string;
    improvement?: number;
    achievements?: string[];
  };
  reelUrl?: string; // Pre-generated privacy-safe reel
}

export class ProudParentLoop extends BaseLoop {
  readonly loopId = ViralLoop.PROUD_PARENT;
  readonly name = 'Proud Parent';
  readonly description = 'Share your child\'s progress with other parents';
  readonly supportedPersonas = [Persona.PARENT];

  private smartLinkService: SmartLinkService;
  private readonly BASE_URL = process.env.BASE_URL || 'https://varsitytutors.com';

  constructor(smartLinkService: SmartLinkService) {
    super();
    this.smartLinkService = smartLinkService;
  }

  async isEligible(context: LoopContext): Promise<boolean> {
    if (!this.validateContext(context)) {
      return false;
    }

    const parentContext = context as ProudParentContext;
    
    // Must have a milestone or progress to share
    if (!parentContext.milestoneType && !parentContext.childProgress) {
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
    const parentContext = context as ProudParentContext;
    
    // Create class sampler link
    const shortCode = this.createSmartLink(this.smartLinkService, {
      baseUrl: this.BASE_URL,
      userId: context.userId,
      fvmType: 'session',
      context: {
        subject: parentContext.childProgress?.subject || parentContext.subject,
      },
    });

    const link = this.smartLinkService.resolveLink(shortCode);
    if (!link) {
      throw new Error('Failed to generate smart link');
    }

    const inviteId = uuidv4();

    // Build message with progress highlights (privacy-safe)
    let progressMessage = '';
    if (parentContext.childProgress) {
      if (parentContext.childProgress.improvement) {
        progressMessage = `My child improved ${parentContext.childProgress.improvement}%! `;
      }
      if (parentContext.childProgress.achievements?.length) {
        progressMessage += `Earned ${parentContext.childProgress.achievements.length} achievement(s)! `;
      }
    }

    const message = `${personalizationData.copy.headline}\n\n${progressMessage}${personalizationData.copy.body}\n\n${personalizationData.copy.cta}`;

    // Log invite event
    await this.logEvent(EventType.INVITE_SENT, context.userId, {
      inviteId,
      shortCode,
      milestoneType: parentContext.milestoneType,
      reelUrl: parentContext.reelUrl,
    });

    return {
      inviteId,
      link: link.fullUrl,
      shortCode,
      message,
      channel: personalizationData.channel,
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
        message: 'Try a class sampler!',
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

    // Log FVM event (parent's child completes first class or practice)
    await this.logEvent(EventType.FVM_REACHED, inviteeContext.userId, {
      inviteCode,
      referrerId: link.metadata.userId,
      loopId: this.loopId,
      fvmType: 'session',
    });

    // Both families get class passes
    return {
      inviterReward: {
        type: RewardType.CLASS_PASS,
        amount: 1,
        description: '1 class pass for inviting another parent',
      },
      inviteeReward: {
        type: RewardType.CLASS_PASS,
        amount: 1,
        description: '1 class pass to get started',
      },
    };
  }
}

