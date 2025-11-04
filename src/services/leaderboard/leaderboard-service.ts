/**
 * Leaderboard Service
 * 
 * Generates mini-leaderboards per subject with age-banding and fairness.
 */

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  score: number;
  metric: 'practice' | 'streak' | 'achievements' | 'sessions';
  subject?: string;
  ageBand?: string;
  anonymous: boolean; // For privacy
}

export interface LeaderboardOptions {
  subject?: string;
  metric: 'practice' | 'streak' | 'achievements' | 'sessions';
  timeWindow?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  ageBand?: string;
  segment?: 'new-user' | 'veteran' | 'all';
  limit?: number;
}

export class LeaderboardService {
  private scores: Map<string, LeaderboardEntry[]> = new Map();

  /**
   * Update user score
   */
  updateScore(
    userId: string,
    metric: LeaderboardEntry['metric'],
    score: number,
    subject?: string,
    ageBand?: string
  ): void {
    const key = this.getKey(metric, subject, ageBand);
    
    if (!this.scores.has(key)) {
      this.scores.set(key, []);
    }

    const entries = this.scores.get(key)!;
    const existingIndex = entries.findIndex((e) => e.userId === userId);

    const entry: LeaderboardEntry = {
      rank: 0, // Will be recalculated
      userId,
      score,
      metric,
      subject,
      ageBand,
      anonymous: this.shouldAnonymize(ageBand),
    };

    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }

    // Recalculate ranks
    this.recalculateRanks(entries);
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(options: LeaderboardOptions): LeaderboardEntry[] {
    const key = this.getKey(options.metric, options.subject, options.ageBand);
    let entries = this.scores.get(key) || [];

    // Filter by segment if specified
    if (options.segment && options.segment !== 'all') {
      // In production, would check user tenure
      // For now, randomly assign (mock)
      entries = entries.filter(() => Math.random() > 0.5);
    }

    // Apply time window (in production, would filter by timestamp)
    // For now, return all entries

    // Sort by score (descending)
    entries.sort((a, b) => b.score - a.score);

    // Apply limit
    if (options.limit) {
      entries = entries.slice(0, options.limit);
    }

    return entries;
  }

  /**
   * Get user rank
   */
  getUserRank(
    userId: string,
    metric: LeaderboardEntry['metric'],
    subject?: string,
    ageBand?: string
  ): number | null {
    const key = this.getKey(metric, subject, ageBand);
    const entries = this.scores.get(key) || [];
    const entry = entries.find((e) => e.userId === userId);
    return entry?.rank || null;
  }

  /**
   * Get leaderboard stats
   */
  getStats(subject?: string): {
    totalParticipants: number;
    topScore: number;
    averageScore: number;
  } {
    let entries: LeaderboardEntry[] = [];
    
    // Get all entries for subject
    this.scores.forEach((scores, key) => {
      if (!subject || key.includes(subject)) {
        entries.push(...scores);
      }
    });

    if (entries.length === 0) {
      return {
        totalParticipants: 0,
        topScore: 0,
        averageScore: 0,
      };
    }

    const scores = entries.map((e) => e.score);
    const topScore = Math.max(...scores);
    const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    return {
      totalParticipants: entries.length,
      topScore,
      averageScore: Math.round(averageScore * 100) / 100,
    };
  }

  /**
   * Generate key for leaderboard
   */
  private getKey(
    metric: LeaderboardEntry['metric'],
    subject?: string,
    ageBand?: string
  ): string {
    return `${metric}-${subject || 'all'}-${ageBand || 'all'}`;
  }

  /**
   * Recalculate ranks
   */
  private recalculateRanks(entries: LeaderboardEntry[]): void {
    entries.sort((a, b) => b.score - a.score);
    
    let currentRank = 1;
    let previousScore: number | null = null;

    entries.forEach((entry, index) => {
      if (previousScore !== null && entry.score < previousScore) {
        currentRank = index + 1;
      }
      entry.rank = currentRank;
      previousScore = entry.score;
    });
  }

  /**
   * Determine if user should be anonymized
   */
  private shouldAnonymize(ageBand?: string): boolean {
    // Anonymize minors for COPPA compliance
    return ageBand === 'under-13' || ageBand === '13-17';
  }
}

