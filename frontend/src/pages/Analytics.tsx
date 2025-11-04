/**
 * Analytics Dashboard Page
 * 
 * Shows K-factor, loop performance, guardrails, and cohort analysis.
 * Only accessible to admins or for demo purposes.
 */

import React, { useState, useEffect } from 'react';
import { KFactorDashboard } from '../components/dashboards/KFactorDashboard';
import { LoopPerformanceDashboard } from '../components/dashboards/LoopPerformanceDashboard';
import { GuardrailDashboard } from '../components/dashboards/GuardrailDashboard';
import { CohortAnalysisDashboard } from '../components/dashboards/CohortAnalysisDashboard';
import { ResultsFunnelDashboard } from '../components/dashboards/ResultsFunnelDashboard';
import { TranscriptionFunnelDashboard } from '../components/dashboards/TranscriptionFunnelDashboard';
import { LTVDeltaDashboard } from '../components/dashboards/LTVDeltaDashboard';
import { apiClient } from '../services/api';
import { BarChart3 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [kFactor, setKFactor] = useState<any>(null);
  const [loops, setLoops] = useState<any[]>([]);
  const [guardrails, setGuardrails] = useState<any>(null);
  const [cohortAnalysis, setCohortAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      // Check if user is logged in
      const token = apiClient.getToken();
      if (!token) {
        console.error('Not authenticated - please login first');
        setLoading(false);
        return;
      }

      try {
        const [kFactorData, loopData, guardrailData, cohortData] = await Promise.all([
          apiClient.getKFactorMetrics('all', 14),
          apiClient.getLoopPerformance(14),
          apiClient.getGuardrailMetrics(7),
          apiClient.getCohortAnalysis('2025-01', 30),
        ]);

        setKFactor(kFactorData);
        setLoops(loopData);
        setGuardrails(guardrailData);
        setCohortAnalysis(cohortData);
      } catch (error: any) {
        console.error('Error loading analytics:', error);
        // If 404, might be authentication issue
        if (error.message?.includes('404') || error.message?.includes('401')) {
          console.error('Authentication failed. Please login again.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Show error if no data loaded (might be auth issue)
  if (!kFactor && !loops.length && !guardrails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium mb-2">Unable to load analytics</p>
            <p className="text-sm text-red-600 mb-4">Please make sure you're logged in and try again</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600">K-factor, loop performance, and system health metrics</p>
        </div>

        {/* K-Factor */}
        {kFactor && (
          <div className="mb-8">
            <KFactorDashboard metrics={kFactor} />
          </div>
        )}

        {/* Loop Performance */}
        {loops.length > 0 && (
          <div className="mb-8">
            <LoopPerformanceDashboard loops={loops} />
          </div>
        )}

        {/* Guardrails */}
        {guardrails && (
          <div className="mb-8">
            <GuardrailDashboard metrics={guardrails} />
          </div>
        )}

        {/* Cohort Analysis */}
        {cohortAnalysis && (
          <div className="mb-8">
            <CohortAnalysisDashboard
              analysis={{
                cohort: cohortAnalysis.cohort,
                referred: {
                  totalUsers: cohortAnalysis.referred.totalUsers,
                  fvmRate: cohortAnalysis.referred.fvmRate,
                  d1Retention: cohortAnalysis.referred.d1Retention,
                  d7Retention: cohortAnalysis.referred.d7Retention,
                  d28Retention: cohortAnalysis.referred.d28Retention,
                },
                baseline: {
                  totalUsers: cohortAnalysis.baseline.totalUsers,
                  fvmRate: cohortAnalysis.baseline.fvmRate,
                  d1Retention: cohortAnalysis.baseline.d1Retention,
                  d7Retention: cohortAnalysis.baseline.d7Retention,
                  d28Retention: cohortAnalysis.baseline.d28Retention,
                },
                uplift: {
                  fvm: cohortAnalysis.uplift.fvm,
                  d1: cohortAnalysis.uplift.d1,
                  d7: cohortAnalysis.uplift.d7,
                  d28: cohortAnalysis.uplift.d28,
                },
              }}
            />
          </div>
        )}

        {/* Funnel Dashboards */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Funnel Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResultsFunnelDashboard days={14} />
            <TranscriptionFunnelDashboard days={14} />
          </div>
        </div>

        {/* LTV Delta */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">LTV Analysis</h2>
          <LTVDeltaDashboard days={30} />
        </div>
      </div>
    </div>
  );
};

