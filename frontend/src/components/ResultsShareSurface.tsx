/**
 * Results Share Surface Component
 * 
 * Minimalist share surface for results pages (diagnostics, practice tests, flashcards).
 * Clean design with clear share options.
 */

import React, { useState } from 'react';
import { Share2, TrendingUp, Users, Copy, Check } from 'lucide-react';
import { ShareCard } from './ShareCard';

interface ResultsShareSurfaceProps {
  title: string;
  description: string;
  score?: number;
  percentile?: number;
  rank?: number;
  totalParticipants?: number;
  subject?: string;
  onShare: (type: 'challenge' | 'invite') => void;
  className?: string;
}

export const ResultsShareSurface: React.FC<ResultsShareSurfaceProps> = ({
  title,
  description,
  score,
  percentile,
  rank,
  totalParticipants,
  subject,
  onShare,
  className = '',
}) => {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = () => {
    // In production, would copy actual share link
    navigator.clipboard.writeText('https://varsitytutors.com/share/...');
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <ShareCard
        title={title}
        description={description}
        score={score}
        cta="Share Results"
        onShare={() => onShare('invite')}
        onChallenge={() => onShare('challenge')}
      />

      {(rank || percentile) && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Your Ranking</p>
              {rank && totalParticipants && (
                <p className="text-sm font-semibold text-gray-900">
                  #{rank} of {totalParticipants}
                </p>
              )}
              {percentile && (
                <p className="text-sm font-semibold text-gray-900">
                  {percentile}th percentile
                </p>
              )}
            </div>
            <TrendingUp className="h-5 w-5 text-primary-500" />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onShare('challenge')}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 px-4 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Challenge Friend
        </button>
        <button
          onClick={() => onShare('invite')}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 px-4 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <Users className="h-4 w-4" />
          Invite Buddy
        </button>
        <button
          onClick={handleCopyLink}
          className="bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 px-4 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          {linkCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};

