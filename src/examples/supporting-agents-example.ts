/**
 * Supporting Agents Example
 * 
 * Demonstrates Incentives, Tutor Advocacy, and Trust & Safety agents.
 */

import { initializeSystem } from '../index.js';
import { RewardType } from '../core/types/index.js';

async function demonstrateSupportingAgents() {
  console.log('🛡️ Supporting Agents - Example\n');

  // Initialize system
  const system = initializeSystem();
  console.log('✅ System initialized');
  console.log(`📊 Registered agents: ${system.agentClient.listAgents().join(', ')}`);
  console.log('');

  // Example 1: Incentives Agent - Allocate Reward
  console.log('💰 Example 1: Incentives Agent - Allocate Reward');
  console.log('─'.repeat(60));
  const allocateRequest = {
    agentId: 'system',
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId: 'student-123',
    action: 'allocate' as const,
    context: {
      rewardType: RewardType.STREAK_SHIELD,
      amount: 1,
      loopId: 'buddy_challenge',
    },
  };

  const allocateResponse = await system.agentClient.callAgent(
    'incentives',
    allocateRequest
  );

  if (allocateResponse.success && allocateResponse.data?.approved) {
    console.log(`✅ Reward allocated: ${allocateResponse.data.reward?.description}`);
    console.log(`Budget remaining: Daily ${allocateResponse.data.budgetStatus?.dailyRemaining}, Weekly ${allocateResponse.data.budgetStatus?.weeklyRemaining}`);
  } else {
    console.log(`❌ Reward denied: ${allocateResponse.rationale}`);
  }
  console.log('');

  // Example 2: Incentives Agent - Check Budget
  console.log('📊 Example 2: Incentives Agent - Check Budget');
  console.log('─'.repeat(60));
  const budgetRequest = {
    agentId: 'system',
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId: 'admin',
    action: 'check_budget' as const,
    context: {},
  };

  const budgetResponse = await system.agentClient.callAgent(
    'incentives',
    budgetRequest
  );

  if (budgetResponse.success && budgetResponse.data?.budgetStatus) {
    const status = budgetResponse.data.budgetStatus;
    console.log(`Budget Status:`);
    console.log(`  Daily: ${status.dailyRemaining} remaining`);
    console.log(`  Weekly: ${status.weeklyRemaining} remaining`);
    console.log(`  Monthly: ${status.monthlyRemaining} remaining`);
  }
  console.log('');

  // Example 3: Tutor Advocacy Agent - Generate Share Pack
  console.log('👨‍🏫 Example 3: Tutor Advocacy Agent - Generate Share Pack');
  console.log('─'.repeat(60));
  const sharePackRequest = {
    agentId: 'system',
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId: 'tutor-456',
    tutorId: 'tutor-456',
    action: 'generate_share_pack' as const,
    context: {
      subject: 'Math',
      classSampler: true,
      prepPack: true,
      sessionId: 'session-123',
    },
  };

  const sharePackResponse = await system.agentClient.callAgent(
    'tutor-advocacy',
    sharePackRequest
  );

  if (sharePackResponse.success && sharePackResponse.data?.sharePack) {
    const pack = sharePackResponse.data.sharePack;
    console.log(`✅ Share pack generated:`);
    console.log(`  Pack ID: ${pack.packId}`);
    console.log(`  Referral Code: ${pack.referralCode}`);
    console.log(`  WhatsApp: ${pack.shareLinks.whatsapp ? '✅' : '❌'}`);
    console.log(`  SMS: ${pack.shareLinks.sms ? '✅' : '❌'}`);
    console.log(`  Email: ${pack.shareLinks.email ? '✅' : '❌'}`);
    console.log(`  Class Sampler: ${pack.classSamplerLink ? '✅' : '❌'}`);
    console.log(`  Prep Pack: ${pack.prepPackLink ? '✅' : '❌'}`);
  }
  console.log('');

  // Example 4: Tutor Advocacy Agent - Get Referral Stats
  console.log('📈 Example 4: Tutor Advocacy Agent - Referral Stats');
  console.log('─'.repeat(60));
  const statsRequest = {
    agentId: 'system',
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId: 'tutor-456',
    tutorId: 'tutor-456',
    action: 'get_referral_stats' as const,
    context: {},
  };

  const statsResponse = await system.agentClient.callAgent(
    'tutor-advocacy',
    statsRequest
  );

  if (statsResponse.success && statsResponse.data?.referralStats) {
    const stats = statsResponse.data.referralStats;
    console.log(`Referral Statistics:`);
    console.log(`  Total Referrals: ${stats.totalReferrals}`);
    console.log(`  Converted: ${stats.convertedReferrals}`);
    console.log(`  Conversion Rate: ${(stats.conversionRate * 100).toFixed(1)}%`);
    console.log(`  Total XP: ${stats.totalXP}`);
  }
  console.log('');

  // Example 5: Trust & Safety Agent - Check Fraud
  console.log('🔒 Example 5: Trust & Safety Agent - Check Fraud');
  console.log('─'.repeat(60));
  const fraudRequest = {
    agentId: 'system',
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId: 'user-789',
    action: 'check_fraud' as const,
    context: {
      email: 'user@example.com',
      deviceId: 'device-123',
    },
  };

  const fraudResponse = await system.agentClient.callAgent(
    'trust-safety',
    fraudRequest
  );

  if (fraudResponse.success && fraudResponse.data) {
    console.log(`Fraud Check:`);
    console.log(`  Allowed: ${fraudResponse.data.allowed ? '✅' : '❌'}`);
    console.log(`  Risk Score: ${fraudResponse.data.riskScore || 0}`);
    if (fraudResponse.data.reason) {
      console.log(`  Reason: ${fraudResponse.data.reason}`);
    }
  }
  console.log('');

  // Example 6: Trust & Safety Agent - Rate Limit Check
  console.log('⏱️ Example 6: Trust & Safety Agent - Rate Limit Check');
  console.log('─'.repeat(60));
  const rateLimitRequest = {
    agentId: 'system',
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId: 'user-123',
    action: 'rate_limit' as const,
    context: {},
  };

  const rateLimitResponse = await system.agentClient.callAgent(
    'trust-safety',
    rateLimitRequest
  );

  if (rateLimitResponse.success && rateLimitResponse.data) {
    console.log(`Rate Limit Check:`);
    console.log(`  Allowed: ${rateLimitResponse.data.allowed ? '✅' : '❌'}`);
    console.log(`  Rate Limited: ${rateLimitResponse.data.rateLimited ? '⚠️' : '✅'}`);
    if (rateLimitResponse.data.retryAfter) {
      console.log(`  Retry After: ${rateLimitResponse.data.retryAfter} seconds`);
    }
  }
  console.log('');

  // Example 7: Trust & Safety Agent - PII Redaction
  console.log('🔐 Example 7: Trust & Safety Agent - PII Redaction (COPPA)');
  console.log('─'.repeat(60));
  const redactRequest = {
    agentId: 'system',
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId: 'student-123',
    action: 'redact_pii' as const,
    context: {
      content: 'My name is John Doe and my email is john@example.com. Call me at 555-123-4567.',
      age: 12, // Under 13 - COPPA applies
    },
  };

  const redactResponse = await system.agentClient.callAgent(
    'trust-safety',
    redactRequest
  );

  if (redactResponse.success && redactResponse.data?.redactedContent) {
    console.log(`Original: ${redactRequest.context.content}`);
    console.log(`Redacted: ${redactResponse.data.redactedContent}`);
    console.log(`✅ COPPA-compliant redaction applied`);
  }
  console.log('');

  // Summary
  console.log('📈 Summary');
  console.log('─'.repeat(60));
  console.log('✅ Incentives Agent: Reward allocation and budget management');
  console.log('✅ Tutor Advocacy Agent: Share pack generation and referral tracking');
  console.log('✅ Trust & Safety Agent: Fraud detection, rate limiting, PII redaction');
  console.log('');
  console.log('✅ All supporting agents operational!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateSupportingAgents().catch(console.error);
}

