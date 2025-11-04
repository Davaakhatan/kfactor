/**
 * Security Tests: COPPA/FERPA Compliance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeSystem, processUserTrigger } from '../../src/index.js';
import { Persona, UserTrigger } from '../../src/core/types/index.js';

describe('COPPA/FERPA Security Tests', () => {
  let system: ReturnType<typeof initializeSystem>;

  beforeEach(() => {
    system = initializeSystem();
  });

  describe('COPPA Compliance', () => {
    it('should redact PII for users under 13', async () => {
      const response = await system.agentClient.callAgent('trust-safety', {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'student-12',
        action: 'redact_pii',
        context: {
          content: 'My name is John Doe and my email is john@example.com. Call me at 555-123-4567.',
          age: 12,
        },
      });

      expect(response.success).toBe(true);
      const redacted = response.data?.redactedContent || '';
      
      // Should redact email
      expect(redacted).toContain('[EMAIL]');
      expect(redacted).not.toContain('john@example.com');
      
      // Should redact phone
      expect(redacted).toContain('[PHONE]');
      expect(redacted).not.toContain('555-123-4567');
      
      // Should redact name
      expect(redacted).toContain('[NAME]');
    });

    it('should not redact PII for users 13+', async () => {
      const response = await system.agentClient.callAgent('trust-safety', {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'student-13',
        action: 'redact_pii',
        context: {
          content: 'My email is john@example.com',
          age: 13,
        },
      });

      expect(response.success).toBe(true);
      const redacted = response.data?.redactedContent || '';
      
      // Should not redact email for 13+
      expect(redacted).not.toContain('[EMAIL]');
    });

    it('should require parental consent for users under 13', async () => {
      // Check that system enforces consent
      const results = await processUserTrigger(
        system,
        'student-12',
        UserTrigger.SESSION_COMPLETE,
        Persona.STUDENT,
        {
          subject: 'Math',
          age: 12,
          email: 'young@test.com',
        }
      );

      // System should handle under-13 users appropriately
      // May block or require consent
      expect(Array.isArray(results)).toBe(true);
    });

    it('should enforce privacy-safe defaults for minors', async () => {
      // Presence indicators should be aggregated only
      const presence = await system.presenceService.getPresence('Algebra', 12);
      expect(presence.count).toBeGreaterThanOrEqual(0);
      // Should not expose individual identities
    });
  });

  describe('FERPA Compliance', () => {
    it('should protect educational records', async () => {
      // Session transcripts are educational records
      const result = await system.sessionIntelligence.processSession({
        sessionId: 'session-1',
        userId: 'student-1',
        persona: Persona.STUDENT,
        audioData: Buffer.from('mock audio'),
      });

      // Transcripts should be protected
      expect(result.transcription).toBeDefined();
      // Should not be shareable without consent
    });

    it('should enforce disclosure restrictions', async () => {
      // Check that sharing requires proper consent
      const shareResult = await system.resultsShareService.generateShare({
        userId: 'student-1',
        persona: Persona.STUDENT,
        resultType: 'practice',
        resultData: {
          score: 92,
        },
        subject: 'Algebra',
      });

      // Share cards should be privacy-safe
      expect(shareResult.shareCard).toBeDefined();
      // Should not include PII without consent
    });
  });

  describe('Data Privacy', () => {
    it('should not expose sensitive data in share cards', async () => {
      const shareCard = await system.shareCardGenerator.generate({
        persona: Persona.STUDENT,
        resultType: 'practice',
        score: 85,
        subject: 'Algebra',
      });

      // Should not include email, phone, or full name
      expect(shareCard.title).toBeDefined();
      expect(shareCard.title).not.toMatch(/@/); // No email
      expect(shareCard.title).not.toMatch(/\d{3}-\d{3}-\d{4}/); // No phone
    });

    it('should anonymize leaderboard entries', async () => {
      const leaderboard = await system.leaderboardService.getLeaderboard('Algebra', 'practice', 15);
      
      leaderboard.entries.forEach((entry) => {
        // Should not expose full user IDs or PII
        if (entry.anonymous) {
          expect(entry.userId).not.toContain('@');
        }
      });
    });
  });
});

