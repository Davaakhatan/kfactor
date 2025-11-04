/**
 * Guardrail Dashboard Component
 * 
 * Minimalist dashboard showing guardrail metrics and health status.
 */

import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface GuardrailMetrics {
  complaintRate: number;
  optOutRate: number;
  fraudRate: number;
  supportTickets: number;
  healthy: boolean;
}

interface GuardrailDashboardProps {
  metrics: GuardrailMetrics;
  className?: string;
}

export const GuardrailDashboard: React.FC<GuardrailDashboardProps> = ({
  metrics,
  className = '',
}) => {
  const thresholds = {
    complaintRate: 0.01, // 1%
    optOutRate: 0.01, // 1%
    fraudRate: 0.005, // 0.5%
    supportTickets: 100,
  };

  const getStatus = (
    value: number,
    threshold: number,
    lowerIsBetter: boolean = true
  ) => {
    if (lowerIsBetter) {
      return value <= threshold ? 'healthy' : 'warning';
    }
    return value >= threshold ? 'healthy' : 'warning';
  };

  const MetricRow = ({
    label,
    value,
    threshold,
    format,
    lowerIsBetter = true,
  }: {
    label: string;
    value: number;
    threshold: number;
    format: (v: number) => string;
    lowerIsBetter?: boolean;
  }) => {
    const status = getStatus(value, threshold, lowerIsBetter);
    const isHealthy = status === 'healthy';

    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-2">
          {isHealthy ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold ${
              isHealthy ? 'text-green-600' : 'text-orange-600'
            }`}
          >
            {format(value)}
          </span>
          <span className="text-xs text-gray-400">/ {format(threshold)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Guardrails</h3>
        </div>
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
            metrics.healthy
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
          }`}
        >
          {metrics.healthy ? (
            <>
              <CheckCircle className="h-3 w-3" />
              Healthy
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3" />
              Warning
            </>
          )}
        </div>
      </div>

      <div>
        <MetricRow
          label="Complaint Rate"
          value={metrics.complaintRate}
          threshold={thresholds.complaintRate}
          format={(v) => `${(v * 100).toFixed(2)}%`}
        />
        <MetricRow
          label="Opt-Out Rate"
          value={metrics.optOutRate}
          threshold={thresholds.optOutRate}
          format={(v) => `${(v * 100).toFixed(2)}%`}
        />
        <MetricRow
          label="Fraud Rate"
          value={metrics.fraudRate}
          threshold={thresholds.fraudRate}
          format={(v) => `${(v * 100).toFixed(2)}%`}
        />
        <MetricRow
          label="Support Tickets"
          value={metrics.supportTickets}
          threshold={thresholds.supportTickets}
          format={(v) => v.toString()}
          lowerIsBetter={true}
        />
      </div>
    </div>
  );
};

