/**
 * Parent Dashboard
 * 
 * Production-ready parent dashboard showing:
 * - Child's progress summary
 * - Privacy-safe sharing options (Proud Parent loop)
 * - Weekly recap highlights
 * - Invite other parents
 * - Progress milestones
 */

import React, { useState, useEffect } from 'react';
import { Share2, TrendingUp, Users, Award, Calendar, Mail } from 'lucide-react';
import { apiClient } from '../services/api';
import { RewardsList } from '../components/RewardsList';

interface ParentDashboardProps {
  user?: any;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ user }) => {
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch child's progress
    // For now, we'll use mock data
    setTimeout(() => {
      setProgressData({
        childName: 'Alex',
        weeklySessions: 5,
        improvement: 15,
        currentStreak: 7,
        achievements: ['Practice Master', 'Week Warrior'],
        subjectProgress: [
          { subject: 'Algebra', score: 92, trend: 'up' },
          { subject: 'Geometry', score: 85, trend: 'up' },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

  const handleShareProgress = async () => {
    // Trigger Proud Parent loop
    try {
      await apiClient.triggerViralLoop('weekly_recap', {
        loopId: 'proud_parent',
        persona: 'parent',
      });
      alert('Progress reel generated! Share with other parents.');
    } catch (error) {
      console.error('Error sharing progress:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {progressData?.childName}'s Progress
          </h1>
          <p className="text-gray-600">Weekly learning summary and achievements</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{progressData?.weeklySessions} sessions</p>
              </div>
              <Calendar className="h-8 w-8 text-primary-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Improvement</p>
                <p className="text-2xl font-bold text-green-600">+{progressData?.improvement}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{progressData?.currentStreak} days</p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">{progressData?.achievements?.length}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Proud Parent Viral Loop - Main Feature */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Share {progressData?.childName}'s Progress
              </h2>
              <p className="text-gray-600 mb-4">
                Create a privacy-safe progress reel to share with other parents. 
                Both families get a class pass when they join!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleShareProgress}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  Generate Progress Reel
                </button>
                <button className="bg-white hover:bg-gray-50 text-primary-600 font-medium py-3 px-6 rounded-lg border border-primary-200 transition-colors flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Invite Parent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Progress</h2>
          <div className="space-y-4">
            {progressData?.subjectProgress?.map((subject: any) => (
              <div key={subject.subject} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{subject.subject}</p>
                  <p className="text-sm text-gray-600">Average score</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-900">{subject.score}%</span>
                  {subject.trend === 'up' && (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progressData?.achievements?.map((achievement: string) => (
              <div key={achievement} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Award className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900">{achievement}</p>
                  <p className="text-sm text-gray-600">Badge earned</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards */}
        <div className="mb-8">
          <RewardsList />
        </div>
      </div>
    </div>
  );
};

