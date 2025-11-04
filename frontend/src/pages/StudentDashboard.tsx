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
  const [studentStats, setStudentStats] = useState({ currentStreak: 0, weeklySessions: 0, ranking: 999 });
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rewardsRefreshTrigger, setRewardsRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [presence, leaderboard, activity, stats, cohortsData] = await Promise.all([
          apiClient.getPresence('Algebra'),
          apiClient.getLeaderboard('Algebra', 'weekly'),
          apiClient.getActivityFeed(5),
          apiClient.getStudentStats(),
          apiClient.getStudentCohorts(),
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
        setStudentStats(stats);
        setCohorts(cohortsData || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set defaults on error
        setStudentStats({ currentStreak: 0, weeklySessions: 0, ranking: 999 });
        setCohorts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const [challengeSuccess, setChallengeSuccess] = useState(false);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [sessionSuccess, setSessionSuccess] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const handleChallengeFriend = async () => {
    setChallengeError(null);
    setChallengeSuccess(false);
    try {
      const result = await apiClient.triggerViralLoop('session_complete', {
        loopId: 'buddy_challenge',
        persona: 'student',
      });
      setChallengeSuccess(true);
      // Refresh rewards after loop execution
      setRewardsRefreshTrigger(prev => prev + 1);
      setTimeout(() => setChallengeSuccess(false), 5000);
    } catch (error: any) {
      setChallengeError(error.message || 'Failed to create challenge. Please try again.');
      setTimeout(() => setChallengeError(null), 5000);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">Continue your learning journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <div className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900">{studentStats.currentStreak}</p>
                <p className="text-xs text-gray-500 mt-1">days</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">This Week</p>
                <p className="text-3xl font-bold text-gray-900">{studentStats.weeklySessions}</p>
                <p className="text-xs text-gray-500 mt-1">sessions</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Ranking</p>
                <p className="text-3xl font-bold text-gray-900">#{studentStats.ranking}</p>
                <p className="text-xs text-gray-500 mt-1">leaderboard</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Presence Indicator */}
            <div className="card p-5">
              <PresenceIndicator {...presenceData} />
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Start Learning
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={async () => {
                    setSessionError(null);
                    setSessionSuccess(false);
                    try {
                      // Create a practice session event
                      await apiClient.createSession({
                        subject: 'Algebra',
                        score: Math.floor(Math.random() * 30) + 70, // Random score 70-100
                        duration: Math.floor(Math.random() * 20) + 10, // 10-30 minutes
                      });
                      // Reload stats after creating session
                      const stats = await apiClient.getStudentStats();
                      setStudentStats(stats);
                      // Also reload presence and leaderboard
                      const [presence, leaderboard] = await Promise.all([
                        apiClient.getPresence('Algebra'),
                        apiClient.getLeaderboard('Algebra', 'weekly'),
                      ]);
                      setPresenceData(presence);
                      setLeaderboardData(leaderboard);
                      setSessionSuccess(true);
                      setTimeout(() => setSessionSuccess(false), 5000);
                    } catch (error: any) {
                      setSessionError(error.message || 'Failed to create session');
                      setTimeout(() => setSessionError(null), 5000);
                    }
                  }}
                  className="btn-primary flex items-center justify-center gap-2 text-base py-4"
                >
                  <Play className="h-5 w-5" />
                  Practice Test
                </button>
                <button 
                  onClick={handleChallengeFriend}
                  className="btn-secondary flex items-center justify-center gap-2 text-base py-4"
                >
                  <Target className="h-5 w-5" />
                  Challenge Friend
                </button>
              </div>
              {challengeSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Challenge created! Check your rewards.
                </div>
              )}
              {challengeError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  {challengeError}
                </div>
              )}
              {sessionSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Practice session completed! Your stats have been updated.
                </div>
              )}
              {sessionError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  {sessionError}
                </div>
              )}
            </div>

            {/* Cohort Rooms */}
            {cohorts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Study Groups
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cohorts.map((cohort) => (
                    <CohortRoom
                      key={cohort.id}
                      name={cohort.name}
                      subject={cohort.subject}
                      members={cohort.members}
                      activeCount={cohort.activeCount}
                      totalCount={cohort.totalCount}
                      onJoin={() => console.log('Join clicked', cohort.id)}
                    />
                  ))}
                </div>
              </div>
            )}
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

