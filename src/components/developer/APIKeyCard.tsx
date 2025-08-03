/**
 * API Key Card Component - WitnessOS Developer Dashboard
 * 
 * Individual API key display card with cyberpunk theming
 * and consciousness-aligned terminology.
 */

'use client';

import React, { useState } from 'react';
import type { APIKeyCardProps } from '@/types/api-keys';

export function APIKeyCard({
  apiKey,
  usage,
  onEdit,
  onRevoke,
  onRegenerate,
  onViewUsage
}: APIKeyCardProps) {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getStatusColor = () => {
    if (!apiKey.is_active) return 'text-red-400 bg-red-900/20 border-red-500/30';
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    }
    return 'text-green-400 bg-green-900/20 border-green-500/30';
  };

  const getStatusText = () => {
    if (!apiKey.is_active) return 'REVOKED';
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return 'EXPIRED';
    }
    return 'ACTIVE';
  };

  const getEnvironmentColor = () => {
    return apiKey.environment === 'live' 
      ? 'text-cyan-400 bg-cyan-900/20 border-cyan-500/30'
      : 'text-purple-400 bg-purple-900/20 border-purple-500/30';
  };

  const getScopeDisplayText = (scopes: string[]) => {
    if (scopes.includes('engines:*:read')) return 'All Engines';
    
    const engineScopes = scopes.filter(s => s.startsWith('engines:') && s !== 'engines:*:read');
    const otherScopes = scopes.filter(s => !s.startsWith('engines:'));
    
    let text = '';
    if (engineScopes.length > 0) {
      const engines = engineScopes.map(s => s.split(':')[1]).join(', ');
      text += engines;
    }
    if (otherScopes.length > 0) {
      if (text) text += ', ';
      text += otherScopes.join(', ');
    }
    
    return text || 'No permissions';
  };

  return (
    <div 
      className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 hover:border-cyan-500/30 transition-all duration-200"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        {/* Key Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-lg font-bold text-white font-mono">{apiKey.name}</h4>
            
            {/* Status Badge */}
            <span className={`px-2 py-1 rounded text-xs font-mono border ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            
            {/* Environment Badge */}
            <span className={`px-2 py-1 rounded text-xs font-mono border ${getEnvironmentColor()}`}>
              {apiKey.environment.toUpperCase()}
            </span>
          </div>

          {/* Description */}
          {apiKey.description && (
            <p className="text-gray-400 text-sm font-mono mb-3">{apiKey.description}</p>
          )}

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/* Key Prefix */}
            <div>
              <div className="text-gray-500 font-mono text-xs mb-1">KEY PREFIX</div>
              <div className="text-cyan-300 font-mono">{apiKey.key_prefix}***</div>
            </div>

            {/* Permissions */}
            <div>
              <div className="text-gray-500 font-mono text-xs mb-1">PERMISSIONS</div>
              <div className="text-purple-300 font-mono text-xs">
                {getScopeDisplayText(apiKey.scopes)}
              </div>
            </div>

            {/* Last Used */}
            <div>
              <div className="text-gray-500 font-mono text-xs mb-1">LAST USED</div>
              <div className="text-yellow-300 font-mono text-xs">
                {formatRelativeTime(apiKey.last_used_at)}
              </div>
            </div>
          </div>

          {/* Usage Stats (if available) */}
          {usage && (
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 font-mono text-xs mb-1">CALLS THIS MONTH</div>
                  <div className="text-green-300 font-mono">{usage.callsThisMonth.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-mono text-xs mb-1">RATE LIMIT</div>
                  <div className="text-blue-300 font-mono">
                    {apiKey.rate_limit_per_minute}/min
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expiration Warning */}
          {apiKey.expires_at && (
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="text-xs font-mono">
                <span className="text-gray-500">EXPIRES:</span>{' '}
                <span className={
                  new Date(apiKey.expires_at) < new Date() 
                    ? 'text-red-400' 
                    : new Date(apiKey.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                }>
                  {formatDate(apiKey.expires_at)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`ml-4 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => onViewUsage(apiKey.id)}
              className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 hover:bg-blue-600/30 transition-colors font-mono text-xs"
              title="View Usage Analytics"
            >
              📊 Analytics
            </button>
            
            <button
              onClick={() => onEdit(apiKey)}
              className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors font-mono text-xs"
              title="Edit API Key"
            >
              ✏️ Edit
            </button>
            
            <button
              onClick={() => onRegenerate(apiKey.id)}
              className="px-3 py-1 bg-yellow-600/20 border border-yellow-500/30 rounded text-yellow-300 hover:bg-yellow-600/30 transition-colors font-mono text-xs"
              title="Regenerate Key"
              disabled={!apiKey.is_active}
            >
              🔄 Regen
            </button>
            
            <button
              onClick={() => onRevoke(apiKey.id)}
              className="px-3 py-1 bg-red-600/20 border border-red-500/30 rounded text-red-300 hover:bg-red-600/30 transition-colors font-mono text-xs"
              title="Revoke API Key"
              disabled={!apiKey.is_active}
            >
              🗑️ Revoke
            </button>
          </div>
        </div>
      </div>

      {/* Rate Limits Display */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="text-gray-500 font-mono text-xs mb-2">RATE LIMITS</div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="text-center">
            <div className="text-gray-400 font-mono">Per Minute</div>
            <div className="text-cyan-300 font-mono font-bold">{apiKey.rate_limit_per_minute}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 font-mono">Per Hour</div>
            <div className="text-purple-300 font-mono font-bold">{apiKey.rate_limit_per_hour}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400 font-mono">Per Day</div>
            <div className="text-pink-300 font-mono font-bold">{apiKey.rate_limit_per_day}</div>
          </div>
        </div>
      </div>

      {/* Scopes Detail (Expandable) */}
      <details className="mt-4 pt-4 border-t border-gray-700/50">
        <summary className="text-gray-500 font-mono text-xs cursor-pointer hover:text-gray-400">
          PERMISSIONS DETAIL ({apiKey.scopes.length} scopes)
        </summary>
        <div className="mt-2 space-y-1">
          {apiKey.scopes.map((scope, index) => (
            <div key={index} className="text-xs font-mono">
              <span className="text-gray-400">•</span>{' '}
              <span className="text-cyan-300">{scope}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
