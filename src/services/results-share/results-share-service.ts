/**
 * Results Share Service
 * 
 * Converts async results pages (diagnostics, practice tests, flashcards) into
 * viral surfaces with share cards, deep links, and cohort challenges.
 */

import { ShareCardGenerator, ShareCardOptions } from '../share-cards/share-card-generator.js';
import { ChallengeDeckGenerator } from '../challenge-deck/challenge-deck-generator.js';
import { SmartLinkService } from '../smart-links/smart-link-service.js';
import { Persona, ViralLoop } from '../../core/types/index.js';
import { LoopExecutor } from '../../core/loops/loop-executor.js';

export interface ResultsShareRequest {
  userId: string;
  persona: Persona;
  resultType: 'diagnostic' | 'practice_test' | 'flashcard';
  score?: number;
  percentile?: number;
  rank?: number;
  totalParticipants?: number;
  subject?: string;
  skills?: string[];
  skillGaps?: string[];
  metadata?: Record<string, unknown>;
}

export interface ResultsShareResponse {
  shareCard: {
    title: string;
    description: string;
    imageUrl?: string;
    cta: string;
    score?: number;
    privacySafe: boolean;
  };
  deepLink: string;
  challengeDeck?: {
    deckId: string;
    title: string;
    questionCount: number;
    estimatedTime: number;
  };
  inviteOptions: {
    challengeFriend: {
      enabled: boolean;
      link: string;
      loopId: ViralLoop;
    };
    inviteStudyBuddy: {
      enabled: boolean;
      link: string;
      loopId: ViralLoop;
    };
    cohortInvite?: {
      enabled: boolean;
      link: string;
    };
  };
}

export class ResultsShareService {
  private shareCardGenerator: ShareCardGenerator;
  private challengeDeckGenerator: ChallengeDeckGenerator;
  private smartLinkService: SmartLinkService;
  private loopExecutor: LoopExecutor;
  private readonly BASE_URL = process.env.BASE_URL || 'https://varsitytutors.com';

  constructor(
    shareCardGenerator: ShareCardGenerator,
    challengeDeckGenerator: ChallengeDeckGenerator,
    smartLinkService: SmartLinkService,
    loopExecutor: LoopExecutor
  ) {
    this.shareCardGenerator = shareCardGenerator;
    this.challengeDeckGenerator = challengeDeckGenerator;
    this.smartLinkService = smartLinkService;
    this.loopExecutor = loopExecutor;
  }

  /**
   * Generate shareable results page with viral surfaces
   */
  async generateShareableResults(
    request: ResultsShareRequest
  ): Promise<ResultsShareResponse> {
    // Generate share card
    const shareCard = this.shareCardGenerator.generateCard({
      persona: request.persona,
      resultType: request.resultType,
      score: request.score,
      percentile: request.percentile,
      rank: request.rank,
      totalParticipants: request.totalParticipants,
      subject: request.subject,
      skills: request.skills,
      metadata: request.metadata,
    });

    // Generate deep link to FVM
    const deepLink = this.generateDeepLink(request);

    // Generate challenge deck if applicable
    let challengeDeck;
    if (request.persona === Persona.STUDENT && request.score !== undefined) {
      challengeDeck = this.challengeDeckGenerator.generateFromResults(
        request.resultType,
        request.score,
        request.subject || 'General',
        request.skillGaps
      );
    }

    // Generate invite links
    const inviteOptions = await this.generateInviteOptions(request, challengeDeck);

    return {
      shareCard: {
        title: shareCard.title,
        description: shareCard.description,
        imageUrl: shareCard.imageUrl || this.shareCardGenerator.generateCardImageUrl(shareCard),
        cta: shareCard.cta,
        score: shareCard.score,
        privacySafe: shareCard.privacySafe,
      },
      deepLink,
      challengeDeck: challengeDeck ? {
        deckId: challengeDeck.deckId,
        title: challengeDeck.title,
        questionCount: challengeDeck.questions.length,
        estimatedTime: challengeDeck.estimatedTime,
      } : undefined,
      inviteOptions,
    };
  }

