/**
 * Trust & Safety Agent
 * 
 * Fraud detection, COPPA/FERPA-aware redaction, duplicate device/email checks,
 * rate-limits, report/undo mechanisms.
 */

import { BaseAgent, AgentRequest, AgentResponse } from '../../core/mcp/agent-base.js';
import { Persona } from '../../core/types/index.js';

export interface TrustSafetyRequest extends AgentRequest {
  action: 'check_fraud' | 'redact_pii' | 'check_duplicate' | 'rate_limit' | 'report' | 'undo';
  userId: string;
  context: {
    email?: string;
    deviceId?: string;
    ipAddress?: string;
    age?: number;
    content?: string;
    actionType?: string;
    reportId?: string;
  };
}

export interface TrustSafetyResponse extends AgentResponse {
  data?: {
    allowed?: boolean;
    riskScore?: number;
    redactedContent?: string;
    duplicateDetected?: boolean;
    rateLimited?: boolean;
    retryAfter?: number;
    reportId?: string;
    reason?: string;
  };
}

export class TrustSafetyAgent extends BaseAgent {
  private readonly MAX_INVITES_PER_DAY = 5;
  private readonly MAX_INVITES_PER_HOUR = 3;
  private readonly MIN_AGE_COPPA = 13;

  // Tracking (in production, would be in database)
  private deviceHistory: Map<string, Set<string>> = new Map(); // deviceId -> Set of userIds
  private emailHistory: Map<string, Set<string>> = new Map(); // email -> Set of userIds
  private rateLimits: Map<string, {
    invites: number;
    lastReset: string;
  }> = new Map();
  private reports: Map<string, {
    userId: string;
    reason: string;
    timestamp: string;
    resolved: boolean;
  }> = new Map();

  constructor() {
    super({
      name: 'trust-safety',
      version: '1.0.0',
      maxLatencyMs: 150,
      enableCaching: true,
      fallbackEnabled: true,
    });
  }

