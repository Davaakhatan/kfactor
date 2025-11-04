/**
 * Results Page
 * 
 * Clean results page showing test/assessment results.
 * This is where users land after completing a test.
 * Includes viral sharing features.
 */

import React from 'react';
import { ResultsShareSurface } from '../components/ResultsShareSurface';

interface ResultsPageProps {
  score?: number;
  subject?: string;
  testType?: string;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  score = 92,
  subject = 'Algebra',
  testType = 'Practice Test',
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {testType} Complete
            </h1>
            <p className="text-gray-600 mb-6">Subject: {subject}</p>
            
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full mb-4">
              <span className="text-5xl font-bold text-primary-600">{score}%</span>
            </div>
            
            <p className="text-lg text-gray-700">
              {score >= 90 ? 'Outstanding!' : score >= 80 ? 'Great job!' : score >= 70 ? 'Good work!' : 'Keep practicing!'}
            </p>
          </div>
        </div>

        {/* Share Surface */}
        <ResultsShareSurface
          title="Great Progress!"
          description={`You scored ${score}% on your ${subject} ${testType}!`}
          score={score}
          percentile={87}
          rank={15}
          totalParticipants={150}
          subject={subject}
          onShare={(type) => {
            console.log(`Share type: ${type}`);
          }}
        />

        {/* Additional Actions */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            What's Next?
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <div className="font-medium text-gray-900">Review Mistakes</div>
              <div className="text-sm text-gray-600 mt-1">See detailed explanations</div>
            </button>
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <div className="font-medium text-gray-900">Practice More</div>
              <div className="text-sm text-gray-600 mt-1">Take another {subject} test</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

