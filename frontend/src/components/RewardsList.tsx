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
    try {
      await apiClient.claimReward(rewardId);
      // Reload rewards to show updated status
      await loadRewards();
    } catch (err: any) {
      console.error('Error claiming reward:', err);
      alert(err.message || 'Failed to claim reward');
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Gift className="h-6 w-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Your Rewards</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {rewards.length} total reward{rewards.length !== 1 ? 's' : ''}
        </p>
      </div>

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
                      className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
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
          <div className="text-center py-12">
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No rewards yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Complete challenges and invite friends to earn rewards!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