  async process(request: AgentRequest): Promise<AgentResponse> {
    this.startTiming();

    if (!this.validateRequest(request)) {
      return this.createErrorResponse(
        request.requestId,
        { code: 'INVALID_REQUEST', message: 'Request validation failed' },
        'Request missing required fields'
      );
    }

    const safetyRequest = request as TrustSafetyRequest;

    try {
      switch (safetyRequest.action) {
        case 'check_fraud':
          return this.checkFraud(safetyRequest);
        case 'redact_pii':
          return this.redactPII(safetyRequest);
        case 'check_duplicate':
          return this.checkDuplicate(safetyRequest);
        case 'rate_limit':
          return this.checkRateLimit(safetyRequest);
        case 'report':
          return this.reportAbuse(safetyRequest);
        case 'undo':
          return this.undoAction(safetyRequest);
        default:
          return this.createErrorResponse(
            request.requestId,
            { code: 'INVALID_ACTION', message: `Unknown action: ${safetyRequest.action}` },
            `Invalid action: ${safetyRequest.action}`
          );
      }
    } catch (error) {
      return this.createErrorResponse(
        request.requestId,
        {
          code: 'TRUST_SAFETY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        `Error in trust & safety: ${error}`
      );
    }
  }

  /**
   * Check for fraud patterns
   */
  private checkFraud(request: TrustSafetyRequest): AgentResponse {
    let riskScore = 0;
    const reasons: string[] = [];

    // Check duplicate device
    if (request.context.deviceId) {
      const deviceUsers = this.deviceHistory.get(request.context.deviceId) || new Set();
      if (deviceUsers.size > 3) {
        riskScore += 30;
        reasons.push(`Device used by ${deviceUsers.size} accounts`);
      }
    }

    // Check duplicate email
    if (request.context.email) {
      const emailUsers = this.emailHistory.get(request.context.email.toLowerCase()) || new Set();
      if (emailUsers.size > 1) {
        riskScore += 40;
        reasons.push(`Email used by ${emailUsers.size} accounts`);
      }
    }

    // Check rate limits
    const rateLimit = this.getRateLimit(request.userId);
    if (rateLimit.invites >= this.MAX_INVITES_PER_DAY) {
      riskScore += 20;
      reasons.push('Daily invite limit reached');
    }

    const isFraud = riskScore >= 50;

    return this.createResponse(
      request.requestId,
      true,
      isFraud
        ? `Fraud detected: ${reasons.join('; ')}`
        : 'No fraud patterns detected',
      {
        data: {
          allowed: !isFraud,
          riskScore,
          reason: reasons.join('; ') || undefined,
        },
        confidence: 0.85,
        featuresUsed: [
          'device_id',
          'email',
          'rate_limits',
          'duplicate_detection',
        ],
      }
    );
  }

  /**
   * Redact PII for COPPA/FERPA compliance
   */
  private redactPII(request: TrustSafetyRequest): AgentResponse {
    const { content, age } = request.context;

    if (!content) {
      return this.createErrorResponse(
        request.requestId,
        { code: 'MISSING_CONTENT', message: 'Content required for redaction' },
        'Content is required for PII redaction'
      );
    }

    let redacted = content;

    // COPPA: If under 13, redact all PII
    if (age !== undefined && age < this.MIN_AGE_COPPA) {
      // Redact email addresses
      redacted = redacted.replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        '[EMAIL]'
      );
      // Redact phone numbers
      redacted = redacted.replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]');
      // Redact names (simple pattern - in production would use NER)
      redacted = redacted.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]');
    } else {
      // For older users, less aggressive redaction
      // Only redact sensitive info
      redacted = redacted.replace(
        /\b\d{3}-\d{2}-\d{4}\b/g,
        '[SSN]'
      ); // SSN
    }

    return this.createResponse(
      request.requestId,
      true,
      `PII redaction completed. ${age !== undefined && age < this.MIN_AGE_COPPA ? 'COPPA-compliant redaction applied.' : 'Standard redaction applied.'}`,
      {
        data: {
          redactedContent: redacted,
        },
        confidence: 0.90,
        featuresUsed: ['content', 'age', 'coppa_compliance'],
      }
    );
  }

  /**
   * Check for duplicate accounts
   */
  private checkDuplicate(request: TrustSafetyRequest): AgentResponse {
    const { email, deviceId } = request.context;
    let duplicateDetected = false;
    const reasons: string[] = [];

    if (email) {
      const emailUsers = this.emailHistory.get(email.toLowerCase()) || new Set();
      if (emailUsers.size > 0 && !emailUsers.has(request.userId)) {
        duplicateDetected = true;
        reasons.push(`Email already used by ${emailUsers.size} account(s)`);
      }
    }

    if (deviceId) {
      const deviceUsers = this.deviceHistory.get(deviceId) || new Set();
      if (deviceUsers.size > 0 && !deviceUsers.has(request.userId)) {
        duplicateDetected = true;
        reasons.push(`Device already used by ${deviceUsers.size} account(s)`);
      }
    }

    // Record for future checks
    if (email) {
      if (!this.emailHistory.has(email.toLowerCase())) {
        this.emailHistory.set(email.toLowerCase(), new Set());
      }
      this.emailHistory.get(email.toLowerCase())!.add(request.userId);
    }

    if (deviceId) {
      if (!this.deviceHistory.has(deviceId)) {
        this.deviceHistory.set(deviceId, new Set());
      }
      this.deviceHistory.get(deviceId)!.add(request.userId);
    }

    return this.createResponse(
      request.requestId,
      true,
      duplicateDetected
        ? `Duplicate detected: ${reasons.join('; ')}`
        : 'No duplicate accounts detected',
      {
        data: {
          duplicateDetected,
          reason: reasons.join('; ') || undefined,
        },
        confidence: 0.95,
        featuresUsed: ['email', 'device_id', 'duplicate_detection'],
      }
    );
  }

  /**
   * Check rate limits
   */
  private checkRateLimit(request: TrustSafetyRequest): AgentResponse {
    const rateLimit = this.getRateLimit(request.userId);
    const now = new Date();

    // Reset if needed
    const lastReset = new Date(rateLimit.lastReset);
    const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

    if (hoursSinceReset >= 24) {
      rateLimit.invites = 0;
      rateLimit.lastReset = now.toISOString();
    }

    const isRateLimited = rateLimit.invites >= this.MAX_INVITES_PER_DAY;

    if (!isRateLimited) {
      rateLimit.invites++;
    }

    const retryAfter = isRateLimited
      ? Math.ceil((24 - hoursSinceReset) * 3600)
      : undefined;

    return this.createResponse(
      request.requestId,
      true,
      isRateLimited
        ? `Rate limit reached. ${rateLimit.invites}/${this.MAX_INVITES_PER_DAY} invites today. Retry after ${Math.ceil((24 - hoursSinceReset) * 3600 / 3600)} hours.`
        : `Rate limit OK. ${rateLimit.invites}/${this.MAX_INVITES_PER_DAY} invites today.`,
      {
        data: {
          allowed: !isRateLimited,
          rateLimited: isRateLimited,
          retryAfter,
        },
        confidence: 1.0,
        featuresUsed: ['user_id', 'rate_limits', 'time_tracking'],
      }
    );
  }

  /**
   * Report abuse
   */
  private reportAbuse(request: TrustSafetyRequest): AgentResponse {
    const reportId = crypto.randomUUID();
    const reason = request.context.actionType || 'abuse_reported';

    this.reports.set(reportId, {
      userId: request.userId,
      reason,
      timestamp: new Date().toISOString(),
      resolved: false,
    });

    return this.createResponse(
      request.requestId,
      true,
      `Abuse report filed: ${reportId}. Reason: ${reason}`,
      {
        data: {
          reportId,
          reason,
        },
        confidence: 1.0,
        featuresUsed: ['user_id', 'report_type'],
      }
    );
  }

  /**
   * Undo action
   */
  private undoAction(request: TrustSafetyRequest): AgentResponse {
    const { reportId } = request.context;

    if (!reportId) {
      return this.createErrorResponse(
        request.requestId,
        { code: 'MISSING_REPORT_ID', message: 'Report ID required' },
        'Report ID is required to undo action'
      );
    }

    const report = this.reports.get(reportId);
    if (!report) {
      return this.createErrorResponse(
        request.requestId,
        { code: 'REPORT_NOT_FOUND', message: 'Report not found' },
        `Report ${reportId} not found`
      );
    }

    report.resolved = true;

    return this.createResponse(
      request.requestId,
      true,
      `Action undone for report ${reportId}`,
      {
        confidence: 1.0,
        featuresUsed: ['report_id'],
      }
    );
  }

  /**
   * Get rate limit data
   */
  private getRateLimit(userId: string) {
    if (!this.rateLimits.has(userId)) {
      this.rateLimits.set(userId, {
        invites: 0,
        lastReset: new Date().toISOString(),
      });
    }
    return this.rateLimits.get(userId)!;
  }
}

