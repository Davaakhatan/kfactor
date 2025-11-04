/**
 * Experimentation Agent
 * 
 * Handles A/B testing, traffic allocation, K-factor calculation, and guardrail monitoring.
 * This is a required agent that manages all experimentation and analytics.
 */

import { BaseAgent, AgentRequest, AgentResponse } from '../../core/mcp/agent-base.js';
import { EventType, ViralEvent } from '../../core/types/index.js';

export interface ExperimentationRequest extends AgentRequest {
  action: 'allocate' | 'log_event' | 'calculate_k' | 'check_guardrails';
  userId: string;
  context?: {
    experimentId?: string;
    loopId?: string;
    event?: ViralEvent;
    cohort?: string;
    timeRange?: {
      start: string;
      end: string;
    };
  };
}

export interface ExperimentationResponse extends AgentResponse {
  data?: {
    variant?: 'control' | 'treatment';
    experimentId?: string;
    kFactor?: number;
    metrics?: {
      invitesPerUser: number;
      conversionRate: number;
      fvmRate: number;
      retentionD7: number;
    };
    guardrails?: {
      complaintRate: number;
      optOutRate: number;
      fraudRate: number;
      supportTickets: number;
      healthy: boolean;
    };
  };
}

export class ExperimentationAgent extends BaseAgent {
  private readonly EXPERIMENT_ALLOCATION = 0.5; // 50/50 split
  private readonly K_FACTOR_TARGET = 1.20;
  private readonly GUARDRAIL_THRESHOLDS = {
    complaintRate: 0.01, // 1%
    optOutRate: 0.01, // 1%
    fraudRate: 0.005, // 0.5%
    supportTickets: 100, // per day
  };

  // In-memory storage (in production, this would be a database/cache)
  private events: ViralEvent[] = [];
  private experiments: Map<string, Map<string, 'control' | 'treatment'>> = new Map();

