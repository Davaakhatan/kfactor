/**
 * Cohort Analysis Dashboard Component
 * 
 * Minimalist dashboard comparing referred vs. baseline cohorts.
 */

import React from 'react';
import { Users, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

interface CohortMetrics {
  totalUsers: number;
  fvmRate: number;
  d1Retention: number;
  d7Retention: number;
  d28Retention: number;
}

interface CohortAnalysis {
  cohort: string;
  referred: CohortMetrics;
  baseline: CohortMetrics;
  uplift: {
    fvm: number;
    d1: number;
    d7: number;
    d28: number;
  };
}

interface CohortAnalysisDashboardProps {
  analysis: CohortAnalysis;
  className?: string;
}

export const CohortAnalysisDashboard: React.FC<CohortAnalysisDashboardProps> = ({
  analysis,
  className = '',
}) => {
  const MetricCard = ({
    label,
    referred,
    baseline,
    uplift,
    format,
  }: {
    label: string;
    referred: number;
    baseline: number;
    uplift: number;
    format: (v: number) => string;
  }) => {
    const isPositive = uplift > 0;
    const upliftPercent = baseline > 0 ? (uplift / baseline) * 100 : 0;

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              isPositive ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {isPositive ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {upliftPercent > 0 ? '+' : ''}
            {upliftPercent.toFixed(1)}%
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Referred</span>
            <span className="text-sm font-semibold text-gray-900">
              {format(referred)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Baseline</span>
            <span className="text-sm font-medium text-gray-600">
              {format(baseline)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5 text-gray-700" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cohort Analysis</h3>
          <p className="text-xs text-gray-500 mt-0.5">Cohort: {analysis.cohort}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="FVM Rate"
          referred={analysis.referred.fvmRate}
          baseline={analysis.baseline.fvmRate}
          uplift={analysis.uplift.fvm}
          format={(v) => `${(v * 100).toFixed(1)}%`}
        />
        <MetricCard
          label="D1 Retention"
          referred={analysis.referred.d1Retention}
          baseline={analysis.baseline.d1Retention}
          uplift={analysis.uplift.d1}
          format={(v) => `${(v * 100).toFixed(1)}%`}
        />
        <MetricCard
          label="D7 Retention"
          referred={analysis.referred.d7Retention}
          baseline={analysis.baseline.d7Retention}
          uplift={analysis.uplift.d7}
          format={(v) => `${(v * 100).toFixed(1)}%`}
        />
        <MetricCard
          label="D28 Retention"
          referred={analysis.referred.d28Retention}
          baseline={analysis.baseline.d28Retention}
          uplift={analysis.uplift.d28}
          format={(v) => `${(v * 100).toFixed(1)}%`}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Users</span>
          <div className="flex items-center gap-4">
            <span className="text-gray-900">
              Referred: <span className="font-semibold">{analysis.referred.totalUsers}</span>
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">
              Baseline: <span className="font-medium">{analysis.baseline.totalUsers}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

