/**
 * Incentives & Economy Agent
 * 
 * Manages rewards, prevents abuse, and ensures unit economics.
 * Tracks reward allocation, abuse detection, and budget management.
 */

import { BaseAgent, AgentRequest, AgentResponse } from '../../core/mcp/agent-base.js';
import { RewardType } from '../../core/types/index.js';

export interface IncentiveRequest extends AgentRequest {
  action: 'allocate' | 'check_budget' | 'detect_abuse' | 'track_redemption';
  userId: string;
  context: {
    rewardType?: RewardType;
    amount?: number;
    loopId?: string;
    inviteCode?: string;
    userHistory?: {
      totalRewardsClaimed?: number;
      recentRewards?: Array<{ type: string; amount: number; timestamp: string }>;
      dailyRewardCount?: number;
      weeklyRewardCount?: number;
    };
  };
}

export interface IncentiveResponse extends AgentResponse {
  data?: {
    approved?: boolean;
    reward?: {
      type: RewardType;
      amount: number;
      description: string;
    };
    budgetStatus?: {
      dailyRemaining: number;
      weeklyRemaining: number;
      monthlyRemaining: number;
    };
    abuseDetected?: boolean;
    abuseScore?: number;
    reason?: string;
  };
}

export class IncentivesAgent extends BaseAgent {
  private readonly MAX_DAILY_REWARDS = 10;
  private readonly MAX_WEEKLY_REWARDS = 50;
  private readonly MAX_MONTHLY_REWARDS = 200;
  private readonly DAILY_BUDGET = 1000; // In reward units
  private readonly WEEKLY_BUDGET = 5000;
  private readonly MONTHLY_BUDGET = 20000;

  // Reward cost per unit (in cents or equivalent)
  private readonly REWARD_COSTS: Record<RewardType, number> = {
    [RewardType.AI_TUTOR_MINUTES]: 10, // 10 cents per minute
    [RewardType.CLASS_PASS]: 500, // $5 per pass
    [RewardType.GEM_BOOST]: 1, // 1 cent per gem
    [RewardType.XP_BOOST]: 0.5, // 0.5 cents per XP
    [RewardType.STREAK_SHIELD]: 50, // 50 cents per shield
    [RewardType.PRACTICE_POWER_UP]: 25, // 25 cents per power-up
  };

  // User reward tracking (in production, would be in database)
  private userRewards: Map<string, {
    daily: number;
    weekly: number;
    monthly: number;
    recent: Array<{ type: string; amount: number; timestamp: string }>;
  }> = new Map();

  // Budget tracking (in production, would be in database)
  private budget: {
    daily: number;
    weekly: number;
    monthly: number;
    lastReset: {
      daily: string;
      weekly: string;
      monthly: string;
    };
  } = {
    daily: this.DAILY_BUDGET,
    weekly: this.WEEKLY_BUDGET,
    monthly: this.MONTHLY_BUDGET,
    lastReset: {
      daily: new Date().toISOString(),
      weekly: new Date().toISOString(),
      monthly: new Date().toISOString(),
    },
  };