  /**
   * Generate deep link to FVM
   */
  private generateDeepLink(request: ResultsShareRequest): string {
    const link = this.smartLinkService.generateLink({
      baseUrl: this.BASE_URL,
      userId: request.userId,
      loopId: ViralLoop.RESULTS_RALLY,
      persona: request.persona,
      fvmType: 'practice',
      context: {
        subject: request.subject,
        skill: request.skills?.[0],
      },
      utmParams: {
        source: 'results_share',
        medium: 'referral',
        campaign: request.resultType,
      },
    });

    return link.deepLink;
  }

  /**
   * Generate invite options
   */
  private async generateInviteOptions(
    request: ResultsShareRequest,
    challengeDeck?: any
  ): Promise<ResultsShareResponse['inviteOptions']> {
    const options: ResultsShareResponse['inviteOptions'] = {
      challengeFriend: {
        enabled: false,
        link: '',
        loopId: ViralLoop.BUDDY_CHALLENGE,
      },
      inviteStudyBuddy: {
        enabled: false,
        link: '',
        loopId: ViralLoop.BUDDY_CHALLENGE,
      },
    };

    // Generate challenge friend invite
    if (request.persona === Persona.STUDENT && challengeDeck) {
      const challengeResult = await this.loopExecutor.execute({
        loopId: ViralLoop.BUDDY_CHALLENGE,
        context: {
          userId: request.userId,
          persona: request.persona,
          subject: request.subject,
          metadata: {
            practiceScore: request.score,
            practiceSubject: request.subject,
            challengeDeckId: challengeDeck.deckId,
          },
        },
      });

      if (challengeResult.success && challengeResult.invite) {
        options.challengeFriend = {
          enabled: true,
          link: challengeResult.invite.link,
          loopId: ViralLoop.BUDDY_CHALLENGE,
        };
      }
    }

    // Generate study buddy invite
    if (request.persona === Persona.STUDENT) {
      const buddyResult = await this.loopExecutor.execute({
        loopId: ViralLoop.BUDDY_CHALLENGE,
        context: {
          userId: request.userId,
          persona: request.persona,
          subject: request.subject,
          metadata: {
            practiceSubject: request.subject,
            practiceSkill: request.skills?.[0],
            coPractice: true,
          },
        },
      });

      if (buddyResult.success && buddyResult.invite) {
        options.inviteStudyBuddy = {
          enabled: true,
          link: buddyResult.invite.link,
          loopId: ViralLoop.BUDDY_CHALLENGE,
        };
      }
    }

    // Cohort invite (for teachers/tutors)
    if (request.persona === Persona.TUTOR) {
      const cohortLink = this.smartLinkService.generateLink({
        baseUrl: this.BASE_URL,
        userId: request.userId,
        loopId: ViralLoop.SUBJECT_CLUBS,
        persona: request.persona,
        fvmType: 'session',
        context: {
          subject: request.subject,
        },
      });

      options.cohortInvite = {
        enabled: true,
        link: cohortLink.fullUrl,
      };
    }

    return options;
  }

  /**
   * Generate shareable results for diagnostics
   */
  async generateDiagnosticShare(
    userId: string,
    persona: Persona,
    score: number,
    subject: string,
    skillGaps: string[]
  ): Promise<ResultsShareResponse> {
    return this.generateShareableResults({
      userId,
      persona,
      resultType: 'diagnostic',
      score,
      subject,
      skillGaps,
    });
  }

  /**
   * Generate shareable results for practice tests
   */
  async generatePracticeTestShare(
    userId: string,
    persona: Persona,
    score: number,
    percentile: number,
    rank: number,
    totalParticipants: number,
    subject: string
  ): Promise<ResultsShareResponse> {
    return this.generateShareableResults({
      userId,
      persona,
      resultType: 'practice_test',
      score,
      percentile,
      rank,
      totalParticipants,
      subject,
    });
  }

  /**
   * Generate shareable results for flashcards
   */
  async generateFlashcardShare(
    userId: string,
    persona: Persona,
    score: number,
    subject: string,
    skills: string[]
  ): Promise<ResultsShareResponse> {
    return this.generateShareableResults({
      userId,
      persona,
      resultType: 'flashcard',
      score,
      subject,
      skills,
    });
  }
}

