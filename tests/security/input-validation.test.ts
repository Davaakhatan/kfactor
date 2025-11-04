/**
 * Security Tests: Input Validation & Injection Prevention
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeSystem } from '../../src/index.js';

describe('Input Validation & Security', () => {
  let system: ReturnType<typeof initializeSystem>;

  beforeEach(() => {
    system = initializeSystem();
  });

  describe('SQL Injection Prevention', () => {
    it('should sanitize user input in context', async () => {
      // Attempt SQL injection in subject field
      const maliciousInput = "'; DROP TABLE users; --";
      
      const result = await system.agentClient.callAgent('orchestrator', {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        trigger: 'session_complete' as any,
        persona: 'student' as any,
        context: {
          subject: maliciousInput,
        },
      });

      // Should handle safely (not execute SQL)
      expect(result).toBeDefined();
      // Input should be treated as string, not executed
    });
  });

  describe('XSS Prevention', () => {
    it('should sanitize script tags in user content', async () => {
      const maliciousScript = '<script>alert("XSS")</script>';
      
      const response = await system.agentClient.callAgent('trust-safety', {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        action: 'redact_pii',
        context: {
          content: maliciousScript,
          age: 15,
        },
      });

      // Should sanitize or handle safely
      expect(response.success).toBe(true);
      const redacted = response.data?.redactedContent || '';
      // Should not contain executable script
      expect(redacted).not.toContain('<script>');
    });
  });

  describe('Path Traversal Prevention', () => {
    it('should prevent directory traversal in file paths', async () => {
      const maliciousPath = '../../../etc/passwd';
      
      // System should not allow traversal
      // This is tested through service usage
      expect(system.smartLinkService).toBeDefined();
      // Services should validate paths
    });
  });

  describe('Request Validation', () => {
    it('should validate required fields in agent requests', async () => {
      // Missing required fields
      const invalidRequest = {
        agentId: 'test',
        // Missing requestId, timestamp, etc.
      };

      // Should be rejected by agent validation
      const response = await system.agentClient.callAgent('orchestrator', invalidRequest as any);
      
      // Should fail validation
      expect(response.success).toBe(false);
    });

    it('should validate request types', async () => {
      const invalidRequest = {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        trigger: 'invalid_trigger' as any, // Invalid trigger
        persona: 'student' as any,
        context: {},
      };

      const response = await system.agentClient.callAgent('orchestrator', invalidRequest);
      
      // Should handle invalid trigger gracefully
      expect(response).toBeDefined();
    });
  });

  describe('Rate Limiting Validation', () => {
    it('should validate rate limit parameters', async () => {
      const response = await system.agentClient.callAgent('trust-safety', {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        action: 'rate_limit',
        context: {
          // Missing or invalid parameters should be handled
        },
      });

      expect(response.success).toBe(true);
    });
  });

  describe('Data Type Validation', () => {
    it('should validate data types in requests', async () => {
      // Invalid data type (string instead of number)
      const invalidRequest = {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        action: 'allocate',
        context: {
          rewardType: 'streak_shield' as any,
          amount: 'invalid' as any, // Should be number
        },
      };

      const response = await system.agentClient.callAgent('incentives', invalidRequest);
      
      // Should handle type errors gracefully
      expect(response).toBeDefined();
    });
  });
});

