/**
 * Session Intelligence Pipeline Example
 * 
 * Demonstrates the complete flow:
 * Session → Transcription → Summary → Agentic Actions → Viral Loops
 */

import { initializeSystem } from '../index.js';
import { Persona } from '../core/types/index.js';

async function demonstrateSessionIntelligence() {
  console.log('🧠 Session Intelligence Pipeline - Example\n');

  // Initialize system
  const system = initializeSystem();
  console.log('✅ System initialized');
  console.log(`📊 Agentic Actions:`, system.actionOrchestrator.getStats());
  console.log('');

  // Example 1: Student Session with Skill Gaps
  console.log('📝 Example 1: Student Session → Beat-My-Skill Challenge');
  console.log('─'.repeat(60));
  const studentResult = await system.sessionIntelligence.processSession({
    sessionId: 'session-student-123',
    userId: 'student-123',
    persona: Persona.STUDENT,
    tutorId: 'tutor-456',
    metadata: {
      subject: 'Math',
      topic: 'Quadratic Equations',
      sessionType: 'scheduled',
    },
  });

  if (studentResult.success) {
    console.log(`✅ Transcription: ${studentResult.transcription?.segments.length} segments`);
    console.log(`✅ Summary generated: ${studentResult.summary?.summary.substring(0, 100)}...`);
    console.log(`✅ Skill gaps: ${studentResult.summary?.skillGaps.length || 0}`);
    console.log(`✅ Agentic actions triggered: ${studentResult.agenticActionsTriggered}`);
    console.log(`✅ Viral loops triggered: ${studentResult.viralLoopsTriggered}`);
  }
  console.log('');

  // Example 2: Student Session with Upcoming Exam
  console.log('📚 Example 2: Student Session → Study Buddy Nudge');
  console.log('─'.repeat(60));
  
  // Create a transcription with exam mention
  const examTranscription = await system.transcriptionService.transcribeSession(
    'session-student-456',
    null,
    {}
  );
  
  // Modify transcription to include exam mention
  examTranscription.segments.push({
    timestamp: 300,
    speaker: 'tutor',
    text: 'Remember, your math exam is in two weeks. Make sure to practice factoring.',
    confidence: 0.95,
  });
  examTranscription.rawTranscript += ' Remember, your math exam is in two weeks.';

  const examResult = await system.sessionIntelligence.processWithTranscription(
    examTranscription,
    'student-456',
    Persona.STUDENT
  );

  if (examResult.success) {
    console.log(`✅ Summary includes upcoming exam: ${!!examResult.summary?.metadata?.upcomingExam}`);
    console.log(`✅ Agentic actions triggered: ${examResult.agenticActionsTriggered}`);
    console.log(`✅ Viral loops triggered: ${examResult.viralLoopsTriggered}`);
  }
  console.log('');

  // Example 3: Tutor Session → Parent Progress Reel
  console.log('👨‍🏫 Example 3: Tutor Session → Parent Progress Reel');
  console.log('─'.repeat(60));
  const tutorResult = await system.sessionIntelligence.processSession({
    sessionId: 'session-tutor-789',
    userId: 'tutor-789',
    persona: Persona.TUTOR,
    metadata: {
      subject: 'Math',
      topic: 'Algebra',
      sessionType: 'scheduled',
    },
  });

  if (tutorResult.success) {
    console.log(`✅ Summary generated: ${tutorResult.summary?.summary.substring(0, 100)}...`);
    console.log(`✅ Strengths identified: ${tutorResult.summary?.strengths.length || 0}`);
    console.log(`✅ Agentic actions triggered: ${tutorResult.agenticActionsTriggered}`);
    console.log(`✅ Viral loops triggered: ${tutorResult.viralLoopsTriggered}`);
  }
  console.log('');

  // Example 4: Tutor Session → Prep Pack Share
  console.log('📦 Example 4: Tutor Session → Prep Pack Share');
  console.log('─'.repeat(60));
  
  const prepTranscription = await system.transcriptionService.transcribeSession(
    'session-tutor-prep',
    null,
    {}
  );
  
  // Add recommendations to summary
  const prepSummary = await system.summaryService.generateSummary(prepTranscription);
  prepSummary.recommendations = [
    'Practice factoring quadratic equations',
    'Review quadratic formula',
    'Complete practice problems',
  ];
  prepSummary.nextSteps = [
    {
      action: 'Practice factoring',
      priority: 'high',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const prepResult = await system.actionOrchestrator.processSummary(
    prepSummary,
    'tutor-789',
    Persona.TUTOR,
    'session-tutor-prep',
    system.loopExecutor
  );

  console.log(`✅ Prep pack actions triggered: ${prepResult.length}`);
  prepResult.forEach((result) => {
    console.log(`  - ${result.actionType}: ${result.success ? '✅' : '❌'} ${result.message || result.error}`);
  });
  console.log('');

  // Summary
  console.log('📈 Summary');
  console.log('─'.repeat(60));
  console.log(`Total sessions processed: 4`);
  console.log(`Total agentic actions: ${studentResult.agenticActionsTriggered + examResult.agenticActionsTriggered + tutorResult.agenticActionsTriggered + prepResult.length}`);
  console.log(`Total viral loops triggered: ${studentResult.viralLoopsTriggered + examResult.viralLoopsTriggered + tutorResult.viralLoopsTriggered}`);
  console.log('');
  console.log('✅ Session Intelligence Pipeline operational!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateSessionIntelligence().catch(console.error);
}

