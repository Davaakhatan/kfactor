/**
 * Student Dashboard
 * 
 * Production-ready student dashboard showing:
 * - Presence indicators (who's practicing now)
 * - Activity feed (recent achievements, challenges)
 * - Leaderboards (subject-specific rankings)
 * - Cohort rooms (study groups)
 * - Quick actions (start practice, view streaks)
 */

import React, { useState, useEffect } from 'react';
import { PresenceIndicator } from '../components/PresenceIndicator';
import { Leaderboard } from '../components/Leaderboard';
import { ActivityFeed } from '../components/ActivityFeed';
import { CohortRoom } from '../components/CohortRoom';
import { RewardsList } from '../components/RewardsList';
import { Play, Target, Flame, TrendingUp } from 'lucide-react';
import { apiClient } from '../services/api';

interface StudentDashboardProps {
  user?: any;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [presenceData, setPresenceData] = useState({ count: 0, subject: 'Algebra', activity: 'practicing' });
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rewardsRefreshTrigger, setRewardsRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [presence, leaderboard, activity] = await Promise.all([
          apiClient.getPresence('Algebra'),
          apiClient.getLeaderboard('Algebra', 'weekly'),
          apiClient.getActivityFeed(5),
        ]);

        setPresenceData(presence);
        setLeaderboardData(leaderboard);
        setActivityData(activity.map((item: any) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          timestamp: item.timestamp,
        })));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChallengeFriend = async () => {
    try {
      const result = await apiClient.triggerViralLoop('session_complete', {
        loopId: 'buddy_challenge',
        persona: 'student',
      });
      alert(`Challenge created! Share with friends. Loop ID: ${result.loopExecutionId}`);
      // Refresh rewards after loop execution
      setRewardsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge. Please try again.');
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">7 days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-2xl font-bold text-gray-900">12 sessions</p>
              </div>
              <Target className="h-8 w-8 text-primary-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ranking</p>
                <p className="text-2xl font-bold text-gray-900">#15</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Presence Indicator */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <PresenceIndicator {...presenceData} />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Start Learning
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-4 px-6 rounded-lg transition-colors">
                  <Play className="h-5 w-5" />
                  Practice Test
                </button>
                <button 
                  onClick={handleChallengeFriend}
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-4 px-6 rounded-lg border border-gray-200 transition-colors"
                >
                  <Target className="h-5 w-5" />
                  Challenge Friend
                </button>
              </div>
            </div>

            {/* Cohort Rooms */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Study Groups
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CohortRoom
                  {...cohortData}
                  onJoin={() => console.log('Join clicked')}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
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

        {/* Rewards */}
        <div className="mb-8">
          <RewardsList refreshTrigger={rewardsRefreshTrigger} />
        </div>
      </div>
    </div>
  );
};

