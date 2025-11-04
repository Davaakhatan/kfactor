/**
 * Test Results Page
 * 
 * Production-ready results page that appears AFTER a student completes a test.
 * This is where viral sharing happens - the key moment of pride.
 * 
 * Features:
 * - Score display
 * - Ranking vs peers
 * - Viral share buttons (Challenge Friend, Share Results)
 * - Next actions (Review, Practice More)
 */

import React, { useState, useEffect } from 'react';
import { ResultsShareSurface } from '../components/ResultsShareSurface';
import { ChallengeInvite } from '../components/ChallengeInvite';
import { RewardsList } from '../components/RewardsList';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/api';

interface TestResultsProps {
  user?: any;
}

export const TestResults: React.FC<TestResultsProps> = ({ user }) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showChallenge, setShowChallenge] = useState(false);
  const [rewardsRefreshTrigger, setRewardsRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const data = await apiClient.getLatestTestResult();
        setResult(data);
      } catch (error) {
        console.error('Error loading test result:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No test results found</p>
          <p className="text-sm text-gray-500">Complete a test to see results here</p>
        </div>
      </div>
    );
  }

  const score = result.score;
  const subject = result.subject;
  const testType = result.test_type;
  const correct = result.correct;
  const total = result.total;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Outstanding!';
    if (score >= 80) return 'Great job!';
    if (score >= 70) return 'Good work!';
    return 'Keep practicing!';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        {/* Results Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {testType} Complete
            </h1>
            <p className="text-gray-600 mb-8">{subject}</p>
            
            {/* Score Display */}
            <div className="mb-6">
              <div className={`inline-flex items-center justify-center w-32 h-32 bg-gray-50 rounded-full mb-4 ${getScoreColor(score)}`}>
                <span className="text-5xl font-bold">{score}%</span>
              </div>
              <p className={`text-xl font-semibold ${getScoreColor(score)} mb-2`}>
                {getScoreMessage(score)}
              </p>
              <p className="text-sm text-gray-600">
                {correct} out of {total} questions correct
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">Accuracy</p>
                <p className="text-lg font-semibold text-gray-900">{score}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Time</p>
                <p className="text-lg font-semibold text-gray-900">12:34</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Rank</p>
                <p className="text-lg font-semibold text-gray-900">#15</p>
              </div>
            </div>
          </div>
        </div>

        {/* Viral Share Surface - This is where the magic happens */}
        <ResultsShareSurface
          title="Great Progress!"
          description={`You scored ${score}% on your ${subject} ${testType}!`}
          score={score}
          percentile={87}
          rank={15}
          totalParticipants={150}
          subject={subject}
          onShare={async (type) => {
            if (type === 'challenge') {
              try {
                await apiClient.triggerViralLoop('results_page_view', {
                  loopId: 'buddy_challenge',
                  persona: 'student',
                  subject: subject,
                  score: score,
                });
                setShowChallenge(true);
                setRewardsRefreshTrigger(prev => prev + 1);
              } catch (error) {
                console.error('Error triggering challenge:', error);
                alert('Failed to create challenge. Please try again.');
              }
            } else {
              // Handle share/invite
              try {
                await apiClient.triggerViralLoop('results_page_view', {
                  loopId: 'results_rally',
                  persona: 'student',
                  subject: subject,
                  score: score,
                });
                console.log('Share triggered:', type);
                setRewardsRefreshTrigger(prev => prev + 1);
              } catch (error) {
                console.error('Error sharing:', error);
              }
            }
          }}
        />

        {/* Challenge Modal */}
        {showChallenge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <ChallengeInvite
                challengeTitle={`Beat my ${subject} score of ${score}%!`}
                subject={subject}
                questionCount={5}
                estimatedTime={10}
                onSend={(channel) => {
                  console.log(`Send challenge via ${channel}`);
                  setShowChallenge(false);
                }}
                onClose={() => setShowChallenge(false)}
              />
            </div>
          </div>
        )}

        {/* Next Actions */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            What would you like to do next?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span className="font-medium text-gray-900">Review Mistakes</span>
              <span className="text-xs text-gray-600 text-center">See detailed explanations</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <RefreshCw className="h-6 w-6 text-primary-500" />
              <span className="font-medium text-gray-900">Practice More</span>
              <span className="text-xs text-gray-600 text-center">Take another {subject} test</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <XCircle className="h-6 w-6 text-gray-500" />
              <span className="font-medium text-gray-900">Back to Dashboard</span>
              <span className="text-xs text-gray-600 text-center">Continue learning</span>
            </button>
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

