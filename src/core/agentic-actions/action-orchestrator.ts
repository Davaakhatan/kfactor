/**
 * Agentic Action Orchestrator
 * 
 * Coordinates agentic actions from session summaries.
 * Determines which actions to trigger and executes them.
 */

import { BaseAgenticAction, AgenticActionContext, AgenticActionResult } from './action-base.js';
import { LoopExecutor } from '../loops/loop-executor.js';
import { SessionSummary } from '../../services/summary/summary-service.js';
import { Persona } from '../types/index.js';

export class ActionOrchestrator {
  private actions: Map<string, BaseAgenticAction> = new Map();

  /**
   * Register an agentic action
   */
  registerAction(action: BaseAgenticAction): void {
    this.actions.set(action.actionId, action);
  }

  /**
   * Process a session summary and trigger appropriate agentic actions
   */
  async processSummary(
    summary: SessionSummary,
    userId: string,
    persona: Persona,
    sessionId: string,
    loopExecutor: LoopExecutor
  ): Promise<AgenticActionResult[]> {
    const context: AgenticActionContext = {
      summary,
      userId,
      persona,
      sessionId,
    };

    const results: AgenticActionResult[] = [];

    // Get all actions for this persona
    const eligibleActions = Array.from(this.actions.values()).filter(
      (action) => action.supportedPersonas.includes(persona)
    );

    // Check each action and execute if should trigger
    for (const action of eligibleActions) {
      try {
        const shouldTrigger = await action.shouldTrigger(context);

        if (shouldTrigger) {
          const result = await action.execute(context, loopExecutor);
          results.push(result);

          console.log(`[ActionOrchestrator] ${action.name}:`, {
            success: result.success,
            rationale: action.getRationale(context),
          });
        }
      } catch (error) {
        console.error(`[ActionOrchestrator] Error in ${action.name}:`, error);
        results.push({
          success: false,
          actionId: action.actionId,
          actionType: action.actionId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get all registered actions
   */
  getAllActions(): BaseAgenticAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Get actions by persona
   */
  getActionsByPersona(persona: Persona): BaseAgenticAction[] {
    return Array.from(this.actions.values()).filter((action) =>
      action.supportedPersonas.includes(persona)
    );
  }

  /**
   * Get action statistics
   */
  getStats(): {
    totalActions: number;
    actionsByPersona: Record<string, number>;
    actions: Array<{ id: string; name: string; personas: string[] }>;
  } {
    const allActions = this.getAllActions();
    const actionsByPersona: Record<string, number> = {};

    allActions.forEach((action) => {
      action.supportedPersonas.forEach((persona) => {
        actionsByPersona[persona] = (actionsByPersona[persona] || 0) + 1;
      });
    });

    return {
      totalActions: allActions.length,
      actionsByPersona,
      actions: allActions.map((action) => ({
        id: action.actionId,
        name: action.name,
        personas: action.supportedPersonas,
      })),
    };
  }
}

