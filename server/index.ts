/**
 * XFactor Viral Growth System - API Server
 * 
 * Express server providing REST API for:
 * - User authentication
 * - Dashboard data (presence, leaderboards, activity feed)
 * - Test results
 * - Viral loop execution
 * - Analytics
 */

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
// Lazy import to avoid blocking server start
let initializeSystem: any = null;
let processUserTrigger: any = null;
let Persona: any = null;
let UserTrigger: any = null;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'xfactor-secret-key-change-in-production';

// Initialize viral growth system (lazy load - non-blocking)
let system: any = null;
setTimeout(() => {
  (async () => {
    try {
      const systemModule = await import('../src/index.js');
      initializeSystem = systemModule.initializeSystem;
      processUserTrigger = systemModule.processUserTrigger;
      const typesModule = await import('../src/core/types/index.js');
      Persona = typesModule.Persona;
      UserTrigger = typesModule.UserTrigger;
      
      system = initializeSystem();
      console.log('✅ Viral growth system initialized');
    } catch (error: any) {
      console.error('⚠️ Failed to initialize viral growth system:', error?.message || error);
      console.log('⚠️ Server will continue but viral loops may not work');
    }
  })();
}, 1000); // Delay initialization to ensure server starts first

// Middleware - CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests - must be before other routes
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (origin && ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'].includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.sendStatus(204);
});

app.use(express.json());

// Database connection
const db = new Database('xfactor.db');
db.pragma('foreign_keys = ON');

// Auth middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    (req as any).user = user;
    next();
  });
};

// ==================== AUTH ENDPOINTS ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, persona: user.persona },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      persona: user.persona,
      age: user.age,
      grade: user.grade,
    },
  });
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const userData = db.prepare('SELECT id, email, name, persona, age, grade FROM users WHERE id = ?').get(user.userId) as any;
  res.json(userData);
});

// ==================== DASHBOARD ENDPOINTS ====================

// Get presence data
app.get('/api/presence', authenticateToken, (req, res) => {
  const { subject } = req.query;
  
  let query = 'SELECT COUNT(*) as count FROM presence WHERE is_online = 1';
  const params: any[] = [];
  
  if (subject) {
    query += ' AND subject = ?';
    params.push(subject);
  }
  
  const result = db.prepare(query).get(...params) as any;
  res.json({
    count: result.count,
    subject: subject || 'all',
    activity: 'practicing',
  });
});

// Get leaderboard
app.get('/api/leaderboard', authenticateToken, (req, res) => {
  const { subject = 'Algebra', period = 'weekly' } = req.query;
  
  const entries = db
    .prepare(`
      SELECT 
        le.rank,
        le.user_id as userId,
        le.score,
        u.name,
        u.persona,
        CASE WHEN u.age < 13 THEN 1 ELSE 0 END as anonymous
      FROM leaderboard_entries le
      JOIN users u ON le.user_id = u.id
      WHERE le.subject = ? AND le.period = ?
      ORDER BY le.rank
      LIMIT 10
    `)
    .all(subject, period) as any[];

  res.json(entries);
});

// Get activity feed
app.get('/api/activity', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const { limit = 10 } = req.query;
  
  const activities = db
    .prepare(`
      SELECT 
        id,
        activity_type as type,
        title,
        description,
        created_at as timestamp
      FROM activity_feed
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `)
    .all(user.userId, limit) as any[];

  res.json(activities);
});

// Get test results
app.get('/api/test-results', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const { limit = 5 } = req.query;
  
  const results = db
    .prepare(`
      SELECT 
        id,
        subject,
        test_type,
        score,
        correct,
        total,
        percentile,
        rank,
        total_participants,
        completed_at
      FROM test_results
      WHERE user_id = ?
      ORDER BY completed_at DESC
      LIMIT ?
    `)
    .all(user.userId, limit) as any[];

  res.json(results);
});

