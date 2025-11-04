/**
 * Leaderboard Component
 * 
 * Minimalist leaderboard showing top performers.
 * Clean design with subtle ranking indicators.
 */

import React from 'react';
import { Trophy, Award, Medal } from 'lucide-react';

interface LeaderboardEntry {
  id?: string;
  rank: number;
  userId: string;
  score: number;
  anonymous?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  subject?: string;
  metric?: string;
  maxEntries?: number;
  className?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  subject,
  metric = 'practice',
  maxEntries = 5,
  className = '',
}) => {
  const displayEntries = entries.slice(0, maxEntries);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return (
      <span className="text-sm font-semibold text-gray-400 w-5 text-center">
        {rank}
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">
          {subject ? `${subject} Leaderboard` : 'Leaderboard'}
        </h3>
        {subject && (
          <p className="text-xs text-gray-500 mt-1">{metric} scores</p>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {displayEntries.map((entry) => (
          <div
            key={entry.id || `${entry.userId}-${entry.rank}`}
            className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {getRankIcon(entry.rank)}
              <span className="text-sm font-medium text-gray-900">
                {entry.anonymous ? 'Anonymous' : `User ${entry.userId.slice(-4)}`}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {entry.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

