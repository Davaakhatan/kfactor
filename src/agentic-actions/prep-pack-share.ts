/**
 * Next-Session Prep Pack Share Agentic Action
 * 
 * Tutor Action #2: Tutor receives an AI-generated prep pack and
 * a class sampler link to share with peers/parents.
 * Joins credit the tutor's referral XP.
 */

import { BaseAgenticAction, AgenticActionContext, AgenticActionResult } from '../core/agentic-actions/action-base.js';
import { LoopExecutor } from '../core/loops/loop-executor.js';
import { Persona, ViralLoop } from '../core/types/index.js';
import { v4 as uuidv4 } from 'uuid';

export interface PrepPack {
  packId: string;
  sessionId: string;
  nextSessionTopic?: string;
  materials: {
    type: 'reading' | 'video' | 'practice' | 'worksheet';
    title: string;
    url?: string;
    description: string;
  }[];
  estimatedTime: number; // minutes
  generatedAt: string;
}

export class PrepPackShareAction extends BaseAgenticAction {
  readonly actionId = 'prep-pack-share';
  readonly name = 'Next-Session Prep Pack Share';
  readonly description = 'Generate prep pack and class sampler for tutor to share';
  readonly supportedPersonas = [Persona.TUTOR];

  async shouldTrigger(context: AgenticActionContext): Promise<boolean> {
    if (!this.validateContext(context)) {
      return false;
    }

    // Trigger if there are next steps or recommendations
    const hasNextSteps = (context.summary.nextSteps?.length || 0) > 0;
    const hasRecommendations = (context.summary.recommendations?.length || 0) > 0;

    return hasNextSteps || hasRecommendations;
  }

  async execute(
    context: AgenticActionContext,
    loopExecutor: LoopExecutor
  ): Promise<AgenticActionResult> {
    const actionId = uuidv4();

    // Generate prep pack
    const prepPack = await this.generatePrepPack(context);

    // Execute Tutor Spotlight loop
    const loopContext = {
      userId: context.userId, // Tutor ID
      persona: context.persona,
      subject: context.summary.metadata?.subject,
      metadata: {
        prepPackId: prepPack.packId,
        nextSessionTopic: prepPack.nextSessionTopic,
        classSampler: true,
      },
    };

    // Note: Tutor Spotlight loop would need to be implemented
    // For now, we'll use a generic approach or create the invite directly
    const result = await loopExecutor.execute({
      loopId: ViralLoop.PROUD_PARENT, // Use PROUD_PARENT as tutor loop not implemented
      context: loopContext,
    });

    if (result.success && result.invite) {
      return {
        success: true,
        actionId,
        actionType: this.actionId,
        viralLoopTriggered: ViralLoop.PROUD_PARENT, // Use PROUD_PARENT as tutor loop not implemented
        inviteGenerated: true,
        message: `Generated prep pack with ${prepPack.materials.length} materials (${prepPack.estimatedTime} min). Class sampler invite ready for tutor to share!`,
      };
    }

    // If Tutor Spotlight isn't implemented yet, create a generic share
    return {
      success: true,
      actionId,
      actionType: this.actionId,
      viralLoopTriggered: undefined,
      inviteGenerated: false,
      message: `Generated prep pack with ${prepPack.materials.length} materials. Tutor can share class sampler link manually.`,
    };
  }

  getRationale(context: AgenticActionContext): string {
    const nextSteps = context.summary.nextSteps || [];
    const recommendations = context.summary.recommendations || [];

    if (nextSteps.length === 0 && recommendations.length === 0) {
      return 'No next steps or recommendations - cannot generate prep pack';
    }

    return `Session identified ${nextSteps.length} next step(s) and ${recommendations.length} recommendation(s). Generating prep pack for next session and class sampler link for tutor to share with peers/parents. Referrals will credit tutor XP.`;
  }

  /**
   * Generate prep pack
   */
  private async generatePrepPack(context: AgenticActionContext): Promise<PrepPack> {
    const packId = uuidv4();
    const materials: PrepPack['materials'] = [];

    // Generate materials based on recommendations and next steps
    const recommendations = context.summary.recommendations || [];
    const nextSteps = context.summary.nextSteps || [];

    recommendations.forEach((rec, index) => {
      materials.push({
        type: 'practice',
        title: `Practice: ${rec.substring(0, 50)}`,
        description: rec,
        url: `https://varsitytutors.com/practice/${packId}-${index}`,
      });
    });

    nextSteps.forEach((step, index) => {
      materials.push({
        type: 'reading',
        title: step.action,
        description: `Priority: ${step.priority}`,
        url: `https://varsitytutors.com/resources/${packId}-${index}`,
      });
    });

    // Add default materials if none
    if (materials.length === 0) {
      materials.push({
        type: 'reading',
        title: 'Session Review',
        description: 'Review key concepts from today\'s session',
        url: `https://varsitytutors.com/review/${packId}`,
      });
    }

    const estimatedTime = materials.length * 10; // 10 min per material

    return {
      packId,
      sessionId: context.sessionId,
      nextSessionTopic: context.summary.metadata?.topic,
      materials,
      estimatedTime,
      generatedAt: new Date().toISOString(),
    };
  }
}

