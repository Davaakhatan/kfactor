/**
 * Unit Tests: Personalization Agent
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PersonalizationAgent } from '../../../src/agents/personalization/personalization-agent.js';
import { Persona, ViralLoop, RewardType } from '../../../src/core/types/index.js';

describe('PersonalizationAgent', () => {
  let agent: PersonalizationAgent;

  beforeEach(() => {
    agent = new PersonalizationAgent();
  });

  describe('persona-based personalization', () => {
    it('should generate student-focused copy for BUDDY_CHALLENGE', async () => {
      const request = {
        agentId: 'test',
        requestId: 'test-1',
        timestamp: new Date().toISOString(),
        userId: 'student-1',
        persona: Persona.STUDENT,
        loopId: ViralLoop.BUDDY_CHALLENGE,
        context: {
          subject: 'Algebra',
          age: 15,
          grade: '10',
        },
      };

      const response = await agent.process(request);

      expect(response.success).toBe(true);
      expect(response.data?.copy).toBeDefined();
      expect(response.data?.copy.headline).toContain('Challenge');
      expect(response.data?.reward?.type).toBe(RewardType.STREAK_SHIELD);
    });

    it('should generate parent-focused copy for PROUD_PARENT', async () => {
      const request = {
        agentId: 'test',
        requestId: 'test-2',
        timestamp: new Date().toISOString(),
        userId: 'parent-1',
        persona: Persona.PARENT,
        loopId: ViralLoop.PROUD_PARENT,
        context: {
          subject: 'Math',
        },
      };

      const response = await agent.process(request);

      expect(response.success).toBe(true);
      expect(response.data?.copy).toBeDefined();
      expect(response.data?.copy.headline).toContain('Progress');
      expect(response.data?.reward?.type).toBe(RewardType.CLASS_PASS);
    });
  });

  describe('age-based personalization', () => {
    it('should adjust copy for younger students', async () => {
      const request = {
        agentId: 'test',
        requestId: 'test-3',
        timestamp: new Date().toISOString(),
        userId: 'student-1',
        persona: Persona.STUDENT,
        loopId: ViralLoop.BUDDY_CHALLENGE,
        context: {
          subject: 'Math',
          age: 10,
          grade: '5',
        },
      };

      const response = await agent.process(request);

      expect(response.success).toBe(true);
      expect(response.data?.copy).toBeDefined();
    });
  });
});

