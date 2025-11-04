/**
 * Loop Performance Dashboard Component
 * 
 * Minimalist dashboard showing performance metrics for each viral loop.
 */

import React from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle } from 'lucide-react';

interface LoopMetric {
  loopId: string;
  totalInvites: number;
  totalOpens: number;
  totalJoins: number;
  totalFVM: number;
  conversionRate: number;
}

interface LoopPerformanceDashboardProps {
  loops: LoopMetric[];
  className?: string;
}

export const LoopPerformanceDashboard: React.FC<LoopPerformanceDashboardProps> = ({
  loops,
  className = '',
}) => {
  const formatLoopName = (loopId: string): string => {
    return loopId
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Loop Performance</h3>
      </div>

      <div className="space-y-4">
        {loops.map((loop) => (
          <div
            key={loop.loopId}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">
                {formatLoopName(loop.loopId)}
              </h4>
              <span className="text-xs font-medium text-primary-600">
                {(loop.conversionRate * 100).toFixed(1)}% conversion
              </span>
            </div>

            {/* Funnel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Invites</span>
                <span className="font-medium text-gray-900">{loop.totalInvites}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Opens</span>
                <span className="font-medium text-gray-900">{loop.totalOpens}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-400"
                  style={{
                    width: `${loop.totalInvites > 0 ? (loop.totalOpens / loop.totalInvites) * 100 : 0}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">FVM Reached</span>
                <span className="font-medium text-gray-900">{loop.totalFVM}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${loop.totalInvites > 0 ? (loop.totalFVM / loop.totalInvites) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

