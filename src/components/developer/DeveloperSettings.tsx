/**
 * Developer Settings Component - WitnessOS Developer Dashboard
 * 
 * Account management and tier configuration for developers
 * with cyberpunk theming and consciousness terminology.
 */

'use client';

import React, { useState } from 'react';
import type { DeveloperSettingsProps } from '@/types/api-keys';

export function DeveloperSettings({
  user,
  tierInfo,
  onUpgradeTier,
  onUpdateProfile
}: DeveloperSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email
  });

  const handleSave = async () => {
    try {
      await onUpdateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-600/20 border-purple-500/50 text-purple-300';
      case 'pro':
        return 'bg-yellow-600/20 border-yellow-500/50 text-yellow-300';
      default:
        return 'bg-green-600/20 border-green-500/50 text-green-300';
    }
  };

  const getUsagePercentage = () => {
    return (user.api_calls_used / user.api_calls_limit) * 100;
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-cyan-300 font-mono">
            👤 Account Information
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-300 hover:bg-purple-600/30 transition-colors font-mono text-sm"
          >
            {isEditing ? '✕ Cancel' : '✏️ Edit'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-cyan-400 text-sm font-mono mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                placeholder="Enter your full name"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white font-mono text-sm">
                {user.name || 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-cyan-400 text-sm font-mono mb-2">
              Email Address
            </label>
            <div className="px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-gray-400 font-mono text-sm">
              {user.email}
            </div>
            <div className="text-xs text-gray-500 font-mono mt-1">
              Contact support to change email
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700/50">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-700 text-gray-300 font-mono text-sm rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 text-black font-mono font-bold text-sm rounded hover:scale-105 transition-transform"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Current Tier */}
      <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-cyan-300 font-mono mb-6">
          🎯 Developer Tier
        </h3>

        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h4 className="text-lg font-bold text-white font-mono">
                {tierInfo.name}
              </h4>
              <span className={`px-3 py-1 rounded text-sm font-mono border ${getTierBadgeColor(tierInfo.id)}`}>
                {tierInfo.id.toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-300 font-mono">
                ${tierInfo.price}
              </div>
              <div className="text-xs text-gray-400 font-mono">per month</div>
            </div>
          </div>

          {/* Usage Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 font-mono text-sm">API Calls This Month</span>
              <span className={`font-mono text-sm ${getUsageColor()}`}>
                {user.api_calls_used.toLocaleString()} / {user.api_calls_limit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  getUsagePercentage() >= 90 ? 'bg-red-500' :
                  getUsagePercentage() >= 75 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
              />
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h5 className="text-purple-300 font-mono font-bold text-sm mb-2">Features</h5>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className={tierInfo.features.webhooks ? 'text-green-400' : 'text-red-400'}>
                    {tierInfo.features.webhooks ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-300">Webhooks</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className={tierInfo.features.batchOperations ? 'text-green-400' : 'text-red-400'}>
                    {tierInfo.features.batchOperations ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-300">Batch Operations</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className={tierInfo.features.customRateLimits ? 'text-green-400' : 'text-red-400'}>
                    {tierInfo.features.customRateLimits ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-300">Custom Rate Limits</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className={tierInfo.features.prioritySupport ? 'text-green-400' : 'text-red-400'}>
                    {tierInfo.features.prioritySupport ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-300">Priority Support</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-purple-300 font-mono font-bold text-sm mb-2">Limits</h5>
              <div className="space-y-1 text-xs font-mono text-gray-300">
                <div>API Keys: {tierInfo.limits.maxApiKeys}</div>
                <div>Rate: {tierInfo.limits.rateLimitPerMinute}/min</div>
                <div>Webhooks: {tierInfo.limits.maxWebhooks}</div>
                <div>Retention: {tierInfo.limits.dataRetentionDays} days</div>
              </div>
            </div>
          </div>

          {/* Engines Access */}
          <div className="mb-6">
            <h5 className="text-purple-300 font-mono font-bold text-sm mb-2">Consciousness Engines</h5>
            <div className="text-xs font-mono text-gray-300">
              {tierInfo.features.engines.includes('*') ? (
                <span className="text-green-400">✓ All engines available</span>
              ) : (
                <div className="space-y-1">
                  {tierInfo.features.engines.map(engine => (
                    <div key={engine} className="text-green-400">
                      ✓ {engine.charAt(0).toUpperCase() + engine.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upgrade Button */}
          {tierInfo.id !== 'enterprise' && (
            <button
              onClick={onUpgradeTier}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 text-black font-mono font-bold text-sm rounded hover:scale-105 transition-transform"
            >
              🚀 Upgrade Tier
            </button>
          )}
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-cyan-300 font-mono mb-6">
          📚 Developer Resources
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => window.open('/docs/api', '_blank')}
            className="p-4 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 rounded-lg hover:border-cyan-400/50 transition-all duration-200 text-left"
          >
            <div className="text-cyan-300 font-mono font-bold mb-2">📖 API Documentation</div>
            <div className="text-gray-400 text-sm font-mono">Complete reference for all consciousness engines</div>
          </button>

          <button
            onClick={() => window.open('/docs/sdks', '_blank')}
            className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg hover:border-purple-400/50 transition-all duration-200 text-left"
          >
            <div className="text-purple-300 font-mono font-bold mb-2">🛠️ SDKs & Libraries</div>
            <div className="text-gray-400 text-sm font-mono">JavaScript, Python, and Swift SDKs</div>
          </button>

          <button
            onClick={() => window.open('/docs/examples', '_blank')}
            className="p-4 bg-gradient-to-r from-pink-600/20 to-yellow-600/20 border border-pink-500/30 rounded-lg hover:border-pink-400/50 transition-all duration-200 text-left"
          >
            <div className="text-pink-300 font-mono font-bold mb-2">💡 Code Examples</div>
            <div className="text-gray-400 text-sm font-mono">Sample implementations and tutorials</div>
          </button>

          <button
            onClick={() => window.open('mailto:developers@witnessos.space')}
            className="p-4 bg-gradient-to-r from-yellow-600/20 to-green-600/20 border border-yellow-500/30 rounded-lg hover:border-yellow-400/50 transition-all duration-200 text-left"
          >
            <div className="text-yellow-300 font-mono font-bold mb-2">💬 Developer Support</div>
            <div className="text-gray-400 text-sm font-mono">Get help from our consciousness engineers</div>
          </button>
        </div>
      </div>

      {/* Billing Information */}
      {user.billing_customer_id && (
        <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-cyan-300 font-mono mb-6">
            💳 Billing Information
          </h3>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-mono">Current Plan: {tierInfo.name}</div>
                <div className="text-gray-400 font-mono text-sm">
                  Customer ID: {user.billing_customer_id}
                </div>
              </div>
              <button
                onClick={() => window.open('/billing/portal', '_blank')}
                className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded text-blue-300 hover:bg-blue-600/30 transition-colors font-mono text-sm"
              >
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
