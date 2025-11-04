/**
 * Landing Page
 * 
 * Clean, minimalist landing page for new visitors.
 * Introduces the platform and encourages sign-up.
 */

import React from 'react';
import { ArrowRight, Users, TrendingUp, Target, Shield } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Learn Together, Grow Together
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with peers, challenge friends, and make learning social. 
            Join thousands of students already practicing together.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-8 py-3 rounded-lg transition-colors flex items-center gap-2">
              Get Started
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-8 py-3 rounded-lg border border-gray-200 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Social Learning
            </h3>
            <p className="text-gray-600">
              Practice with peers, join study groups, and challenge friends to make learning fun and engaging.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
              <TrendingUp className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Track Progress
            </h3>
            <p className="text-gray-600">
              See how you rank, track your streaks, and celebrate achievements as you learn.
            </p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
              <Target className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Personalized Learning
            </h3>
            <p className="text-gray-600">
              Get tailored practice tests and challenges based on your skill level and goals.
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-24 text-center">
          <p className="text-sm text-gray-500 mb-4">Join thousands of learners</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span className="font-medium">1,234</span>
            <span>students practicing now</span>
          </div>
        </div>
      </div>
    </div>
  );
};

