/**
 * Example Usage of XFactor Viral Growth System
 * 
 * Demonstrates the complete flow from user trigger to viral loop activation.
 */

import { initializeSystem, processUserTrigger } from './index.js';
import { Persona, UserTrigger, ViralLoop, EventType } from './core/types/index.js';
import { SmartLinkService } from './services/smart-links/smart-link-service.js';
import { eventBus } from './core/events/event-bus.js';

async function main() {
  console.log('🚀 XFactor Viral Growth System - Example\n');

  // Initialize system
  const client = initializeSystem();
  console.log('✅ System initialized with agents:', client.listAgents());
  console.log('');

  // Example 1: Student completes a practice session
  console.log('📝 Example 1: Student completes practice session');
  await processUserTrigger(
    client,
    'student-123',
    UserTrigger.SESSION_COMPLETE,
    Persona.STUDENT,
    {
      subject: 'Algebra',
      age: 15,
      grade: '10',
      inviteCount: 2,
      lastInviteTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    }
  );
  console.log('');

  // Example 2: Student views results page
  console.log('📊 Example 2: Student views results page');
  await processUserTrigger(
    client,
    'student-456',
    UserTrigger.RESULTS_PAGE_VIEW,
    Persona.STUDENT,
    {
      subject: 'Geometry',
      age: 14,
      grade: '9',
      inviteCount: 0,
    }
  );
  console.log('');

  // Example 3: Tutor gets 5-star rating
  console.log('⭐ Example 3: Tutor receives 5-star rating');
  await processUserTrigger(
    client,
    'tutor-789',
    UserTrigger.SESSION_COMPLETE,
    Persona.TUTOR,
    {
      subject: 'Calculus',
      inviteCount: 5,
    }
  );
  console.log('');

  // Example 4: Generate smart link
  console.log('🔗 Example 4: Generate smart link');
  const smartLinkService = new SmartLinkService();
  const link = smartLinkService.generateLink({
    baseUrl: 'https://varsitytutors.com',
    userId: 'student-123',
    referrerId: 'student-456',
    loopId: ViralLoop.BUDDY_CHALLENGE,
    persona: Persona.STUDENT,
    fvmType: 'challenge',
    context: {
      subject: 'Algebra',
      skill: 'quadratic-equations',
      difficulty: 'medium',
      challengeId: 'challenge-abc123',
    },
    utmParams: {
      source: 'viral_growth',
      medium: 'referral',
      campaign: 'buddy_challenge',
    },
  });

  console.log('Smart Link Generated:');
  console.log('  Short Code:', link.shortCode);
  console.log('  Full URL:', link.fullUrl);
  console.log('  Deep Link:', link.deepLink);
  console.log('  Expires:', link.expiresAt);
  console.log('');

  // Example 5: Track link click
  console.log('👆 Example 5: Track link click');
  const clicked = smartLinkService.trackClick(link.shortCode, {
    timestamp: new Date().toISOString(),
    userAgent: 'Mozilla/5.0...',
    deviceId: 'device-xyz',
  });
  console.log('Link clicked:', clicked);
  const stats = smartLinkService.getLinkStats(link.shortCode);
  console.log('Link stats:', stats);
  console.log('');

  // Example 6: Calculate K-factor
  console.log('📈 Example 6: Calculate K-factor');
  
  // Log some events first
  const expAgent = client as any;
  if (expAgent.agents) {
    const exp = expAgent.agents.get('experimentation');
    if (exp) {
      // Simulate some events
      await exp.process({
        agentId: 'system',
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userId: 'student-123',
        action: 'log_event',
        context: {
          event: {
            eventType: EventType.INVITE_SENT,
            userId: 'student-123',
            timestamp: new Date().toISOString(),
            inviteCode: link.shortCode,
            loopId: ViralLoop.BUDDY_CHALLENGE,
            channel: 'in_app' as any,
          },
        },
      } as any);

      await exp.process({
        agentId: 'system',
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userId: 'student-456',
        action: 'log_event',
        context: {
          event: {
            eventType: EventType.INVITE_OPENED,
            userId: 'student-456',
            timestamp: new Date().toISOString(),
            inviteCode: link.shortCode,
            loopId: ViralLoop.BUDDY_CHALLENGE,
            channel: 'in_app' as any,
          },
        },
      } as any);

      await exp.process({
        agentId: 'system',
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userId: 'student-456',
        action: 'log_event',
        context: {
          event: {
            eventType: EventType.FVM_REACHED,
            userId: 'student-456',
            timestamp: new Date().toISOString(),
            inviteCode: link.shortCode,
            fvmType: 'practice',
          },
        },
      } as any);

      // Calculate K-factor
      const kFactorResponse = await exp.process({
        agentId: 'system',
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userId: 'student-123',
        action: 'calculate_k',
        context: {
          cohort: 'test-cohort',
        },
      } as any);

      if (kFactorResponse.success && kFactorResponse.data) {
        console.log('K-Factor:', kFactorResponse.data.kFactor?.toFixed(2));
        console.log('Metrics:', kFactorResponse.data.metrics);
        console.log('Rationale:', kFactorResponse.rationale);
      }
    }
  }

  console.log('\n✅ Examples completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

