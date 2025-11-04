/**
 * "Alive" Layer Example
 * 
 * Demonstrates presence signals, activity feeds, leaderboards, and cohort rooms.
 */

import { initializeSystem } from '../index.js';
import { Persona } from '../core/types/index.js';

async function demonstrateAliveLayer() {
  console.log('✨ "Alive" Layer - Example\n');

  // Initialize system
  const system = initializeSystem();
  console.log('✅ System initialized');
  console.log('');

  // Example 1: Presence Signals
  console.log('👥 Example 1: Presence Signals');
  console.log('─'.repeat(60));
  
  // Simulate users practicing
  system.aliveService.updatePresence(
    'student-1',
    Persona.STUDENT,
    'practicing',
    'Algebra',
    { age: 15, grade: '10' }
  );
  system.aliveService.updatePresence(
    'student-2',
    Persona.STUDENT,
    'practicing',
    'Algebra',
    { age: 16, grade: '11' }
  );
  system.aliveService.updatePresence(
    'student-3',
    Persona.STUDENT,
    'practicing',
    'Geometry',
    { age: 14, grade: '9' }
  );

  const presenceStatus = system.aliveService.getAliveStatus('student-1', 'Algebra', 15);
  console.log(`Presence message: "${presenceStatus.presence.message}"`);
  console.log(`Active users: ${presenceStatus.presence.count}`);
  console.log('');

  // Example 2: Activity Feed
  console.log('📰 Example 2: Activity Feed');
  console.log('─'.repeat(60));
  
  // Add some activities
  system.activityFeedService.addActivity({
    userId: 'student-1',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    description: 'Earned achievement: Practice Master',
    privacySafe: true,
    metadata: { subject: 'Algebra', achievement: 'Practice Master' },
  });

  system.activityFeedService.addActivity({
    userId: 'student-2',
    type: 'streak',
    title: 'Streak Maintained!',
    description: 'Maintained 7-day streak',
    privacySafe: true,
    metadata: { streakDays: 7, subject: 'Math' },
  });

  system.activityFeedService.addActivity({
    userId: 'student-3',
    type: 'challenge',
    title: 'Challenge Created',
    description: 'Created Buddy Challenge',
    privacySafe: true,
    metadata: { subject: 'Geometry' },
  });

  const feed = system.aliveService.getActivityFeed({ limit: 5 });
  console.log(`Activity feed (${feed.length} items):`);
  feed.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.title}: ${item.description}`);
  });
  console.log('');

  // Example 3: Leaderboards
  console.log('🏆 Example 3: Mini-Leaderboards');
  console.log('─'.repeat(60));
  
  // Update scores
  system.leaderboardService.updateScore('student-1', 'practice', 150, 'Algebra', '13-17');
  system.leaderboardService.updateScore('student-2', 'practice', 200, 'Algebra', '13-17');
  system.leaderboardService.updateScore('student-3', 'practice', 100, 'Geometry', '13-17');
  system.leaderboardService.updateScore('student-4', 'practice', 180, 'Algebra', '13-17');

  const leaderboard = system.aliveService.getLeaderboard({
    subject: 'Algebra',
    metric: 'practice',
    timeWindow: 'weekly',
    limit: 5,
  });

  console.log('Algebra Practice Leaderboard:');
  leaderboard.forEach((entry) => {
    console.log(`  ${entry.rank}. ${entry.anonymous ? 'Anonymous' : entry.userId}: ${entry.score} points`);
  });

  const stats = system.leaderboardService.getStats('Algebra');
  console.log(`\nStats: ${stats.totalParticipants} participants, top score: ${stats.topScore}, avg: ${stats.averageScore}`);
  console.log('');

  // Example 4: Cohort Rooms
  console.log('👥 Example 4: Cohort Rooms');
  console.log('─'.repeat(60));
  
  const room = system.cohortService.createRoom({
    name: 'Algebra Study Group',
    subject: 'Algebra',
    description: 'Weekly algebra practice group',
    members: ['student-1'],
    createdBy: 'student-1',
    metadata: { grade: '10', topic: 'Quadratic Equations' },
  });

  system.cohortService.joinRoom(room.roomId, 'student-2');
  system.cohortService.joinRoom(room.roomId, 'student-3');
  
  // Update presence in room
  system.cohortService.updatePresence(room.roomId, 'student-1', true);
  system.cohortService.updatePresence(room.roomId, 'student-2', true);

  const presence = system.cohortService.getRoomPresence(room.roomId);
  console.log(`Cohort Room: ${room.name}`);
  console.log(`  Total members: ${presence?.totalMembers}`);
  console.log(`  Active now: ${presence?.presenceCount}`);
  console.log(`  Subject: ${room.subject}`);
  console.log('');

  // Example 5: Friends Online
  console.log('👫 Example 5: Friends Online');
  console.log('─'.repeat(60));
  
  // Add friend connections
  system.presenceService.addFriend('student-1', 'student-2');
  system.presenceService.addFriend('student-1', 'student-3');
  
  // Update presence for friends
  system.aliveService.updatePresence(
    'student-2',
    Persona.STUDENT,
    'practicing',
    'Algebra',
    { age: 16 }
  );

  const friendsOnline = system.aliveService.getFriendsOnline('student-1');
  const onlineFriends = friendsOnline.filter((f) => f.online);
  console.log(`Friends online: ${onlineFriends.length}/${friendsOnline.length}`);
  onlineFriends.forEach((friend) => {
    console.log(`  - ${friend.userId} is ${friend.currentActivity} ${friend.subject || ''}`);
  });
  console.log('');

  // Example 6: Complete Alive Status
  console.log('🌟 Example 6: Complete Alive Status');
  console.log('─'.repeat(60));
  const aliveStatus = system.aliveService.getAliveStatus('student-1', 'Algebra', 15);
  console.log('Alive Status:');
  console.log(`  Presence: ${aliveStatus.presence.message}`);
  console.log(`  Friends online: ${aliveStatus.friendsOnline}`);
  console.log(`  Recent activity: ${aliveStatus.recentActivity} items`);
  console.log(`  Leaderboard rank: ${aliveStatus.leaderboardRank || 'N/A'}`);
  console.log(`  Cohort rooms: ${aliveStatus.cohortRooms}`);
  console.log('');

  console.log('✅ "Alive" Layer operational!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateAliveLayer().catch(console.error);
}

