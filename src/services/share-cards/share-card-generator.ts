/**
 * Share Card Generator
 * 
 * Generates privacy-safe share cards for results pages (diagnostics, practice tests, flashcards)
 * with persona-specific variants (student, parent, tutor).
 */

import { Persona } from '../../core/types/index.js';

export interface ShareCardData {
  title: string;
  description: string;
  imageUrl?: string;
  cta: string;
  score?: number;
  percentile?: number;
  rank?: number;
  totalParticipants?: number;
  subject?: string;
  privacySafe: boolean;
}

export interface ShareCardOptions {
  persona: Persona;
  resultType: 'diagnostic' | 'practice_test' | 'flashcard';
  score?: number;
  percentile?: number;
  rank?: number;
  totalParticipants?: number;
  subject?: string;
  skills?: string[];
  metadata?: Record<string, unknown>;
}

export class ShareCardGenerator {
  /**
   * Generate share card for results page
   */
  generateCard(options: ShareCardOptions): ShareCardData {
    switch (options.persona) {
      case Persona.STUDENT:
        return this.generateStudentCard(options);
      case Persona.PARENT:
        return this.generateParentCard(options);
      case Persona.TUTOR:
        return this.generateTutorCard(options);
      default:
        return this.generateDefaultCard(options);
    }
  }

  /**
   * Generate student variant (achievement-focused, challenge CTA)
   */
  private generateStudentCard(options: ShareCardOptions): ShareCardData {
    const { score, percentile, rank, totalParticipants, subject } = options;

    let title = 'Great Progress!';
    let description = 'Check out my results!';

    if (score !== undefined) {
      if (score >= 90) {
        title = 'Outstanding Score!';
        description = `I scored ${score}% on ${subject || 'my test'}!`;
      } else if (score >= 80) {
        title = 'Great Score!';
        description = `I scored ${score}% on ${subject || 'my test'}!`;
      } else {
        title = 'Practice Complete!';
        description = `I scored ${score}% and I'm improving!`;
      }
    } else if (percentile !== undefined) {
      title = 'Top Performer!';
      description = `I'm in the ${percentile}th percentile!`;
    } else if (rank && totalParticipants) {
      title = 'Ranked!';
      description = `I ranked #${rank} out of ${totalParticipants}!`;
    }

    return {
      title,
      description,
      cta: 'Challenge a friend to beat my score!',
      score,
      percentile,
      rank,
      totalParticipants,
      subject,
      privacySafe: true, // Always privacy-safe for students (COPPA)
    };
  }

  /**
   * Generate parent variant (progress-focused, invite CTA)
   */
  private generateParentCard(options: ShareCardOptions): ShareCardData {
    const { score, percentile, subject } = options;

    let title = 'Progress Update';
    let description = 'See how my child is progressing!';

    if (score !== undefined) {
      if (score >= 90) {
        title = 'Excellent Progress!';
        description = `My child scored ${score}% on ${subject || 'their test'}!`;
      } else if (score >= 80) {
        title = 'Great Progress!';
        description = `My child scored ${score}% on ${subject || 'their test'}!`;
      } else {
        title = 'Making Progress!';
        description = `My child is improving with ${score}% on ${subject || 'their test'}!`;
      }
    } else if (percentile !== undefined) {
      title = 'Top Performer!';
      description = `My child is in the ${percentile}th percentile!`;
    }

    return {
      title,
      description,
      cta: 'Invite another parent to try Varsity Tutors!',
      score,
      percentile,
      subject,
      privacySafe: true, // Privacy-safe by default
    };
  }

  /**
   * Generate tutor variant (insight-focused, class sampler CTA)
   */
  private generateTutorCard(options: ShareCardOptions): ShareCardData {
    const { subject, skills } = options;

    const title = 'Learning Insights';
    let description = `See insights from ${subject || 'this session'}!`;

    if (skills && skills.length > 0) {
      description = `Key skills: ${skills.slice(0, 3).join(', ')}`;
    }

    return {
      title,
      description,
      cta: 'Try a class sampler!',
      subject,
      privacySafe: true,
    };
  }

  /**
   * Generate default card
   */
  private generateDefaultCard(options: ShareCardOptions): ShareCardData {
    return {
      title: 'Check out my results!',
      description: `I completed ${options.resultType.replace('_', ' ')}!`,
      cta: 'Try it yourself!',
      subject: options.subject,
      privacySafe: true,
    };
  }

  /**
   * Generate share card image URL (in production, would generate actual image)
   */
  generateCardImageUrl(cardData: ShareCardData): string {
    // In production, would use a service to generate share card images
    // For now, return a placeholder URL
    const params = new URLSearchParams({
      title: cardData.title,
      description: cardData.description.substring(0, 100),
    });
    if (cardData.score) params.append('score', cardData.score.toString());
    if (cardData.subject) params.append('subject', cardData.subject);

    return `https://varsitytutors.com/share-card?${params.toString()}`;
  }

  /**
   * Generate share card JSON (for social media)
   */
  generateCardJson(cardData: ShareCardData, baseUrl: string): {
    '@context': string;
    '@type': string;
    name: string;
    description: string;
    image?: string;
  } {
    return {
      '@context': 'https://schema.org',
      '@type': 'EducationalAssessment',
      name: cardData.title,
      description: cardData.description,
      image: cardData.imageUrl || this.generateCardImageUrl(cardData),
    };
  }
}

