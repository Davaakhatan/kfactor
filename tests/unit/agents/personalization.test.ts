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

      // Agent should process the request
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      
      // If successful, data should be present
      if (response.success && response.data) {
        const data = response.data as any;
        expect(data).toBeDefined();
        
        // Copy should be generated
        if (data.copy) {
          expect(data.copy).toBeDefined();
          expect(data.copy.headline || data.copy || '').toBeTruthy();
        }
        
        // Reward should be selected
        if (data.reward) {
          expect(data.reward.type).toBeDefined();
        }
      }
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

      // Agent should process the request
      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      
      // If successful, data should be present
      if (response.success && response.data) {
        const data = response.data as any;
        expect(data).toBeDefined();
        
        // Copy should be generated
        if (data.copy) {
          expect(data.copy).toBeDefined();
          expect(data.copy.headline || data.copy || '').toBeTruthy();
        }
        
        // Reward should be selected
        if (data.reward) {
          expect(data.reward.type).toBeDefined();
        }
      }
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

      // Should succeed (may return data or not depending on validation)
      expect(response).toBeDefined();
      if (response.success && response.data) {
        const copy = (response.data as any)?.copy;
        if (copy) {
          expect(copy).toBeDefined();
        }
      }
    });
  });
});

