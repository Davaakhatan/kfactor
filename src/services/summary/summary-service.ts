/**
 * Summary Service
 * 
 * Generates summaries from session transcriptions and identifies:
 * - Skill gaps
 * - Key learnings
 * - Next steps
 * - Upcoming exams
 * - Stuck concepts
 */

import { SessionTranscription } from '../transcription/transcription-service.js';

export interface SkillGap {
  skill: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  evidence: string[]; // Quotes from transcript
  priority: 'high' | 'medium' | 'low';
}

export interface SessionSummary {
  sessionId: string;
  userId: string;
  tutorId?: string;
  summary: string; // Main summary text
  keyPoints: string[];
  skillGaps: SkillGap[];
  strengths: string[];
  recommendations: string[];
  nextSteps: {
    action: string;
    priority: 'high' | 'medium' | 'low';
    deadline?: string;
  }[];
  metadata: {
    subject?: string;
    topic?: string;
    sessionType?: string;
    upcomingExam?: {
      date: string;
      subject: string;
      topics: string[];
    };
    stuckConcepts?: string[];
  };
}

export interface SummaryOptions {
  includeSkillGaps?: boolean;
  includeRecommendations?: boolean;
  includeNextSteps?: boolean;
  maxLength?: number;
}

export class SummaryService {
  /**
   * Generate summary from transcription
   * 
   * In production, this would use an LLM to generate summaries.
   */
  async generateSummary(
    transcription: SessionTranscription,
    options: SummaryOptions = {}
  ): Promise<SessionSummary> {
    // Mock implementation - in production would call LLM service
    const transcript = transcription.rawTranscript || 
      transcription.segments.map(s => s.text).join(' ');

    // Extract key information (in production, LLM would do this)
    const skillGaps: SkillGap[] = this.extractSkillGaps(transcript);
    const keyPoints = this.extractKeyPoints(transcript);
    const strengths = this.extractStrengths(transcript);
    const recommendations = this.generateRecommendations(skillGaps);
    const nextSteps = this.generateNextSteps(skillGaps, transcription);

    // Generate main summary
    const summary = this.generateSummaryText(
      transcription,
      keyPoints,
      skillGaps,
      strengths
    );

    return {
      sessionId: transcription.sessionId,
      userId: transcription.userId,
      tutorId: transcription.tutorId,
      summary,
      keyPoints,
      skillGaps: options.includeSkillGaps !== false ? skillGaps : [],
      strengths,
      recommendations: options.includeRecommendations !== false ? recommendations : [],
      nextSteps: options.includeNextSteps !== false ? nextSteps : [],
      metadata: {
        subject: transcription.metadata?.subject,
        topic: transcription.metadata?.topic,
        sessionType: transcription.metadata?.sessionType,
        upcomingExam: this.extractUpcomingExam(transcript),
        stuckConcepts: this.extractStuckConcepts(transcript),
      },
    };
  }

  /**
   * Extract skill gaps from transcript
   */
  private extractSkillGaps(transcript: string): SkillGap[] {
    // Mock extraction - in production, LLM would identify these
    const gaps: SkillGap[] = [];

    // Look for indicators of skill gaps
    if (transcript.toLowerCase().includes('trouble') || 
        transcript.toLowerCase().includes('difficulty') ||
        transcript.toLowerCase().includes('struggling')) {
      gaps.push({
        skill: 'factoring',
        subject: 'Math',
        difficulty: 'medium',
        evidence: [
          'Student mentioned having trouble with factoring',
          'Tutor provided additional practice examples',
        ],
        priority: 'high',
      });
    }

    if (transcript.toLowerCase().includes('quadratic')) {
      gaps.push({
        skill: 'quadratic-equations',
        subject: 'Math',
        difficulty: 'medium',
        evidence: [
          'Session focused on quadratic equations',
          'Student needed guidance on solving methods',
        ],
        priority: 'medium',
      });
    }

    return gaps;
  }

  /**
   * Extract key points from transcript
   */
  private extractKeyPoints(transcript: string): string[] {
    // Mock extraction
    const points: string[] = [];

    if (transcript.includes('factoring')) {
      points.push('Practiced factoring quadratic equations');
    }
    if (transcript.includes('practice')) {
      points.push('Student needs more practice with similar problems');
    }
    if (transcript.includes('great job')) {
      points.push('Student showed improvement during session');
    }

    return points.length > 0 ? points : ['Session completed successfully'];
  }

  /**
   * Extract strengths from transcript
   */
  private extractStrengths(transcript: string): string[] {
    const strengths: string[] = [];

    if (transcript.toLowerCase().includes('great') || 
        transcript.toLowerCase().includes('good')) {
      strengths.push('Shows understanding of concepts');
    }
    if (transcript.toLowerCase().includes('improvement')) {
      strengths.push('Demonstrates learning progress');
    }

    return strengths.length > 0 ? strengths : ['Engaged in learning'];
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(skillGaps: SkillGap[]): string[] {
    const recommendations: string[] = [];

    skillGaps.forEach((gap) => {
      if (gap.priority === 'high') {
        recommendations.push(
          `Focus on ${gap.skill} with additional practice problems`
        );
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Continue practicing current topics');
    }

    return recommendations;
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(
    skillGaps: SkillGap[],
    transcription: SessionTranscription
  ): SessionSummary['nextSteps'] {
    const nextSteps: SessionSummary['nextSteps'] = [];

    skillGaps.forEach((gap) => {
      if (gap.priority === 'high') {
        nextSteps.push({
          action: `Practice ${gap.skill}`,
          priority: 'high',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        });
      }
    });

    if (nextSteps.length === 0) {
      nextSteps.push({
        action: 'Review session notes',
        priority: 'medium',
      });
    }

    return nextSteps;
  }

  /**
   * Generate summary text
   */
  private generateSummaryText(
    transcription: SessionTranscription,
    keyPoints: string[],
    skillGaps: SkillGap[],
    strengths: string[]
  ): string {
    const parts: string[] = [];

    parts.push(`Session on ${transcription.metadata?.topic || 'learning'} completed.`);

    if (strengths.length > 0) {
      parts.push(`Strengths: ${strengths.join(', ')}.`);
    }

    if (skillGaps.length > 0) {
      parts.push(`Areas for improvement: ${skillGaps.map(g => g.skill).join(', ')}.`);
    }

    if (keyPoints.length > 0) {
      parts.push(`Key points: ${keyPoints.join('; ')}.`);
    }

    return parts.join(' ');
  }

  /**
   * Extract upcoming exam information
   */
  private extractUpcomingExam(transcript: string): SessionSummary['metadata']['upcomingExam'] {
    // Mock extraction - in production, LLM would identify this
    if (transcript.toLowerCase().includes('exam') || 
        transcript.toLowerCase().includes('test')) {
      return {
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks
        subject: 'Math',
        topics: ['Quadratic Equations', 'Factoring'],
      };
    }
    return undefined;
  }

  /**
   * Extract stuck concepts
   */
  private extractStuckConcepts(transcript: string): string[] {
    const concepts: string[] = [];

    if (transcript.toLowerCase().includes('stuck') ||
        transcript.toLowerCase().includes('confused')) {
      concepts.push('factoring');
      concepts.push('quadratic-equations');
    }

    return concepts;
  }
}