// Get latest test result
app.get('/api/test-results/latest', authenticateToken, (req, res) => {
  const user = (req as any).user;
  
  const result = db
    .prepare(`
      SELECT 
        id,
        subject,
        test_type,
        score,
        correct,
        total,
        percentile,
        rank,
        total_participants,
        completed_at
      FROM test_results
      WHERE user_id = ?
      ORDER BY completed_at DESC
      LIMIT 1
    `)
    .get(user.userId) as any;

  if (!result) {
    return res.status(404).json({ error: 'No test results found' });
  }

  res.json(result);
});

// ==================== ANALYTICS ENDPOINTS ====================

// Get K-factor metrics
app.get('/api/analytics/k-factor', authenticateToken, (req, res) => {
  const { cohort = 'all', days = 14 } = req.query;
  
  // Calculate from events
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));
  
  const invites = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE event_type = 'invites_sent'
      AND timestamp >= ?
    `)
    .get(startDate.toISOString()) as any;

  const joins = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE event_type = 'account_created'
      AND timestamp >= ?
    `)
    .get(startDate.toISOString()) as any;

  const users = db
    .prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM events
      WHERE event_type = 'invites_sent'
      AND timestamp >= ?
    `)
    .get(startDate.toISOString()) as any;

  const invitesPerUser = users.count > 0 ? invites.count / users.count : 0;
  const conversionRate = invites.count > 0 ? joins.count / invites.count : 0;
  const kFactor = invitesPerUser * conversionRate;

  res.json({
    cohort: cohort as string,
    invitesPerUser,
    conversionRate,
    kFactor,
    targetMet: kFactor >= 1.20,
    timeRange: {
      start: startDate.toISOString(),
      end: new Date().toISOString(),
    },
  });
});

// Get loop performance metrics
app.get('/api/analytics/loops', authenticateToken, (req, res) => {
  const { days = 14 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const loops = db
    .prepare(`
      SELECT 
        loop_id as loopId,
        COUNT(DISTINCT CASE WHEN event_type = 'invites_sent' THEN user_id END) as totalInvites,
        COUNT(DISTINCT CASE WHEN event_type = 'invite_opened' THEN user_id END) as totalOpens,
        COUNT(DISTINCT CASE WHEN event_type = 'account_created' THEN user_id END) as totalJoins,
        COUNT(DISTINCT CASE WHEN event_type = 'FVM_reached' THEN user_id END) as totalFVM
      FROM events
      WHERE timestamp >= ?
      AND loop_id IS NOT NULL
      GROUP BY loop_id
    `)
    .all(startDate.toISOString()) as any[];

  const metrics = loops.map((loop) => ({
    loopId: loop.loopId,
    totalInvites: loop.totalInvites || 0,
    totalOpens: loop.totalOpens || 0,
    totalJoins: loop.totalJoins || 0,
    totalFVM: loop.totalFVM || 0,
    conversionRate: loop.totalInvites > 0 ? (loop.totalFVM || 0) / loop.totalInvites : 0,
    timeRange: {
      start: startDate.toISOString(),
      end: new Date().toISOString(),
    },
  }));

  res.json(metrics);
});

// Get guardrail metrics
app.get('/api/analytics/guardrails', authenticateToken, (req, res) => {
  const { days = 7 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));

  const totalEvents = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE timestamp >= ?
    `)
    .get(startDate.toISOString()) as any;

  const complaints = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE event_type = 'complaint_filed'
      AND timestamp >= ?
    `)
    .get(startDate.toISOString()) as any;

  const optOuts = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE event_type = 'opt_out'
      AND timestamp >= ?
    `)
    .get(startDate.toISOString()) as any;

  const fraud = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE event_type = 'fraud_detected'
      AND timestamp >= ?
    `)
    .get(startDate.toISOString()) as any;

  const total = totalEvents.count || 1;
  const complaintRate = complaints.count / total;
  const optOutRate = optOuts.count / total;
  const fraudRate = fraud.count / total;

  const healthy = complaintRate <= 0.01 && optOutRate <= 0.01 && fraudRate <= 0.005;

  res.json({
    complaintRate,
    optOutRate,
    fraudRate,
    supportTickets: 0, // Would query support system
    healthy,
    timeRange: {
      start: startDate.toISOString(),
      end: new Date().toISOString(),
    },
  });
});

// ==================== REWARD ENDPOINTS ====================

// Get user rewards
app.get('/api/rewards', authenticateToken, (req, res) => {
  const user = (req as any).user;
  
  const rewards = db
    .prepare(`
      SELECT 
        id,
        reward_type,
        amount,
        description,
        status,
        allocated_at,
        claimed_at,
        redeemed_at
      FROM rewards
      WHERE user_id = ?
      ORDER BY allocated_at DESC
    `)
    .all(user.userId) as any[];

  res.json(rewards);
});

// Claim reward
app.post('/api/rewards/:id/claim', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const { id } = req.params;

  const reward = db
    .prepare('SELECT * FROM rewards WHERE id = ? AND user_id = ?')
    .get(id, user.userId) as any;

  if (!reward) {
    return res.status(404).json({ error: 'Reward not found' });
  }

  if (reward.status !== 'allocated') {
    return res.status(400).json({ error: 'Reward already claimed or redeemed' });
  }

  db.prepare(`
    UPDATE rewards
    SET status = 'claimed', claimed_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).run(id, user.userId);

  res.json({ success: true, message: 'Reward claimed successfully' });
});

