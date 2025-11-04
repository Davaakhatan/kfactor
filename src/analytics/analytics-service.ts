/**
 * Analytics Service
 * 
 * Aggregates data from events and provides analytics for dashboards.
 * Calculates K-factor, metrics, and guardrails.
 */

import { EventType, ViralEvent } from '../core/types/index.js';
import { EventBus } from '../core/events/event-bus.js';

export interface KFactorMetrics {
  cohort: string;
  invitesPerUser: number;
  conversionRate: number;
  kFactor: number;
  targetMet: boolean;
  timeRange: {
    start: string;
    end: string;
  };
}

export interface LoopMetrics {
  loopId: string;
  totalInvites: number;
  totalOpens: number;
  totalJoins: number;
  totalFVM: number;
  conversionRate: number;
  timeRange: {
    start: string;
    end: string;
  };
}

export interface GuardrailMetrics {
  complaintRate: number;
  optOutRate: number;
  fraudRate: number;
  supportTickets: number;
  healthy: boolean;
  timeRange: {
    start: string;
    end: string;
  };
}

export interface CohortAnalysis {
  cohort: string;
  referred: {
    totalUsers: number;
    fvmRate: number;
    d1Retention: number;
    d7Retention: number;
    d28Retention: number;
  };
  baseline: {
    totalUsers: number;
    fvmRate: number;
    d1Retention: number;
    d7Retention: number;
    d28Retention: number;
  };
  uplift: {
    fvm: number;
    d1: number;
    d7: number;
    d28: number;
  };
}

export class AnalyticsService {
  private events: ViralEvent[] = [];
  private readonly MAX_EVENTS = 100000;
  private eventBus?: EventBus;

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus;
    
