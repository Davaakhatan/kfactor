/**
 * Loop Executor
 * 
 * Executes viral loops end-to-end, coordinating with agents and services.
 */

import { BaseLoop, LoopContext, LoopInvite, LoopReward } from './loop-base.js';
import { LoopRegistry } from './loop-registry.js';
import { AgentClient } from '../mcp/agent-client.js';
import { ViralLoop, Persona } from '../types/index.js';
import { eventBus } from '../events/event-bus.js';
import { EventType } from '../types/index.js';

export interface ExecuteLoopRequest {
  loopId: ViralLoop;
  context: LoopContext;
}

export interface ExecuteLoopResult {
  success: boolean;
  loopId: ViralLoop;
  invite?: LoopInvite;
  reward?: LoopReward;
  rationale?: string;
  error?: string;
}

export class LoopExecutor {
  private registry: LoopRegistry;
  private agentClient: AgentClient;

  constructor(registry: LoopRegistry, agentClient: AgentClient) {
    this.registry = registry;
    this.agentClient = agentClient;
  }

  /**
   * Execute a viral loop from trigger to invite generation
   */
  async execute(request: ExecuteLoopRequest): Promise<ExecuteLoopResult> {
    const loop = this.registry.get(request.loopId);
    if (!loop) {
      return {
        success: false,
        loopId: request.loopId,
        error: `Loop ${request.loopId} not found`,
      };
    }

    try {
      // Step 1: Check eligibility
      const eligible = await loop.isEligible(request.context);
      if (!eligible) {
        return {
          success: false,
          loopId: request.loopId,
          rationale: `User not eligible for ${loop.name} loop`,
        };
      }

      // Step 2: Get personalization from Personalization Agent
      const personalizationRequest = {
        agentId: 'loop-executor',
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userId: request.context.userId,
        persona: request.context.persona,
        loopId: request.loopId,
        context: {
          subject: request.context.subject,
          age: request.context.age,
          grade: request.context.grade,
        },
      };

      const personalizationResponse = await this.agentClient.callAgent(
        'personalization',
        personalizationRequest
      );

      if (!personalizationResponse.success || !personalizationResponse.data) {
        return {
          success: false,
          loopId: request.loopId,
          error: 'Personalization failed',
          rationale: personalizationResponse.rationale,
        };
      }

      // Step 3: Generate invite
      const invite = await loop.generateInvite(request.context, {
        copy: personalizationResponse.data.copy,
        channel: personalizationResponse.data.channel,
      });

      // Step 4: Log to Experimentation Agent
      await this.logToExperimentation(request.context, request.loopId, invite);

      return {
        success: true,
        loopId: request.loopId,
        invite,
        rationale: `Successfully generated invite for ${loop.name}`,
      };
    } catch (error) {
      return {
        success: false,
        loopId: request.loopId,
        error: error instanceof Error ? error.message : 'Unknown error',
        rationale: `Error executing loop: ${error}`,
      };
    }
  }

  /**
   * Process invitee joining
   */
  async processJoin(
    inviteCode: string,
    inviteeContext: LoopContext
  ): Promise<ExecuteLoopResult> {
    // Resolve loop from invite code (would need to store this mapping)
    // For now, we'll try to determine from the link metadata
    const loop = await this.findLoopByInviteCode(inviteCode);
    if (!loop) {
      return {
        success: false,
        loopId: ViralLoop.BUDDY_CHALLENGE, // fallback
        error: 'Could not determine loop from invite code',
      };
    }

    try {
      const result = await loop.processJoin(inviteCode, inviteeContext);
      
      if (!result.success) {
        return {
          success: false,
          loopId: loop.loopId,
          error: result.error,
        };
      }

      // Log to Experimentation Agent
      await this.logToExperimentation(inviteeContext, loop.loopId, result.invite, 'join');

      return {
        success: true,
        loopId: loop.loopId,
        invite: result.invite,
        rationale: `Invitee successfully joined ${loop.name}`,
      };
    } catch (error) {
      return {
        success: false,
        loopId: loop.loopId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process FVM achievement
   */
  async processFVM(
    inviteCode: string,
    inviteeContext: LoopContext
  ): Promise<ExecuteLoopResult> {
    const loop = await this.findLoopByInviteCode(inviteCode);
    if (!loop) {
      return {
        success: false,
        loopId: ViralLoop.BUDDY_CHALLENGE,
        error: 'Could not determine loop from invite code',
      };
    }

    try {
      const reward = await loop.processFVM(inviteCode, inviteeContext);
      
      if (!reward) {
        return {
          success: false,
          loopId: loop.loopId,
          rationale: 'FVM conditions not met or expired',
        };
      }

      // Log to Experimentation Agent
      await this.logToExperimentation(inviteeContext, loop.loopId, undefined, 'fvm');

      return {
        success: true,
        loopId: loop.loopId,
        reward,
        rationale: `FVM achieved for ${loop.name}, rewards allocated`,
      };
    } catch (error) {
      return {
        success: false,
        loopId: loop.loopId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Find loop by invite code (simplified - in production would query database)
   */
  private async findLoopByInviteCode(inviteCode: string): Promise<BaseLoop | null> {
    // In production, we'd store invite code -> loop ID mapping
    // For now, try all loops (this is inefficient but works for prototype)
    const loops = this.registry.getAll();
    
    // Try to resolve the link to get metadata
    // This would need access to SmartLinkService
    // For now, return first loop as fallback
    return loops[0] || null;
  }

  /**
   * Log events to Experimentation Agent
   */
  private async logToExperimentation(
    context: LoopContext,
    loopId: ViralLoop,
    invite?: LoopInvite,
    eventType: 'trigger' | 'join' | 'fvm' = 'trigger'
  ): Promise<void> {
    const eventTypeMap = {
      trigger: EventType.LOOP_TRIGGERED,
      join: EventType.INVITE_OPENED,
      fvm: EventType.FVM_REACHED,
    };

    const expRequest = {
      agentId: 'loop-executor',
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: context.userId,
      action: 'log_event' as const,
      context: {
        event: {
          eventType: eventTypeMap[eventType],
          userId: context.userId,
          timestamp: new Date().toISOString(),
          inviteCode: invite?.shortCode,
          loopId,
          metadata: {
            persona: context.persona,
            subject: context.subject,
          },
        },
      },
    };

    await this.agentClient.callAgent('experimentation', expRequest);
  }
}

