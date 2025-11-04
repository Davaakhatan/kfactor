/**
 * Tutor Advocacy Agent
 * 
 * Generates share packs for tutors (smart links, auto thumbnails, one-tap
 * WhatsApp/SMS) and tracks referrals/attribution.
 */

import { BaseAgent, AgentRequest, AgentResponse } from '../../core/mcp/agent-base.js';
import { SmartLinkService } from '../../services/smart-links/smart-link-service.js';
import { Persona } from '../../core/types/index.js';

export interface TutorAdvocacyRequest extends AgentRequest {
  action: 'generate_share_pack' | 'track_referral' | 'get_referral_stats';
  tutorId: string;
  context: {
    sessionId?: string;
    subject?: string;
    classSampler?: boolean;
    prepPack?: boolean;
    referralCode?: string;
    channel?: 'whatsapp' | 'sms' | 'email' | 'link';
  };
}

export interface TutorSharePack {
  packId: string;
  tutorId: string;
  shareLinks: {
    whatsapp?: string;
    sms?: string;
    email?: string;
    direct?: string;
  };
  thumbnailUrl?: string;
  classSamplerLink?: string;
  prepPackLink?: string;
  message: string;
  referralCode: string;
  createdAt: string;
}

export interface TutorAdvocacyResponse extends AgentResponse {
  data?: {
    sharePack?: TutorSharePack;
    referralStats?: {
      totalReferrals: number;
      convertedReferrals: number;
      conversionRate: number;
      totalXP: number;
      recentReferrals: Array<{
        userId: string;
        converted: boolean;
        timestamp: string;
      }>;
    };
    referralCode?: string;
  };
}

export class TutorAdvocacyAgent extends BaseAgent {
  private smartLinkService: SmartLinkService;
  private readonly BASE_URL = process.env.BASE_URL || 'https://varsitytutors.com';
  
  // Referral tracking (in production, would be in database)
  private referrals: Map<string, Array<{
    userId: string;
    converted: boolean;
    timestamp: string;
    fvmReached: boolean;
  }>> = new Map();

