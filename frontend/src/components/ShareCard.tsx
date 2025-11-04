/**
 * Share Card Component
 * 
 * Minimalist share card for results pages.
 * Clean design with clear CTAs.
 */

import React from 'react';
import { Share2, Trophy, TrendingUp } from 'lucide-react';

interface ShareCardProps {
  title: string;
  description: string;
  score?: number;
  cta: string;
  onShare: () => void;
  onChallenge?: () => void;
  className?: string;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  title,
  description,
  score,
  cta,
  onShare,
  onChallenge,
  className = '',
}) => {
  return (
    <div
      className={`bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        {score !== undefined && (
          <div className="flex items-center gap-1 bg-white rounded-full px-3 py-1.5">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-bold text-gray-900">{score}%</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onShare}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          {cta}
        </button>
        {onChallenge && (
          <button
            onClick={onChallenge}
            className="bg-white hover:bg-gray-50 text-primary-600 text-sm font-medium py-2.5 px-4 rounded-lg border border-primary-200 transition-colors flex items-center justify-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Challenge
          </button>
        )}
      </div>
    </div>
  );
};

