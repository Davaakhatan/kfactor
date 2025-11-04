/**
 * Results Rally Loop
 * 
 * Async → Social loop where diagnostics/practice results generate a rank vs. peers
 * and a challenge link. Cohort leaderboard refreshes in real time.
 */

import { BaseLoop, LoopContext, LoopInvite, LoopReward, LoopResult } from '../core/loops/loop-base.js';
import { ViralLoop, Persona, EventType, RewardType } from '../core/types/index.js';
import { SmartLinkService } from '../services/smart-links/smart-link-service.js';
import { v4 as uuidv4 } from 'uuid';

export interface ResultsRallyContext extends LoopContext {
  resultType: 'diagnostic' | 'practice_test' | 'flashcard';
  score?: number;
  percentile?: number;
  rank?: number;
  totalParticipants?: number;
  subject?: string;
  skills?: string[];
}

export class ResultsRallyLoop extends BaseLoop {
  readonly loopId = ViralLoop.RESULTS_RALLY;
  readonly name = 'Results Rally';
  readonly description = 'Share your results and challenge peers';
  readonly supportedPersonas = [Persona.STUDENT, Persona.PARENT];

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

    const resultsContext = context as ResultsRallyContext;
    
    // Must have results
    if (!resultsContext.resultType) {
      return false;
    }

    // Must have either score or percentile
    if (!resultsContext.score && !resultsContext.percentile) {
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
    const resultsContext = context as ResultsRallyContext;
    
    // Create results page deep link
    const shortCode = this.createSmartLink(this.smartLinkService, {
      baseUrl: this.BASE_URL,
      userId: context.userId,
      fvmType: 'practice',
      context: {
        subject: resultsContext.subject,
        skill: resultsContext.skills?.[0],
      },
    });

    const link = this.smartLinkService.resolveLink(shortCode);
    if (!link) {
      throw new Error('Failed to generate smart link');
    }

    const inviteId = uuidv4();

    // Build message with rank/percentile if available
    let rankMessage = '';
    if (resultsContext.rank && resultsContext.totalParticipants) {
      rankMessage = `I ranked #${resultsContext.rank} out of ${resultsContext.totalParticipants}! `;
    } else if (resultsContext.percentile) {
      rankMessage = `I scored in the ${resultsContext.percentile}th percentile! `;
    }

    const message = `${personalizationData.copy.headline}\n\n${rankMessage}${personalizationData.copy.body}\n\n${personalizationData.copy.cta}`;

    // Log invite event
    await this.logEvent(EventType.INVITE_SENT, context.userId, {
      inviteId,
      shortCode,
      resultType: resultsContext.resultType,
      score: resultsContext.score,
      percentile: resultsContext.percentile,
      rank: resultsContext.rank,
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
        message: 'View results and join the rally!',
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

    // Log FVM event
    await this.logEvent(EventType.FVM_REACHED, inviteeContext.userId, {
      inviteCode,
      referrerId: link.metadata.userId,
      loopId: this.loopId,
      fvmType: 'practice',
    });

    // Inviter gets gem boost, invitee gets practice power-up
    return {
      inviterReward: {
        type: RewardType.GEM_BOOST,
        amount: 50,
        description: '50 gems for bringing a friend to the rally',
      },
      inviteeReward: {
        type: RewardType.PRACTICE_POWER_UP,
        amount: 1,
        description: '1 practice power-up to get started',
      },
    };
  }
}