// ==================== VIRAL LOOP ENDPOINTS ====================

// Trigger viral loop
app.post('/api/viral-loops/trigger', authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const { trigger, context } = req.body;

  if (!system) {
    return res.status(503).json({
      success: false,
      error: 'Viral growth system not initialized',
    });
  }

  try {
    // Map trigger string to UserTrigger enum
    const triggerMap: Record<string, UserTrigger> = {
      'session_complete': UserTrigger.SESSION_COMPLETE,
      'results_page_view': UserTrigger.RESULTS_PAGE_VIEW,
      'badge_earned': UserTrigger.BADGE_EARNED,
      'streak_preserved': UserTrigger.STREAK_PRESERVED,
      'streak_at_risk': UserTrigger.STREAK_AT_RISK,
      'class_recorded': UserTrigger.CLASS_RECORDED,
      'club_joined': UserTrigger.CLUB_JOINED,
      'milestone_reached': UserTrigger.MILESTONE_REACHED,
      'weekly_recap': UserTrigger.MILESTONE_REACHED,
    };

    const userTrigger = triggerMap[trigger] || UserTrigger.SESSION_COMPLETE;
    const persona = Persona[user.persona.toUpperCase() as keyof typeof Persona] || Persona.STUDENT;

    // Process trigger through actual viral loop system
    const results = await processUserTrigger(
      system,
      user.userId,
      userTrigger,
      persona,
      {
        subject: context?.subject || 'Algebra',
        age: user.age || 15,
        grade: user.grade || '10th',
        practiceScore: context?.practiceScore || 85,
        practiceSubject: context?.subject || 'Algebra',
        practiceSkill: context?.skill || 'Equations',
        recentLoops: [],
        inviteCount: 0,
        preferences: {
          optedOut: false,
        },
        ...context,
      }
    );

    // Process results - check if any loops executed successfully
    const successfulLoops = results.filter((r: any) => r.success && r.invite);
    
    if (successfulLoops.length > 0) {
      const firstLoop = successfulLoops[0];
      const loopId = context?.loopId || 'buddy_challenge';
      const loopExecutionId = uuidv4();
      
      db.prepare(`
        INSERT INTO loop_executions (id, loop_id, trigger_user_id, status, created_at)
        VALUES (?, ?, ?, 'pending', datetime('now'))
      `).run(loopExecutionId, loopId, user.userId);

      // Store invite if available
      if (firstLoop.invite) {
        db.prepare(`
          INSERT INTO invites (id, sender_id, recipient_email, loop_execution_id, channel, status, sent_at)
          VALUES (?, ?, ?, ?, ?, 'sent', datetime('now'))
        `).run(
          firstLoop.invite.inviteId,
          user.userId,
          context?.recipientEmail || 'friend@example.com',
          loopExecutionId,
          firstLoop.invite.channel || 'link'
        );
      }

      res.json({
        success: true,
        loopExecutionId,
        loopId,
        invite: firstLoop.invite,
        message: 'Viral loop triggered successfully',
      });
    } else {
      res.json({
        success: false,
        message: 'No loops executed (throttled or not eligible)',
        errors: results.map((r: any) => r.error || r.rationale),
      });
    }
  } catch (error: any) {
    console.error('Error triggering viral loop:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to trigger viral loop',
    });
  }
});

