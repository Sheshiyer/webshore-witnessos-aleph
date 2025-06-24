/**
 * Debug Toggle Button for WitnessOS Webshore
 * 
 * Floating button to access debug navigation panel
 * Only visible in development environment
 */

'use client';

import { useDebug } from './DebugContext';
import React from 'react';

export const DebugToggleButton: React.FC = () => {
  const { debugState, togglePanel } = useDebug();

  if (!debugState.isEnabled) {
    return null;
  }

  return (
    <button
      onClick={togglePanel}
      className={`
        fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full
        bg-gradient-to-r from-cyan-600 to-blue-600
        border border-cyan-400/50 shadow-lg shadow-cyan-500/25
        flex items-center justify-center
        transition-all duration-300 hover:scale-110
        ${debugState.isPanelVisible ? 'bg-opacity-100' : 'bg-opacity-80 hover:bg-opacity-100'}
      `}
      title="Debug Console (Ctrl+D)"
    >
      <div className="relative">
        {/* Debug Icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        
        {/* Active indicator */}
        {debugState.isPanelVisible && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        )}
        
        {/* Layer indicator */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black/80 rounded-full flex items-center justify-center">
          <span className="text-xs text-cyan-400 font-mono font-bold">
            {debugState.currentLayer}
          </span>
        </div>
      </div>
    </button>
  );
};

export default DebugToggleButton;
