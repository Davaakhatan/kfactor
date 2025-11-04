/**
 * Study Buddy Nudge Agentic Action
 * 
 * Student Action #2: If summary shows upcoming exam or stuck concept,
 * create a co-practice invite tied to the exact deck.
 * Presence shows "friend joined."
 */

import { BaseAgenticAction, AgenticActionContext, AgenticActionResult } from '../core/agentic-actions/action-base.js';
import { LoopExecutor } from '../core/loops/loop-executor.js';
import { Persona, ViralLoop } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class StudyBuddyNudgeAction extends BaseAgenticAction {
  readonly actionId = 'study-buddy-nudge';
  readonly name = 'Study Buddy Nudge';
  readonly description = 'Invite friend for co-practice before exam or on stuck concepts';
  readonly supportedPersonas = [Persona.STUDENT];

  async shouldTrigger(context: AgenticActionContext): Promise<boolean> {
    if (!this.validateContext(context)) {
      return false;
    }

    // Trigger if there's an upcoming exam
    const hasUpcomingExam = !!context.summary.metadata?.upcomingExam;

    // Or if there are stuck concepts
    const hasStuckConcepts = (context.summary.metadata?.stuckConcepts?.length || 0) > 0;

    return hasUpcomingExam || hasStuckConcepts;
  }

  async execute(
    context: AgenticActionContext,
    loopExecutor: LoopExecutor
  ): Promise<AgenticActionResult> {
    const actionId = uuidv4();

    const upcomingExam = context.summary.metadata?.upcomingExam;
    const stuckConcepts = context.summary.metadata?.stuckConcepts || [];

    // Determine what to practice
    let practiceTopic = '';
    let subject = context.summary.metadata?.subject || 'General';

    if (upcomingExam) {
      practiceTopic = upcomingExam.topics[0] || 'exam preparation';
      subject = upcomingExam.subject;
    } else if (stuckConcepts.length > 0) {
      practiceTopic = stuckConcepts[0];
    } else {
      return {
        success: false,
        actionId,
        actionType: this.actionId,
        error: 'No exam or stuck concepts identified',
      };
    }

    // Generate practice deck ID
    const practiceDeckId = this.generatePracticeDeckId(subject, practiceTopic);

    // Execute Buddy Challenge loop (or could be a new co-practice loop)
    const loopContext = {
      userId: context.userId,
      persona: context.persona,
      subject,
      metadata: {
        practiceSubject: subject,
        practiceSkill: practiceTopic,
        challengeDeckId: practiceDeckId,
        coPractice: true, // Flag for co-practice mode
        examDate: upcomingExam?.date,
      },
    };

    const result = await loopExecutor.execute({
      loopId: ViralLoop.BUDDY_CHALLENGE,
      context: loopContext,
    });

    if (result.success && result.invite) {
      const message = upcomingExam
        ? `Upcoming ${subject} exam on ${new Date(upcomingExam.date).toLocaleDateString()}. Invite a study buddy to practice ${practiceTopic}!`
        : `Stuck on ${practiceTopic}? Invite a study buddy to co-practice!`;

      return {
        success: true,
        actionId,
        actionType: this.actionId,
        viralLoopTriggered: ViralLoop.BUDDY_CHALLENGE,
        inviteGenerated: true,
        message,
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
    const upcomingExam = context.summary.metadata?.upcomingExam;
    const stuckConcepts = context.summary.metadata?.stuckConcepts || [];

    if (upcomingExam) {
      return `Upcoming ${upcomingExam.subject} exam on ${new Date(upcomingExam.date).toLocaleDateString()}. Generating co-practice invite to help student prepare with a study buddy.`;
    }

    if (stuckConcepts.length > 0) {
      return `Student identified as stuck on: ${stuckConcepts.join(', ')}. Generating co-practice invite to help them work through concepts with a friend.`;
    }

    return 'No exam or stuck concepts identified - cannot generate study buddy invite';
  }

  /**
   * Generate practice deck ID
   */
  private generatePracticeDeckId(subject: string, topic: string): string {
    const hash = `${subject}-${topic}-${Date.now()}`;
    return `practice-${hash.substring(0, 20)}`;
  }
}

