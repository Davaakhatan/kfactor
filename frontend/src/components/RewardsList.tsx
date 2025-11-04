/**
 * Rewards List Component
 * 
 * Displays user rewards with ability to claim them
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Gift, CheckCircle, Clock } from 'lucide-react';

interface Reward {
  id: string;
  reward_type: string;
  amount: number;
  description: string;
  status: 'pending' | 'claimed' | 'redeemed';
  allocated_at: string;
  claimed_at?: string;
  redeemed_at?: string;
}

interface RewardsListProps {
  autoRefresh?: boolean;
  refreshTrigger?: number; // External trigger to refresh
}

export const RewardsList: React.FC<RewardsListProps> = ({ autoRefresh = false, refreshTrigger }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  useEffect(() => {
    loadRewards();
  }, [refreshTrigger]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadRewards();
      }, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getRewards();
      setRewards(data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading rewards:', err);
      setError(err.message || 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    setClaimError(null);
    try {
      await apiClient.claimReward(rewardId);
      // Reload rewards to show updated status
      await loadRewards();
    } catch (err: any) {
      console.error('Error claiming reward:', err);
      setClaimError(err.message || 'Failed to claim reward');
      setTimeout(() => setClaimError(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Rewards</h2>
        </div>
        <p className="text-gray-500">Loading rewards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Rewards</h2>
        </div>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const pendingRewards = rewards.filter(r => r.status === 'pending');
  const claimedRewards = rewards.filter(r => r.status === 'claimed');
  const redeemedRewards = rewards.filter(r => r.status === 'redeemed');

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Gift className="h-5 w-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your Rewards</h2>
        </div>
        <p className="text-sm text-gray-500 ml-12">
          {rewards.length} total reward{rewards.length !== 1 ? 's' : ''}
        </p>
      </div>

      {claimError && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {claimError}
        </div>
      )}
      <div className="p-6 space-y-6">
        {/* Pending Rewards */}
        {pendingRewards.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Available to Claim ({pendingRewards.length})
            </h3>
            <div className="space-y-3">
              {pendingRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 capitalize">
                          {reward.reward_type.replace('_', ' ')}
                        </span>
                        <span className="text-primary-600 font-bold">
                          +{reward.amount}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Earned {new Date(reward.allocated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleClaimReward(reward.id)}
                      className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-sm hover:shadow text-sm font-medium"
                    >
                      Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claimed Rewards */}
        {claimedRewards.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Claimed ({claimedRewards.length})
            </h3>
            <div className="space-y-3">
              {claimedRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="border border-green-200 bg-green-50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 capitalize">
                          {reward.reward_type.replace('_', ' ')}
                        </span>
                        <span className="text-primary-600 font-bold">
                          +{reward.amount}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Claimed {reward.claimed_at ? new Date(reward.claimed_at).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                      Claimed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Redeemed Rewards */}
        {redeemedRewards.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-400" />
              Redeemed ({redeemedRewards.length})
            </h3>
            <div className="space-y-3">
              {redeemedRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="border border-gray-200 bg-gray-50 rounded-lg p-4 opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 capitalize">
                          {reward.reward_type.replace('_', ' ')}
                        </span>
                        <span className="text-gray-600 font-bold">
                          +{reward.amount}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Redeemed {reward.redeemed_at ? new Date(reward.redeemed_at).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    <span className="ml-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                      Redeemed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {rewards.length === 0 && (
          <div className="empty-state">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Gift className="h-10 w-10 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No rewards yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Complete challenges and invite friends to earn exciting rewards!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

