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
import { Persona } from '../types/index.js';

export interface ProcessSessionRequest {
  sessionId: string;
  userId: string;
  persona: Persona;
  tutorId?: string;
  audioData?: unknown; // In production: actual audio stream/file
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

      // Step 2: Generate summary
      console.log(`[SessionIntelligence] Generating summary for session ${request.sessionId}`);
      const summary = await this.summaryService.generateSummary(transcription, {
        includeSkillGaps: true,
        includeRecommendations: true,
        includeNextSteps: true,
      });

      // Step 3: Trigger agentic actions
      console.log(`[SessionIntelligence] Processing agentic actions for ${request.persona}`);
      const actionResults = await this.actionOrchestrator.processSummary(
        summary,
        request.userId,
        request.persona,
        request.sessionId,
        this.loopExecutor
      );

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

