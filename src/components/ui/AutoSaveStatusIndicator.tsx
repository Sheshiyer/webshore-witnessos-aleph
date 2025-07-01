/**
 * Auto-Save Status Indicator Component
 * 
 * Displays real-time auto-save status for consciousness engine results
 * with consciousness-themed styling and sacred geometry animations.
 */

'use client';

import React from 'react';
import { useConsciousnessEngineAutoSave } from '@/hooks/useConsciousnessEngineAutoSave';

interface AutoSaveStatusIndicatorProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showWhenIdle?: boolean;
  compact?: boolean;
}

export function AutoSaveStatusIndicator({
  className = '',
  position = 'top-right',
  showWhenIdle = false,
  compact = false
}: AutoSaveStatusIndicatorProps) {
  const { 
    isAutoSaving, 
    autoSaveError, 
    autoSaveCount, 
    getAutoSaveStats 
  } = useConsciousnessEngineAutoSave();

  const stats = getAutoSaveStats();

  // Don't show if idle and showWhenIdle is false
  if (!isAutoSaving && !autoSaveError && !showWhenIdle) {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const getStatusIcon = () => {
    if (isAutoSaving) {
      return (
        <div className="relative">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-4 h-4 border border-blue-200 rounded-full animate-pulse"></div>
        </div>
      );
    }
    
    if (autoSaveError) {
      return (
        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      );
    }
    
    if (stats.isEnabled && autoSaveCount > 0) {
      return (
        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      );
    }

    return (
      <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs">○</span>
      </div>
    );
  };

  const getStatusText = () => {
    if (isAutoSaving) {
      return compact ? 'Saving...' : '☁️ Syncing consciousness reading...';
    }
    
    if (autoSaveError) {
      return compact ? 'Save failed' : '⚠️ Auto-save failed - will retry';
    }
    
    if (stats.isEnabled && autoSaveCount > 0) {
      return compact 
        ? `${autoSaveCount} saved` 
        : `✨ ${autoSaveCount} readings auto-saved`;
    }

    if (!stats.isEnabled) {
      return compact ? 'Disabled' : '🔒 Auto-save disabled';
    }

    return compact ? 'Ready' : '💾 Auto-save ready';
  };

  const getStatusColor = () => {
    if (isAutoSaving) return 'text-blue-300';
    if (autoSaveError) return 'text-red-300';
    if (stats.isEnabled && autoSaveCount > 0) return 'text-green-300';
    if (!stats.isEnabled) return 'text-gray-400';
    return 'text-gray-300';
  };

  return (
    <div 
      className={`
        fixed z-50 flex items-center space-x-3 
        bg-black/60 backdrop-blur-sm border border-white/20 
        rounded-xl px-4 py-3 text-sm transition-all duration-300
        hover:bg-black/80 hover:border-white/40
        ${positionClasses[position]}
        ${className}
      `}
      title={`Auto-save status: ${getStatusText()}`}
    >
      {/* Status Icon */}
      {getStatusIcon()}
      
      {/* Status Text */}
      {!compact && (
        <span className={`font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      )}

      {/* Statistics (when expanded) */}
      {!compact && showWhenIdle && stats.totalSaved > 0 && (
        <div className="text-xs text-gray-400 border-l border-white/20 pl-3">
          <div>Total: {stats.totalSaved}</div>
          {stats.pendingOperations > 0 && (
            <div>Pending: {stats.pendingOperations}</div>
          )}
        </div>
      )}

      {/* Sacred geometry accent */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10"></div>
    </div>
  );
}

/**
 * Compact version for minimal UI impact
 */
export function CompactAutoSaveIndicator({ className = '' }: { className?: string }) {
  return (
    <AutoSaveStatusIndicator 
      className={className}
      compact={true}
      showWhenIdle={false}
    />
  );
}

/**
 * Detailed version for dashboard/settings
 */
export function DetailedAutoSaveIndicator({ className = '' }: { className?: string }) {
  return (
    <AutoSaveStatusIndicator 
      className={className}
      compact={false}
      showWhenIdle={true}
      position="top-left"
    />
  );
} 