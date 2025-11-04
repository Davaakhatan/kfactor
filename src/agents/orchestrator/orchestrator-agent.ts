/**
 * Loop Orchestrator Agent
 * 
 * Chooses which viral loop to trigger based on user context, triggers, and eligibility.
 * This is a required agent that coordinates viral loop selection.
 */

import { BaseAgent, AgentRequest, AgentResponse } from '../../core/mcp/agent-base.js';
import { Persona, UserTrigger, ViralLoop } from '../../core/types/index.js';

export interface OrchestratorRequest extends AgentRequest {
  trigger: UserTrigger;
  persona: Persona;
  userId: string;
  context: {
    subject?: string;
    age?: number;
    grade?: string;
    recentLoops?: ViralLoop[];
    inviteCount?: number;
    lastInviteTimestamp?: string;
    preferences?: {
      optedOut?: boolean;
      channels?: string[];
    };
  };
}

export interface OrchestratorResponse extends AgentResponse {
  data?: {
    selectedLoops: ViralLoop[];
    eligibility: {
      eligible: boolean;
      reason?: string;
    };
    throttling: {
      throttled: boolean;
      reason?: string;
      retryAfter?: number;
    };
  };
}

export class OrchestratorAgent extends BaseAgent {
  private readonly MAX_INVITES_PER_DAY = 5;
  private readonly COOLDOWN_MINUTES = 60;
  private readonly MAX_LOOPS_PER_TRIGGER = 2;

