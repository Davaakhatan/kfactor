/**
 * Transcription-Action Funnel Dashboard
 * 
 * Tracks: session → summary → agentic action → invite → join → FVM
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { Brain, ArrowRight, TrendingUp } from 'lucide-react';

interface TranscriptionFunnelData {
  sessions: number;
  summaries: number;
  agenticActions: number;
  invites: number;
  joins: number;
  fvm: number;
  summaryRate: number;
  actionRate: number;
  inviteRate: number;
  joinRate: number;
  fvmRate: number;
  overallConversion: number;
}

interface TranscriptionFunnelDashboardProps {
  days?: number;
  className?: string;
}

export const TranscriptionFunnelDashboard: React.FC<TranscriptionFunnelDashboardProps> = ({
  days = 14,
  className = '',
}) => {
  const [funnelData, setFunnelData] = useState<TranscriptionFunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFunnelData();
  }, [days]);

  const loadFunnelData = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getTranscriptionFunnel(days);
      setFunnelData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transcription funnel');
      console.error('Error loading transcription funnel:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">Loading transcription funnel...</div>
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

  if (!funnelData) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transcription-Action Funnel</h3>
        <div className="text-center text-gray-500">No funnel data available</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Transcription-Action Funnel</h3>
          <p className="text-sm text-gray-500 mt-1">Session → Summary → Action → Invite → Join → FVM</p>
        </div>
        <Brain className="h-6 w-6 text-gray-400" />
      </div>

      {/* Funnel Steps */}
      <div className="space-y-4">
        {/* Sessions */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Sessions Processed</span>
              <span className="text-sm font-bold text-gray-900">{funnelData.sessions.toLocaleString()}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '100%' }} />
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>

        {/* Summaries */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Summaries Generated</span>
              <span className="text-sm font-bold text-gray-900">
                {funnelData.summaries.toLocaleString()}
                <span className="text-gray-500 ml-1">({funnelData.summaryRate.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${funnelData.summaryRate}%` }}
              />
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>

        {/* Agentic Actions */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Agentic Actions Triggered</span>
              <span className="text-sm font-bold text-gray-900">
                {funnelData.agenticActions.toLocaleString()}
                <span className="text-gray-500 ml-1">({funnelData.actionRate.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{ width: `${funnelData.actionRate}%` }}
              />
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>

        {/* Invites */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Invites Sent</span>
              <span className="text-sm font-bold text-gray-900">
                {funnelData.invites.toLocaleString()}
                <span className="text-gray-500 ml-1">({funnelData.inviteRate.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500"
                style={{ width: `${funnelData.inviteRate}%` }}
              />
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>

        {/* Joins */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Joins (Account Created)</span>
              <span className="text-sm font-bold text-gray-900">
                {funnelData.joins.toLocaleString()}
                <span className="text-gray-500 ml-1">({funnelData.joinRate.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${funnelData.joinRate}%` }}
              />
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </div>

        {/* FVM */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">FVM Reached</span>
              <span className="text-sm font-bold text-gray-900">
                {funnelData.fvm.toLocaleString()}
                <span className="text-gray-500 ml-1">({funnelData.fvmRate.toFixed(1)}%)</span>
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${funnelData.fvmRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Overall Conversion</div>
            <div className="text-2xl font-bold text-gray-900">
              {funnelData.overallConversion.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Sessions → FVM
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Action Efficiency</div>
            <div className="text-2xl font-bold text-gray-900">
              {funnelData.actionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Sessions → Actions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