// Create invite
app.post('/api/invites', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const { recipientEmail, loopExecutionId, channel } = req.body;

  const inviteId = uuidv4();
  
  db.prepare(`
    INSERT INTO invites (id, sender_id, recipient_email, loop_execution_id, channel, status, sent_at)
    VALUES (?, ?, ?, ?, ?, 'sent', datetime('now'))
  `).run(inviteId, user.userId, recipientEmail, loopExecutionId, channel);

  // Log event
  db.prepare(`
    INSERT INTO events (id, event_type, user_id, timestamp)
    VALUES (?, 'invites_sent', ?, datetime('now'))
  `).run(uuidv4(), user.userId);

  res.json({
    success: true,
    inviteId,
    message: 'Invite sent successfully',
  });
});

// ==================== SESSION INTELLIGENCE ENDPOINTS ====================

// Process session for intelligence
app.post('/api/session-intelligence/process', authenticateToken, async (req, res) => {
  const user = (req as any).user;
  const { sessionId, tutorId, metadata } = req.body;

  if (!system || !system.sessionIntelligence) {
    return res.status(503).json({
      success: false,
      error: 'Session intelligence system not initialized',
    });
  }

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'sessionId is required',
    });
  }

  try {
    const persona = Persona[user.persona.toUpperCase() as keyof typeof Persona] || Persona.STUDENT;
    
    const result = await system.sessionIntelligence.processSession({
      sessionId,
      userId: user.userId,
      persona,
      tutorId,
      metadata,
    });

    res.json({
      success: result.success,
      sessionId: result.sessionId,
      agenticActionsTriggered: result.agenticActionsTriggered,
      viralLoopsTriggered: result.viralLoopsTriggered,
      summary: result.summary,
      error: result.error,
    });
  } catch (error: any) {
    console.error('Error processing session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process session',
    });
  }
});

// ==================== SMART LINK RESOLUTION ====================

// Resolve smart link (short code to full URL with tracking)
app.get('/api/smart-links/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  const { ref, utm_source, utm_medium, utm_campaign } = req.query;

  if (!system || !system.smartLinkService) {
    return res.status(503).json({
      success: false,
      error: 'Smart link service not initialized',
    });
  }

  try {
    const link = system.smartLinkService.resolveLink(shortCode);
    
    if (!link) {
      return res.status(404).json({
        success: false,
        error: 'Link not found',
      });
    }

    // Track link click
    if (link.userId) {
      db.prepare(`
        INSERT INTO events (id, event_type, user_id, timestamp, metadata)
        VALUES (?, 'invite_opened', ?, datetime('now'), ?)
      `).run(
        uuidv4(),
        link.userId,
        JSON.stringify({
          shortCode,
          loopId: link.metadata?.loopId,
          ref,
          utm_source,
          utm_medium,
          utm_campaign,
        })
      );
    }

    // Redirect to full URL (or return for frontend to handle)
    res.json({
      success: true,
      url: link.url,
      loopId: link.metadata?.loopId,
      fvmType: link.metadata?.fvmType,
      context: link.metadata?.context,
    });
  } catch (error: any) {
    console.error('Error resolving smart link:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to resolve link',
    });
  }
});

// ==================== COHORT ENDPOINTS ====================

