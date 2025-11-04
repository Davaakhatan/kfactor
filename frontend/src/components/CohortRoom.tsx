/**
 * Cohort Room Component
 * 
 * Minimalist cohort room showing active members and presence.
 * Clean, social design.
 */

import React from 'react';
import { Users, User, Activity } from 'lucide-react';

interface CohortMember {
  userId: string;
  online: boolean;
  currentActivity?: string;
}

interface CohortRoomProps {
  name: string;
  subject: string;
  members: CohortMember[];
  activeCount: number;
  totalCount: number;
  onJoin?: () => void;
  className?: string;
}

export const CohortRoom: React.FC<CohortRoomProps> = ({
  name,
  subject,
  members,
  activeCount,
  totalCount,
  onJoin,
  className = '',
}) => {
  const onlineMembers = members.filter((m) => m.online);

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:border-primary-300 transition-colors ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{name}</h3>
          <p className="text-xs text-gray-500">{subject}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Activity className="h-3 w-3" />
          <span>{activeCount} active</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex -space-x-2">
          {onlineMembers.slice(0, 3).map((member, index) => (
            <div
              key={member.userId}
              className="h-8 w-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-medium text-primary-700 relative"
            >
              {member.online && (
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
              <User className="h-4 w-4" />
            </div>
          ))}
        </div>
        {totalCount > 3 && (
          <span className="text-xs text-gray-500">+{totalCount - 3} more</span>
        )}
      </div>

      {onJoin && (
        <button
          onClick={onJoin}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Users className="h-4 w-4" />
          Join Room
        </button>
      )}
    </div>
  );
};

