/**
 * Parent Progress Reel + Invite Agentic Action
 * 
 * Tutor Action #1: Auto-compose a privacy-safe 20-30s reel (key moments & wins)
 * with a referral link for the parent to invite another parent for a class pass.
 */

import { BaseAgenticAction, AgenticActionContext, AgenticActionResult } from '../core/agentic-actions/action-base.js';
import { LoopExecutor } from '../core/loops/loop-executor.js';
import { Persona, ViralLoop } from '../core/types/index.js';
import { v4 as uuidv4 } from 'uuid';

export interface ProgressReel {
  reelId: string;
  duration: number; // seconds
  keyMoments: string[];
  achievements: string[];
  privacySafe: boolean;
  reelUrl?: string; // In production, would be actual video URL
}

export class ParentProgressReelAction extends BaseAgenticAction {
  readonly actionId = 'parent-progress-reel';
  readonly name = 'Parent Progress Reel + Invite';
  readonly description = 'Generate privacy-safe progress reel and parent invite';
  readonly supportedPersonas = [Persona.TUTOR];

  async shouldTrigger(context: AgenticActionContext): Promise<boolean> {
    if (!this.validateContext(context)) {
      return false;
    }

    // Trigger if there are positive indicators
    const hasStrengths = (context.summary.strengths?.length || 0) > 0;
    const hasKeyPoints = (context.summary.keyPoints?.length || 0) > 0;
    const hasAchievements = (context.summary.metadata?.upcomingExam === undefined); // No exam stress = good progress

    // Need at least some positive content
    return hasStrengths || (hasKeyPoints && hasAchievements);
  }

  async execute(
    context: AgenticActionContext,
    loopExecutor: LoopExecutor
  ): Promise<AgenticActionResult> {
    const actionId = uuidv4();

    // Generate progress reel
    const reel = await this.generateProgressReel(context);

    // Execute Proud Parent loop
    // Note: This is from tutor perspective, but loop is parent-to-parent
    // In production, we'd need to get the parent ID from the session
    const parentUserId = context.userId; // In production, would be parent ID

    const loopContext = {
      userId: parentUserId,
      persona: Persona.PARENT, // Switch to parent persona
      subject: context.summary.metadata?.subject,
      metadata: {
        milestoneType: 'progress_milestone',
        childProgress: {
          subject: context.summary.metadata?.subject,
          improvement: this.calculateImprovement(context),
          achievements: reel.achievements,
        },
        reelUrl: reel.reelUrl,
      },
    };

    const result = await loopExecutor.execute({
      loopId: ViralLoop.PROUD_PARENT,
      context: loopContext,
    });

    if (result.success && result.invite) {
      return {
        success: true,
        actionId,
        actionType: this.actionId,
        viralLoopTriggered: ViralLoop.PROUD_PARENT,
        inviteGenerated: true,
        message: `Generated ${reel.duration}s privacy-safe progress reel with ${reel.keyMoments.length} key moments. Parent invite ready!`,
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
    const strengths = context.summary.strengths || [];
    const keyPoints = context.summary.keyPoints || [];

    if (strengths.length === 0 && keyPoints.length === 0) {
      return 'No positive progress indicators - cannot generate progress reel';
    }

    return `Session showed ${strengths.length} strength(s) and ${keyPoints.length} key point(s). Generating privacy-safe progress reel (20-30s) with key moments and achievements for parent to share with other parents.`;
  }

  /**
   * Generate privacy-safe progress reel
   */
  private async generateProgressReel(
    context: AgenticActionContext
  ): Promise<ProgressReel> {
    const reelId = uuidv4();
    const keyMoments: string[] = [];
    const achievements: string[] = [];

    // Extract key moments from summary (privacy-safe)
    if (context.summary.strengths) {
      context.summary.strengths.forEach((strength) => {
        keyMoments.push(`Showed ${strength.toLowerCase()}`);
      });
    }

    if (context.summary.keyPoints) {
      context.summary.keyPoints.forEach((point) => {
        // Remove any PII from key points
        const safePoint = this.sanitizeForPrivacy(point);
        keyMoments.push(safePoint);
      });
    }

    // Generate achievements
    if (context.summary.strengths?.length) {
      achievements.push('Demonstrated Understanding');
    }
    if (context.summary.keyPoints?.length) {
      achievements.push('Active Participation');
    }

    // In production, would generate actual video reel
    const reelUrl = `https://varsitytutors.com/reels/${reelId}`;

    return {
      reelId,
      duration: Math.min(30, Math.max(20, keyMoments.length * 5)), // 20-30s
      keyMoments: keyMoments.slice(0, 5), // Max 5 moments
      achievements,
      privacySafe: true,
      reelUrl,
    };
  }

  /**
   * Calculate improvement percentage (mock)
   */
  private calculateImprovement(context: AgenticActionContext): number {
    // In production, would compare to previous sessions
    // For now, mock based on strengths
    const strengths = context.summary.strengths?.length || 0;
    return Math.min(25, strengths * 5); // 5% per strength, max 25%
  }

  /**
   * Sanitize text for privacy (remove PII)
   */
  private sanitizeForPrivacy(text: string): string {
    // In production, would use more sophisticated PII detection
    // For now, simple replacement
    return text
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]') // SSN
      .replace(/\b\d{10}\b/g, '[PHONE]') // Phone
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]'); // Email
  }
}

