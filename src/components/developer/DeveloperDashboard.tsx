/**
 * Developer Dashboard Component - WitnessOS API Management
 * 
 * Integrated developer section for the authenticated user's home dashboard
 * with cyberpunk theming and WitnessOS consciousness terminology.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { APIKeyCard } from './APIKeyCard';
import { CreateAPIKeyModal } from './CreateAPIKeyModal';
import { UsageChart } from './UsageChart';
import { DeveloperSettings } from './DeveloperSettings';
import { DocumentationDashboard } from './docs/DocumentationDashboard';
import type {
  APIKey,
  DeveloperDashboardState,
  CreateAPIKeyRequest,
  UsageStatistics,
  RateLimitStatus
} from '@/types/api-keys';

interface DeveloperDashboardProps {
  className?: string;
}

export function DeveloperDashboard({ className = '' }: DeveloperDashboardProps) {
  const { user, isAuthenticated } = useAuth();
  const [dashboardState, setDashboardState] = useState<DeveloperDashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'analytics' | 'docs' | 'settings'>('overview');

  // Load dashboard data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [keysResponse, usageResponse, rateLimitsResponse, scopesResponse] = await Promise.all([
        fetch('/api/developer/keys', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('witnessos_token')}` }
        }),
        fetch('/api/developer/usage', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('witnessos_token')}` }
        }),
        fetch('/api/developer/rate-limits', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('witnessos_token')}` }
        }),
        fetch('/api/developer/scopes', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('witnessos_token')}` }
        })
      ]);

      const [keysData, usageData, rateLimitsData, scopesData] = await Promise.all([
        keysResponse.json(),
        usageResponse.json(),
        rateLimitsResponse.json(),
        scopesResponse.json()
      ]);

      if (!keysData.success || !usageData.success || !rateLimitsData.success || !scopesData.success) {
        throw new Error('Failed to load dashboard data');
      }

      setDashboardState({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          developer_tier: (user as any).developer_tier || 'free',
          api_calls_used: (user as any).api_calls_used || 0,
          api_calls_limit: (user as any).api_calls_limit || 1000,
          billing_customer_id: (user as any).billing_customer_id
        },
        apiKeys: keysData.data.apiKeys,
        usage: usageData.data,
        rateLimits: rateLimitsData.data,
        availableScopes: scopesData.data.scopes,
        tierInfo: getTierInfo((user as any).developer_tier || 'free')
      });

    } catch (err) {
      console.error('Failed to load developer dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAPIKey = async (request: CreateAPIKeyRequest) => {
    try {
      const response = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('witnessos_token')}`
        },
        body: JSON.stringify(request)
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh dashboard data
        await loadDashboardData();
        setShowCreateModal(false);
        
        // Show the generated key to user (only time they'll see it)
        alert(`API Key Created!\n\nKey: ${result.data.plainTextKey}\n\nSave this key now - you won't be able to see it again!`);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create API key'
      };
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/developer/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('witnessos_token')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        await loadDashboardData();
      } else {
        alert(`Failed to revoke key: ${result.error}`);
      }
    } catch (error) {
      alert(`Failed to revoke key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getTierInfo = (tier: 'free' | 'pro' | 'enterprise') => {
    const tiers = {
      free: {
        id: 'free' as const,
        name: 'Free Tier',
        price: 0,
        features: {
          engines: ['numerology', 'biorhythm', 'iching'],
          webhooks: false,
          batchOperations: false,
          customRateLimits: false,
          prioritySupport: false,
          sla: false,
          whiteLabeling: false
        },
        limits: {
          apiCallsPerMonth: 1000,
          rateLimitPerMinute: 10,
          rateLimitPerHour: 100,
          rateLimitPerDay: 1000,
          maxApiKeys: 2,
          maxWebhooks: 0,
          dataRetentionDays: 7
        }
      },
      pro: {
        id: 'pro' as const,
        name: 'Pro Tier',
        price: 29,
        features: {
          engines: ['*'],
          webhooks: true,
          batchOperations: true,
          customRateLimits: true,
          prioritySupport: false,
          sla: false,
          whiteLabeling: false
        },
        limits: {
          apiCallsPerMonth: 50000,
          rateLimitPerMinute: 100,
          rateLimitPerHour: 5000,
          rateLimitPerDay: 50000,
          maxApiKeys: 10,
          maxWebhooks: 5,
          dataRetentionDays: 30
        }
      },
      enterprise: {
        id: 'enterprise' as const,
        name: 'Enterprise Tier',
        price: 299,
        features: {
          engines: ['*'],
          webhooks: true,
          batchOperations: true,
          customRateLimits: true,
          prioritySupport: true,
          sla: true,
          whiteLabeling: true
        },
        limits: {
          apiCallsPerMonth: 500000,
          rateLimitPerMinute: 1000,
          rateLimitPerHour: 50000,
          rateLimitPerDay: 500000,
          maxApiKeys: 50,
          maxWebhooks: 25,
          dataRetentionDays: 365
        }
      }
    };
    
    return tiers[tier];
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className={`developer-dashboard ${className}`}>
        <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-cyan-300 font-mono">Loading Developer Portal...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`developer-dashboard ${className}`}>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <div className="text-red-400 font-mono text-center">
            <span className="text-red-500">[ERROR]</span> {error}
          </div>
          <button
            onClick={loadDashboardData}
            className="mt-4 mx-auto block px-4 py-2 bg-red-600/20 border border-red-500/50 rounded text-red-300 hover:bg-red-600/30 transition-colors font-mono text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardState) {
    return null;
  }

  return (
    <div className={`developer-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cyan-300 font-mono mb-2">
              🔧 Developer Portal
            </h2>
            <p className="text-gray-400 font-mono text-sm">
              API Gateway to WitnessOS Consciousness Engines
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 font-mono">Tier</div>
            <div className={`text-lg font-bold font-mono ${
              dashboardState.user.developer_tier === 'enterprise' ? 'text-purple-400' :
              dashboardState.user.developer_tier === 'pro' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {dashboardState.tierInfo.name.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 font-mono mb-1">API CALLS THIS MONTH</div>
            <div className="text-xl font-bold text-cyan-300 font-mono">
              {dashboardState.usage.callsThisMonth.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              / {dashboardState.user.api_calls_limit.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 font-mono mb-1">SUCCESS RATE</div>
            <div className="text-xl font-bold text-green-400 font-mono">
              {(dashboardState.usage.successRate * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 font-mono mb-1">AVG RESPONSE</div>
            <div className="text-xl font-bold text-purple-400 font-mono">
              {dashboardState.usage.averageResponseTime}ms
            </div>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 font-mono mb-1">ACTIVE KEYS</div>
            <div className="text-xl font-bold text-yellow-400 font-mono">
              {dashboardState.apiKeys.filter(k => k.is_active).length}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              / {dashboardState.tierInfo.limits.maxApiKeys}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'keys', label: 'API Keys', icon: '🔑' },
          { id: 'analytics', label: 'Analytics', icon: '📈' },
          { id: 'docs', label: 'Documentation', icon: '🧠' },
          { id: 'settings', label: 'Settings', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-mono text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-cyan-600/20 border-b-2 border-cyan-400 text-cyan-300'
                : 'text-gray-400 hover:text-cyan-300 hover:bg-cyan-600/10'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-cyan-300 font-mono mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-4 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border border-cyan-500/30 rounded-lg hover:border-cyan-400/50 transition-all duration-200 text-left"
              >
                <div className="text-cyan-300 font-mono font-bold mb-2">🔑 Create API Key</div>
                <div className="text-gray-400 text-sm font-mono">Generate new access credentials</div>
              </button>
              
              <button
                onClick={() => setActiveTab('docs')}
                className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg hover:border-purple-400/50 transition-all duration-200 text-left"
              >
                <div className="text-purple-300 font-mono font-bold mb-2">🧠 Engine Lab</div>
                <div className="text-gray-400 text-sm font-mono">Interactive consciousness documentation</div>
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className="p-4 bg-gradient-to-r from-pink-600/20 to-yellow-600/20 border border-pink-500/30 rounded-lg hover:border-pink-400/50 transition-all duration-200 text-left"
              >
                <div className="text-pink-300 font-mono font-bold mb-2">📈 View Analytics</div>
                <div className="text-gray-400 text-sm font-mono">Monitor API usage patterns</div>
              </button>
            </div>
          </div>

          {/* Recent API Keys */}
          <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-cyan-300 font-mono">Recent API Keys</h3>
              <button
                onClick={() => setActiveTab('keys')}
                className="text-cyan-400 hover:text-cyan-300 font-mono text-sm"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {dashboardState.apiKeys.slice(0, 3).map(apiKey => (
                <APIKeyCard
                  key={apiKey.id}
                  apiKey={apiKey}
                  onEdit={() => {}}
                  onRevoke={handleRevokeKey}
                  onRegenerate={() => {}}
                  onViewUsage={() => setActiveTab('analytics')}
                />
              ))}
              {dashboardState.apiKeys.length === 0 && (
                <div className="text-center py-8 text-gray-400 font-mono">
                  No API keys created yet. Create your first key to get started!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-cyan-300 font-mono">API Keys Management</h3>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={dashboardState.apiKeys.filter(k => k.is_active).length >= dashboardState.tierInfo.limits.maxApiKeys}
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 text-black font-mono font-bold text-sm rounded hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                + Create New Key
              </button>
            </div>
            
            <div className="space-y-4">
              {dashboardState.apiKeys.map(apiKey => (
                <APIKeyCard
                  key={apiKey.id}
                  apiKey={apiKey}
                  onEdit={() => {}}
                  onRevoke={handleRevokeKey}
                  onRegenerate={() => {}}
                  onViewUsage={() => setActiveTab('analytics')}
                />
              ))}
              {dashboardState.apiKeys.length === 0 && (
                <div className="text-center py-12 text-gray-400 font-mono">
                  <div className="text-4xl mb-4">🔑</div>
                  <div className="text-lg mb-2">No API keys yet</div>
                  <div className="text-sm">Create your first API key to start using the WitnessOS API</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <UsageChart
            data={dashboardState.usage.timeSeriesData}
            timeRange="30d"
            onTimeRangeChange={() => {}}
          />
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="space-y-6">
          <DocumentationDashboard
            userTier={dashboardState.user.developer_tier}
            apiKeys={dashboardState.apiKeys}
            onUpgradeTier={() => {
              // Handle tier upgrade
              alert('Upgrade functionality coming soon!');
            }}
          />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <DeveloperSettings
            user={dashboardState.user}
            tierInfo={dashboardState.tierInfo}
            onUpgradeTier={() => {}}
            onUpdateProfile={() => {}}
          />
        </div>
      )}

      {/* Create API Key Modal */}
      <CreateAPIKeyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateKey={handleCreateAPIKey}
        availableScopes={dashboardState.availableScopes}
        userTier={dashboardState.user.developer_tier}
        currentKeyCount={dashboardState.apiKeys.filter(k => k.is_active).length}
        maxKeys={dashboardState.tierInfo.limits.maxApiKeys}
      />
    </div>
  );
}
