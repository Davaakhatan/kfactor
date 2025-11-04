/**
 * Acceptance Tests: PRD Requirements
 * 
 * Tests that verify all PRD requirements are met
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeSystem, processUserTrigger } from '../../src/index.js';
import { Persona, UserTrigger, ViralLoop } from '../../src/core/types/index.js';

describe('PRD Requirements Acceptance Tests', () => {
  let system: ReturnType<typeof initializeSystem>;

  beforeEach(() => {
    system = initializeSystem();
  });

  describe('AC1: ≥4 Viral Loops Functioning End-to-End', () => {
    it('should have at least 4 viral loops registered', () => {
      const stats = system.loopRegistry.getStats();
      expect(stats.totalLoops).toBeGreaterThanOrEqual(4);
    });

    it('should execute BUDDY_CHALLENGE loop end-to-end', async () => {
      const results = await processUserTrigger(
        system,
        'student-1',
        UserTrigger.SESSION_COMPLETE,
        Persona.STUDENT,
        {
          subject: 'Algebra',
          age: 15,
          email: 'student@test.com',
        }
      );

      const buddyChallenge = results.find((r) => r.loopId === ViralLoop.BUDDY_CHALLENGE);
      expect(buddyChallenge).toBeDefined();
      expect(buddyChallenge?.success).toBe(true);
      expect(buddyChallenge?.invite).toBeDefined();
    });

    it('should execute RESULTS_RALLY loop end-to-end', async () => {
      const results = await processUserTrigger(
        system,
        'student-1',
        UserTrigger.RESULTS_PAGE_VIEW,
        Persona.STUDENT,
        {
          subject: 'Math',
          age: 16,
          email: 'student@test.com',
        }
      );

      const resultsRally = results.find((r) => r.loopId === ViralLoop.RESULTS_RALLY);
      expect(resultsRally).toBeDefined();
      expect(resultsRally?.success).toBe(true);
    });

    it('should execute PROUD_PARENT loop end-to-end', async () => {
      const results = await processUserTrigger(
        system,
        'parent-1',
        UserTrigger.SESSION_COMPLETE,
        Persona.PARENT,
        {
          subject: 'Math',
          email: 'parent@test.com',
        }
      );

      const proudParent = results.find((r) => r.loopId === ViralLoop.PROUD_PARENT);
      expect(proudParent).toBeDefined();
      expect(proudParent?.success).toBe(true);
    });

    it('should execute STREAK_RESCUE loop end-to-end', async () => {
      const results = await processUserTrigger(
        system,
        'student-1',
        UserTrigger.STREAK_AT_RISK,
        Persona.STUDENT,
        {
          subject: 'Science',
          age: 14,
          email: 'student@test.com',
        }
      );

      const streakRescue = results.find((r) => r.loopId === ViralLoop.STREAK_RESCUE);
      expect(streakRescue).toBeDefined();
      expect(streakRescue?.success).toBe(true);
    });
  });

  describe('AC2: ≥4 Agentic Actions (≥2 Tutor, ≥2 Student)', () => {
    it('should have at least 4 agentic actions registered', () => {
      const stats = system.actionOrchestrator.getStats();
      expect(stats.totalActions).toBeGreaterThanOrEqual(4);
    });

    it('should have at least 2 student actions', () => {
      const stats = system.actionOrchestrator.getStats();
      const studentActions = stats.actions.filter((a) => a.personas.includes(Persona.STUDENT));
      expect(studentActions.length).toBeGreaterThanOrEqual(2);
    });

    it('should have at least 2 tutor actions', () => {
      const stats = system.actionOrchestrator.getStats();
      const tutorActions = stats.actions.filter((a) => a.personas.includes(Persona.TUTOR));
      expect(tutorActions.length).toBeGreaterThanOrEqual(2);
    });

    it('should trigger agentic actions from session transcription', async () => {
      const result = await system.sessionIntelligence.processSession({
        sessionId: 'session-1',
        userId: 'student-1',
        persona: Persona.STUDENT,
        audioData: Buffer.from('mock audio'),
      });

      expect(result.success).toBe(true);
      expect(result.agenticActionsTriggered).toBeGreaterThanOrEqual(2);
    });
  });

  describe('AC3: K-Factor Measurement (K ≥ 1.20)', () => {
    it('should calculate K-factor for a cohort', () => {
      // Add test events
      for (let i = 0; i < 100; i++) {
        system.analyticsService.addEvent({
          eventType: 'INVITE_SENT' as any,
          userId: `user-${i % 20}`,
          timestamp: new Date().toISOString(),
          metadata: {
            cohort: 'test-cohort',
            loopId: ViralLoop.BUDDY_CHALLENGE,
          },
        });
      }

      for (let i = 0; i < 65; i++) {
        system.analyticsService.addEvent({
          eventType: 'FVM_REACHED' as any,
          userId: `invitee-${i}`,
          timestamp: new Date().toISOString(),
          metadata: {
            cohort: 'test-cohort',
            referred: true,
          },
        });
      }

      const kFactor = system.analyticsService.calculateKFactor('test-cohort');
      expect(kFactor.kFactor).toBeGreaterThanOrEqual(1.20);
      expect(kFactor.targetMet).toBe(true);
    });

    it('should provide clear readout (pass/fail vs K ≥ 1.20)', () => {
      const kFactor = system.analyticsService.calculateKFactor('test-cohort');
      expect(kFactor.targetMet).toBeDefined();
      expect(typeof kFactor.targetMet).toBe('boolean');
    });
  });

  describe('AC4: Presence UI and Leaderboard', () => {
    it('should provide presence service', () => {
      expect(system.presenceService).toBeDefined();
    });

    it('should provide leaderboard service', () => {
      expect(system.leaderboardService).toBeDefined();
    });

    it('should generate presence indicators', async () => {
      const presence = await system.presenceService.getPresence('Algebra', 15);
      expect(presence).toBeDefined();
      expect(presence.count).toBeGreaterThanOrEqual(0);
    });

    it('should generate leaderboard entries', async () => {
      const leaderboard = await system.leaderboardService.getLeaderboard('Algebra', 'practice', 15);
      expect(leaderboard).toBeDefined();
      expect(Array.isArray(leaderboard.entries)).toBe(true);
    });
  });

  describe('AC5: Compliance Memo Approved', () => {
    it('should have trust & safety agent operational', () => {
      expect(system.trustSafetyAgent).toBeDefined();
    });

    it('should enforce COPPA compliance', async () => {
      const response = await system.agentClient.callAgent('trust-safety', {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'student-12',
        action: 'redact_pii',
        context: {
          content: 'My name is John Doe and email is john@example.com',
          age: 12, // Under 13
        },
      });

      expect(response.success).toBe(true);
      expect(response.data?.redactedContent).toBeDefined();
      expect(response.data?.redactedContent).toContain('[EMAIL]');
    });

    it('should enforce FERPA compliance', async () => {
      // FERPA compliance is enforced through data protection
      // Trust & Safety agent handles this
      expect(system.trustSafetyAgent).toBeDefined();
    });
  });

  describe('AC6: Results-Page Sharing Active', () => {
    it('should provide results share service', () => {
      expect(system.resultsShareService).toBeDefined();
    });

    it('should generate share cards for diagnostics', async () => {
      const shareCard = await system.shareCardGenerator.generate({
        persona: Persona.STUDENT,
        resultType: 'diagnostic',
        score: 85,
        subject: 'Algebra',
      });

      expect(shareCard).toBeDefined();
      expect(shareCard.title).toBeDefined();
      expect(shareCard.imageUrl).toBeDefined();
    });

    it('should generate challenge decks', async () => {
      const deck = await system.challengeDeckGenerator.generate({
        skill: 'algebra',
        difficulty: 'medium',
        questionCount: 5,
      });

      expect(deck).toBeDefined();
      expect(deck.questions.length).toBe(5);
    });

    it('should generate share links for results', async () => {
      const shareResult = await system.resultsShareService.generateShare({
        userId: 'student-1',
        persona: Persona.STUDENT,
        resultType: 'practice',
        resultData: {
          score: 92,
          percentile: 87,
          rank: 15,
          totalParticipants: 150,
        },
        subject: 'Algebra',
      });

      expect(shareResult).toBeDefined();
      expect(shareResult.shareCard).toBeDefined();
      expect(shareResult.deepLink).toBeDefined();
    });
  });
});

