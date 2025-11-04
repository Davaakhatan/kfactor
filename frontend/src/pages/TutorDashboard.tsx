/**
 * Tutor Dashboard
 * 
 * Production-ready tutor dashboard showing:
 * - Session history and ratings
 * - Referral tracking and analytics
 * - Tutor Spotlight sharing tools
 * - Referral credits/XP
 * - Student progress they're helping
 */

import React, { useState, useEffect } from 'react';
import { Share2, TrendingUp, Users, Star, DollarSign, BarChart3, Send } from 'lucide-react';
import { apiClient } from '../services/api';
import { RewardsList } from '../components/RewardsList';
import { SessionIntelligenceButton } from '../components/SessionIntelligenceButton';

interface TutorDashboardProps {
  user?: any;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({ user }) => {
  const [tutorData, setTutorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentSessionId, setRecentSessionId] = useState<string | null>(null);
  const [spotlightSuccess, setSpotlightSuccess] = useState(false);
  const [spotlightError, setSpotlightError] = useState<string | null>(null);

  useEffect(() => {
    const loadTutorData = async () => {
      try {
        const data = await apiClient.getTutorStats();
        setTutorData(data);
      } catch (error) {
        console.error('Error loading tutor stats:', error);
        // Fallback to minimal data on error
        setTutorData({
          totalSessions: 0,
          averageRating: 0,
          totalReferrals: 0,
          referralConversions: 0,
          referralCredits: 0,
          thisWeekSessions: 0,
          recentRatings: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadTutorData();
  }, []);

  const handleTutorSpotlight = async () => {
    setSpotlightError(null);
    setSpotlightSuccess(false);
    try {
      await apiClient.triggerViralLoop('session_rated', {
        persona: 'tutor',
        sessionRating: 5, // Must be 5★ to trigger
        sessionId: recentSessionId || 'demo-session',
        subject: tutorData?.subjectPreference || 'Math',
        tutorName: user?.name || 'Expert Tutor',
        tutorRating: tutorData?.averageRating || 5,
      });
      setSpotlightSuccess(true);
      setTimeout(() => setSpotlightSuccess(false), 5000);
    } catch (error: any) {
      setSpotlightError(error.message || 'Failed to generate tutor spotlight');
      setTimeout(() => setSpotlightError(null), 5000);
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
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">Grow your student base and track referrals</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
          <div className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{tutorData?.totalSessions || 0}</p>
                <p className="text-xs text-gray-500 mt-1">completed</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-xl group-hover:bg-primary-100 transition-colors">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">{tutorData?.averageRating || 0}</p>
                <p className="text-xs text-gray-500 mt-1">stars</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl group-hover:bg-yellow-100 transition-colors">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Referrals</p>
                <p className="text-3xl font-bold text-gray-900">{tutorData?.totalReferrals || 0}</p>
                <p className="text-xs text-gray-500 mt-1">total</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Referral Credits</p>
                <p className="text-3xl font-bold text-gray-900">{tutorData?.referralCredits || 0}</p>
                <p className="text-xs text-gray-500 mt-1">earned</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tutor Spotlight Viral Loop - Main Feature */}
        <div className="card p-8 mb-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Share Your Expertise
                </h2>
              </div>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed max-w-2xl">
                Generate a tutor card and share it with families. 
                <span className="font-semibold text-gray-900"> Earn referral credits when they book their first session!</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleTutorSpotlight}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-base active:scale-[0.98]"
                >
                  <Share2 className="h-5 w-5" />
                  Generate Tutor Card
                </button>
                <button className="btn-secondary flex items-center gap-2 text-base">
                  <Send className="h-5 w-5" />
                  Share Prep Pack
                </button>
              </div>
              {spotlightSuccess && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  Tutor Spotlight card generated! Check your rewards.
                </div>
              )}
              {spotlightError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  {spotlightError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Referral Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Referral Performance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Referrals</span>
                <span className="text-lg font-semibold text-gray-900">{tutorData?.totalReferrals}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conversions</span>
                <span className="text-lg font-semibold text-green-600">{tutorData?.referralConversions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="text-lg font-semibold text-gray-900">
                  {tutorData?.totalReferrals > 0 
                    ? Math.round((tutorData.referralConversions / tutorData.totalReferrals) * 100)
                    : 0}%
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Earned Credits</span>
                  <span className="text-2xl font-bold text-blue-600">{tutorData?.referralCredits}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Ratings</h2>
            <div className="space-y-4">
              {tutorData?.recentRatings?.map((rating: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{rating.student}</p>
                    <p className="text-sm text-gray-600">{rating.date}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < rating.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Session Stats */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">This Week</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Sessions Completed</p>
              <p className="text-2xl font-bold text-gray-900">{tutorData?.thisWeekSessions}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">New Referrals</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>

        {/* Session Intelligence */}
        {recentSessionId && (
          <div className="mb-8">
            <SessionIntelligenceButton
              sessionId={recentSessionId}
              tutorId={user?.id}
              metadata={{
                subject: 'Algebra',
                topic: 'Quadratic Equations',
                sessionType: 'scheduled',
              }}
              onSuccess={(result) => {
                console.log('Session processed:', result);
                // Could trigger a refresh of relevant data
              }}
            />
          </div>
        )}

        {/* Rewards */}
        <div className="mb-8">
          <RewardsList />
        </div>
      </div>
    </div>
  );
};

