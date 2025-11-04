/**
 * XFactor Viral Growth System - Main Entry Point
 * 
 * 10x K Factor System for Varsity Tutors
 */

import { AgentClient } from './core/mcp/agent-client.js';
import { OrchestratorAgent } from './agents/orchestrator/orchestrator-agent.js';
import { PersonalizationAgent } from './agents/personalization/personalization-agent.js';
import { ExperimentationAgent } from './agents/experimentation/experimentation-agent.js';
import { eventBus } from './core/events/event-bus.js';
import { Persona, UserTrigger, ViralLoop, EventType } from './core/types/index.js';
import { SmartLinkService } from './services/smart-links/smart-link-service.js';
import { LoopRegistry } from './core/loops/loop-registry.js';
import { LoopExecutor } from './core/loops/loop-executor.js';
import { LoopContext } from './core/loops/loop-base.js';
import { TranscriptionService } from './services/transcription/transcription-service.js';
import { SummaryService } from './services/summary/summary-service.js';
import { ActionOrchestrator } from './core/agentic-actions/action-orchestrator.js';
import { SessionIntelligenceService } from './services/session-intelligence.js';
import { BeatMySkillChallengeAction } from './agentic-actions/beat-my-skill-challenge.js';
import { StudyBuddyNudgeAction } from './agentic-actions/study-buddy-nudge.js';
import { ParentProgressReelAction } from './agentic-actions/parent-progress-reel.js';
import { PrepPackShareAction } from './agentic-actions/prep-pack-share.js';
import { PresenceService } from './services/presence/presence-service.js';
import { ActivityFeedService } from './services/activity-feed/activity-feed-service.js';
import { LeaderboardService } from './services/leaderboard/leaderboard-service.js';
import { CohortService } from './services/cohort/cohort-service.js';
import { AliveService } from './services/alive/alive-service.js';
import { ShareCardGenerator } from './services/share-cards/share-card-generator.js';
import { ChallengeDeckGenerator } from './services/challenge-deck/challenge-deck-generator.js';
import { ResultsShareService } from './services/results-share/results-share-service.js';
import { IncentivesAgent } from './agents/incentives/incentives-agent.js';
import { TutorAdvocacyAgent } from './agents/tutor-advocacy/tutor-advocacy-agent.js';
import { TrustSafetyAgent } from './agents/trust-safety/trust-safety-agent.js';
import { AnalyticsService } from './analytics/analytics-service.js';

/**
 * System initialization result
 */
export interface SystemComponents {
  agentClient: AgentClient;
  loopRegistry: LoopRegistry;
  loopExecutor: LoopExecutor;
  smartLinkService: SmartLinkService;
  transcriptionService: TranscriptionService;
  summaryService: SummaryService;
  actionOrchestrator: ActionOrchestrator;
  sessionIntelligence: SessionIntelligenceService;
  presenceService: PresenceService;
  activityFeedService: ActivityFeedService;
  leaderboardService: LeaderboardService;
  cohortService: CohortService;
  aliveService: AliveService;
  shareCardGenerator: ShareCardGenerator;
  challengeDeckGenerator: ChallengeDeckGenerator;
  resultsShareService: ResultsShareService;
  incentivesAgent: IncentivesAgent;
  tutorAdvocacyAgent: TutorAdvocacyAgent;
  trustSafetyAgent: TrustSafetyAgent;
  analyticsService: AnalyticsService;
}

/**
 * Initialize the viral growth system
 */
