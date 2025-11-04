/**
 * Async Results as Viral Surfaces Example
 * 
 * Demonstrates converting diagnostics, practice tests, and flashcards results
 * into shareable viral surfaces with share cards, deep links, and challenges.
 */

import { initializeSystem } from '../index.js';
import { Persona } from '../core/types/index.js';

async function demonstrateResultsShare() {
  console.log('📊 Async Results as Viral Surfaces - Example\n');

  // Initialize system
  const system = initializeSystem();
  console.log('✅ System initialized');
  console.log('');

  // Example 1: Diagnostic Results Share (Student)
  console.log('🔍 Example 1: Diagnostic Results Share (Student)');
  console.log('─'.repeat(60));
  const diagnosticShare = await system.resultsShareService.generateDiagnosticShare(
    'student-123',
    Persona.STUDENT,
    75,
    'Math',
    ['factoring', 'quadratic-equations']
  );

  console.log('Share Card:');
  console.log(`  Title: ${diagnosticShare.shareCard.title}`);
  console.log(`  Description: ${diagnosticShare.shareCard.description}`);
  console.log(`  CTA: ${diagnosticShare.shareCard.cta}`);
  console.log(`  Privacy Safe: ${diagnosticShare.shareCard.privacySafe}`);
  console.log(`\nDeep Link: ${diagnosticShare.deepLink}`);
  
  if (diagnosticShare.challengeDeck) {
    console.log(`\nChallenge Deck:`);
    console.log(`  Title: ${diagnosticShare.challengeDeck.title}`);
    console.log(`  Questions: ${diagnosticShare.challengeDeck.questionCount}`);
    console.log(`  Estimated Time: ${diagnosticShare.challengeDeck.estimatedTime} min`);
  }

  console.log(`\nInvite Options:`);
  console.log(`  Challenge Friend: ${diagnosticShare.inviteOptions.challengeFriend.enabled ? '✅' : '❌'}`);
  if (diagnosticShare.inviteOptions.challengeFriend.enabled) {
    console.log(`    Link: ${diagnosticShare.inviteOptions.challengeFriend.link.substring(0, 80)}...`);
  }
  console.log(`  Invite Study Buddy: ${diagnosticShare.inviteOptions.inviteStudyBuddy.enabled ? '✅' : '❌'}`);
  console.log('');

  // Example 2: Practice Test Results Share (Student with ranking)
  console.log('📝 Example 2: Practice Test Results Share (Student with Ranking)');
  console.log('─'.repeat(60));
  const practiceShare = await system.resultsShareService.generatePracticeTestShare(
    'student-456',
    Persona.STUDENT,
    92,
    87,
    15,
    150,
    'Algebra'
  );

  console.log('Share Card:');
  console.log(`  Title: ${practiceShare.shareCard.title}`);
  console.log(`  Description: ${practiceShare.shareCard.description}`);
  console.log(`  Score: ${practiceShare.shareCard.score}%`);
  console.log(`  CTA: ${practiceShare.shareCard.cta}`);
  console.log(`\nDeep Link: ${practiceShare.deepLink.substring(0, 80)}...`);
  console.log('');

  // Example 3: Flashcard Results Share (Student)
  console.log('🎴 Example 3: Flashcard Results Share (Student)');
  console.log('─'.repeat(60));
  const flashcardShare = await system.resultsShareService.generateFlashcardShare(
    'student-789',
    Persona.STUDENT,
    85,
    'English',
    ['vocabulary', 'reading-comprehension']
  );

  console.log('Share Card:');
  console.log(`  Title: ${flashcardShare.shareCard.title}`);
  console.log(`  Description: ${flashcardShare.shareCard.description}`);
  console.log(`  Score: ${flashcardShare.shareCard.score}%`);
  console.log(`\nDeep Link: ${flashcardShare.deepLink.substring(0, 80)}...`);
  console.log('');

  // Example 4: Parent Results Share
  console.log('👨‍👩‍👧 Example 4: Parent Results Share');
  console.log('─'.repeat(60));
  const parentShare = await system.resultsShareService.generateShareableResults({
    userId: 'parent-123',
    persona: Persona.PARENT,
    resultType: 'practice_test',
    score: 88,
    percentile: 82,
    subject: 'Math',
  });

  console.log('Share Card (Parent Variant):');
  console.log(`  Title: ${parentShare.shareCard.title}`);
  console.log(`  Description: ${parentShare.shareCard.description}`);
  console.log(`  CTA: ${parentShare.shareCard.cta}`);
  console.log(`  Privacy Safe: ${parentShare.shareCard.privacySafe}`);
  console.log('');

  // Example 5: Tutor Results Share
  console.log('👨‍🏫 Example 5: Tutor Results Share');
  console.log('─'.repeat(60));
  const tutorShare = await system.resultsShareService.generateShareableResults({
    userId: 'tutor-456',
    persona: Persona.TUTOR,
    resultType: 'diagnostic',
    subject: 'Math',
    skills: ['algebra', 'geometry'],
  });

  console.log('Share Card (Tutor Variant):');
  console.log(`  Title: ${tutorShare.shareCard.title}`);
  console.log(`  Description: ${tutorShare.shareCard.description}`);
  console.log(`  CTA: ${tutorShare.shareCard.cta}`);
  
  if (tutorShare.inviteOptions.cohortInvite) {
    console.log(`\nCohort Invite: ${tutorShare.inviteOptions.cohortInvite.enabled ? '✅' : '❌'}`);
    if (tutorShare.inviteOptions.cohortInvite.enabled) {
      console.log(`  Link: ${tutorShare.inviteOptions.cohortInvite.link.substring(0, 80)}...`);
    }
  }
  console.log('');

  // Example 6: Challenge Deck Generation
  console.log('🎯 Example 6: Challenge Deck Generation');
  console.log('─'.repeat(60));
  const challengeDeck = system.challengeDeckGenerator.generateDeck({
    subject: 'Math',
    skill: 'quadratic-equations',
    difficulty: 'medium',
    questionCount: 5,
  });

  console.log('Challenge Deck:');
  console.log(`  Title: ${challengeDeck.title}`);
  console.log(`  Subject: ${challengeDeck.subject}`);
  console.log(`  Skill: ${challengeDeck.skill}`);
  console.log(`  Difficulty: ${challengeDeck.difficulty}`);
  console.log(`  Questions: ${challengeDeck.questions.length}`);
  console.log(`  Total Points: ${challengeDeck.totalPoints}`);
  console.log(`  Estimated Time: ${challengeDeck.estimatedTime} min`);
  console.log(`\nSample Questions:`);
  challengeDeck.questions.slice(0, 2).forEach((q, i) => {
    console.log(`  ${i + 1}. ${q.question} (${q.type}, ${q.points} pts)`);
  });
  console.log('');

  // Summary
  console.log('📈 Summary');
  console.log('─'.repeat(60));
  console.log('✅ Results share services operational');
  console.log('✅ Share cards generated for all personas');
  console.log('✅ Deep links created for FVM');
  console.log('✅ Challenge decks generated');
  console.log('✅ Invite options configured');
  console.log('✅ Privacy-safe by default');
  console.log('');
  console.log('✅ Async Results as Viral Surfaces complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateResultsShare().catch(console.error);
}

