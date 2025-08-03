/**
 * Backend Status Indicator
 * 
 * Shows real-time backend connection status and mode
 * Automatically switches between real API and fallback mode
 */

'use client';

import React, { useState, useEffect } from 'react';

interface BackendStatus {
  connected: boolean;
  mode: 'real-api' | 'fallback' | 'checking';
  lastCheck: Date | null;
  responseTime?: number;
}

interface BackendStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const BackendStatusIndicator: React.FC<BackendStatusIndicatorProps> = ({
  className = '',
  showDetails = false
}) => {
  const [status, setStatus] = useState<BackendStatus>({
    connected: false,
    mode: 'checking',
    lastCheck: null
  });

  const checkBackendStatus = async () => {
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://witnessos-engines-production.up.railway.app/calculate/numerology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { birth_date: '1991-08-13', full_name: 'Status Check' } }),
      });
      
      const responseTime = Date.now() - startTime;
      const connected = response.ok;
      
      setStatus({
        connected,
        mode: connected ? 'real-api' : 'fallback',
        lastCheck: new Date(),
        responseTime
      });
    } catch (error) {
      setStatus({
        connected: false,
        mode: 'fallback',
        lastCheck: new Date(),
        responseTime: Date.now() - startTime
      });
    }
  };

  useEffect(() => {
    // Initial check
    checkBackendStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status.mode) {
      case 'real-api': return 'text-green-400';
      case 'fallback': return 'text-yellow-400';
      case 'checking': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status.mode) {
      case 'real-api': return '🟢';
      case 'fallback': return '🟡';
      case 'checking': return '🔵';
      default: return '⚪';
    }
  };

  const getStatusText = () => {
    switch (status.mode) {
      case 'real-api': return 'Real API';
      case 'fallback': return 'Fallback Mode';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  const getStatusDescription = () => {
    switch (status.mode) {
      case 'real-api': return 'Connected to Railway backend - all engines using real calculations';
      case 'fallback': return 'Using TypeScript engines - full functionality with local calculations';
      case 'checking': return 'Checking backend connection status...';
      default: return 'Status unknown';
    }
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <span className="text-sm">{getStatusIcon()}</span>
        <span className={`text-xs font-mono ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-black/30 backdrop-blur-sm border border-gray-600/30 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <span className={`font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <button
          onClick={checkBackendStatus}
          className="px-2 py-1 bg-gray-600/50 hover:bg-gray-500/50 rounded text-xs text-gray-300 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <p className="text-xs text-gray-400 mb-2">
        {getStatusDescription()}
      </p>
      
      {status.lastCheck && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Last check: {status.lastCheck.toLocaleTimeString()}</div>
          {status.responseTime && (
            <div>Response time: {status.responseTime}ms</div>
          )}
        </div>
      )}
      
      {status.mode === 'fallback' && (
        <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-600/30 rounded text-xs text-yellow-300">
          <strong>Note:</strong> All engines are fully functional using local TypeScript calculations. 
          Real backend will be used automatically when available.
        </div>
      )}
    </div>
  );
};

export default BackendStatusIndicator;