// Get cohort rooms
// Get parent dashboard data (child progress)
app.get('/api/parent/progress', authenticateToken, (req, res) => {
  const user = (req as any).user;
  
  if (user.persona !== 'parent') {
    return res.status(403).json({ error: 'Access denied. Parent persona required.' });
  }

  // Get child's user ID from metadata or separate children table
  // For now, we'll use the first child linked to this parent
  // In production, this would be a proper parent-child relationship
  const childUsers = db
    .prepare(`
      SELECT id, name, age, grade, subject_preferences
      FROM users
      WHERE persona = 'student'
      ORDER BY created_at DESC
      LIMIT 1
    `)
    .all() as any[];

  if (childUsers.length === 0) {
    return res.json({
      childName: 'Student',
      weeklySessions: 0,
      improvement: 0,
      currentStreak: 0,
      achievements: [],
      subjectProgress: [],
    });
  }

  const childId = childUsers[0].id;
  const childName = childUsers[0].name || 'Student';

  // Calculate weekly sessions
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklySessions = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE user_id = ? 
      AND event_type IN ('session_started', 'practice_completed')
      AND timestamp >= ?
    `)
    .get(childId, weekAgo.toISOString()) as any;

  // Get current streak (from events)
  const streakEvents = db
    .prepare(`
      SELECT COUNT(DISTINCT DATE(timestamp)) as days
      FROM events
      WHERE user_id = ?
      AND event_type = 'practice_completed'
      AND timestamp >= datetime('now', '-30 days')
      ORDER BY timestamp DESC
    `)
    .get(childId) as any;

  // Get test results for improvement calculation
  const recentResults = db
    .prepare(`
      SELECT subject, score, completed_at
      FROM test_results
      WHERE user_id = ?
      ORDER BY completed_at DESC
      LIMIT 10
    `)
    .all(childId) as any[];

  // Calculate improvement (compare last 2 results)
  let improvement = 0;
  if (recentResults.length >= 2) {
    const latest = recentResults[0].score;
    const previous = recentResults[1].score;
    improvement = latest - previous;
  }

  // Get subject progress
  const subjectProgress = db
    .prepare(`
      SELECT 
        subject,
        AVG(score) as avg_score,
        MAX(score) as max_score,
        MIN(score) as min_score
      FROM test_results
      WHERE user_id = ?
      GROUP BY subject
      ORDER BY avg_score DESC
    `)
    .all(childId) as any[];

  // Get achievements (from activity feed)
  const achievements = db
    .prepare(`
      SELECT DISTINCT title
      FROM activity_feed
      WHERE user_id = ?
      AND activity_type = 'achievement'
      ORDER BY created_at DESC
      LIMIT 5
    `)
    .all(childId) as any[];

  res.json({
    childName,
    weeklySessions: weeklySessions?.count || 0,
    improvement: Math.max(0, improvement),
    currentStreak: streakEvents?.days || 0,
    achievements: achievements.map((a: any) => a.title),
    subjectProgress: subjectProgress.map((s: any) => ({
      subject: s.subject,
      score: Math.round(s.avg_score),
      trend: 'up', // Could calculate from recent trends
    })),
  });
});

// Get tutor dashboard data
app.get('/api/tutor/stats', authenticateToken, (req, res) => {
  const user = (req as any).user;
  
  if (user.persona !== 'tutor') {
    return res.status(403).json({ error: 'Access denied. Tutor persona required.' });
  }

  // Get total sessions (from events)
  const totalSessions = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE user_id = ?
      AND event_type = 'session_completed'
    `)
    .get(user.userId) as any;

  // Get this week's sessions
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeekSessions = db
    .prepare(`
      SELECT COUNT(*) as count
      FROM events
      WHERE user_id = ?
      AND event_type = 'session_completed'
      AND timestamp >= ?
    `)
    .get(user.userId, weekAgo.toISOString()) as any;

  // Get referrals (from loop executions where tutor is referrer)
  const referrals = db
    .prepare(`
      SELECT COUNT(DISTINCT invitee_id) as total,
             SUM(CASE WHEN fvm_reached = 1 THEN 1 ELSE 0 END) as conversions
      FROM loop_executions
      WHERE trigger_user_id = ?
      AND loop_id = 'tutor_spotlight'
    `)
    .get(user.userId) as any;

  // Calculate referral credits (from rewards)
  const referralCredits = db
    .prepare(`
      SELECT SUM(amount) as total
      FROM rewards
      WHERE user_id = ?
      AND reward_type = 'referral_credit'
    `)
    .get(user.userId) as any;

  // Get average rating (from metadata or events)
  // For now, we'll use a default or calculate from events
  const averageRating = 4.9; // Would come from ratings table in production

  // Get recent ratings (mock structure for now)
  const recentRatings: any[] = []; // Would query ratings table

  res.json({
    totalSessions: totalSessions?.count || 0,
    averageRating,
    totalReferrals: referrals?.total || 0,
    referralConversions: referrals?.conversions || 0,
    referralCredits: referralCredits?.total || 0,
    thisWeekSessions: thisWeekSessions?.count || 0,
    recentRatings,
  });
});

