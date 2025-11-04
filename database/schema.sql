-- XFactor Viral Growth System - Database Schema
-- SQLite compatible (can be migrated to PostgreSQL)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    persona TEXT NOT NULL CHECK (persona IN ('student', 'parent', 'tutor')),
    name TEXT,
    age INTEGER,
    grade TEXT,
    subject_preferences TEXT, -- JSON array
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    opted_out BOOLEAN DEFAULT 0,
    parent_consent BOOLEAN DEFAULT 0,
    metadata TEXT -- JSON for additional data
);

-- Events Table (for analytics)
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id TEXT,
    referrer_id TEXT,
    loop_id TEXT,
    metadata TEXT, -- JSON
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (referrer_id) REFERENCES users(id)
);

-- Viral Loop Executions
CREATE TABLE IF NOT EXISTS loop_executions (
    id TEXT PRIMARY KEY,
    loop_id TEXT NOT NULL,
    trigger_user_id TEXT NOT NULL,
    invitee_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'opened', 'completed', 'expired')),
    smart_link_code TEXT,
    reward_allocated BOOLEAN DEFAULT 0,
    fvm_reached BOOLEAN DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    FOREIGN KEY (trigger_user_id) REFERENCES users(id),
    FOREIGN KEY (invitee_id) REFERENCES users(id)
);

-- Smart Links
CREATE TABLE IF NOT EXISTS smart_links (
    code TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    referrer_id TEXT,
    loop_id TEXT NOT NULL,
    persona TEXT NOT NULL,
    fvm_type TEXT NOT NULL,
    deep_link_url TEXT NOT NULL,
    full_url TEXT NOT NULL,
    click_count INTEGER DEFAULT 0,
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (referrer_id) REFERENCES users(id)
);

-- Invites
CREATE TABLE IF NOT EXISTS invites (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    recipient_email TEXT,
    recipient_id TEXT,
    loop_execution_id TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'link', 'in_app')),
    status TEXT NOT NULL CHECK (status IN ('sent', 'opened', 'clicked', 'converted', 'expired')),
    sent_at TEXT NOT NULL DEFAULT (datetime('now')),
    opened_at TEXT,
    clicked_at TEXT,
    converted_at TEXT,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id),
    FOREIGN KEY (loop_execution_id) REFERENCES loop_executions(id)
);

-- Rewards
CREATE TABLE IF NOT EXISTS rewards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    loop_execution_id TEXT,
    reward_type TEXT NOT NULL,
    amount INTEGER,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'allocated', 'claimed', 'redeemed')),
    allocated_at TEXT NOT NULL DEFAULT (datetime('now')),
    claimed_at TEXT,
    redeemed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (loop_execution_id) REFERENCES loop_executions(id)
);

-- Presence Tracking
CREATE TABLE IF NOT EXISTS presence (
    user_id TEXT PRIMARY KEY,
    subject TEXT,
    is_online BOOLEAN DEFAULT 1,
    last_seen TEXT NOT NULL DEFAULT (datetime('now')),
    activity_type TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    score INTEGER NOT NULL,
    metric_type TEXT NOT NULL,
    period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
    rank INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Test Results
CREATE TABLE IF NOT EXISTS test_results (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    test_type TEXT NOT NULL,
    score INTEGER NOT NULL,
    correct INTEGER NOT NULL,
    total INTEGER NOT NULL,
    percentile INTEGER,
    rank INTEGER,
    total_participants INTEGER,
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Activity Feed
CREATE TABLE IF NOT EXISTS activity_feed (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata TEXT, -- JSON
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_loop_executions_trigger_user ON loop_executions(trigger_user_id);
CREATE INDEX IF NOT EXISTS idx_loop_executions_status ON loop_executions(status);
CREATE INDEX IF NOT EXISTS idx_invites_sender ON invites(sender_id);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_presence_online ON presence(is_online);
CREATE INDEX IF NOT EXISTS idx_leaderboard_subject_period ON leaderboard_entries(subject, period);
CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results(user_id);

