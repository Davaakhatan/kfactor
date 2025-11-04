/**
 * Challenge Invite Component
 * 
 * Minimalist challenge invitation UI.
 * Clean, focused design for inviting friends.
 */

import React from 'react';
import { Send, UserPlus, X } from 'lucide-react';

interface ChallengeInviteProps {
  challengeTitle: string;
  subject?: string;
  questionCount?: number;
  estimatedTime?: number;
  onSend: (channel: 'whatsapp' | 'sms' | 'email' | 'link') => void;
  onClose?: () => void;
  className?: string;
}

export const ChallengeInvite: React.FC<ChallengeInviteProps> = ({
  challengeTitle,
  subject,
  questionCount = 5,
  estimatedTime = 10,
  onSend,
  onClose,
  className = '',
}) => {
  const shareChannels = [
    { id: 'whatsapp' as const, label: 'WhatsApp', icon: Send },
    { id: 'sms' as const, label: 'SMS', icon: Send },
    { id: 'email' as const, label: 'Email', icon: Send },
    { id: 'link' as const, label: 'Copy Link', icon: UserPlus },
  ];

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-lg p-6 ${className}`}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Challenge a Friend
        </h3>
        <p className="text-sm text-gray-600 mb-4">{challengeTitle}</p>

        {subject && (
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{subject}</span>
            <span>•</span>
            <span>{questionCount} questions</span>
            <span>•</span>
            <span>~{estimatedTime} min</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {shareChannels.map((channel) => {
          const Icon = channel.icon;
          return (
            <button
              key={channel.id}
              onClick={() => onSend(channel.id)}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-sm font-medium text-gray-700 transition-colors"
            >
              <Icon className="h-4 w-4" />
              {channel.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

