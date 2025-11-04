/**
 * Base Agentic Action Interface
 * 
 * Agentic actions are triggered from session summaries and generate
 * viral loop invitations automatically.
 */

import { SessionSummary } from '../../services/summary/summary-service.js';
import { Persona } from '../types/index.js';
import { LoopExecutor } from '../loops/loop-executor.js';
import { LoopContext } from '../loops/loop-base.js';

export interface AgenticActionContext {
  summary: SessionSummary;
  userId: string;
  persona: Persona;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export interface AgenticActionResult {
  success: boolean;
  actionId: string;
  actionType: string;
  viralLoopTriggered?: string;
  inviteGenerated?: boolean;
  message?: string;
  error?: string;
}

export abstract class BaseAgenticAction {
  abstract readonly actionId: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly supportedPersonas: Persona[];

  /**
   * Check if this action should be triggered for this summary
   */
  abstract shouldTrigger(context: AgenticActionContext): Promise<boolean>;

  /**
   * Execute the agentic action
   */
  abstract execute(
    context: AgenticActionContext,
    loopExecutor: LoopExecutor
  ): Promise<AgenticActionResult>;

  /**
   * Get rationale for why this action was triggered or not
   */
  abstract getRationale(context: AgenticActionContext): string;

  /**
   * Validate context
   */
  protected validateContext(context: AgenticActionContext): boolean {
    if (!this.supportedPersonas.includes(context.persona)) {
      return false;
    }
    if (!context.summary) {
      return false;
    }
    return true;
  }
}