// Get cohort analysis data
app.get('/api/analytics/cohorts', authenticateToken, (req, res) => {
  const { cohort = '2025-01', days = 30 } = req.query;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(days));
  
  // Get referred users (from events where referrer_id is set)
  const referred = db
    .prepare(`
      SELECT 
        COUNT(DISTINCT user_id) as total_users,
        SUM(CASE WHEN event_type = 'fvm_reached' THEN 1 ELSE 0 END) as fvm_count
      FROM events
      WHERE referrer_id IS NOT NULL
      AND timestamp >= ?
    `)
    .get(startDate.toISOString()) as any;

  // Get baseline users (no referrer)
  const baseline = db
    .prepare(`
      SELECT 
        COUNT(DISTINCT user_id) as total_users,
        SUM(CASE WHEN event_type = 'fvm_reached' THEN 1 ELSE 0 END) as fvm_count
      FROM events
      WHERE referrer_id IS NULL
      AND timestamp >= ?
    `)
    .get(startDate.toISOString()) as any;

  // Calculate retention (D1, D7, D28)
  // This would need more complex queries in production
  const referredD1 = 0.65; // Placeholder - would calculate from actual retention data
  const referredD7 = 0.55;
  const referredD28 = 0.45;
  const baselineD1 = 0.55;
  const baselineD7 = 0.45;
  const baselineD28 = 0.35;

  const fvmRate = referred.total_users > 0 ? referred.fvm_count / referred.total_users : 0;
  const baselineFvmRate = baseline.total_users > 0 ? baseline.fvm_count / baseline.total_users : 0;

  res.json({
    cohort,
    referred: {
      totalUsers: referred.total_users || 0,
      fvmRate,
      d1Retention: referredD1,
      d7Retention: referredD7,
      d28Retention: referredD28,
    },
    baseline: {
      totalUsers: baseline.total_users || 0,
      fvmRate: baselineFvmRate,
      d1Retention: baselineD1,
      d7Retention: baselineD7,
      d28Retention: baselineD28,
    },
    uplift: {
      fvm: fvmRate - baselineFvmRate,
      d1: referredD1 - baselineD1,
      d7: referredD7 - baselineD7,
      d28: referredD28 - baselineD28,
    },
  });
});

app.get('/api/cohorts', authenticateToken, (req, res) => {
  const user = (req as any).user;
  
  // Mock cohort data - in production, this would query actual cohort memberships
  const cohorts = [
    {
      name: 'Algebra Study Group',
      subject: 'Algebra',
      members: [
        { userId: 'student-1', online: true },
        { userId: 'student-2', online: true },
        { userId: 'student-3', online: false },
      ],
      activeCount: 2,
      totalCount: 3,
    },
  ];

  res.json(cohorts);
});

// Debug: List all registered routes
const routes: string[] = [];
app._router?.stack.forEach((middleware: any) => {
  if (middleware.route) {
    routes.push(`${Object.keys(middleware.route.methods)[0].toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler: any) => {
      if (handler.route) {
        routes.push(`${Object.keys(handler.route.methods)[0].toUpperCase()} ${handler.route.path}`);
      }
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 XFactor API Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: xfactor.db`);
  console.log(`📋 Registered routes: ${routes.length}`);
  if (routes.length > 0) {
    console.log('Routes:', routes.slice(0, 10).join(', '), routes.length > 10 ? '...' : '');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  db.close();
  process.exit(0);
});

