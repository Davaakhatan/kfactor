/**
 * Event Types for Analytics
 */

export enum EventType {
  // Invite events
  INVITE_SENT = 'invites_sent',
  INVITE_OPENED = 'invite_opened',
  INVITE_CLICKED = 'invite_clicked',
  INVITE_VIEWED = 'invite_viewed',
  
  // Conversion events
  ACCOUNT_CREATED = 'account_created',
  SIGNUP_STARTED = 'signup_started',
  SIGNUP_COMPLETED = 'signup_completed',
  
  // Value events
  FVM_REACHED = 'FVM_reached',
  FIRST_CORRECT_PRACTICE = 'first_correct_practice',
  FIRST_AI_TUTOR_MINUTE = 'first_ai_tutor_minute',
  FIRST_SESSION = 'first_session',
  FIRST_PRACTICE = 'first_practice',
  
  // Reward events
  REWARD_CLAIMED = 'reward_claimed',
  REWARD_REDEEMED = 'reward_redeemed',
  
  // Loop events
  LOOP_TRIGGERED = 'loop_triggered',
  LOOP_COMPLETED = 'loop_completed',
  
  // Guardrail events
  COMPLAINT_FILED = 'complaint_filed',
  OPT_OUT = 'opt_out',
  ABUSE_REPORT = 'abuse_report',
  FRAUD_DETECTED = 'fraud_detected',
  SUPPORT_TICKET = 'support_ticket',
}

export interface BaseEvent {
  eventType: EventType;
  userId: string;
  timestamp: string;
  requestId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface InviteEvent extends BaseEvent {
  eventType: EventType.INVITE_SENT | EventType.INVITE_OPENED | EventType.INVITE_CLICKED;
  inviteeId?: string;
  inviteCode: string;
  loopId: ViralLoop;
  channel: Channel;
}

export interface ConversionEvent extends BaseEvent {
  eventType: EventType.ACCOUNT_CREATED | EventType.SIGNUP_STARTED | EventType.SIGNUP_COMPLETED;
  inviteCode?: string;
  referrerId?: string;
}

export interface FVMEvent extends BaseEvent {
  eventType: EventType.FVM_REACHED | EventType.FIRST_CORRECT_PRACTICE | EventType.FIRST_AI_TUTOR_MINUTE;
  inviteCode?: string;
  referrerId?: string;
  fvmType: 'practice' | 'ai_tutor' | 'session';
}

export type ViralEvent = InviteEvent | ConversionEvent | FVMEvent | BaseEvent;

