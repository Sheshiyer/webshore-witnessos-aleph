/**
 * Cache Notification Component
 * 
 * Displays notifications about cached consciousness profile data
 * Informs users when data is restored or when cache is cleared
 */

'use client';

import { useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';
import React, { useEffect, useState } from 'react';

interface CacheNotificationProps {
  onDismiss?: () => void;
}

export const CacheNotification: React.FC<CacheNotificationProps> = ({ onDismiss }) => {
  const { profile, profileAge, cacheInfo } = useConsciousnessProfile();
  const [isVisible, setIsVisible] = useState(false);
  const [notificationType, setNotificationType] = useState<'restored' | 'cleared' | 'expired' | null>(null);

  useEffect(() => {
    if (profile && cacheInfo.profile.exists && !cacheInfo.profile.expired) {
      setNotificationType('restored');
      setIsVisible(true);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [profile, cacheInfo, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible || !notificationType) {
    return null;
  }

  const formatAge = (ageMs: number): string => {
    const days = Math.floor(ageMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ageMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'recently';
    }
  };

  const getNotificationContent = () => {
    switch (notificationType) {
      case 'restored':
        return {
          icon: '🔄',
          title: 'Consciousness Profile Restored',
          message: `Welcome back! Your profile was saved ${formatAge(profileAge)}.`,
          bgColor: 'from-green-600/20 to-emerald-600/20',
          borderColor: 'border-green-500/50',
          textColor: 'text-green-400',
        };
      case 'cleared':
        return {
          icon: '🗑️',
          title: 'Profile Data Cleared',
          message: 'Your consciousness profile has been reset.',
          bgColor: 'from-orange-600/20 to-yellow-600/20',
          borderColor: 'border-orange-500/50',
          textColor: 'text-orange-400',
        };
      case 'expired':
        return {
          icon: '⏰',
          title: 'Profile Cache Expired',
          message: 'Your saved profile has expired and will be refreshed.',
          bgColor: 'from-blue-600/20 to-cyan-600/20',
          borderColor: 'border-blue-500/50',
          textColor: 'text-blue-400',
        };
      default:
        return null;
    }
  };

  const content = getNotificationContent();
  if (!content) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div
        className={`
          bg-gradient-to-r ${content.bgColor}
          backdrop-blur-md border ${content.borderColor}
          rounded-lg shadow-2xl p-4
          animate-in slide-in-from-top-2 duration-300
        `}
      >
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{content.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-mono font-bold text-sm ${content.textColor}`}>
              {content.title}
            </h3>
            <p className="text-gray-300 text-xs mt-1">
              {content.message}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ✕
          </button>
        </div>
        
        {/* Progress bar for auto-dismiss */}
        <div className="mt-3 w-full bg-gray-700/50 rounded-full h-1">
          <div 
            className={`h-1 rounded-full bg-gradient-to-r ${content.bgColor} animate-pulse`}
            style={{
              animation: 'shrink 5s linear forwards',
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default CacheNotification;