  constructor() {
    super({
      name: 'incentives',
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

    const incentiveRequest = request as IncentiveRequest;

    try {
      // Reset budgets if needed
      this.resetBudgetsIfNeeded();

      switch (incentiveRequest.action) {
        case 'allocate':
          return this.allocateReward(incentiveRequest);
        case 'check_budget':
          return this.checkBudget(incentiveRequest);
        case 'detect_abuse':
          return this.detectAbuse(incentiveRequest);
        case 'track_redemption':
          return this.trackRedemption(incentiveRequest);
        default:
          return this.createErrorResponse(
            request.requestId,
            { code: 'INVALID_ACTION', message: `Unknown action: ${incentiveRequest.action}` },
            `Invalid action: ${incentiveRequest.action}`
          );
      }
    } catch (error) {
      return this.createErrorResponse(
        request.requestId,
        {
          code: 'INCENTIVE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        `Error in incentives: ${error}`
      );
    }
  }

  /**
   * Allocate a reward
   */
  private allocateReward(request: IncentiveRequest): AgentResponse {
    const { rewardType, amount } = request.context;
    if (!rewardType || !amount) {
      return this.createErrorResponse(
        request.requestId,
        { code: 'MISSING_PARAMS', message: 'Reward type and amount required' },
        'Reward type and amount are required for allocation'
      );
    }

    // Check abuse first
    const abuseCheck = this.checkAbusePattern(request);
    if (abuseCheck.abuseDetected) {
      return this.createResponse(
        request.requestId,
        false,
        `Abuse detected: ${abuseCheck.reason}. Reward allocation denied.`,
        {
          data: {
            approved: false,
            abuseDetected: true,
            abuseScore: abuseCheck.score,
            reason: abuseCheck.reason,
          },
          confidence: 0.95,
          featuresUsed: ['user_history', 'reward_patterns', 'rate_limits'],
        }
      );
    }

    // Check budget
    const cost = this.calculateCost(rewardType, amount);
    if (!this.checkBudgetAvailability(cost)) {
      return this.createResponse(
        request.requestId,
        false,
        `Budget exceeded. Cannot allocate reward.`,
        {
          data: {
            approved: false,
            budgetStatus: this.getBudgetStatus(),
            reason: 'Budget limit reached',
          },
          confidence: 1.0,
          featuresUsed: ['budget_tracking', 'cost_calculation'],
        }
      );
    }

    // Check user limits
    const userRewardData = this.getUserRewardData(request.userId);
    if (userRewardData.daily >= this.MAX_DAILY_REWARDS) {
      return this.createResponse(
        request.requestId,
        false,
        `Daily reward limit reached (${this.MAX_DAILY_REWARDS}).`,
        {
          data: {
            approved: false,
            reason: 'Daily limit exceeded',
          },
          confidence: 1.0,
          featuresUsed: ['user_limits', 'daily_count'],
        }
      );
    }

    // Allocate reward
    this.budget.daily -= cost;
    this.budget.weekly -= cost;
    this.budget.monthly -= cost;

    userRewardData.daily++;
    userRewardData.weekly++;
    userRewardData.monthly++;
    userRewardData.recent.push({
      type: rewardType,
      amount,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 20 rewards
    if (userRewardData.recent.length > 20) {
      userRewardData.recent = userRewardData.recent.slice(-20);
    }

    return this.createResponse(
      request.requestId,
      true,
      `Reward allocated: ${amount} ${rewardType} (cost: ${cost} units). Budget remaining: ${this.budget.daily} daily, ${this.budget.weekly} weekly.`,
      {
        data: {
          approved: true,
          reward: {
            type: rewardType,
            amount,
            description: this.getRewardDescription(rewardType, amount),
          },
          budgetStatus: this.getBudgetStatus(),
        },
        confidence: 0.90,
        featuresUsed: [
          'reward_type',
          'amount',
          'cost_calculation',
          'budget_check',
          'user_limits',
          'abuse_detection',
        ],
      }
    );
  }

  /**
   * Check budget status
   */
  private checkBudget(request: IncentiveRequest): AgentResponse {
    return this.createResponse(
      request.requestId,
      true,
      `Budget status: Daily ${this.budget.daily}/${this.DAILY_BUDGET}, Weekly ${this.budget.weekly}/${this.WEEKLY_BUDGET}, Monthly ${this.budget.monthly}/${this.MONTHLY_BUDGET}`,
      {
        data: {
          budgetStatus: this.getBudgetStatus(),
        },
        confidence: 1.0,
        featuresUsed: ['budget_tracking'],
      }
    );
  }

  /**
   * Detect abuse patterns
   */
  private detectAbuse(request: IncentiveRequest): AgentResponse {
    const abuseCheck = this.checkAbusePattern(request);

    return this.createResponse(
      request.requestId,
      true,
      abuseCheck.abuseDetected
        ? `Abuse detected: ${abuseCheck.reason}`
        : 'No abuse patterns detected',
      {
        data: {
          abuseDetected: abuseCheck.abuseDetected,
          abuseScore: abuseCheck.score,
          reason: abuseCheck.reason,
        },
        confidence: 0.85,
        featuresUsed: [
          'user_history',
          'reward_patterns',
          'rate_limits',
          'duplicate_detection',
        ],
      }
    );
  }

  /**
   * Track reward redemption
   */
  private trackRedemption(request: IncentiveRequest): AgentResponse {
    // In production, would log redemption to analytics
    return this.createResponse(
      request.requestId,
      true,
      'Reward redemption tracked',
      {
        confidence: 1.0,
        featuresUsed: ['redemption_tracking'],
      }
    );
  }

  /**
   * Check for abuse patterns
   */
  private checkAbusePattern(request: IncentiveRequest): {
    abuseDetected: boolean;
    score: number;
    reason?: string;
  } {
    const userRewardData = this.getUserRewardData(request.userId);
    let score = 0;
    const reasons: string[] = [];

    // Check for rapid reward claims
    const recentRewards = userRewardData.recent.filter(
      (r) => Date.now() - new Date(r.timestamp).getTime() < 60 * 60 * 1000 // Last hour
    );

    if (recentRewards.length > 10) {
      score += 50;
      reasons.push(`Too many rewards in short time (${recentRewards.length} in 1 hour)`);
    }

    // Check for duplicate claims
    const recentTypes = new Set(recentRewards.map((r) => r.type));
    if (recentRewards.length > 0 && recentTypes.size === 1 && recentRewards.length > 5) {
      score += 30;
      reasons.push('Suspicious pattern: same reward type repeatedly');
    }

    // Check daily limit exceeded
    if (userRewardData.daily > this.MAX_DAILY_REWARDS) {
      score += 40;
      reasons.push(`Daily limit exceeded: ${userRewardData.daily}`);
    }

    return {
      abuseDetected: score >= 50,
      score,
      reason: reasons.join('; '),
    };
  }

  /**
   * Calculate cost of reward
   */
  private calculateCost(rewardType: RewardType, amount: number): number {
    const unitCost = this.REWARD_COSTS[rewardType] || 1;
    return unitCost * amount;
  }

  /**
   * Check if budget is available
   */
  private checkBudgetAvailability(cost: number): boolean {
    return (
      this.budget.daily >= cost &&
      this.budget.weekly >= cost &&
      this.budget.monthly >= cost
    );
  }

  /**
   * Get budget status
   */
  private getBudgetStatus(): IncentiveResponse['data']['budgetStatus'] {
    return {
      dailyRemaining: this.budget.daily,
      weeklyRemaining: this.budget.weekly,
      monthlyRemaining: this.budget.monthly,
    };
  }

  /**
   * Get user reward data
   */
  private getUserRewardData(userId: string) {
    if (!this.userRewards.has(userId)) {
      this.userRewards.set(userId, {
        daily: 0,
        weekly: 0,
        monthly: 0,
        recent: [],
      });
    }
    return this.userRewards.get(userId)!;
  }

  /**
   * Reset budgets if needed
   */
  private resetBudgetsIfNeeded(): void {
    const now = new Date();
    const dailyReset = new Date(this.budget.lastReset.daily);
    const weeklyReset = new Date(this.budget.lastReset.weekly);
    const monthlyReset = new Date(this.budget.lastReset.monthly);

    // Reset daily if needed
    if (now.getDate() !== dailyReset.getDate() || now.getMonth() !== dailyReset.getMonth()) {
      this.budget.daily = this.DAILY_BUDGET;
      this.budget.lastReset.daily = now.toISOString();
    }

    // Reset weekly if needed (Monday)
    const daysSinceWeekly = Math.floor((now.getTime() - weeklyReset.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceWeekly >= 7) {
      this.budget.weekly = this.WEEKLY_BUDGET;
      this.budget.lastReset.weekly = now.toISOString();
    }

    // Reset monthly if needed
    if (now.getMonth() !== monthlyReset.getMonth() || now.getFullYear() !== monthlyReset.getFullYear()) {
      this.budget.monthly = this.MONTHLY_BUDGET;
      this.budget.lastReset.monthly = now.toISOString();
    }
  }

  /**
   * Get reward description
   */
  private getRewardDescription(type: RewardType, amount: number): string {
    const descriptions: Record<RewardType, (amount: number) => string> = {
      [RewardType.AI_TUTOR_MINUTES]: (amt) => `${amt} minutes of AI Tutor`,
      [RewardType.CLASS_PASS]: (amt) => `${amt} class pass${amt > 1 ? 'es' : ''}`,
      [RewardType.GEM_BOOST]: (amt) => `${amt} gems`,
      [RewardType.XP_BOOST]: (amt) => `${amt} XP`,
      [RewardType.STREAK_SHIELD]: (amt) => `${amt} streak shield${amt > 1 ? 's' : ''}`,
      [RewardType.PRACTICE_POWER_UP]: (amt) => `${amt} practice power-up${amt > 1 ? 's' : ''}`,
    };

    return descriptions[type]?.(amount) || `${amount} ${type}`;
  }
}

