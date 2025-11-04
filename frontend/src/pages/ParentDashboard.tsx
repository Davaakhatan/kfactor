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
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const data = await apiClient.getParentProgress();
        setProgressData(data);
      } catch (error) {
        console.error('Error loading parent progress:', error);
        // Fallback to minimal data on error
        setProgressData({
          childName: 'Student',
          weeklySessions: 0,
          improvement: 0,
          currentStreak: 0,
          achievements: [],
          subjectProgress: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const handleShareProgress = async () => {
    setShareError(null);
    setShareSuccess(false);
    try {
      await apiClient.triggerViralLoop('milestone_reached', {
        loopId: 'proud_parent',
        persona: 'parent',
      });
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 5000);
    } catch (error: any) {
      setShareError(error.message || 'Failed to generate progress reel.');
      setTimeout(() => setShareError(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">
            {progressData?.childName}'s Progress
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">Weekly learning summary and achievements</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
          <div className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">This Week</p>
                <p className="text-3xl font-bold text-gray-900">{progressData?.weeklySessions || 0}</p>
                <p className="text-xs text-gray-500 mt-1">sessions</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Improvement</p>
                <p className="text-3xl font-bold text-green-600">+{progressData?.improvement || 0}%</p>
                <p className="text-xs text-gray-500 mt-1">vs last week</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Current Streak</p>
                <p className="text-3xl font-bold text-gray-900">{progressData?.currentStreak || 0}</p>
                <p className="text-xs text-gray-500 mt-1">days</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Achievements</p>
                <p className="text-3xl font-bold text-gray-900">{progressData?.achievements?.length || 0}</p>
                <p className="text-xs text-gray-500 mt-1">earned</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl group-hover:bg-yellow-100 transition-colors">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Proud Parent Viral Loop - Main Feature */}
        <div className="card p-8 mb-8 bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 border-primary-200/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Share {progressData?.childName}'s Progress
                </h2>
              </div>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed max-w-2xl">
                Create a privacy-safe progress reel to share with other parents. 
                <span className="font-semibold text-gray-900"> Both families get a class pass when they join!</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleShareProgress}
                  className="btn-primary flex items-center gap-2 text-base"
                >
                  <Share2 className="h-5 w-5" />
                  Generate Progress Reel
                </button>
                <button className="btn-secondary flex items-center gap-2 text-base">
                  <Mail className="h-5 w-5" />
                  Invite Parent
                </button>
              </div>
              {shareSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Progress reel generated! Check your rewards.
                </div>
              )}
              {shareError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  {shareError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="card p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Subject Progress</h2>
          {progressData?.subjectProgress && progressData.subjectProgress.length > 0 ? (
            <div className="space-y-3">
              {progressData.subjectProgress.map((subject: any) => (
                <div key={subject.subject} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{subject.subject}</p>
                    <p className="text-sm text-gray-500 mt-1">Average score</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-900">{subject.score}%</span>
                    {subject.trend === 'up' && (
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-1">No progress data yet</p>
              <p className="text-sm text-gray-400">Progress will appear here as your child learns</p>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="card p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
          {progressData?.achievements && progressData.achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progressData.achievements.map((achievement: string) => (
                <div key={achievement} className="flex items-center gap-4 p-5 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 hover:shadow-md transition-all group">
                  <div className="p-3 bg-yellow-100 rounded-xl group-hover:bg-yellow-200 transition-colors">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{achievement}</p>
                    <p className="text-sm text-gray-500 mt-1">Badge earned</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium mb-1">No achievements yet</p>
              <p className="text-sm text-gray-400">Achievements will appear here as milestones are reached</p>
            </div>
          )}
        </div>

        {/* Rewards */}
        <div className="mb-8">
          <RewardsList />
        </div>
      </div>
    </div>
  );
};

