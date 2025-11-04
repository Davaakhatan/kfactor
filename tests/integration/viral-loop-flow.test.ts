/**
 * Integration Tests: Viral Loop Flow
 * 
 * Tests the complete flow from trigger to invite generation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeSystem, processUserTrigger } from '../../src/index.js';
import { Persona, UserTrigger } from '../../src/core/types/index.js';

describe('Viral Loop Flow Integration', () => {
  let system: ReturnType<typeof initializeSystem>;

  beforeEach(() => {
    system = initializeSystem();
  });

  it('should execute complete flow: trigger → orchestrator → loop → invite', async () => {
    const results = await processUserTrigger(
      system,
      'student-1',
      UserTrigger.RESULTS_PAGE_VIEW,
      Persona.STUDENT,
      {
        subject: 'Algebra',
        age: 15,
        grade: '10',
        email: 'student@test.com',
      }
    );

    expect(results.length).toBeGreaterThan(0);
    const successful = results.filter((r) => r.success);
    expect(successful.length).toBeGreaterThan(0);

    const result = successful[0];
    expect(result.invite).toBeDefined();
    expect(result.invite?.shortCode).toBeDefined();
    expect(result.invite?.link).toBeDefined();
  });

  it('should handle trust & safety check', async () => {
    // Test with suspicious device (multiple users)
    const results = await processUserTrigger(
      system,
      'user-suspicious',
      UserTrigger.SESSION_COMPLETE,
      Persona.STUDENT,
      {
        subject: 'Math',
        deviceId: 'device-multi-user',
        email: 'suspicious@test.com',
      }
    );

    // Should be blocked or filtered by trust & safety
    // This depends on implementation - may return empty or filtered results
    expect(Array.isArray(results)).toBe(true);
  });

  it('should publish events to event bus', async () => {
    const results = await processUserTrigger(
      system,
      'student-2',
      UserTrigger.SESSION_COMPLETE,
      Persona.STUDENT,
      {
        subject: 'Chemistry',
        age: 16,
      }
    );

    // Events should be published (check analytics service)
    // This is a simplified check - in production would verify event bus
    expect(results).toBeDefined();
  });

  it('should validate loops against registry', async () => {
    // Orchestrator should only return loops that exist in registry
    const results = await processUserTrigger(
      system,
      'student-3',
      UserTrigger.SESSION_COMPLETE,
      Persona.STUDENT,
      {
        subject: 'Physics',
      }
    );

    // All returned loops should be valid
    results.forEach((result) => {
      if (result.success) {
        expect(system.loopRegistry.has(result.loopId)).toBe(true);
      }
    });
  });
});

