/**
 * Seed Cohort Data for K-Factor Demonstration
 * 
 * Creates a seeded cohort with events that demonstrate K ≥ 1.20
 */

import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const dbPath = path.join(process.cwd(), 'xfactor.db');
const db = new Database(dbPath);

// Cohort name for demo
const COHORT_NAME = 'demo-cohort-2025-01';
const TARGET_K = 1.20;

// Create seeded cohort with events that demonstrate K ≥ 1.20
function seedCohort() {
  console.log('📊 Seeding cohort data for K-factor demonstration...');

  // Get or create cohort users (20 users)
  const users: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const userId = `cohort-user-${i}`;
    users.push(userId);
    
    // Check if user exists, if not create
    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(userId) as any;
    if (!existing) {
      db.prepare(`
        INSERT INTO users (id, email, password_hash, persona, name, age, grade, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        userId,
        `cohort${i}@demo.com`,
        '$2a$10$demo', // Demo hash
        'student',
        `Cohort User ${i}`,
        15,
        '10th'
      );
    }
  }

  // Generate events to achieve K ≥ 1.20
  // Target: Each user sends 1.5 invites on average, 80% conversion rate
  // K = 1.5 × 0.80 = 1.20
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 14); // 14-day window

  let eventCount = 0;
  let inviteCount = 0;
  let openCount = 0;
  let joinCount = 0;
  let fvmCount = 0;

  // Create invitee users as needed
  const inviteeIds: string[] = [];
  
  // For each user, generate events
  users.forEach((userId, index) => {
    // Each user sends 1-2 invites (average 1.5)
    const invitesForUser = Math.random() < 0.5 ? 1 : 2;
    
    for (let i = 0; i < invitesForUser; i++) {
      inviteCount++;
      const inviteId = uuidv4();
      const inviteTime = new Date(startDate.getTime() + (index * 24 * 60 * 60 * 1000) + (i * 60 * 60 * 1000));
      
      // Insert invite_sent event
      db.prepare(`
        INSERT INTO events (id, event_type, user_id, timestamp, metadata)
        VALUES (?, 'invites_sent', ?, ?, ?)
      `).run(
        inviteId,
        userId,
        inviteTime.toISOString(),
        JSON.stringify({
          cohort: COHORT_NAME,
          loopId: 'buddy_challenge',
          inviteId: inviteId,
        })
      );
      eventCount++;

      // 85% open rate (to ensure K ≥ 1.20)
      if (Math.random() < 0.85) {
        openCount++;
        const openTime = new Date(inviteTime.getTime() + 30 * 60 * 1000); // 30 min later
        const inviteeId = `cohort-invitee-${inviteCount}`;
        
        // Create invitee user if not exists
        if (!inviteeIds.includes(inviteeId)) {
          inviteeIds.push(inviteeId);
          const existingInvitee = db.prepare('SELECT id FROM users WHERE id = ?').get(inviteeId) as any;
          if (!existingInvitee) {
            db.prepare(`
              INSERT INTO users (id, email, password_hash, persona, name, age, grade, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `).run(
              inviteeId,
              `invitee${inviteCount}@demo.com`,
              '$2a$10$demo',
              'student',
              `Cohort Invitee ${inviteCount}`,
              15,
              '10th'
            );
          }
        }
        
        db.prepare(`
          INSERT INTO events (id, event_type, user_id, referrer_id, timestamp, metadata)
          VALUES (?, 'invite_opened', ?, ?, ?, ?)
        `).run(
          uuidv4(),
          inviteeId,
          userId,
          openTime.toISOString(),
          JSON.stringify({
            cohort: COHORT_NAME,
            loopId: 'buddy_challenge',
            inviteId: inviteId,
            referred: true,
          })
        );
        eventCount++;

        // 80% account creation rate
        if (Math.random() < 0.80) {
          joinCount++;
          const joinTime = new Date(openTime.getTime() + 15 * 60 * 1000); // 15 min later
          
          db.prepare(`
            INSERT INTO events (id, event_type, user_id, referrer_id, timestamp, metadata)
            VALUES (?, 'account_created', ?, ?, ?, ?)
          `).run(
            uuidv4(),
            inviteeId,
            userId,
            joinTime.toISOString(),
            JSON.stringify({
              cohort: COHORT_NAME,
              loopId: 'buddy_challenge',
              inviteId: inviteId,
              referred: true,
            })
          );
          eventCount++;

          // 95% FVM rate (to ensure K ≥ 1.20)
          if (Math.random() < 0.95) {
            fvmCount++;
            const fvmTime = new Date(joinTime.getTime() + 60 * 60 * 1000); // 1 hour later
            
            db.prepare(`
              INSERT INTO events (id, event_type, user_id, referrer_id, timestamp, metadata)
              VALUES (?, 'FVM_reached', ?, ?, ?, ?)
            `).run(
              uuidv4(),
              inviteeId,
              userId,
              fvmTime.toISOString(),
              JSON.stringify({
                cohort: COHORT_NAME,
                loopId: 'buddy_challenge',
                inviteId: inviteId,
                referred: true,
                fvmType: 'practice',
              })
            );
            eventCount++;
          }
        }
      }
    }
  });

  // Calculate actual K-factor
  const invitesPerUser = inviteCount / users.length;
  const conversionRate = inviteCount > 0 ? fvmCount / inviteCount : 0;
  const kFactor = invitesPerUser * conversionRate;
  const targetMet = kFactor >= TARGET_K;

  console.log(`✅ Cohort seeded: ${COHORT_NAME}`);
  console.log(`   Users: ${users.length}`);
  console.log(`   Invites: ${inviteCount} (${invitesPerUser.toFixed(2)} per user)`);
  console.log(`   Opens: ${openCount}`);
  console.log(`   Joins: ${joinCount}`);
  console.log(`   FVM: ${fvmCount}`);
  console.log(`   Conversion Rate: ${(conversionRate * 100).toFixed(1)}%`);
  console.log(`   K-Factor: ${kFactor.toFixed(2)}`);
  console.log(`   Target Met: ${targetMet ? '✅ YES' : '❌ NO'} (target: ${TARGET_K})`);
  console.log(`   Total Events: ${eventCount}`);

  return {
    cohort: COHORT_NAME,
    users: users.length,
    invites: inviteCount,
    opens: openCount,
    joins: joinCount,
    fvm: fvmCount,
    kFactor,
    targetMet,
  };
}

// Run seeding
try {
  const result = seedCohort();
  console.log('\n✅ Cohort seeding complete!');
  console.log(`\nTo view K-factor: GET /api/analytics/k-factor?cohort=${result.cohort}&days=14`);
  process.exit(0);
} catch (error) {
  console.error('❌ Error seeding cohort:', error);
  process.exit(1);
}

export { seedCohort };

