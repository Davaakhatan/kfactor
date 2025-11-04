/**
 * Database Seed Script
 * Creates test users for all personas to test all features
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Persona } from '../src/core/types/persona.js';

const db = new Database('xfactor.db');

// Hash password helper
const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

// Seed users
const seedUsers = () => {
  console.log('Seeding users...');

  const users = [
    // Students
    {
      id: 'student-1',
      email: 'student1@test.com',
      password: 'password123',
      persona: Persona.STUDENT,
      name: 'Alex Johnson',
      age: 15,
      grade: '10',
      subject_preferences: JSON.stringify(['Algebra', 'Geometry']),
    },
    {
      id: 'student-2',
      email: 'student2@test.com',
      password: 'password123',
      persona: Persona.STUDENT,
      name: 'Sarah Chen',
      age: 16,
      grade: '11',
      subject_preferences: JSON.stringify(['Algebra', 'Chemistry']),
    },
    {
      id: 'student-3',
      email: 'student3@test.com',
      password: 'password123',
      persona: Persona.STUDENT,
      name: 'Mike Rodriguez',
      age: 14,
      grade: '9',
      subject_preferences: JSON.stringify(['Algebra']),
    },
    // Parents
    {
      id: 'parent-1',
      email: 'parent1@test.com',
      password: 'password123',
      persona: Persona.PARENT,
      name: 'Jennifer Johnson',
      age: null,
      grade: null,
      subject_preferences: JSON.stringify([]),
    },
    {
      id: 'parent-2',
      email: 'parent2@test.com',
      password: 'password123',
      persona: Persona.PARENT,
      name: 'David Chen',
      age: null,
      grade: null,
      subject_preferences: JSON.stringify([]),
    },
    // Tutors
    {
      id: 'tutor-1',
      email: 'tutor1@test.com',
      password: 'password123',
      persona: Persona.TUTOR,
      name: 'Dr. Emily Watson',
      age: null,
      grade: null,
      subject_preferences: JSON.stringify(['Algebra', 'Geometry', 'Calculus']),
    },
    {
      id: 'tutor-2',
      email: 'tutor2@test.com',
      password: 'password123',
      persona: Persona.TUTOR,
      name: 'Prof. James Miller',
      age: null,
      grade: null,
      subject_preferences: JSON.stringify(['Chemistry', 'Physics']),
    },
  ];

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password_hash, persona, name, age, grade, subject_preferences, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  for (const user of users) {
    const passwordHash = hashPassword(user.password);
    stmt.run(
      user.id,
      user.email,
      passwordHash,
      user.persona,
      user.name,
      user.age,
      user.grade,
      user.subject_preferences
    );
    console.log(`✓ Created user: ${user.email} (${user.persona})`);
  }

  // Seed some test results
  const seedTestResults = db.prepare(`
    INSERT INTO test_results (id, user_id, subject, test_type, score, correct, total, percentile, rank, total_participants, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || ? || ' minutes'))
  `);

  // Student 1 has recent results
  seedTestResults.run(
    uuidv4(),
    'student-1',
    'Algebra',
    'Practice Test',
    92,
    23,
    25,
    87,
    15,
    150,
    0 // completed just now
  );

  seedTestResults.run(
    uuidv4(),
    'student-1',
    'Algebra',
    'Diagnostic',
    85,
    17,
    20,
    75,
    30,
    200,
    60 // completed 1 hour ago
  );

  // Student 2 has results
  seedTestResults.run(
    uuidv4(),
    'student-2',
    'Algebra',
    'Practice Test',
    88,
    22,
    25,
    80,
    20,
    150,
    30 // completed 30 min ago
  );

  // Seed presence data
  const seedPresence = db.prepare(`
    INSERT OR REPLACE INTO presence (user_id, subject, is_online, last_seen, activity_type)
    VALUES (?, ?, ?, datetime('now'), ?)
  `);

  seedPresence.run('student-1', 'Algebra', 1, 'practicing');
  seedPresence.run('student-2', 'Algebra', 1, 'practicing');
  seedPresence.run('student-3', 'Algebra', 0, null);

  // Seed leaderboard
  const seedLeaderboard = db.prepare(`
    INSERT OR REPLACE INTO leaderboard_entries (id, user_id, subject, score, metric_type, period, rank, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const leaderboardData = [
    { userId: 'student-1', score: 250, rank: 1 },
    { userId: 'student-2', score: 230, rank: 2 },
    { userId: 'student-3', score: 215, rank: 3 },
  ];

  leaderboardData.forEach((entry) => {
    seedLeaderboard.run(
      uuidv4(),
      entry.userId,
      'Algebra',
      entry.score,
      'practice',
      'weekly',
      entry.rank
    );
  });

  // Seed activity feed
  const seedActivity = db.prepare(`
    INSERT INTO activity_feed (id, user_id, activity_type, title, description, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', '-' || ? || ' minutes'))
  `);

  seedActivity.run(uuidv4(), 'student-1', 'achievement', 'Achievement Unlocked', 'Earned Practice Master badge', 5);
  seedActivity.run(uuidv4(), 'student-1', 'streak', 'Streak Maintained', '7-day streak continues', 30);
  seedActivity.run(uuidv4(), 'student-1', 'challenge', 'Challenge Accepted', 'Sarah accepted your Algebra challenge', 120);

  console.log('\n✓ Seed data created successfully!');
  console.log('\nTest Users:');
  console.log('  Students:');
  console.log('    - student1@test.com (password123)');
  console.log('    - student2@test.com (password123)');
  console.log('    - student3@test.com (password123)');
  console.log('  Parents:');
  console.log('    - parent1@test.com (password123)');
  console.log('    - parent2@test.com (password123)');
  console.log('  Tutors:');
  console.log('    - tutor1@test.com (password123)');
  console.log('    - tutor2@test.com (password123)');
};

// Run seed
try {
  seedUsers();
} catch (error) {
  console.error('Error seeding database:', error);
  process.exit(1);
} finally {
  db.close();
}

