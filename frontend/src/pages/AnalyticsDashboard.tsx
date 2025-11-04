/**
 * Analytics Dashboard Page
 * 
 * Comprehensive analytics dashboard showing K-factor, loop performance,
 * guardrails, and cohort analysis. Minimalist, modern design.
 */

import React, { useState, useEffect } from 'react';
import { KFactorDashboard } from '../components/dashboards/KFactorDashboard';
import { LoopPerformanceDashboard } from '../components/dashboards/LoopPerformanceDashboard';
import { GuardrailDashboard } from '../components/dashboards/GuardrailDashboard';
import { CohortAnalysisDashboard } from '../components/dashboards/CohortAnalysisDashboard';
import { BarChart3 } from 'lucide-react';

export const AnalyticsDashboardPage: React.FC = () => {
  const [kFactorMetrics, setKFactorMetrics] = useState({
    cohort: 'test-cohort-2024-01',
    invitesPerUser: 1.85,
    conversionRate: 0.68,
    kFactor: 1.26,
    targetMet: true,
  });

  const [loopMetrics, setLoopMetrics] = useState([
    {
      loopId: 'buddy_challenge',
      totalInvites: 450,
      totalOpens: 320,
      totalJoins: 280,
      totalFVM: 190,
      conversionRate: 0.42,
    },
    {
      loopId: 'results_rally',
      totalInvites: 380,
      totalOpens: 290,
      totalJoins: 250,
      totalFVM: 180,
      conversionRate: 0.47,
    },
    {
      loopId: 'proud_parent',
      totalInvites: 220,
      totalOpens: 180,
      totalJoins: 150,
      totalFVM: 120,
      conversionRate: 0.55,
    },
    {
      loopId: 'streak_rescue',
      totalInvites: 150,
      totalOpens: 120,
      totalJoins: 100,
      totalFVM: 85,
      conversionRate: 0.57,
    },
  ]);

  const [guardrailMetrics, setGuardrailMetrics] = useState({
    complaintRate: 0.003,
    optOutRate: 0.008,
    fraudRate: 0.002,
    supportTickets: 45,
    healthy: true,
  });

  const [cohortAnalysis, setCohortAnalysis] = useState({
    cohort: 'test-cohort-2024-01',
    referred: {
      totalUsers: 500,
      fvmRate: 0.72,
      d1Retention: 0.65,
      d7Retention: 0.52,
      d28Retention: 0.38,
    },
    baseline: {
      totalUsers: 500,
      fvmRate: 0.60,
      d1Retention: 0.55,
      d7Retention: 0.42,
      d28Retention: 0.30,
    },
    uplift: {
      fvm: 0.12,
      d1: 0.10,
      d7: 0.10,
      d28: 0.08,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-6 w-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <p className="text-sm text-gray-600">
            Real-time metrics and performance tracking
          </p>
        </div>

        {/* K-Factor & Guardrails Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <KFactorDashboard metrics={kFactorMetrics} />
          <GuardrailDashboard metrics={guardrailMetrics} />
        </div>

        {/* Loop Performance */}
        <div className="mb-6">
          <LoopPerformanceDashboard loops={loopMetrics} />
        </div>

        {/* Cohort Analysis */}
        <CohortAnalysisDashboard analysis={cohortAnalysis} />
      </div>
    </div>
  );
};

