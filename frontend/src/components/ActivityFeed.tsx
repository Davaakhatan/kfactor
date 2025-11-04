/**
 * Activity Feed Component
 * 
 * Minimalist activity feed showing recent achievements and challenges.
 * Clean, scannable design.
 */

import React from 'react';
import { Trophy, Target, Flame, UserPlus } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'achievement' | 'challenge' | 'streak' | 'invite';
  title: string;
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  items,
  maxItems = 5,
  className = '',
}) => {
  const displayItems = items.slice(0, maxItems);

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'challenge':
        return <Target className="h-4 w-4 text-primary-500" />;
      case 'streak':
        return <Flame className="h-4 w-4 text-orange-500" />;
      case 'invite':
        return <UserPlus className="h-4 w-4 text-green-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
          >
            <div className="mt-0.5">{getIcon(item.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              <p className="text-xs text-gray-400 mt-1">{formatTime(item.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

