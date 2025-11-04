/**
 * LTV Delta Dashboard
 * 
 * Shows LTV comparison between referred and baseline cohorts
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface LTVDeltaData {
  referred: {
    avgLTV: number;
    userCount: number;
  };
  baseline: {
    avgLTV: number;
    userCount: number;
  };
  delta: number;
  deltaPercent: number;
  timeRange: {
    start: string;
    end: string;
  };
}

interface LTVDeltaDashboardProps {
  cohort?: string;
  days?: number;
  className?: string;
}

export const LTVDeltaDashboard: React.FC<LTVDeltaDashboardProps> = ({
  cohort,
  days = 30,
  className = '',
}) => {
  const [ltvData, setLtvData] = useState<LTVDeltaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLTVData();
  }, [cohort, days]);

  const loadLTVData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getLTVDelta(cohort, days);
      setLtvData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load LTV data');
      console.error('Error loading LTV delta:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">Loading LTV data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!ltvData) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">LTV Delta</h3>
        <div className="text-center text-gray-500">No LTV data available</div>
      </div>
    );
  }

  const isPositive = ltvData.delta >= 0;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">LTV Delta</h3>
          <p className="text-sm text-gray-500 mt-1">
            Referred vs Baseline (Last {days} days)
          </p>
        </div>
        <DollarSign className="h-6 w-6 text-gray-400" />
      </div>

      {/* Delta Display */}
      <div className={`mb-6 p-4 rounded-lg ${
        isPositive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">LTV Delta</div>
            <div className={`text-3xl font-bold ${
              isPositive ? 'text-green-700' : 'text-red-700'
            }`}>
              {isPositive ? '+' : ''}${ltvData.delta.toFixed(2)}
            </div>
            <div className={`text-sm mt-1 ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{ltvData.deltaPercent.toFixed(1)}% vs baseline
            </div>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {isPositive ? (
              <TrendingUp className="h-6 w-6" />
            ) : (
              <TrendingDown className="h-6 w-6" />
            )}
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-2">Referred Cohort</div>
          <div className="text-2xl font-bold text-gray-900">
            ${ltvData.referred.avgLTV.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {ltvData.referred.userCount.toLocaleString()} users
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-2">Baseline Cohort</div>
          <div className="text-2xl font-bold text-gray-900">
            ${ltvData.baseline.avgLTV.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {ltvData.baseline.userCount.toLocaleString()} users
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className={`text-sm ${
          isPositive ? 'text-green-700' : 'text-red-700'
        }`}>
          {isPositive ? (
            <p>
              ✅ Referred users have <strong>{Math.abs(ltvData.deltaPercent).toFixed(1)}% higher LTV</strong> than baseline.
              This indicates viral loops are attracting higher-value users.
            </p>
          ) : (
            <p>
              ⚠️ Referred users have <strong>{Math.abs(ltvData.deltaPercent).toFixed(1)}% lower LTV</strong> than baseline.
              Consider optimizing onboarding or reward allocation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

