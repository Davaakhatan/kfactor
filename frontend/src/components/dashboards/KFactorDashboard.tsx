/**
 * K-Factor Dashboard Component
 * 
 * Minimalist dashboard showing K-factor metrics and target achievement.
 */

import React from 'react';
import { TrendingUp, Target, Users, Zap } from 'lucide-react';

interface KFactorMetrics {
  cohort: string;
  invitesPerUser: number;
  conversionRate: number;
  kFactor: number;
  targetMet: boolean;
}

interface KFactorDashboardProps {
  metrics: KFactorMetrics;
  className?: string;
}

export const KFactorDashboard: React.FC<KFactorDashboardProps> = ({
  metrics,
  className = '',
}) => {
  const targetK = 1.20;
  const kPercentage = (metrics.kFactor / targetK) * 100;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">K-Factor</h3>
          <p className="text-sm text-gray-500 mt-1">Cohort: {metrics.cohort}</p>
        </div>
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center ${
            metrics.targetMet
              ? 'bg-green-100 text-green-600'
              : 'bg-orange-100 text-orange-600'
          }`}
        >
          <Target className="h-6 w-6" />
        </div>
      </div>

      {/* K-Factor Display */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900">
            {metrics.kFactor.toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">/ {targetK}</span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              metrics.targetMet ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(kPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {metrics.targetMet ? 'Target met' : `${(targetK - metrics.kFactor).toFixed(2)} to go`}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-500">Invites/User</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {metrics.invitesPerUser.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-500">Conversion</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {(metrics.conversionRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