  constructor(smartLinkService: SmartLinkService) {
    super({
      name: 'tutor-advocacy',
      version: '1.0.0',
      maxLatencyMs: 150,
      enableCaching: true,
      fallbackEnabled: true,
    });
    this.smartLinkService = smartLinkService;
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    this.startTiming();

    if (!this.validateRequest(request)) {
      return this.createErrorResponse(
        request.requestId,
        { code: 'INVALID_REQUEST', message: 'Request validation failed' },
        'Request missing required fields'
      );
    }

    const tutorRequest = request as TutorAdvocacyRequest;

    try {
      switch (tutorRequest.action) {
        case 'generate_share_pack':
          return this.generateSharePack(tutorRequest);
        case 'track_referral':
          return this.trackReferral(tutorRequest);
        case 'get_referral_stats':
          return this.getReferralStats(tutorRequest);
        default:
          return this.createErrorResponse(
            request.requestId,
            { code: 'INVALID_ACTION', message: `Unknown action: ${tutorRequest.action}` },
            `Invalid action: ${tutorRequest.action}`
          );
      }
    } catch (error) {
      return this.createErrorResponse(
        request.requestId,
        {
          code: 'TUTOR_ADVOCACY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        `Error in tutor advocacy: ${error}`
      );
    }
  }

  /**
   * Generate share pack for tutor
   */
  private generateSharePack(request: TutorAdvocacyRequest): AgentResponse {
    const tutorId = request.tutorId;
    const referralCode = request.context.referralCode || this.generateReferralCode(tutorId);

    // Generate smart link
    const smartLink = this.smartLinkService.generateLink({
      baseUrl: this.BASE_URL,
      userId: tutorId,
      loopId: 'tutor_spotlight' as any,
      persona: Persona.TUTOR,
      fvmType: 'session',
      context: {
        subject: request.context.subject,
      },
      utmParams: {
        source: 'tutor_referral',
        medium: 'referral',
        campaign: 'tutor_spotlight',
        term: referralCode,
      },
    });

    // Generate share links for different channels
    const shareLinks: TutorSharePack['shareLinks'] = {
      direct: smartLink.fullUrl,
    };

    // WhatsApp link
    const whatsappMessage = encodeURIComponent(
      `Check out Varsity Tutors! ${smartLink.fullUrl}`
    );
    shareLinks.whatsapp = `https://wa.me/?text=${whatsappMessage}`;

    // SMS link
    const smsMessage = encodeURIComponent(
      `Check out Varsity Tutors: ${smartLink.fullUrl}`
    );
    shareLinks.sms = `sms:?body=${smsMessage}`;

    // Email link (mailto)
    const emailSubject = encodeURIComponent('Try Varsity Tutors');
    const emailBody = encodeURIComponent(
      `I recommend trying Varsity Tutors! ${smartLink.fullUrl}`
    );
    shareLinks.email = `mailto:?subject=${emailSubject}&body=${emailBody}`;

    // Generate class sampler link if requested
    let classSamplerLink: string | undefined;
    if (request.context.classSampler) {
      classSamplerLink = `${this.BASE_URL}/class-sampler?ref=${referralCode}&subject=${request.context.subject || ''}`;
    }

    // Generate prep pack link if requested
    let prepPackLink: string | undefined;
    if (request.context.prepPack && request.context.sessionId) {
      prepPackLink = `${this.BASE_URL}/prep-pack/${request.context.sessionId}?ref=${referralCode}`;
    }

    const sharePack: TutorSharePack = {
      packId: crypto.randomUUID(),
      tutorId,
      shareLinks,
      thumbnailUrl: `${this.BASE_URL}/tutor-thumbnail/${tutorId}`,
      classSamplerLink,
      prepPackLink,
      message: `Try Varsity Tutors with tutor ${tutorId}! ${smartLink.fullUrl}`,
      referralCode,
      createdAt: new Date().toISOString(),
    };

    return this.createResponse(
      request.requestId,
      true,
      `Generated share pack for tutor ${tutorId} with referral code ${referralCode}. Includes ${Object.keys(shareLinks).length} share channels.`,
      {
        data: {
          sharePack,
          referralCode,
        },
        confidence: 0.95,
        featuresUsed: [
          'tutor_id',
          'smart_link_generation',
          'channel_generation',
          'referral_code',
        ],
      }
    );
  }

  /**
   * Track referral
   */
  private trackReferral(request: TutorAdvocacyRequest): AgentResponse {
    const tutorId = request.tutorId;
    const referralCode = request.context.referralCode;

    if (!referralCode) {
      return this.createErrorResponse(
        request.requestId,
        { code: 'MISSING_CODE', message: 'Referral code required' },
        'Referral code is required for tracking'
      );
    }

    // In production, would extract userId from invite/referral
    const userId = `user-${Date.now()}`; // Mock

    if (!this.referrals.has(tutorId)) {
      this.referrals.set(tutorId, []);
    }

    this.referrals.get(tutorId)!.push({
      userId,
      converted: false,
      timestamp: new Date().toISOString(),
      fvmReached: false,
    });

    return this.createResponse(
      request.requestId,
      true,
      `Referral tracked for tutor ${tutorId} with code ${referralCode}`,
      {
        data: {
          referralCode,
        },
        confidence: 1.0,
        featuresUsed: ['referral_code', 'tutor_id'],
      }
    );
  }

  /**
   * Get referral statistics
   */
  private getReferralStats(request: TutorAdvocacyRequest): AgentResponse {
    const tutorId = request.tutorId;
    const tutorReferrals = this.referrals.get(tutorId) || [];

    const totalReferrals = tutorReferrals.length;
    const convertedReferrals = tutorReferrals.filter((r) => r.converted).length;
    const conversionRate = totalReferrals > 0 ? convertedReferrals / totalReferrals : 0;

    // Calculate XP (mock - in production would track actual XP)
    const totalXP = convertedReferrals * 200; // 200 XP per conversion

    const recentReferrals = tutorReferrals
      .slice(-10)
      .map((r) => ({
        userId: r.userId,
        converted: r.converted,
        timestamp: r.timestamp,
      }));

    return this.createResponse(
      request.requestId,
      true,
      `Referral stats for tutor ${tutorId}: ${totalReferrals} total, ${convertedReferrals} converted (${(conversionRate * 100).toFixed(1)}%), ${totalXP} XP earned`,
      {
        data: {
          referralStats: {
            totalReferrals,
            convertedReferrals,
            conversionRate,
            totalXP,
            recentReferrals,
          },
        },
        confidence: 0.90,
        featuresUsed: ['tutor_id', 'referral_tracking', 'conversion_tracking'],
      }
    );
  }

  /**
   * Generate referral code
   */
  private generateReferralCode(tutorId: string): string {
    // In production, would use a more sophisticated code generation
    const hash = tutorId.substring(0, 8).toUpperCase();
    return `TUTOR-${hash}`;
  }
}

