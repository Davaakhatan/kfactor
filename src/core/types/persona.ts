/**
 * User Persona Types
 */

export enum Persona {
  STUDENT = 'student',
  PARENT = 'parent',
  TUTOR = 'tutor',
}

export enum UserTrigger {
  SESSION_COMPLETE = 'session_complete',
  BADGE_EARNED = 'badge_earned',
  STREAK_PRESERVED = 'streak_preserved',
  RESULTS_PAGE_VIEW = 'results_page_view',
  STREAK_AT_RISK = 'streak_at_risk',
  CLASS_RECORDED = 'class_recorded',
  CLUB_JOINED = 'club_joined',
  MILESTONE_REACHED = 'milestone_reached',
}

export enum ViralLoop {
  BUDDY_CHALLENGE = 'buddy_challenge',
  RESULTS_RALLY = 'results_rally',
  PROUD_PARENT = 'proud_parent',
  TUTOR_SPOTLIGHT = 'tutor_spotlight',
  CLASS_WATCH_PARTY = 'class_watch_party',
  STREAK_RESCUE = 'streak_rescue',
  SUBJECT_CLUBS = 'subject_clubs',
  ACHIEVEMENT_SPOTLIGHT = 'achievement_spotlight',
}

export enum RewardType {
  AI_TUTOR_MINUTES = 'ai_tutor_minutes',
  CLASS_PASS = 'class_pass',
  GEM_BOOST = 'gem_boost',
  XP_BOOST = 'xp_boost',
  STREAK_SHIELD = 'streak_shield',
  PRACTICE_POWER_UP = 'practice_power_up',
}

export enum Channel {
  IN_APP = 'in_app',
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
}