export function initializeSystem(): SystemComponents {
  const client = new AgentClient({
    maxRetries: 3,
    retryDelayMs: 100,
    timeoutMs: 200,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeoutMs: 60000,
  });

  // Register required agents
  client.registerAgent(new OrchestratorAgent());
  client.registerAgent(new PersonalizationAgent());
  client.registerAgent(new ExperimentationAgent());

  // Initialize smart link service (needed for tutor advocacy)
  const smartLinkService = new SmartLinkService();

  // Create supporting agents
  const incentivesAgent = new IncentivesAgent();
  const tutorAdvocacyAgent = new TutorAdvocacyAgent(smartLinkService);
  const trustSafetyAgent = new TrustSafetyAgent();

  // Register supporting agents
  client.registerAgent(incentivesAgent);
  client.registerAgent(tutorAdvocacyAgent);
  client.registerAgent(trustSafetyAgent);

  // Smart link service already initialized above

  // Initialize loop registry (registers all loops)
  const loopRegistry = new LoopRegistry(smartLinkService);

  // Initialize loop executor
  const loopExecutor = new LoopExecutor(loopRegistry, client);

  // Initialize session intelligence services
  const transcriptionService = new TranscriptionService();
  const summaryService = new SummaryService();
  
  // Initialize agentic action orchestrator
  const actionOrchestrator = new ActionOrchestrator();
  
  // Register all agentic actions
  actionOrchestrator.registerAction(new BeatMySkillChallengeAction());
  actionOrchestrator.registerAction(new StudyBuddyNudgeAction());
  actionOrchestrator.registerAction(new ParentProgressReelAction());
  actionOrchestrator.registerAction(new PrepPackShareAction());
  
  // Initialize session intelligence service
  const sessionIntelligence = new SessionIntelligenceService(
    transcriptionService,
    summaryService,
    actionOrchestrator,
    loopExecutor
  );

  // Initialize "alive" layer services
  const presenceService = new PresenceService();
  const activityFeedService = new ActivityFeedService();
  const leaderboardService = new LeaderboardService();
  const cohortService = new CohortService();
  const aliveService = new AliveService(
    presenceService,
    activityFeedService,
    leaderboardService,
    cohortService
  );

  // Initialize results share services
  const shareCardGenerator = new ShareCardGenerator();
  const challengeDeckGenerator = new ChallengeDeckGenerator();
  const resultsShareService = new ResultsShareService(
    shareCardGenerator,
    challengeDeckGenerator,
    smartLinkService,
    loopExecutor
  );

  // Initialize analytics service
  const analyticsService = new AnalyticsService(eventBus);

  // Set up event bus subscribers
  eventBus.subscribe('*' as EventType, async (event) => {
    console.log(`[EventBus] Event: ${event.eventType}`, {
      userId: event.userId,
      timestamp: event.timestamp,
    });
  });

  return {
    agentClient: client,
    loopRegistry,
    loopExecutor,
    smartLinkService,
    transcriptionService,
    summaryService,
    actionOrchestrator,
    sessionIntelligence,
    presenceService,
    activityFeedService,
    leaderboardService,
    cohortService,
    aliveService,
    shareCardGenerator,
    challengeDeckGenerator,
    resultsShareService,
    incentivesAgent,
    tutorAdvocacyAgent,
    trustSafetyAgent,
    analyticsService,
  };
}

/**
 * Process a user trigger and execute viral loops
 */
export async function processUserTrigger(
  system: SystemComponents,
  userId: string,
  trigger: UserTrigger,
  persona: Persona,
  context: LoopContext & {
    inviteCount?: number;
    lastInviteTimestamp?: string;
    email?: string;
    deviceId?: string;
  }
) {
  const { agentClient, loopExecutor, trustSafetyAgent, eventBus } = system;

  // Step 0: Trust & Safety Check
  const safetyRequest = {
    agentId: 'system',
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId,
    action: 'check_fraud' as const,
    context: {
      email: context.email,
      deviceId: context.deviceId,
    },
  };

  const safetyResponse = await agentClient.callAgent('trust-safety', safetyRequest);
  if (!safetyResponse.success || !safetyResponse.data?.allowed) {
    console.warn('Trust & Safety check failed:', safetyResponse.data?.reason);
    // Publish event for analytics
    await eventBus.publish({
      eventType: EventType.FRAUD_DETECTED,
      userId,
      timestamp: new Date().toISOString(),
      metadata: {
        reason: safetyResponse.data?.reason || 'Safety check failed',
      },
    });
    return [];
  }

  // Step 1: Orchestrator selects loops
  const orchestratorRequest = {
    agentId: 'system',
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId,
    trigger,
    persona,
    context: {
      ...context,
      preferences: {
        optedOut: false,
      },
    },
  };

  const orchestratorResponse = await agentClient.callAgent(
    'orchestrator',
    orchestratorRequest
  );

  if (!orchestratorResponse.success || !orchestratorResponse.data) {
    console.error('Orchestrator failed:', orchestratorResponse.rationale);
    return [];
  }

  const selectedLoops = orchestratorResponse.data.selectedLoops as ViralLoop[];
  
  // Filter out loops that don't exist in registry
  const validLoops = selectedLoops.filter((loopId) => 
    system.loopRegistry.has(loopId)
  );

  if (validLoops.length === 0) {
    console.warn('No valid loops found for trigger:', trigger);
    return [];
  }

  const results = [];

  // Step 2: Execute each selected loop
  for (const loopId of validLoops) {
    const loopContext: LoopContext = {
      userId,
      persona,
      subject: context.subject,
      age: context.age,
      grade: context.grade,
      metadata: context.metadata,
    };

    const result = await loopExecutor.execute({
      loopId,
      context: loopContext,
    });

    results.push(result);

    // Publish events to event bus
    if (result.success && result.invite) {
      await eventBus.publish({
        eventType: EventType.INVITE_SENT,
        userId,
        timestamp: new Date().toISOString(),
        metadata: {
          loopId,
          inviteId: result.invite.inviteId,
          channel: result.invite.channel,
        },
      });

      console.log(`✅ Loop ${loopId} executed:`, {
        inviteId: result.invite.inviteId,
        shortCode: result.invite.shortCode,
        channel: result.invite.channel,
      });
    } else {
      await eventBus.publish({
        eventType: EventType.INVITE_FAILED,
        userId,
        timestamp: new Date().toISOString(),
        metadata: {
          loopId,
          error: result.error || result.rationale,
        },
      });

      console.warn(`⚠️ Loop ${loopId} failed:`, result.error || result.rationale);
    }
  }

  return results;
}

// Export for use
export { AgentClient, eventBus };
export * from './core/types/index.js';
export * from './core/loops/index.js';
export type { SystemComponents };

