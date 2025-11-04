/**
 * Example Usage of Viral Loops
 * 
 * Demonstrates all 4 implemented loops end-to-end.
 */

import { initializeSystem, processUserTrigger } from '../index.js';
import { Persona, UserTrigger, ViralLoop } from '../core/types/index.js';
import { LoopContext } from '../core/loops/loop-base.js';

async function demonstrateLoops() {
  console.log('🚀 XFactor Viral Loops - Examples\n');

  // Initialize system
  const system = initializeSystem();
  console.log('✅ System initialized');
  console.log(`📊 Registered loops:`, system.loopRegistry.getStats());
  console.log('');

  // Example 1: Buddy Challenge (Student completes practice)
  console.log('📝 Example 1: Buddy Challenge Loop');
  console.log('─'.repeat(50));
  const buddyResults = await processUserTrigger(
    system,
    'student-123',
    UserTrigger.SESSION_COMPLETE,
    Persona.STUDENT,
    {
      userId: 'student-123',
      persona: Persona.STUDENT,
      subject: 'Algebra',
      age: 15,
      grade: '10',
      inviteCount: 2,
      metadata: {
        practiceScore: 85,
        practiceSubject: 'Algebra',
        practiceSkill: 'quadratic-equations',
      },
    } as LoopContext & { practiceScore: number; practiceSubject: string; practiceSkill: string }
  );
  console.log('');

  // Example 2: Results Rally (Student views results page)
  console.log('📊 Example 2: Results Rally Loop');
  console.log('─'.repeat(50));
  const resultsRallyResults = await processUserTrigger(
    system,
    'student-456',
    UserTrigger.RESULTS_PAGE_VIEW,
    Persona.STUDENT,
    {
      userId: 'student-456',
      persona: Persona.STUDENT,
      subject: 'Geometry',
      age: 14,
      grade: '9',
      inviteCount: 0,
      metadata: {
        resultType: 'practice_test',
        score: 92,
        percentile: 87,
        rank: 15,
        totalParticipants: 150,
        skills: ['triangles', 'angles'],
      },
    } as LoopContext & { resultType: string; score: number; percentile: number; rank: number; totalParticipants: number; skills: string[] }
  );
  console.log('');

  // Example 3: Proud Parent (Parent receives weekly recap)
  console.log('👨‍👩‍👧 Example 3: Proud Parent Loop');
  console.log('─'.repeat(50));
  const parentResults = await processUserTrigger(
    system,
    'parent-789',
    UserTrigger.MILESTONE_REACHED,
    Persona.PARENT,
    {
      userId: 'parent-789',
      persona: Persona.PARENT,
      subject: 'Math',
      metadata: {
        milestoneType: 'weekly_recap',
        childProgress: {
          subject: 'Math',
          improvement: 15,
          achievements: ['Perfect Week', 'Practice Master'],
        },
      },
    } as LoopContext & { milestoneType: string; childProgress: any }
  );
  console.log('');

  // Example 4: Streak Rescue (Student at risk of losing streak)
  console.log('🔥 Example 4: Streak Rescue Loop');
  console.log('─'.repeat(50));
  const streakExpiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(); // 12 hours from now
  const streakResults = await processUserTrigger(
    system,
    'student-321',
    UserTrigger.STREAK_AT_RISK,
    Persona.STUDENT,
    {
      userId: 'student-321',
      persona: Persona.STUDENT,
      subject: 'English',
      age: 16,
      grade: '11',
      inviteCount: 1,
      metadata: {
        currentStreak: 7,
        streakExpiresAt,
        hoursUntilExpiry: 12,
        practiceTopic: 'reading-comprehension',
      },
    } as LoopContext & { currentStreak: number; streakExpiresAt: string; hoursUntilExpiry: number; practiceTopic: string }
  );
  console.log('');

  // Summary
  console.log('📈 Summary');
  console.log('─'.repeat(50));
  console.log(`Total loops triggered: ${buddyResults.length + resultsRallyResults.length + parentResults.length + streakResults.length}`);
  console.log(`Successful: ${[...buddyResults, ...resultsRallyResults, ...parentResults, ...streakResults].filter(r => r.success).length}`);
  console.log('');

  // Show loop registry stats
  const stats = system.loopRegistry.getStats();
  console.log('📋 Loop Registry Stats:');
  console.log(`  Total loops: ${stats.totalLoops}`);
  console.log(`  Loops by persona:`, stats.loopsByPersona);
  console.log(`  Available loops:`, stats.loops.map(l => l.name).join(', '));
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateLoops().catch(console.error);
}