    // Subscribe to all events if event bus provided
    if (this.eventBus) {
      this.eventBus.subscribe('*' as EventType, async (event) => {
        this.events.push(event);
        if (this.events.length > this.MAX_EVENTS) {
          this.events = this.events.slice(-this.MAX_EVENTS);
        }
      });
    }
  }

  /**
   * Manually add an event (for testing or external sources)
   */
  addEvent(event: ViralEvent): void {
    this.events.push(event);
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }
  }

  /**
   * Calculate K-factor for a cohort
   */
  calculateKFactor(
    cohort: string,
    timeRange?: { start: string; end: string }
  ): KFactorMetrics {
    const events = this.filterEventsByTimeRange(timeRange);
    const cohortEvents = this.filterByCohort(events, cohort);

    const inviteEvents = cohortEvents.filter(
      (e) => e.eventType === EventType.INVITE_SENT
    );
    const uniqueInviters = new Set(inviteEvents.map((e) => e.userId));
    const invitesPerUser = inviteEvents.length / Math.max(uniqueInviters.size, 1);

    const fvmEvents = cohortEvents.filter(
      (e) => e.eventType === EventType.FVM_REACHED
    );
    const conversionRate = inviteEvents.length > 0
      ? fvmEvents.length / inviteEvents.length
      : 0;

    const kFactor = invitesPerUser * conversionRate;
    const targetMet = kFactor >= 1.20;

    return {
      cohort,
      invitesPerUser,
      conversionRate,
      kFactor,
      targetMet,
      timeRange: timeRange || {
        start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
    };
  }

  /**
   * Get loop performance metrics
   */
  getLoopMetrics(
    loopId: string,
    timeRange?: { start: string; end: string }
  ): LoopMetrics {
    const events = this.filterEventsByTimeRange(timeRange);
    const loopEvents = events.filter(
      (e) => e.metadata?.loopId === loopId
    );

    const invites = loopEvents.filter(
      (e) => e.eventType === EventType.INVITE_SENT
    ).length;
    const opens = loopEvents.filter(
      (e) => e.eventType === EventType.INVITE_OPENED
    ).length;
    const joins = loopEvents.filter(
      (e) => e.eventType === EventType.ACCOUNT_CREATED
    ).length;
    const fvm = loopEvents.filter(
      (e) => e.eventType === EventType.FVM_REACHED
    ).length;

    const conversionRate = invites > 0 ? fvm / invites : 0;

    return {
      loopId,
      totalInvites: invites,
      totalOpens: opens,
      totalJoins: joins,
      totalFVM: fvm,
      conversionRate,
      timeRange: timeRange || {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
    };
  }

  /**
   * Get guardrail metrics
   */
  getGuardrailMetrics(
    timeRange?: { start: string; end: string }
  ): GuardrailMetrics {
    const events = this.filterEventsByTimeRange(timeRange);
    const total = events.length;

    const complaints = events.filter(
      (e) => e.eventType === EventType.COMPLAINT_FILED
    ).length;
    const optOuts = events.filter(
      (e) => e.eventType === EventType.OPT_OUT
    ).length;
    const fraud = events.filter(
      (e) => e.eventType === EventType.FRAUD_DETECTED
    ).length;
    const support = events.filter(
      (e) => e.eventType === EventType.SUPPORT_TICKET
    ).length;

    const complaintRate = total > 0 ? complaints / total : 0;
    const optOutRate = total > 0 ? optOuts / total : 0;
    const fraudRate = total > 0 ? fraud / total : 0;

    const healthy =
      complaintRate <= 0.01 &&
      optOutRate <= 0.01 &&
      fraudRate <= 0.005 &&
      support <= 100;

    return {
      complaintRate,
      optOutRate,
      fraudRate,
      supportTickets: support,
      healthy,
      timeRange: timeRange || {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
    };
  }

  /**
   * Get cohort analysis
   */
  getCohortAnalysis(
    cohort: string,
    timeRange?: { start: string; end: string }
  ): CohortAnalysis {
    const events = this.filterEventsByTimeRange(timeRange);
    const referredEvents = events.filter(
      (e) => e.metadata?.cohort === cohort && e.metadata?.referred === true
    );
    const baselineEvents = events.filter(
      (e) => e.metadata?.cohort === cohort && !e.metadata?.referred
    );

    const referred = this.calculateCohortMetrics(referredEvents);
    const baseline = this.calculateCohortMetrics(baselineEvents);

    return {
      cohort,
      referred,
      baseline,
      uplift: {
        fvm: referred.fvmRate - baseline.fvmRate,
        d1: referred.d1Retention - baseline.d1Retention,
        d7: referred.d7Retention - baseline.d7Retention,
        d28: referred.d28Retention - baseline.d28Retention,
      },
    };
  }

  /**
   * Calculate cohort metrics
   */
  private calculateCohortMetrics(events: ViralEvent[]): {
    totalUsers: number;
    fvmRate: number;
    d1Retention: number;
    d7Retention: number;
    d28Retention: number;
  } {
    const uniqueUsers = new Set(events.map((e) => e.userId));
    const fvmEvents = events.filter((e) => e.eventType === EventType.FVM_REACHED);
    const fvmRate = uniqueUsers.size > 0 ? fvmEvents.length / uniqueUsers.size : 0;

    // Simplified retention calculation (in production would track actual cohorts)
    const d1Retention = 0.6; // 60% mock
    const d7Retention = 0.45; // 45% mock
    const d28Retention = 0.3; // 30% mock

    return {
      totalUsers: uniqueUsers.size,
      fvmRate,
      d1Retention,
      d7Retention,
      d28Retention,
    };
  }

  /**
   * Filter events by time range
   */
  private filterEventsByTimeRange(
    timeRange?: { start: string; end: string }
  ): ViralEvent[] {
    if (!timeRange) return this.events;

    const start = new Date(timeRange.start).getTime();
    const end = new Date(timeRange.end).getTime();

    return this.events.filter((e) => {
      const eventTime = new Date(e.timestamp).getTime();
      return eventTime >= start && eventTime <= end;
    });
  }

  /**
   * Filter events by cohort
   */
  private filterByCohort(events: ViralEvent[], cohort: string): ViralEvent[] {
    return events.filter((e) => e.metadata?.cohort === cohort);
  }

  /**
   * Get all loop metrics
   */
  getAllLoopMetrics(
    timeRange?: { start: string; end: string }
  ): LoopMetrics[] {
    const loopIds = new Set<string>();
    this.events.forEach((e) => {
      if (e.metadata?.loopId) {
        loopIds.add(e.metadata.loopId as string);
      }
    });

    return Array.from(loopIds).map((loopId) =>
      this.getLoopMetrics(loopId, timeRange)
    );
  }
}

