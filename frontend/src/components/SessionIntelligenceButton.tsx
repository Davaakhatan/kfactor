/**
 * Session Intelligence Button Component
 * 
 * Allows tutors to trigger session intelligence processing
 * after a session completes
 */

import React, { useState } from 'react';
import { Brain, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/api';

interface SessionIntelligenceButtonProps {
  sessionId: string;
  tutorId?: string;
  metadata?: {
    subject?: string;
    topic?: string;
    sessionType?: 'scheduled' | 'instant' | 'ai';
  };
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

export const SessionIntelligenceButton: React.FC<SessionIntelligenceButtonProps> = ({
  sessionId,
  tutorId,
  metadata,
  onSuccess,
  onError,
}) => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    try {
      setProcessing(true);
      setError(null);
      setResult(null);

      const response = await apiClient.processSession(sessionId, tutorId, metadata);

      if (response.success) {
        setResult(response);
        if (onSuccess) {
          onSuccess(response);
        }
      } else {
        const errorMsg = response.error || 'Failed to process session';
        setError(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to process session';
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (result) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Session processed successfully</p>
            <p className="text-xs text-green-700 mt-1">
              {result.agenticActionsTriggered} agentic action{result.agenticActionsTriggered !== 1 ? 's' : ''} triggered
              {result.viralLoopsTriggered > 0 && ` • ${result.viralLoopsTriggered} viral loop${result.viralLoopsTriggered !== 1 ? 's' : ''} triggered`}
            </p>
          </div>
          <button
            onClick={() => {
              setResult(null);
              setError(null);
            }}
            className="text-sm text-green-700 hover:text-green-900"
          >
            Process again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">Process Session Intelligence</p>
            <p className="text-xs text-gray-500">
              Analyze session and trigger viral loops
            </p>
          </div>
        </div>
        <button
          onClick={handleProcess}
          disabled={processing}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              Process
            </>
          )}
        </button>
      </div>
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

