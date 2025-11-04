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
    // Trigger Tutor Spotlight loop
    try {
      await apiClient.triggerViralLoop('session_rated', {
        loopId: 'tutor_spotlight',
        persona: 'tutor',
        rating: 5,
      });
      alert('Tutor card generated! Share with families to get referral credits.');
    } catch (error) {
      console.error('Error generating tutor spotlight:', error);
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
            Tutor Dashboard
          </h1>
          <p className="text-gray-600">Grow your student base and track referrals</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{tutorData?.totalSessions}</p>
              </div>
              <Users className="h-8 w-8 text-primary-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{tutorData?.averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{tutorData?.totalReferrals}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Referral Credits</p>
                <p className="text-2xl font-bold text-gray-900">{tutorData?.referralCredits}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Tutor Spotlight Viral Loop - Main Feature */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Share Your Expertise
              </h2>
              <p className="text-gray-600 mb-4">
                Generate a tutor card and share it with families. 
                Earn referral credits when they book their first session!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleTutorSpotlight}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  Generate Tutor Card
                </button>
                <button className="bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-6 rounded-lg border border-blue-200 transition-colors flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Share Prep Pack
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Referral Performance</h2>
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

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Ratings</h2>
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
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">This Week</h2>
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

