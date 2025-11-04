/**
 * Presence Indicator Component
 * 
 * Minimalist component showing "X peers practicing [subject] now"
 * Clean, modern, non-intrusive design.
 */

import React from 'react';
import { Users } from 'lucide-react';

interface PresenceIndicatorProps {
  count: number;
  subject?: string;
  activity?: string;
  className?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  count,
  subject,
  activity = 'practicing',
  className = '',
}) => {
  if (count === 0) return null;

  const text = subject
    ? `${count} ${count === 1 ? 'peer' : 'peers'} ${activity} ${subject} now`
    : `${count} ${count === 1 ? 'peer' : 'peers'} ${activity} now`;

  return (
    <div
      className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}
    >
      <Users className="h-4 w-4 text-primary-500" />
      <span className="font-medium">{text}</span>
    </div>
  );
};

