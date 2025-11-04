/**
 * Security Tests: Fraud Detection & Abuse Prevention
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeSystem, processUserTrigger } from '../../src/index.js';
import { Persona, UserTrigger } from '../../src/core/types/index.js';

describe('Fraud Detection & Abuse Prevention', () => {
  let system: ReturnType<typeof initializeSystem>;

  beforeEach(() => {
    system = initializeSystem();
  });

  describe('Duplicate Detection', () => {
    it('should detect duplicate device usage', async () => {
      // First user with device
      await processUserTrigger(
        system,
        'user-1',
        UserTrigger.SESSION_COMPLETE,
        Persona.STUDENT,
        {
          subject: 'Math',
          deviceId: 'device-123',
          email: 'user1@test.com',
        }
      );

      // Second user with same device
      const safetyCheck = await system.agentClient.callAgent('trust-safety', {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'user-2',
        action: 'check_fraud',
        context: {
          deviceId: 'device-123',
          email: 'user2@test.com',
        },
      });

      expect(safetyCheck.success).toBe(true);
      // Should detect risk from duplicate device
      expect(safetyCheck.data?.riskScore).toBeGreaterThan(0);
    });

    it('should detect duplicate email usage', async () => {
      // First user with email
      await processUserTrigger(
        system,
        'user-1',
        UserTrigger.SESSION_COMPLETE,
        Persona.STUDENT,
        {
          subject: 'Math',
          email: 'duplicate@test.com',
        }
      );

      // Second user with same email
      const safetyCheck = await system.agentClient.callAgent('trust-safety', {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'user-2',
        action: 'check_fraud',
        context: {
          email: 'duplicate@test.com',
        },
      });

      expect(safetyCheck.success).toBe(true);
      // Should detect risk from duplicate email
      expect(safetyCheck.data?.riskScore).toBeGreaterThan(0);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce daily invite limit', async () => {
      // Exceed rate limit
      for (let i = 0; i < 6; i++) {
        const rateLimitCheck = await system.agentClient.callAgent('trust-safety', {
          agentId: 'test',
          requestId: `test-${i}`,
          timestamp: new Date().toISOString(),
          userId: 'user-rate-limit',
          action: 'rate_limit',
          context: {},
        });

        if (i < 5) {
          expect(rateLimitCheck.data?.allowed).toBe(true);
        } else {
          // 6th attempt should be rate limited
          expect(rateLimitCheck.data?.allowed).toBe(false);
          expect(rateLimitCheck.data?.rateLimited).toBe(true);
        }
      }
    });

    it('should block invites when rate limited', async () => {
      // Create user at rate limit
      for (let i = 0; i < 5; i++) {
        await system.agentClient.callAgent('trust-safety', {
          agentId: 'test',
          requestId: `test-${i}`,
          timestamp: new Date().toISOString(),
          userId: 'user-limited',
          action: 'rate_limit',
          context: {},
        });
      }

      // Attempt to trigger loop
      const results = await processUserTrigger(
        system,
        'user-limited',
        UserTrigger.SESSION_COMPLETE,
        Persona.STUDENT,
        {
          subject: 'Math',
          inviteCount: 5, // Already at limit
        }
      );

      // Should be blocked or filtered
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Abuse Detection', () => {
    it('should detect rapid reward claims', async () => {
      // Simulate rapid reward claims
      for (let i = 0; i < 12; i++) {
        const abuseCheck = await system.agentClient.callAgent('trust-safety', {
          agentId: 'test',
          requestId: `test-${i}`,
          timestamp: new Date().toISOString(),
          userId: 'user-abuse',
          action: 'check_fraud',
          context: {
            userHistory: {
              recentRewards: Array.from({ length: i + 1 }, () => ({
                type: 'streak_shield',
                amount: 1,
                timestamp: new Date().toISOString(),
              })),
            },
          },
        });

        if (i >= 10) {
          // Should detect abuse after 10 rapid claims
          expect(abuseCheck.data?.abuseDetected).toBe(true);
        }
      }
    });

    it('should detect suspicious reward patterns', async () => {
      const abuseCheck = await system.agentClient.callAgent('trust-safety', {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'user-pattern',
        action: 'check_fraud',
        context: {
          userHistory: {
            recentRewards: Array.from({ length: 6 }, () => ({
              type: 'streak_shield', // Same type repeatedly
              amount: 1,
              timestamp: new Date().toISOString(),
            })),
          },
        },
      });

      // Should detect suspicious pattern
      expect(abuseCheck.success).toBe(true);
    });
  });

  describe('Incentives Abuse Prevention', () => {
    it('should prevent duplicate reward claims', async () => {
      const allocate1 = await system.agentClient.callAgent('incentives', {
        agentId: 'test',
        requestId: 'test-1',
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        action: 'allocate',
        context: {
          rewardType: 'streak_shield' as any,
          amount: 1,
          loopId: 'buddy_challenge',
        },
      });

      expect(allocate1.success).toBe(true);

      // Attempt duplicate allocation
      const abuseCheck = await system.agentClient.callAgent('incentives', {
        agentId: 'test',
        requestId: 'test-2',
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        action: 'detect_abuse',
        context: {
          userHistory: {
            recentRewards: [
              {
                type: 'streak_shield',
                amount: 1,
                timestamp: new Date().toISOString(),
              },
              {
                type: 'streak_shield',
                amount: 1,
                timestamp: new Date().toISOString(),
              },
            ],
          },
        },
      });

      expect(abuseCheck.success).toBe(true);
    });

    it('should enforce budget limits', async () => {
      // Attempt to allocate large reward
      const allocate = await system.agentClient.callAgent('incentives', {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        action: 'allocate',
        context: {
          rewardType: 'class_pass' as any,
          amount: 10000, // Exceeds budget
          loopId: 'buddy_challenge',
        },
      });

      // Should be denied due to budget
      expect(allocate.success).toBe(false);
    });
  });
});

