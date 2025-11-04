/**
 * Analytics Dashboard Example
 * 
 * Demonstrates analytics service calculating K-factor, loop performance,
 * guardrails, and cohort analysis.
 */

import { initializeSystem } from '../index.js';
import { EventType } from '../core/types/index.js';

async function demonstrateAnalytics() {
  console.log('📊 Analytics & Experimentation - Example\n');

  // Initialize system
  const system = initializeSystem();
  console.log('✅ System initialized');
  console.log('');

  // Simulate some events for analytics
  console.log('📈 Simulating events for analytics...');
  
  // Simulate invites
  for (let i = 0; i < 100; i++) {
    system.analyticsService.addEvent({
      eventType: EventType.INVITE_SENT,
      userId: `user-${i % 20}`, // 20 unique users
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        loopId: ['buddy_challenge', 'results_rally', 'proud_parent', 'streak_rescue'][i % 4],
        cohort: 'test-cohort-2024-01',
      },
    });
  }

  // Simulate opens
  for (let i = 0; i < 75; i++) {
    system.analyticsService.addEvent({
      eventType: EventType.INVITE_OPENED,
      userId: `invitee-${i}`,
      timestamp: new Date().toISOString(),
      metadata: {
        cohort: 'test-cohort-2024-01',
      },
    });
  }

  // Simulate FVM
  for (let i = 0; i < 65; i++) {
    system.analyticsService.addEvent({
      eventType: EventType.FVM_REACHED,
      userId: `invitee-${i}`,
      timestamp: new Date().toISOString(),
      metadata: {
        cohort: 'test-cohort-2024-01',
        referred: true,
      },
    });
  }

  console.log(`✅ Generated events for analytics\n`);

  // Example 1: K-Factor Calculation
  console.log('🎯 Example 1: K-Factor Calculation');
  console.log('─'.repeat(60));
  const kFactor = system.analyticsService.calculateKFactor('test-cohort-2024-01');
  console.log(`K-Factor: ${kFactor.kFactor.toFixed(2)}`);
  console.log(`  Target: 1.20`);
  console.log(`  Status: ${kFactor.targetMet ? '✅ TARGET MET' : '❌ Below target'}`);
  console.log(`  Invites/User: ${kFactor.invitesPerUser.toFixed(2)}`);
  console.log(`  Conversion Rate: ${(kFactor.conversionRate * 100).toFixed(1)}%`);
  console.log('');

  // Example 2: Loop Performance
  console.log('🔄 Example 2: Loop Performance Metrics');
  console.log('─'.repeat(60));
  const loopMetrics = system.analyticsService.getAllLoopMetrics();
  loopMetrics.forEach((loop) => {
    console.log(`\n${loop.loopId}:`);
    console.log(`  Invites: ${loop.totalInvites}`);
    console.log(`  Opens: ${loop.totalOpens}`);
    console.log(`  Joins: ${loop.totalJoins}`);
    console.log(`  FVM: ${loop.totalFVM}`);
    console.log(`  Conversion: ${(loop.conversionRate * 100).toFixed(1)}%`);
  });
  console.log('');

  // Example 3: Guardrail Metrics
  console.log('🛡️ Example 3: Guardrail Metrics');
  console.log('─'.repeat(60));
  const guardrails = system.analyticsService.getGuardrailMetrics();
  console.log(`Status: ${guardrails.healthy ? '✅ HEALTHY' : '⚠️ WARNING'}`);
  console.log(`  Complaint Rate: ${(guardrails.complaintRate * 100).toFixed(2)}% (threshold: 1%)`);
  console.log(`  Opt-Out Rate: ${(guardrails.optOutRate * 100).toFixed(2)}% (threshold: 1%)`);
  console.log(`  Fraud Rate: ${(guardrails.fraudRate * 100).toFixed(2)}% (threshold: 0.5%)`);
  console.log(`  Support Tickets: ${guardrails.supportTickets} (threshold: 100)`);
  console.log('');

  // Example 4: Cohort Analysis
  console.log('📊 Example 4: Cohort Analysis');
  console.log('─'.repeat(60));
  const cohortAnalysis = system.analyticsService.getCohortAnalysis('test-cohort-2024-01');
  console.log(`Cohort: ${cohortAnalysis.cohort}`);
  console.log(`\nReferred Cohort:`);
  console.log(`  Users: ${cohortAnalysis.referred.totalUsers}`);
  console.log(`  FVM Rate: ${(cohortAnalysis.referred.fvmRate * 100).toFixed(1)}%`);
  console.log(`  D7 Retention: ${(cohortAnalysis.referred.d7Retention * 100).toFixed(1)}%`);
  console.log(`\nBaseline Cohort:`);
  console.log(`  Users: ${cohortAnalysis.baseline.totalUsers}`);
  console.log(`  FVM Rate: ${(cohortAnalysis.baseline.fvmRate * 100).toFixed(1)}%`);
  console.log(`  D7 Retention: ${(cohortAnalysis.baseline.d7Retention * 100).toFixed(1)}%`);
  console.log(`\nUplift:`);
  console.log(`  FVM: +${(cohortAnalysis.uplift.fvm * 100).toFixed(1)}%`);
  console.log(`  D7 Retention: +${(cohortAnalysis.uplift.d7 * 100).toFixed(1)}%`);
  console.log('');

  // Summary
  console.log('📈 Summary');
  console.log('─'.repeat(60));
  console.log('✅ Analytics service operational');
  console.log('✅ K-factor calculation working');
  console.log('✅ Loop performance tracking');
  console.log('✅ Guardrail monitoring');
  console.log('✅ Cohort analysis ready');
  console.log('');
  console.log('✅ Analytics & Experimentation complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateAnalytics().catch(console.error);
}

