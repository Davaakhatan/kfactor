/**
 * Beat-My-Skill Challenge Agentic Action
 * 
 * Student Action #1: From session summary's skill gaps, generate a
 * 5-question micro-deck with a share link to challenge a friend.
 * Both get streak shields if friend reaches FVM within 48h.
 */

import { BaseAgenticAction, AgenticActionContext, AgenticActionResult } from '../core/agentic-actions/action-base.js';
import { LoopExecutor } from '../core/loops/loop-executor.js';
import { Persona, ViralLoop } from '../core/types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class BeatMySkillChallengeAction extends BaseAgenticAction {
  readonly actionId = 'beat-my-skill-challenge';
  readonly name = 'Beat-My-Skill Challenge';
  readonly description = 'Generate challenge deck from skill gaps and invite friend';
  readonly supportedPersonas = [Persona.STUDENT];

  async shouldTrigger(context: AgenticActionContext): Promise<boolean> {
    if (!this.validateContext(context)) {
      return false;
    }

    // Trigger if there are skill gaps identified
    const skillGaps = context.summary.skillGaps || [];
    
    // Need at least one high or medium priority skill gap
    const hasRelevantGap = skillGaps.some(
      gap => gap.priority === 'high' || gap.priority === 'medium'
    );

    return hasRelevantGap;
  }

  async execute(
    context: AgenticActionContext,
    loopExecutor: LoopExecutor
  ): Promise<AgenticActionResult> {
    const actionId = uuidv4();
    const skillGaps = context.summary.skillGaps || [];

    if (skillGaps.length === 0) {
      return {
        success: false,
        actionId,
        actionType: this.actionId,
        error: 'No skill gaps identified in summary',
      };
    }

    // Select the highest priority skill gap
    const targetGap = skillGaps
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })[0];

    // Generate challenge deck ID (5-question micro-deck)
    const challengeDeckId = this.generateChallengeDeckId(targetGap);

    // Execute Buddy Challenge loop
    const loopContext = {
      userId: context.userId,
      persona: context.persona,
      subject: targetGap.subject,
      metadata: {
        practiceScore: undefined, // No score yet, it's a challenge
        practiceSubject: targetGap.subject,
        practiceSkill: targetGap.skill,
        challengeDeckId,
      },
    };

    const result = await loopExecutor.execute({
      loopId: ViralLoop.BUDDY_CHALLENGE,
      context: loopContext,
    });

    if (result.success && result.invite) {
      return {
        success: true,
        actionId,
        actionType: this.actionId,
        viralLoopTriggered: ViralLoop.BUDDY_CHALLENGE,
        inviteGenerated: true,
        message: `Generated ${targetGap.skill} challenge deck with 5 questions. Invite ready to share!`,
      };
    }

    return {
      success: false,
      actionId,
      actionType: this.actionId,
      error: result.error || 'Failed to generate invite',
    };
  }

  getRationale(context: AgenticActionContext): string {
    const skillGaps = context.summary.skillGaps || [];
    
    if (skillGaps.length === 0) {
      return 'No skill gaps identified - cannot generate challenge';
    }

    const gapCount = skillGaps.length;
    const highPriorityGaps = skillGaps.filter(g => g.priority === 'high').length;
    const topGap = skillGaps[0];

    return `Identified ${gapCount} skill gap(s) (${highPriorityGaps} high priority). Generating challenge deck for "${topGap.skill}" to help student practice while inviting friends.`;
  }

  /**
   * Generate challenge deck ID
   */
  private generateChallengeDeckId(gap: { skill: string; subject: string }): string {
    // In production, this would create an actual deck in the content system
    const hash = `${gap.subject}-${gap.skill}-${Date.now()}`;
    return `challenge-${hash.substring(0, 20)}`;
  }
}