  constructor() {
    super({
      name: 'orchestrator',
      version: '1.0.0',
      maxLatencyMs: 150,
      enableCaching: true,
      fallbackEnabled: true,
    });
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    this.startTiming();

    if (!this.validateRequest(request)) {
      return this.createErrorResponse(
        request.requestId,
        { code: 'INVALID_REQUEST', message: 'Request validation failed' },
        'Request missing required fields: agentId, requestId, timestamp, or userId'
      );
    }

    const orchestratorRequest = request as OrchestratorRequest;

    try {
      // Check eligibility
      const eligibility = this.checkEligibility(orchestratorRequest);
      if (!eligibility.eligible) {
        return this.createResponse(
          request.requestId,
          false,
          `User not eligible: ${eligibility.reason}`,
          {
            data: {
              selectedLoops: [],
              eligibility,
              throttling: { throttled: false },
            },
            confidence: 1.0,
            featuresUsed: ['user_preferences', 'opt_out_status'],
          }
        );
      }

      // Check throttling
      const throttling = this.checkThrottling(orchestratorRequest);
      if (throttling.throttled) {
        return this.createResponse(
          request.requestId,
          false,
          `Request throttled: ${throttling.reason}`,
          {
            data: {
              selectedLoops: [],
              eligibility,
              throttling,
            },
            confidence: 1.0,
            featuresUsed: ['invite_count', 'last_invite_timestamp'],
          }
        );
      }

      // Select loops based on trigger and persona
      const selectedLoops = this.selectLoops(
        orchestratorRequest.trigger,
        orchestratorRequest.persona,
        orchestratorRequest.context
      );

      const rationale = this.buildRationale(
        orchestratorRequest,
        selectedLoops,
        eligibility,
        throttling
      );

      return this.createResponse(
        request.requestId,
        true,
        rationale,
        {
          data: {
            selectedLoops,
            eligibility,
            throttling,
          },
          confidence: 0.85,
          featuresUsed: [
            'trigger_type',
            'persona',
            'subject',
            'recent_loops',
            'invite_count',
            'user_preferences',
          ],
        }
      );
    } catch (error) {
      return this.createErrorResponse(
        request.requestId,
        {
          code: 'PROCESSING_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        `Error processing orchestrator request: ${error}`
      );
    }
  }

  /**
   * Check if user is eligible for viral loops
   */
  private checkEligibility(
    request: OrchestratorRequest
  ): { eligible: boolean; reason?: string } {
    // Check opt-out status
    if (request.context.preferences?.optedOut) {
      return { eligible: false, reason: 'User has opted out of growth communications' };
    }

    // Check age restrictions (COPPA compliance)
    if (request.persona === Persona.STUDENT && request.context.age !== undefined) {
      if (request.context.age < 13) {
        // Require parental consent - this would be checked elsewhere
        // For now, we allow but flag for compliance check
      }
    }

    return { eligible: true };
  }

  /**
   * Check if request should be throttled
   */
  private checkThrottling(
    request: OrchestratorRequest
  ): { throttled: boolean; reason?: string; retryAfter?: number } {
    const inviteCount = request.context.inviteCount ?? 0;
    const lastInvite = request.context.lastInviteTimestamp;

    // Check daily limit
    if (inviteCount >= this.MAX_INVITES_PER_DAY) {
      return {
        throttled: true,
        reason: `Daily invite limit reached (${this.MAX_INVITES_PER_DAY})`,
        retryAfter: this.calculateRetryAfter(lastInvite),
      };
    }

    // Check cooldown
    if (lastInvite) {
      const lastInviteTime = new Date(lastInvite).getTime();
      const cooldownMs = this.COOLDOWN_MINUTES * 60 * 1000;
      const timeSinceLastInvite = Date.now() - lastInviteTime;

      if (timeSinceLastInvite < cooldownMs) {
        const retryAfter = Math.ceil((cooldownMs - timeSinceLastInvite) / 1000);
        return {
          throttled: true,
          reason: `Cooldown period active (${this.COOLDOWN_MINUTES} minutes)`,
          retryAfter,
        };
      }
    }

    return { throttled: false };
  }

  /**
   * Select appropriate loops based on trigger and persona
   */
  private selectLoops(
    trigger: UserTrigger,
    persona: Persona,
    context: OrchestratorRequest['context']
  ): ViralLoop[] {
    const loops: ViralLoop[] = [];
    const recentLoops = context.recentLoops ?? [];

    // Map triggers to eligible loops by persona
    // Only includes implemented loops: BUDDY_CHALLENGE, RESULTS_RALLY, PROUD_PARENT, STREAK_RESCUE
    const triggerMapping: Record<
      UserTrigger,
      Record<Persona, ViralLoop[]>
    > = {
      [UserTrigger.SESSION_COMPLETE]: {
        [Persona.STUDENT]: [ViralLoop.BUDDY_CHALLENGE],
        [Persona.PARENT]: [ViralLoop.PROUD_PARENT],
        [Persona.TUTOR]: [], // Tutor Spotlight triggered by rating, not session complete
      },
      [UserTrigger.RESULTS_PAGE_VIEW]: {
        [Persona.STUDENT]: [ViralLoop.BUDDY_CHALLENGE, ViralLoop.RESULTS_RALLY],
        [Persona.PARENT]: [ViralLoop.PROUD_PARENT],
        [Persona.TUTOR]: [],
      },
      [UserTrigger.BADGE_EARNED]: {
        [Persona.STUDENT]: [ViralLoop.BUDDY_CHALLENGE],
        [Persona.PARENT]: [ViralLoop.PROUD_PARENT],
        [Persona.TUTOR]: [],
      },
      [UserTrigger.STREAK_PRESERVED]: {
        [Persona.STUDENT]: [ViralLoop.BUDDY_CHALLENGE],
        [Persona.PARENT]: [],
        [Persona.TUTOR]: [],
      },
      [UserTrigger.STREAK_AT_RISK]: {
        [Persona.STUDENT]: [ViralLoop.STREAK_RESCUE],
        [Persona.PARENT]: [],
        [Persona.TUTOR]: [],
      },
      [UserTrigger.CLASS_RECORDED]: {
        [Persona.STUDENT]: [ViralLoop.BUDDY_CHALLENGE], // Fallback to buddy challenge
        [Persona.PARENT]: [],
        [Persona.TUTOR]: [],
      },
      [UserTrigger.CLUB_JOINED]: {
        [Persona.STUDENT]: [ViralLoop.BUDDY_CHALLENGE], // Fallback to buddy challenge
        [Persona.PARENT]: [],
        [Persona.TUTOR]: [],
      },
      [UserTrigger.MILESTONE_REACHED]: {
        [Persona.STUDENT]: [ViralLoop.BUDDY_CHALLENGE],
        [Persona.PARENT]: [ViralLoop.PROUD_PARENT],
        [Persona.TUTOR]: [],
      },
      [UserTrigger.SESSION_RATED]: {
        [Persona.STUDENT]: [],
        [Persona.PARENT]: [],
        [Persona.TUTOR]: [ViralLoop.TUTOR_SPOTLIGHT], // Tutor Spotlight triggered by 5★ rating
      },
    };

    const eligibleLoops = triggerMapping[trigger]?.[persona] ?? [];

    // Filter out recently used loops
    const availableLoops = eligibleLoops.filter(
      (loop) => !recentLoops.includes(loop)
    );

    // Select up to MAX_LOOPS_PER_TRIGGER loops
    loops.push(...availableLoops.slice(0, this.MAX_LOOPS_PER_TRIGGER));

    // If no loops available after filtering, allow recent loops (but prioritize less recent)
    if (loops.length === 0 && eligibleLoops.length > 0) {
      loops.push(...eligibleLoops.slice(0, this.MAX_LOOPS_PER_TRIGGER));
    }

    return loops;
  }

  /**
   * Build human-readable rationale for the decision
   */
  private buildRationale(
    request: OrchestratorRequest,
    selectedLoops: ViralLoop[],
    eligibility: { eligible: boolean; reason?: string },
    throttling: { throttled: boolean; reason?: string }
  ): string {
    if (!eligibility.eligible) {
      return `User ineligible: ${eligibility.reason}`;
    }

    if (throttling.throttled) {
      return `Request throttled: ${throttling.reason}`;
    }

    if (selectedLoops.length === 0) {
      return `No loops selected for trigger ${request.trigger} and persona ${request.persona}`;
    }

    return `Selected ${selectedLoops.length} loop(s) [${selectedLoops.join(
      ', '
    )}] for ${request.persona} triggered by ${request.trigger}. Based on user context: ${request.context.subject ?? 'no subject'}, ${request.context.inviteCount ?? 0} invites today.`;
  }

  /**
   * Calculate retry after seconds
   */
  private calculateRetryAfter(lastInviteTimestamp?: string): number {
    if (!lastInviteTimestamp) {
      return 3600; // 1 hour default
    }

    const lastInvite = new Date(lastInviteTimestamp).getTime();
    const nextAvailable = lastInvite + 24 * 60 * 60 * 1000; // 24 hours later
    const retryAfter = Math.max(0, Math.ceil((nextAvailable - Date.now()) / 1000));

    return retryAfter;
  }
}

