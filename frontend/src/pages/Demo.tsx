/**
 * Demo Page
 * 
 * Thin-slice prototype demonstrating all viral growth features.
 * Minimalist, modern design showcasing the complete system.
 */

import React, { useState } from 'react';
import { PresenceIndicator } from '../components/PresenceIndicator';
import { Leaderboard } from '../components/Leaderboard';
import { ShareCard } from '../components/ShareCard';
import { ChallengeInvite } from '../components/ChallengeInvite';
import { ActivityFeed } from '../components/ActivityFeed';
import { ResultsShareSurface } from '../components/ResultsShareSurface';
import { CohortRoom } from '../components/CohortRoom';

export const DemoPage: React.FC = () => {
  const [showChallenge, setShowChallenge] = useState(false);

  // Mock data
  const presenceData = {
    count: 28,
    subject: 'Algebra',
    activity: 'practicing',
  };

  const leaderboardData = [
    { rank: 1, userId: 'user-1', score: 250, anonymous: false },
    { rank: 2, userId: 'user-2', score: 230, anonymous: false },
    { rank: 3, userId: 'user-3', score: 215, anonymous: true },
    { rank: 4, userId: 'user-4', score: 200, anonymous: false },
    { rank: 5, userId: 'user-5', score: 185, anonymous: true },
  ];

  const activityData = [
    {
      id: '1',
      type: 'achievement' as const,
      title: 'Achievement Unlocked!',
      description: 'Earned Practice Master badge',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: '2',
      type: 'streak' as const,
      title: 'Streak Maintained!',
      description: '7-day streak continues',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: '3',
      type: 'challenge' as const,
      title: 'Challenge Created',
      description: 'Buddy Challenge shared',
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    },
  ];

  const cohortData = {
    name: 'Algebra Study Group',
    subject: 'Algebra',
    members: [
      { userId: 'user-1', online: true },
      { userId: 'user-2', online: true },
      { userId: 'user-3', online: false },
    ],
    activeCount: 2,
    totalCount: 3,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                XFactor Viral Growth - Component Demo
              </h1>
              <p className="text-sm text-gray-600">
                This is a demonstration page showing all viral growth components.
                All data shown is mock data for illustration purposes.
              </p>
            </div>
            <div className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              DEMO MODE
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Features */}
          <div className="lg:col-span-2 space-y-6">
            {/* Presence Indicator */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <PresenceIndicator {...presenceData} />
            </div>

            {/* Results Share Surface */}
            <ResultsShareSurface
              title="Great Progress!"
              description="You scored 92% on your Algebra practice test!"
              score={92}
              percentile={87}
              rank={15}
              totalParticipants={150}
              subject="Algebra"
              onShare={(type) => {
                console.log(`Share type: ${type}`);
                if (type === 'challenge') setShowChallenge(true);
              }}
            />

            {/* Share Card */}
            <ShareCard
              title="Outstanding Score!"
              description="I scored 92% on my Algebra test!"
              score={92}
              cta="Share Results"
              onShare={() => console.log('Share clicked')}
              onChallenge={() => setShowChallenge(true)}
            />

            {/* Challenge Invite Modal */}
            {showChallenge && (
              <div className="relative">
                <ChallengeInvite
                  challengeTitle="Beat my Algebra score!"
                  subject="Algebra"
                  questionCount={5}
                  estimatedTime={10}
                  onSend={(channel) => {
                    console.log(`Send via ${channel}`);
                    setShowChallenge(false);
                  }}
                  onClose={() => setShowChallenge(false)}
                />
              </div>
            )}

            {/* Cohort Rooms */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Study Groups
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CohortRoom
                  {...cohortData}
                  onJoin={() => console.log('Join clicked')}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <Leaderboard
              entries={leaderboardData}
              subject="Algebra"
              metric="practice"
            />

            {/* Activity Feed */}
            <ActivityFeed items={activityData} />
          </div>
        </div>
      </div>
    </div>
  );
};

