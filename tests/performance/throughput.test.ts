/**
 * Performance Tests: Throughput
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { initializeSystem } from '../../src/index.js';

describe('Throughput Performance Tests', () => {
  let system: ReturnType<typeof initializeSystem>;

  beforeEach(() => {
    system = initializeSystem();
  });

  describe('Peak Event Throughput', () => {
    it('should handle peak 50 events/sec orchestration', async () => {
      const eventsPerSecond = 50;
      const durationSeconds = 10;
      const totalEvents = eventsPerSecond * durationSeconds;

      const startTime = Date.now();

      // Simulate 50 events/sec for 10 seconds
      const promises: Promise<any>[] = [];
      for (let second = 0; second < durationSeconds; second++) {
        for (let event = 0; event < eventsPerSecond; event++) {
          const promise = system.analyticsService.addEvent({
            eventType: 'INVITE_SENT' as any,
            userId: `user-${event}`,
            timestamp: new Date().toISOString(),
            metadata: {
              loopId: 'buddy_challenge',
            },
          });
          promises.push(promise);
        }
        // Small delay to simulate real-time rate
        if (second < durationSeconds - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const actualDuration = (endTime - startTime) / 1000;

      // Should handle the load
      expect(promises.length).toBe(totalEvents);
      
      const actualThroughput = totalEvents / actualDuration;
      console.log(`Processed ${totalEvents} events in ${actualDuration.toFixed(2)}s (${actualThroughput.toFixed(0)} events/sec)`);
      
      // Should maintain at least 50 events/sec
      expect(actualThroughput).toBeGreaterThanOrEqual(45); // Allow some variance
    });
  });

  describe('Concurrent Learners', () => {
    it('should handle 5000 concurrent learners', async () => {
      const learnerCount = 5000;
      const startTime = Date.now();

      // Simulate concurrent learners
      const promises = Array.from({ length: learnerCount }, (_, i) =>
        system.agentClient.callAgent('orchestrator', {
          agentId: 'test',
          requestId: `test-${i}`,
          timestamp: new Date().toISOString(),
          userId: `learner-${i}`,
          trigger: 'session_complete' as any,
          persona: 'student' as any,
          context: {
            subject: 'Math',
          },
        })
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All should complete
      expect(results.length).toBe(learnerCount);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(30000); // <30 seconds
      
      const learnersPerSecond = (learnerCount / duration) * 1000;
      console.log(`Handled ${learnerCount} concurrent learners in ${duration}ms (${learnersPerSecond.toFixed(0)} learners/sec)`);
    });
  });

  describe('K-Factor Calculation Performance', () => {
    it('should calculate K-factor quickly for large cohorts', async () => {
      // Add many events for large cohort
      const eventCount = 100000;
      
      for (let i = 0; i < eventCount; i++) {
        system.analyticsService.addEvent({
          eventType: (i % 2 === 0 ? 'INVITE_SENT' : 'FVM_REACHED') as any,
          userId: `user-${i % 10000}`,
          timestamp: new Date().toISOString(),
          metadata: {
            cohort: 'large-cohort',
            loopId: 'buddy_challenge',
          },
        });
      }

      const startTime = Date.now();
      const kFactor = system.analyticsService.calculateKFactor('large-cohort');
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should calculate quickly (<1 second)
      expect(duration).toBeLessThan(1000);
      expect(kFactor.kFactor).toBeGreaterThanOrEqual(0);
      
      console.log(`K-factor calculation for ${eventCount} events: ${duration}ms`);
    });
  });
});

