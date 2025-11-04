/**
 * End-to-End Tests: Complete User Journey
 * 
 * Tests the complete user journey from trigger to K-factor achievement
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeSystem, processUserTrigger } from '../../src/index.js';
import { Persona, UserTrigger, EventType } from '../../src/core/types/index.js';

describe('Complete User Journey E2E', () => {
  let system: ReturnType<typeof initializeSystem>;

  beforeEach(() => {
    system = initializeSystem();
  });

  it('should complete full journey: Results → Challenge → Friend Joins → FVM → Rewards', async () => {
    // Step 1: Student views results page
    const results = await processUserTrigger(
      system,
      'student-sarah',
      UserTrigger.RESULTS_PAGE_VIEW,
      Persona.STUDENT,
      {
        subject: 'Algebra',
        age: 15,
        grade: '10',
        email: 'sarah@test.com',
      }
    );

    expect(results.length).toBeGreaterThan(0);
    const challengeResult = results.find((r) => r.success);
    expect(challengeResult).toBeDefined();
    expect(challengeResult?.invite).toBeDefined();

    const inviteCode = challengeResult!.invite!.shortCode;

    // Step 2: Friend (Alex) joins via invite
    const joinResult = await system.loopExecutor.processJoin(inviteCode, {
      userId: 'student-alex',
      persona: Persona.STUDENT,
      subject: 'Algebra',
      age: 15,
    });

    expect(joinResult.success).toBe(true);

    // Step 3: Friend reaches FVM (completes challenge)
    const fvmResult = await system.loopExecutor.processFVM(inviteCode, {
      userId: 'student-alex',
      persona: Persona.STUDENT,
      subject: 'Algebra',
    });

    expect(fvmResult.success).toBe(true);

    // Step 4: Check analytics - K-factor should be calculated
    const kFactor = system.analyticsService.calculateKFactor('test-cohort');
    expect(kFactor.kFactor).toBeGreaterThan(0);
  });

  it('should track complete attribution chain', async () => {
    // Create invite
    const inviteResults = await processUserTrigger(
      system,
      'student-1',
      UserTrigger.SESSION_COMPLETE,
      Persona.STUDENT,
      {
        subject: 'Math',
        email: 'student1@test.com',
      }
    );

    const invite = inviteResults[0]?.invite;
    expect(invite).toBeDefined();

    // Join via invite
    const joinResult = await system.loopExecutor.processJoin(
      invite!.shortCode,
      {
        userId: 'student-2',
        persona: Persona.STUDENT,
        subject: 'Math',
      }
    );

    expect(joinResult.success).toBe(true);

    // Verify attribution
    const link = system.smartLinkService.resolveLink(invite!.shortCode);
    expect(link).toBeDefined();
    expect(link?.userId).toBe('student-1'); // Original inviter
  });

  it('should maintain privacy compliance throughout journey', async () => {
    // Test with user under 13 (COPPA)
    const results = await processUserTrigger(
      system,
      'student-young',
      UserTrigger.SESSION_COMPLETE,
      Persona.STUDENT,
      {
        subject: 'Math',
        age: 12, // Under 13
        email: 'young@test.com',
      }
    );

    // Should still work but with privacy protections
    expect(Array.isArray(results)).toBe(true);

    // Check that PII would be redacted (if applicable)
    const safetyCheck = await system.agentClient.callAgent('trust-safety', {
      agentId: 'test',
      requestId: 'test',
      timestamp: new Date().toISOString(),
      userId: 'student-young',
      action: 'redact_pii',
      context: {
        content: 'My name is John Doe and email is john@example.com',
        age: 12,
      },
    });

    expect(safetyCheck.success).toBe(true);
    expect(safetyCheck.data?.redactedContent).toBeDefined();
    expect(safetyCheck.data?.redactedContent).toContain('[EMAIL]');
  });
});

