/**
 * Personalization Agent
 * 
 * Tailors messaging, rewards, and channels by persona, subject, and user context.
 * This is a required agent that personalizes all viral loop communications.
 */

import { BaseAgent, AgentRequest, AgentResponse } from '../../core/mcp/agent-base.js';
import { Persona, ViralLoop, RewardType, Channel } from '../../core/types/index.js';

export interface PersonalizationRequest extends AgentRequest {
  persona: Persona;
  loopId: ViralLoop;
  userId: string;
  context: {
    subject?: string;
    age?: number;
    grade?: string;
    userHistory?: {
      preferredRewards?: RewardType[];
      preferredChannels?: Channel[];
      pastInvites?: number;
    };
    inviteeContext?: {
      relationship?: string;
      sharedSubjects?: string[];
    };
  };
}

export interface PersonalizationResponse extends AgentResponse {
  data?: {
    copy: {
      headline: string;
      body: string;
      cta: string;
      tone: 'casual' | 'friendly' | 'encouraging' | 'competitive' | 'supportive';
    };
    reward: {
      type: RewardType;
      amount: number;
      description: string;
    };
    channel: Channel;
    variant?: string;
  };
}

export class PersonalizationAgent extends BaseAgent {
  constructor() {
    super({
      name: 'personalization',
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

    const personalizationRequest = request as PersonalizationRequest;

    try {
      // Generate personalized copy
      const copy = this.generateCopy(
        personalizationRequest.persona,
        personalizationRequest.loopId,
        personalizationRequest.context
      );

      // Select appropriate reward
      const reward = this.selectReward(
        personalizationRequest.persona,
        personalizationRequest.loopId,
        personalizationRequest.context
      );

      // Select communication channel
      const channel = this.selectChannel(
        personalizationRequest.persona,
        personalizationRequest.context
      );

      const rationale = this.buildRationale(
        personalizationRequest,
        copy,
        reward,
        channel
      );

      return this.createResponse(
        request.requestId,
        true,
        rationale,
        {
          data: {
            copy,
            reward,
            channel,
            variant: this.selectVariant(personalizationRequest),
          },
          confidence: 0.80,
          featuresUsed: [
            'persona',
            'loop_id',
            'subject',
            'age',
            'user_history',
            'preferred_rewards',
            'preferred_channels',
          ],
        }
      );
    } catch (error) {
      return this.createErrorResponse(
        request.requestId,
        {
          code: 'PERSONALIZATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        `Error personalizing content: ${error}`
      );
    }
  }

  /**
   * Generate personalized copy based on persona and loop
   */
  private generateCopy(
    persona: Persona,
    loopId: ViralLoop,
    context: PersonalizationRequest['context']
  ): PersonalizationResponse['data']['copy'] {
    const subject = context.subject ?? 'your subject';
    const templates = this.getCopyTemplates(persona, loopId);

    // Select template variant based on context
    const variant = this.selectTemplateVariant(context);

    // Get base template
    const template = templates[variant] ?? templates.default;

    return {
      headline: this.interpolate(template.headline, context),
      body: this.interpolate(template.body, context),
      cta: this.interpolate(template.cta, context),
      tone: template.tone,
    };
  }

  /**
   * Get copy templates by persona and loop
   */
  private getCopyTemplates(
    persona: Persona,
    loopId: ViralLoop
  ): Record<string, PersonalizationResponse['data']['copy']> {
    // Template structure - in production, these would come from a content management system
    const templates: Record<
      string,
      Record<string, PersonalizationResponse['data']['copy']>
    > = {
      [`${persona}_${loopId}`]: {
        default: {
          headline: `Share your ${loopId} progress!`,
          body: `You've been doing great! Challenge a friend to join you.`,
          cta: 'Invite a friend',
          tone: 'encouraging',
        },
        competitive: {
          headline: `Beat your friend at ${loopId}!`,
          body: `Think you can do better? Challenge them now!`,
          cta: 'Challenge Friend',
          tone: 'competitive',
        },
        supportive: {
          headline: `Help a friend with ${loopId}`,
          body: `Share the learning journey with someone you care about.`,
          cta: 'Invite Friend',
          tone: 'supportive',
        },
      },
    };

    const key = `${persona}_${loopId}`;
    return templates[key] ?? templates[`${persona}_buddy_challenge`] ?? templates.default;
  }

  /**
   * Select appropriate reward type and amount
   */
  private selectReward(
    persona: Persona,
    loopId: ViralLoop,
    context: PersonalizationRequest['context']
  ): PersonalizationResponse['data']['reward'] {
    // Reward mapping by persona and loop
    const rewardMap: Record<
      Persona,
      Record<ViralLoop, { type: RewardType; baseAmount: number }>
    > = {
      [Persona.STUDENT]: {
        [ViralLoop.BUDDY_CHALLENGE]: { type: RewardType.STREAK_SHIELD, baseAmount: 1 },
        [ViralLoop.RESULTS_RALLY]: { type: RewardType.GEM_BOOST, baseAmount: 50 },
        [ViralLoop.STREAK_RESCUE]: { type: RewardType.STREAK_SHIELD, baseAmount: 1 },
        [ViralLoop.ACHIEVEMENT_SPOTLIGHT]: { type: RewardType.XP_BOOST, baseAmount: 100 },
        [ViralLoop.CLASS_WATCH_PARTY]: { type: RewardType.AI_TUTOR_MINUTES, baseAmount: 15 },
        [ViralLoop.SUBJECT_CLUBS]: { type: RewardType.PRACTICE_POWER_UP, baseAmount: 1 },
        [ViralLoop.PROUD_PARENT]: { type: RewardType.CLASS_PASS, baseAmount: 1 },
        [ViralLoop.TUTOR_SPOTLIGHT]: { type: RewardType.XP_BOOST, baseAmount: 50 },
      },
      [Persona.PARENT]: {
        [ViralLoop.PROUD_PARENT]: { type: RewardType.CLASS_PASS, baseAmount: 1 },
        [ViralLoop.BUDDY_CHALLENGE]: { type: RewardType.CLASS_PASS, baseAmount: 1 },
        [ViralLoop.RESULTS_RALLY]: { type: RewardType.CLASS_PASS, baseAmount: 1 },
        [ViralLoop.TUTOR_SPOTLIGHT]: { type: RewardType.CLASS_PASS, baseAmount: 1 },
        [ViralLoop.CLASS_WATCH_PARTY]: { type: RewardType.CLASS_PASS, baseAmount: 1 },
        [ViralLoop.STREAK_RESCUE]: { type: RewardType.CLASS_PASS, baseAmount: 1 },
        [ViralLoop.SUBJECT_CLUBS]: { type: RewardType.CLASS_PASS, baseAmount: 1 },
        [ViralLoop.ACHIEVEMENT_SPOTLIGHT]: { type: RewardType.CLASS_PASS, baseAmount: 1 },
      },
      [Persona.TUTOR]: {
        [ViralLoop.TUTOR_SPOTLIGHT]: { type: RewardType.XP_BOOST, baseAmount: 200 },
        [ViralLoop.PROUD_PARENT]: { type: RewardType.XP_BOOST, baseAmount: 100 },
        [ViralLoop.BUDDY_CHALLENGE]: { type: RewardType.XP_BOOST, baseAmount: 50 },
        [ViralLoop.RESULTS_RALLY]: { type: RewardType.XP_BOOST, baseAmount: 50 },
        [ViralLoop.CLASS_WATCH_PARTY]: { type: RewardType.XP_BOOST, baseAmount: 100 },
        [ViralLoop.STREAK_RESCUE]: { type: RewardType.XP_BOOST, baseAmount: 50 },
        [ViralLoop.SUBJECT_CLUBS]: { type: RewardType.XP_BOOST, baseAmount: 50 },
        [ViralLoop.ACHIEVEMENT_SPOTLIGHT]: { type: RewardType.XP_BOOST, baseAmount: 100 },
      },
    };

    const rewardConfig = rewardMap[persona]?.[loopId] ?? {
      type: RewardType.GEM_BOOST,
      baseAmount: 25,
    };

    // Adjust amount based on user history (loyalty bonus)
    const pastInvites = context.userHistory?.pastInvites ?? 0;
    const amountMultiplier = Math.min(1 + pastInvites * 0.1, 2); // Cap at 2x
    const amount = Math.floor(rewardConfig.baseAmount * amountMultiplier);

    return {
      type: rewardConfig.type,
      amount,
      description: this.getRewardDescription(rewardConfig.type, amount),
    };
  }

  /**
   * Select communication channel
   */
  private selectChannel(
    persona: Persona,
    context: PersonalizationRequest['context']
  ): Channel {
    // Prefer user's preferred channels
    const preferredChannels = context.userHistory?.preferredChannels;
    if (preferredChannels && preferredChannels.length > 0) {
      return preferredChannels[0] as Channel;
    }

    // Default channel by persona
    const defaultChannels: Record<Persona, Channel> = {
      [Persona.STUDENT]: Channel.IN_APP,
      [Persona.PARENT]: Channel.EMAIL,
      [Persona.TUTOR]: Channel.EMAIL,
    };

    return defaultChannels[persona] ?? Channel.IN_APP;
  }

  /**
   * Select template variant
   */
  private selectTemplateVariant(
    context: PersonalizationRequest['context']
  ): string {
    // In production, this would use ML to select the best variant
    // For now, use simple heuristics
    const age = context.age ?? 0;
    if (age < 13) {
      return 'supportive';
    } else if (age >= 18) {
      return 'competitive';
    }
    return 'default';
  }

  /**
   * Select A/B test variant
   */
  private selectVariant(request: PersonalizationRequest): string {
    // Simple hash-based variant selection
    const hash = this.simpleHash(request.userId + request.loopId);
    return hash % 2 === 0 ? 'A' : 'B';
  }

  /**
   * Interpolate template strings with context
   */
  private interpolate(
    template: string,
    context: PersonalizationRequest['context']
  ): string {
    return template
      .replace(/\{subject\}/g, context.subject ?? 'your subject')
      .replace(/\{age\}/g, context.age?.toString() ?? '')
      .replace(/\{grade\}/g, context.grade ?? '');
  }

  /**
   * Get reward description
   */
  private getRewardDescription(type: RewardType, amount: number): string {
    const descriptions: Record<RewardType, (amount: number) => string> = {
      [RewardType.AI_TUTOR_MINUTES]: (amt) => `${amt} minutes of AI Tutor`,
      [RewardType.CLASS_PASS]: (amt) => `${amt} class pass${amt > 1 ? 'es' : ''}`,
      [RewardType.GEM_BOOST]: (amt) => `${amt} gems`,
      [RewardType.XP_BOOST]: (amt) => `${amt} XP`,
      [RewardType.STREAK_SHIELD]: (amt) => `${amt} streak shield${amt > 1 ? 's' : ''}`,
      [RewardType.PRACTICE_POWER_UP]: (amt) => `${amt} practice power-up${amt > 1 ? 's' : ''}`,
    };

    return descriptions[type]?.(amount) ?? `${amount} reward`;
  }

  /**
   * Build rationale
   */
  private buildRationale(
    request: PersonalizationRequest,
    copy: PersonalizationResponse['data']['copy'],
    reward: PersonalizationResponse['data']['reward'],
    channel: Channel
  ): string {
    return `Personalized for ${request.persona} with ${request.loopId} loop. Selected ${copy.tone} tone copy, ${reward.type} reward (${reward.amount}), and ${channel} channel. Based on subject: ${request.context.subject ?? 'none'}, age: ${request.context.age ?? 'unknown'}, past invites: ${request.context.userHistory?.pastInvites ?? 0}.`;
  }

  /**
   * Simple hash function for variant selection
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

