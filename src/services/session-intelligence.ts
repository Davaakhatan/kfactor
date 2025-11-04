/**
 * Session Intelligence Pipeline
 * 
 * Orchestrates the complete flow:
 * Session → Transcription → Summary → Agentic Actions → Viral Loops
 */

import { TranscriptionService, SessionTranscription } from './transcription/transcription-service.js';
import { SummaryService, SessionSummary } from './summary/summary-service.js';
import { ActionOrchestrator } from '../core/agentic-actions/action-orchestrator.js';
import { LoopExecutor } from '../core/loops/loop-executor.js';
import { Persona } from '../core/types/index.js';
import { EventBus } from '../core/events/event-bus.js';

export interface ProcessSessionRequest {
  sessionId: string;
  userId: string;
  persona: Persona;
  tutorId?: string;
  audioData?: unknown; // In production: actual audio stream/file
  eventBus?: EventBus; // Optional event bus for funnel tracking
  metadata?: {
    subject?: string;
    topic?: string;
    sessionType?: 'scheduled' | 'instant' | 'ai';
  };
}

export interface ProcessSessionResult {
  sessionId: string;
  transcription?: SessionTranscription;
  summary?: SessionSummary;
  agenticActionsTriggered: number;
  viralLoopsTriggered: number;
  success: boolean;
  error?: string;
}

export class SessionIntelligenceService {
  private transcriptionService: TranscriptionService;
  private summaryService: SummaryService;
  private actionOrchestrator: ActionOrchestrator;
  private loopExecutor: LoopExecutor;

  constructor(
    transcriptionService: TranscriptionService,
    summaryService: SummaryService,
    actionOrchestrator: ActionOrchestrator,
    loopExecutor: LoopExecutor
  ) {
    this.transcriptionService = transcriptionService;
    this.summaryService = summaryService;
    this.actionOrchestrator = actionOrchestrator;
    this.loopExecutor = loopExecutor;
  }

  /**
   * Process a completed session through the intelligence pipeline
   */
  async processSession(
    request: ProcessSessionRequest
  ): Promise<ProcessSessionResult> {
    try {
      // Step 1: Transcribe session
      console.log(`[SessionIntelligence] Transcribing session ${request.sessionId}`);
      const transcription = await this.transcriptionService.transcribeSession(
        request.sessionId,
        request.audioData,
        {
          language: 'en',
          enablePunctuation: true,
          enableSpeakerDiarization: true,
        }
      );

      // Track session processed event (for funnel tracking)
      if (request.eventBus) {
        request.eventBus.publish({
          eventType: 'session_processed' as any,
          userId: request.userId,
          timestamp: new Date().toISOString(),
          metadata: {
            sessionId: request.sessionId,
            persona: request.persona,
          },
        });
      }

      // Step 2: Generate summary
      console.log(`[SessionIntelligence] Generating summary for session ${request.sessionId}`);
      const summary = await this.summaryService.generateSummary(transcription, {
        includeSkillGaps: true,
        includeRecommendations: true,
        includeNextSteps: true,
      });

      // Track summary generated event (for funnel tracking)
      if (request.eventBus) {
        request.eventBus.publish({
          eventType: 'summary_generated' as any,
          userId: request.userId,
          timestamp: new Date().toISOString(),
          metadata: {
            sessionId: request.sessionId,
            persona: request.persona,
            summaryLength: summary.keyPoints.length,
          },
        });
      }

      // Step 3: Trigger agentic actions
      console.log(`[SessionIntelligence] Processing agentic actions for ${request.persona}`);
      const actionResults = await this.actionOrchestrator.processSummary(
        summary,
        request.userId,
        request.persona,
        request.sessionId,
        this.loopExecutor
      );

      // Track agentic actions triggered (for funnel tracking)
      if (request.eventBus && actionResults.length > 0) {
        request.eventBus.publish({
          eventType: 'agentic_action_triggered' as any,
          userId: request.userId,
          timestamp: new Date().toISOString(),
          metadata: {
            sessionId: request.sessionId,
            persona: request.persona,
            actionCount: actionResults.length,
            source: 'agentic_action',
          },
        });
      }

      const successfulActions = actionResults.filter((r) => r.success);
      const loopsTriggered = successfulActions.filter(
        (r) => r.viralLoopTriggered
      ).length;

      return {
        sessionId: request.sessionId,
        transcription,
        summary,
        agenticActionsTriggered: actionResults.length,
        viralLoopsTriggered: loopsTriggered,
        success: true,
      };
    } catch (error) {
      console.error(`[SessionIntelligence] Error processing session:`, error);
      return {
        sessionId: request.sessionId,
        agenticActionsTriggered: 0,
        viralLoopsTriggered: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process a session with existing transcription
   */
  async processWithTranscription(
    transcription: SessionTranscription,
    userId: string,
    persona: Persona
  ): Promise<ProcessSessionResult> {
    try {
      // Generate summary
      const summary = await this.summaryService.generateSummary(transcription, {
        includeSkillGaps: true,
        includeRecommendations: true,
        includeNextSteps: true,
      });

      // Trigger agentic actions
      const actionResults = await this.actionOrchestrator.processSummary(
        summary,
        userId,
        persona,
        transcription.sessionId,
        this.loopExecutor
      );

      const successfulActions = actionResults.filter((r) => r.success);
      const loopsTriggered = successfulActions.filter(
        (r) => r.viralLoopTriggered
      ).length;

      return {
        sessionId: transcription.sessionId,
        transcription,
        summary,
        agenticActionsTriggered: actionResults.length,
        viralLoopsTriggered: loopsTriggered,
        success: true,
      };
    } catch (error) {
      return {
        sessionId: transcription.sessionId,
        agenticActionsTriggered: 0,
        viralLoopsTriggered: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

