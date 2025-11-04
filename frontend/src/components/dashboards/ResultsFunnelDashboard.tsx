/**
 * Results Page Funnel Dashboard
 * 
 * Tracks: impressions → share clicks → join → FVM per tool
 * Tools: diagnostics, practice tests, flashcards
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface FunnelData {
  tool: string;
  impressions: number;
  shareClicks: number;
  joins: number;
  fvm: number;
  shareClickRate: number;
  joinRate: number;
  fvmRate: number;
  overallConversion: number;
}

interface ResultsFunnelDashboardProps {
  days?: number;
  className?: string;
}

export const ResultsFunnelDashboard: React.FC<ResultsFunnelDashboardProps> = ({
  days = 14,
  className = '',
}) => {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFunnelData();
  }, [days]);

  const loadFunnelData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getResultsFunnel(days);
      setFunnelData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load funnel data');
      console.error('Error loading results funnel:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">Loading funnel data...</div>
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

  if (funnelData.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Results Page Funnels</h3>
        <div className="text-center text-gray-500">No funnel data available</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Results Page Funnels</h3>
          <p className="text-sm text-gray-500 mt-1">Last {days} days</p>
        </div>
        <BarChart3 className="h-6 w-6 text-gray-400" />
      </div>

      <div className="space-y-6">
        {funnelData.map((tool) => (
          <div key={tool.tool} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 capitalize">{tool.tool}</h4>
              <span className="text-sm text-gray-500">
                {tool.overallConversion.toFixed(1)}% conversion
              </span>
            </div>

            {/* Funnel Visualization */}
            <div className="space-y-3">
              {/* Impressions */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Impressions</span>
                  <span className="text-sm font-medium text-gray-900">{tool.impressions.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Share Clicks */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Share Clicks</span>
                  <span className="text-sm font-medium text-gray-900">
                    {tool.shareClicks.toLocaleString()}
                    <span className="text-gray-500 ml-1">({tool.shareClickRate.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${tool.shareClickRate}%` }}
                  />
                </div>
              </div>

              {/* Joins */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Joins</span>
                  <span className="text-sm font-medium text-gray-900">
                    {tool.joins.toLocaleString()}
                    <span className="text-gray-500 ml-1">({tool.joinRate.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${(tool.joins / tool.impressions) * 100}%` }}
                  />
                </div>
              </div>

              {/* FVM */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">FVM Reached</span>
                  <span className="text-sm font-medium text-gray-900">
                    {tool.fvm.toLocaleString()}
                    <span className="text-gray-500 ml-1">({tool.fvmRate.toFixed(1)}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(tool.fvm / tool.impressions) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Drop-off Analysis */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Impression → Share</div>
                  <div className="font-medium text-gray-900">
                    {(100 - tool.shareClickRate).toFixed(1)}% drop-off
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Share → Join</div>
                  <div className="font-medium text-gray-900">
                    {(tool.shareClickRate - tool.joinRate).toFixed(1)}% drop-off
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Join → FVM</div>
                  <div className="font-medium text-gray-900">
                    {(tool.joinRate - tool.fvmRate).toFixed(1)}% drop-off
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

