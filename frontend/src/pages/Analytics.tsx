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
import { apiClient } from '../services/api';
import { BarChart3 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [kFactor, setKFactor] = useState<any>(null);
  const [loops, setLoops] = useState<any[]>([]);
  const [guardrails, setGuardrails] = useState<any>(null);
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
        const [kFactorData, loopData, guardrailData] = await Promise.all([
          apiClient.getKFactorMetrics('all', 14),
          apiClient.getLoopPerformance(14),
          apiClient.getGuardrailMetrics(7),
        ]);

        setKFactor(kFactorData);
        setLoops(loopData);
        setGuardrails(guardrailData);
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
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading analytics...</div>;
  }

  // Show error if no data loaded (might be auth issue)
  if (!kFactor && !loops.length && !guardrails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load analytics</p>
          <p className="text-sm text-gray-500">Please make sure you're logged in and try again</p>
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

        {/* Cohort Analysis - Mock data for now */}
        <div className="mb-8">
          <CohortAnalysisDashboard
            analysis={{
              cohort: '2025-01',
              referred: {
                totalUsers: 150,
                fvmRate: 0.75,
                d1Retention: 0.65,
                d7Retention: 0.55,
                d28Retention: 0.45,
              },
              baseline: {
                totalUsers: 200,
                fvmRate: 0.60,
                d1Retention: 0.55,
                d7Retention: 0.45,
                d28Retention: 0.35,
              },
              uplift: {
                fvm: 0.15,
                d1: 0.10,
                d7: 0.10,
                d28: 0.10,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