  constructor() {
    super({
      name: 'experimentation',
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

    const expRequest = request as ExperimentationRequest;

    try {
      switch (expRequest.action) {
        case 'allocate':
          return this.allocateTraffic(expRequest);
        case 'log_event':
          return this.logEvent(expRequest);
        case 'calculate_k':
          return this.calculateKFactor(expRequest);
        case 'check_guardrails':
          return this.checkGuardrails(expRequest);
        default:
          return this.createErrorResponse(
            request.requestId,
            { code: 'INVALID_ACTION', message: `Unknown action: ${expRequest.action}` },
            `Invalid action: ${expRequest.action}`
          );
      }
    } catch (error) {
      return this.createErrorResponse(
        request.requestId,
        {
          code: 'EXPERIMENTATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        `Error in experimentation: ${error}`
      );
    }
  }

  /**
   * Allocate traffic to control or treatment
   */
  private allocateTraffic(
    request: ExperimentationRequest
  ): AgentResponse {
    const experimentId = request.context?.experimentId ?? 'default';
    const userId = request.userId;

    // Check if user already has allocation
    const userAllocations = this.experiments.get(experimentId);
    if (userAllocations?.has(userId)) {
      const variant = userAllocations.get(userId)!;
      return this.createResponse(
        request.requestId,
        true,
        `User already allocated to ${variant} in experiment ${experimentId}`,
        {
          data: {
            variant,
            experimentId,
          },
          confidence: 1.0,
          featuresUsed: ['user_id', 'experiment_id', 'existing_allocation'],
        }
      );
    }

    // Allocate based on consistent hash
    const variant = this.hashAllocate(userId, experimentId);
    
    // Store allocation
    if (!userAllocations) {
      this.experiments.set(experimentId, new Map());
    }
    this.experiments.get(experimentId)!.set(userId, variant);

    return this.createResponse(
      request.requestId,
      true,
      `Allocated user to ${variant} group in experiment ${experimentId}`,
      {
        data: {
          variant,
          experimentId,
        },
        confidence: 1.0,
        featuresUsed: ['user_id', 'experiment_id', 'hash_allocation'],
      }
    );
  }

  /**
   * Log an event for analytics
   */
  private logEvent(request: ExperimentationRequest): AgentResponse {
    const event = request.context?.event;
    if (!event) {
      return this.createErrorResponse(
        request.requestId,
        { code: 'MISSING_EVENT', message: 'Event data is required' },
        'Event data missing from request context'
      );
    }

    // Store event (in production, this would go to event bus)
    this.events.push({
      ...event,
      timestamp: new Date().toISOString(),
      requestId: request.requestId,
    });

    return this.createResponse(
      request.requestId,
      true,
      `Logged event ${event.eventType} for user ${event.userId}`,
      {
        confidence: 1.0,
        featuresUsed: ['event_type', 'user_id', 'timestamp'],
      }
    );
  }

  /**
   * Calculate K-factor for a cohort
   */
  private calculateKFactor(request: ExperimentationRequest): AgentResponse {
    const cohort = request.context?.cohort ?? 'default';
    const timeRange = request.context?.timeRange;

    // Filter events by cohort and time range
    let cohortEvents = this.events.filter((e) => {
      // In production, events would have cohort metadata
      // For now, we'll use all events
      if (timeRange) {
        const eventTime = new Date(e.timestamp).getTime();
        const start = new Date(timeRange.start).getTime();
        const end = new Date(timeRange.end).getTime();
        return eventTime >= start && eventTime <= end;
      }
      return true;
    });

    // Calculate metrics
    const inviteEvents = cohortEvents.filter(
      (e) => e.eventType === EventType.INVITE_SENT
    );
    const uniqueInviters = new Set(inviteEvents.map((e) => e.userId));
    const invitesPerUser = inviteEvents.length / Math.max(uniqueInviters.size, 1);

    const openedEvents = cohortEvents.filter(
      (e) => e.eventType === EventType.INVITE_OPENED
    );
    const clickedEvents = cohortEvents.filter(
      (e) => e.eventType === EventType.INVITE_CLICKED
    );
    const createdEvents = cohortEvents.filter(
      (e) => e.eventType === EventType.ACCOUNT_CREATED
    );
    const fvmEvents = cohortEvents.filter(
      (e) => e.eventType === EventType.FVM_REACHED
    );

    const conversionRate = inviteEvents.length > 0
      ? fvmEvents.length / inviteEvents.length
      : 0;

    const kFactor = invitesPerUser * conversionRate;

    // Calculate retention (simplified - would need more sophisticated tracking)
    const retentionD7 = this.calculateRetention(cohortEvents, 7);

    return this.createResponse(
      request.requestId,
      true,
      `K-factor calculated: ${kFactor.toFixed(2)} (target: ${this.K_FACTOR_TARGET}). Invites/user: ${invitesPerUser.toFixed(2)}, Conversion: ${(conversionRate * 100).toFixed(1)}%, D7 Retention: ${(retentionD7 * 100).toFixed(1)}%`,
      {
        data: {
          kFactor,
          metrics: {
            invitesPerUser,
            conversionRate,
            fvmRate: conversionRate,
            retentionD7,
          },
        },
        confidence: 0.85,
        featuresUsed: [
          'invite_events',
          'conversion_events',
          'fvm_events',
          'cohort_filter',
          'time_range',
        ],
      }
    );
  }

  /**
   * Check guardrail metrics
   */
  private checkGuardrails(request: ExperimentationRequest): AgentResponse {
    const timeRange = request.context?.timeRange;
    
    // Filter events by time range
    let recentEvents = this.events;
    if (timeRange) {
      const start = new Date(timeRange.start).getTime();
      const end = new Date(timeRange.end).getTime();
      recentEvents = this.events.filter((e) => {
        const eventTime = new Date(e.timestamp).getTime();
        return eventTime >= start && eventTime <= end;
      });
    }

    // Calculate guardrail metrics
    const complaintEvents = recentEvents.filter(
      (e) => e.eventType === EventType.COMPLAINT_FILED
    );
    const optOutEvents = recentEvents.filter(
      (e) => e.eventType === EventType.OPT_OUT
    );
    const fraudEvents = recentEvents.filter(
      (e) => e.eventType === EventType.FRAUD_DETECTED
    );
    const supportEvents = recentEvents.filter(
      (e) => e.eventType === EventType.SUPPORT_TICKET
    );

    const totalEvents = recentEvents.length;
    const complaintRate = totalEvents > 0 ? complaintEvents.length / totalEvents : 0;
    const optOutRate = totalEvents > 0 ? optOutEvents.length / totalEvents : 0;
    const fraudRate = totalEvents > 0 ? fraudEvents.length / totalEvents : 0;
    const supportTickets = supportEvents.length;

    const healthy =
      complaintRate <= this.GUARDRAIL_THRESHOLDS.complaintRate &&
      optOutRate <= this.GUARDRAIL_THRESHOLDS.optOutRate &&
      fraudRate <= this.GUARDRAIL_THRESHOLDS.fraudRate &&
      supportTickets <= this.GUARDRAIL_THRESHOLDS.supportTickets;

    const guardrails = {
      complaintRate,
      optOutRate,
      fraudRate,
      supportTickets,
      healthy,
    };

    return this.createResponse(
      request.requestId,
      true,
      `Guardrails checked: ${healthy ? 'HEALTHY' : 'VIOLATED'}. Complaint: ${(complaintRate * 100).toFixed(2)}%, Opt-out: ${(optOutRate * 100).toFixed(2)}%, Fraud: ${(fraudRate * 100).toFixed(2)}%, Support: ${supportTickets}`,
      {
        data: {
          guardrails,
        },
        confidence: 0.90,
        featuresUsed: [
          'complaint_events',
          'opt_out_events',
          'fraud_events',
          'support_events',
          'time_range',
        ],
      }
    );
  }

  /**
   * Hash-based consistent allocation
   */
  private hashAllocate(
    userId: string,
    experimentId: string
  ): 'control' | 'treatment' {
    const hash = this.simpleHash(userId + experimentId);
    return hash % 100 < this.EXPERIMENT_ALLOCATION * 100
      ? 'treatment'
      : 'control';
  }

  /**
   * Calculate retention rate
   */
  private calculateRetention(events: ViralEvent[], days: number): number {
    // Simplified retention calculation
    // In production, this would track user cohorts more precisely
    const signupEvents = events.filter(
      (e) => e.eventType === EventType.ACCOUNT_CREATED
    );
    const uniqueUsers = new Set(signupEvents.map((e) => e.userId));

    // For D7, we'd check if users are still active after 7 days
    // This is a simplified version
    const retentionRate = signupEvents.length > 0 ? 0.5 : 0; // Placeholder
    return retentionRate;
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

