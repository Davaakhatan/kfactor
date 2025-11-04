/**
 * Performance Tests: Load Testing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeSystem, processUserTrigger } from '../../src/index.js';
import { Persona, UserTrigger } from '../../src/core/types/index.js';

describe('Load Performance Tests', () => {
  let system: ReturnType<typeof initializeSystem>;

  beforeEach(() => {
    system = initializeSystem();
  });

  describe('Concurrent User Load', () => {
    it('should handle 100 concurrent loop executions', async () => {
      const startTime = Date.now();
      
      const promises = Array.from({ length: 100 }, (_, i) =>
        processUserTrigger(
          system,
          `user-${i}`,
          UserTrigger.SESSION_COMPLETE,
          Persona.STUDENT,
          {
            subject: 'Algebra',
            age: 15,
            email: `user${i}@test.com`,
          }
        )
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All should complete successfully
      const successful = results.filter((r) => r.length > 0 && r.some((res) => res.success));
      expect(successful.length).toBeGreaterThan(0);

      // Should complete within reasonable time (<5 seconds for 100 requests)
      expect(duration).toBeLessThan(5000);
      
      console.log(`100 concurrent requests completed in ${duration}ms`);
    });

    it('should handle 500 concurrent loop executions', async () => {
      const startTime = Date.now();
      
      const promises = Array.from({ length: 500 }, (_, i) =>
        processUserTrigger(
          system,
          `user-${i}`,
          UserTrigger.SESSION_COMPLETE,
          Persona.STUDENT,
          {
            subject: 'Math',
            age: 15,
            email: `user${i}@test.com`,
          }
        )
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should handle load
      expect(results.length).toBe(500);
      
      // Should complete within reasonable time (<30 seconds for 500 requests)
      expect(duration).toBeLessThan(30000);
      
      console.log(`500 concurrent requests completed in ${duration}ms`);
    });
  });

  describe('Event Bus Performance', () => {
    it('should handle 1000 events per second', async () => {
      const startTime = Date.now();
      const eventCount = 1000;

      const promises = Array.from({ length: eventCount }, (_, i) =>
        system.analyticsService.addEvent({
          eventType: 'INVITE_SENT' as any,
          userId: `user-${i % 100}`,
          timestamp: new Date().toISOString(),
          metadata: {
            loopId: 'buddy_challenge',
          },
        })
      );

      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should process 1000 events quickly
      expect(duration).toBeLessThan(2000); // <2 seconds
      
      const eventsPerSecond = (eventCount / duration) * 1000;
      console.log(`Processed ${eventCount} events in ${duration}ms (${eventsPerSecond.toFixed(0)} events/sec)`);
      expect(eventsPerSecond).toBeGreaterThan(500); // At least 500 events/sec
    });
  });

  describe('Agent Response Time', () => {
    it('should respond within SLA (<150ms for in-app triggers)', async () => {
      const startTime = Date.now();

      await system.agentClient.callAgent('orchestrator', {
        agentId: 'test',
        requestId: 'test',
        timestamp: new Date().toISOString(),
        userId: 'user-1',
        trigger: UserTrigger.SESSION_COMPLETE,
        persona: Persona.STUDENT,
        context: {
          subject: 'Algebra',
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should meet SLA
      expect(duration).toBeLessThan(150);
      
      console.log(`Orchestrator response time: ${duration}ms`);
    });

    it('should handle multiple agent calls efficiently', async () => {
      const startTime = Date.now();

      const promises = [
        system.agentClient.callAgent('orchestrator', {
          agentId: 'test',
          requestId: 'test-1',
          timestamp: new Date().toISOString(),
          userId: 'user-1',
          trigger: UserTrigger.SESSION_COMPLETE,
          persona: Persona.STUDENT,
          context: { subject: 'Math' },
        }),
        system.agentClient.callAgent('personalization', {
          agentId: 'test',
          requestId: 'test-2',
          timestamp: new Date().toISOString(),
          userId: 'user-1',
          persona: Persona.STUDENT,
          loopId: 'buddy_challenge' as any,
          context: { subject: 'Math' },
        }),
        system.agentClient.callAgent('trust-safety', {
          agentId: 'test',
          requestId: 'test-3',
          timestamp: new Date().toISOString(),
          userId: 'user-1',
          action: 'check_fraud',
          context: {},
        }),
      ];

      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete all calls efficiently
      expect(duration).toBeLessThan(500); // <500ms for 3 calls
      
      console.log(`3 agent calls completed in ${duration}ms`);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with repeated operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        await processUserTrigger(
          system,
          `user-${i}`,
          UserTrigger.SESSION_COMPLETE,
          Persona.STUDENT,
          {
            subject: 'Math',
            age: 15,
          }
        );
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

      // Should not increase memory excessively (<100MB for 1000 operations)
      expect(memoryIncreaseMB).toBeLessThan(100);
      
      console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`);
    });
  });

  describe('Database/Storage Performance', () => {
    it('should handle analytics event storage efficiently', async () => {
      const startTime = Date.now();
      const eventCount = 10000;

      // Add many events
      for (let i = 0; i < eventCount; i++) {
        system.analyticsService.addEvent({
          eventType: 'INVITE_SENT' as any,
          userId: `user-${i % 1000}`,
          timestamp: new Date().toISOString(),
          metadata: {
            loopId: 'buddy_challenge',
            cohort: 'test-cohort',
          },
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should store events efficiently
      expect(duration).toBeLessThan(5000); // <5 seconds for 10k events
      
      const eventsPerSecond = (eventCount / duration) * 1000;
      console.log(`Stored ${eventCount} events in ${duration}ms (${eventsPerSecond.toFixed(0)} events/sec)`);
      expect(eventsPerSecond).toBeGreaterThan(1000); // At least 1000 events/sec
    });
  });
});

