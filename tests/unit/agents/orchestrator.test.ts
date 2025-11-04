/**
 * Unit Tests: Orchestrator Agent
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OrchestratorAgent } from '../../../src/agents/orchestrator/orchestrator-agent.js';
import { Persona, UserTrigger, ViralLoop } from '../../../src/core/types/index.js';

describe('OrchestratorAgent', () => {
  let agent: OrchestratorAgent;

  beforeEach(() => {
    agent = new OrchestratorAgent();
  });

  describe('loop selection', () => {
    it('should select BUDDY_CHALLENGE for student session complete', async () => {
      const request = {
        agentId: 'test',
        requestId: 'test-1',
        timestamp: new Date().toISOString(),
        userId: 'student-1',
        trigger: UserTrigger.SESSION_COMPLETE,
        persona: Persona.STUDENT,
        context: {
          subject: 'Algebra',
          recentLoops: [],
        },
      };

      const response = await agent.process(request);

      expect(response.success).toBe(true);
      expect(response.data?.selectedLoops).toContain(ViralLoop.BUDDY_CHALLENGE);
    });

    it('should select PROUD_PARENT for parent session complete', async () => {
      const request = {
        agentId: 'test',
        requestId: 'test-2',
        timestamp: new Date().toISOString(),
        userId: 'parent-1',
        trigger: UserTrigger.SESSION_COMPLETE,
        persona: Persona.PARENT,
        context: {
          subject: 'Math',
          recentLoops: [],
        },
      };

      const response = await agent.process(request);

      expect(response.success).toBe(true);
      expect(response.data?.selectedLoops).toContain(ViralLoop.PROUD_PARENT);
    });

    it('should select STREAK_RESCUE for streak at risk', async () => {
      const request = {
        agentId: 'test',
        requestId: 'test-3',
        timestamp: new Date().toISOString(),
        userId: 'student-1',
        trigger: UserTrigger.STREAK_AT_RISK,
        persona: Persona.STUDENT,
        context: {
          recentLoops: [],
        },
      };

      const response = await agent.process(request);

      expect(response.success).toBe(true);
      expect(response.data?.selectedLoops).toContain(ViralLoop.STREAK_RESCUE);
    });

    it('should select RESULTS_RALLY for results page view', async () => {
      const request = {
        agentId: 'test',
        requestId: 'test-4',
        timestamp: new Date().toISOString(),
        userId: 'student-1',
        trigger: UserTrigger.RESULTS_PAGE_VIEW,
        persona: Persona.STUDENT,
        context: {
          subject: 'Algebra',
          recentLoops: [],
        },
      };

      const response = await agent.process(request);

      expect(response.success).toBe(true);
      expect(response.data?.selectedLoops).toContain(ViralLoop.RESULTS_RALLY);
    });
  });

  describe('throttling', () => {
    it('should throttle if user exceeded daily invite limit', async () => {
      const request = {
        agentId: 'test',
        requestId: 'test-5',
        timestamp: new Date().toISOString(),
        userId: 'student-1',
        trigger: UserTrigger.SESSION_COMPLETE,
        persona: Persona.STUDENT,
        context: {
          inviteCount: 10, // Exceeds max
          recentLoops: [],
        },
      };

      const response = await agent.process(request);

      expect(response.success).toBe(false);
      expect(response.rationale).toContain('throttled');
    });
  });

  describe('eligibility', () => {
    it('should not select loops for opted-out users', async () => {
      const request = {
        agentId: 'test',
        requestId: 'test-6',
        timestamp: new Date().toISOString(),
        userId: 'student-1',
        trigger: UserTrigger.SESSION_COMPLETE,
        persona: Persona.STUDENT,
        context: {
          preferences: {
            optedOut: true,
          },
          recentLoops: [],
        },
      };

      const response = await agent.process(request);

      expect(response.success).toBe(true);
      expect(response.data?.selectedLoops).toHaveLength(0);
    });
  });
});

