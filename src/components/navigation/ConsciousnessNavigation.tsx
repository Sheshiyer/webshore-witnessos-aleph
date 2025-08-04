/**
 * Consciousness Navigation - Sacred Gateway Menu
 * 
 * Admin-only navigation system for consciousness features
 * Only visible to admin users after authentication
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenMonitor } from '@/hooks/useTokenMonitor';
import { useConsciousnessEngineIntegration } from '@/hooks/useConsciousnessEngineIntegration';

interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  description: string;
  requiresAuth: boolean;
  color: string;
}

const WITNESS_PATHS: NavigationItem[] = [
  {
    name: 'Witness Engines',
    path: '/consciousness-engines',
    icon: '🧠',
    description: 'Engine unlock and testing interface',
    requiresAuth: true,
    color: 'purple',
  },
  {
    name: 'Cosmic Temple',
    path: '/cosmic-temple',
    icon: '🌌',
    description: 'Sacred portal for deep witness exploration',
    requiresAuth: true,
    color: 'indigo',
  },
  {
    name: 'Submerged Forest',
    path: '/submerged-forest',
    icon: '🌲',
    description: 'Symbolic forest practice terrain',
    requiresAuth: true,
    color: 'green',
  },
  {
    name: 'Sigil Workshop',
    path: '/sigil-workshop',
    icon: '🌸',
    description: 'Breath-tree sigil creation atelier',
    requiresAuth: true,
    color: 'purple',
  },
  {
    name: 'Engine Laboratory',
    path: '/test-engines',
    icon: '🧪',
    description: 'Consciousness engine testing & calibration',
    requiresAuth: true,
    color: 'blue',
  },
];

export default function ConsciousnessNavigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const { timeUntilExpiry, needsRefresh } = useTokenMonitor();
  const { 
    isAdminMode, 
    adminUnlockAll, 
    unlockedEngines,
    toggleAdminMode,
    toggleAdminUnlockAll,
    toggleDebugMode,
    isDebugMode
  } = useConsciousnessEngineIntegration();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  const isAdmin = user?.email === 'sheshnarayan.iyer@gmail.com';

  // Handle loading state - only show after authentication is resolved
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Wait for auth to settle

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  // Don't render anything if loading (temporarily allow non-admin for testing)
  if (isLoading) {
    return null;
  }

  return (
    <>
      {/* Unified Admin Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-3 rounded-full backdrop-blur-sm border transition-all duration-300 bg-yellow-600/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-600/30"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">🔧</span>
          <span className="text-xs hidden sm:block font-semibold">
            Admin {adminUnlockAll ? '⚡' : ''}
          </span>
        </div>
      </button>

      {/* Admin Navigation & Control Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-black/90 backdrop-blur-md rounded-3xl border border-yellow-500/30 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-yellow-300 mb-2">
                  🔧 Admin Control Center
                </h2>
                <p className="text-yellow-200">
                  Welcome, Admin {user?.name} - Full System Access
                </p>
                <div className="text-sm text-white/60 mt-2">
                  <p>Session expires in: {timeUntilExpiry}</p>
                  {needsRefresh && (
                    <p className="text-yellow-400">⚡ Signature renewal recommended</p>
                  )}
                </div>
              </div>

              {/* Admin Controls Section */}
              <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-2xl p-6 mb-8 border border-yellow-500/30">
                <h3 className="text-xl font-bold text-yellow-300 mb-4">⚡ Admin Controls</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Primary Control - Unlock All Engines */}
                  <div className="bg-black/30 rounded-lg p-4 border border-yellow-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-yellow-300">🔓 Unlock All Engines</span>
                      <button
                        onClick={toggleAdminUnlockAll}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                          adminUnlockAll
                            ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        {adminUnlockAll ? 'ON ⚡' : 'OFF'}
                      </button>
                    </div>
                    <div className="text-xs text-yellow-200">
                      {adminUnlockAll ? 
                        `✅ All 10 engines unlocked (${unlockedEngines.length}/10)` : 
                        `🔒 Normal unlock progression (${unlockedEngines.length}/10)`
                      }
                    </div>
                  </div>

                  {/* Secondary Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-300">🔑 Admin Mode</span>
                      <button
                        onClick={toggleAdminMode}
                        className={`px-2 py-1 rounded text-xs ${
                          isAdminMode ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {isAdminMode ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-300">🐛 Debug Mode</span>
                      <button
                        onClick={toggleDebugMode}
                        className={`px-2 py-1 rounded text-xs ${
                          isDebugMode ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                        }`}
                      >
                        {isDebugMode ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Overview */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-black/20 rounded p-3">
                    <div className="text-2xl font-bold text-green-400">{unlockedEngines.length}</div>
                    <div className="text-xs text-gray-300">Engines Unlocked</div>
                  </div>
                  <div className="bg-black/20 rounded p-3">
                    <div className="text-2xl font-bold text-blue-400">{isAdminMode ? '✅' : '❌'}</div>
                    <div className="text-xs text-gray-300">Admin Mode</div>
                  </div>
                  <div className="bg-black/20 rounded p-3">
                    <div className="text-2xl font-bold text-purple-400">{adminUnlockAll ? '⚡' : '🔒'}</div>
                    <div className="text-xs text-gray-300">Override Status</div>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">🌟 Witness Spaces</h3>
                <div className="grid gap-4">
                  {WITNESS_PATHS.map((item) => (
                    <NavigationCard
                      key={item.path}
                      item={item}
                      isAuthenticated={isAuthenticated}
                      onNavigate={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              </div>

              {/* Admin Actions */}
              <div className="border-t border-white/20 pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link 
                    href="/"
                    onClick={() => setIsOpen(false)}
                    className="block p-3 bg-blue-500/20 border border-blue-500/50 rounded-2xl text-center text-blue-300 hover:bg-blue-500/30 transition-colors"
                  >
                    🏠 Return to Onboarding
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-3 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-300 hover:bg-red-500/30 transition-colors"
                  >
                    🚪 Admin Logout
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface NavigationCardProps {
  item: NavigationItem;
  isAuthenticated: boolean;
  onNavigate: () => void;
}

function NavigationCard({ item, isAuthenticated, onNavigate }: NavigationCardProps) {
  const canAccess = !item.requiresAuth || isAuthenticated;
  
  const colorClasses = {
    indigo: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20',
    green: 'border-green-500/50 bg-green-500/10 text-green-300 hover:bg-green-500/20',
    purple: 'border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20',
    blue: 'border-blue-500/50 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20',
  };

  const disabledClasses = 'border-gray-500/30 bg-gray-500/10 text-gray-500 cursor-not-allowed';

  if (canAccess) {
    return (
      <Link
        href={item.path}
        onClick={onNavigate}
        className={`block p-4 rounded-2xl border transition-all duration-300 hover:scale-105 ${
          colorClasses[item.color as keyof typeof colorClasses]
        }`}
      >
        <div className="flex items-center space-x-4">
          <span className="text-2xl">{item.icon}</span>
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm opacity-80">{item.description}</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={`p-4 rounded-2xl border ${disabledClasses}`}>
      <div className="flex items-center space-x-4">
        <span className="text-2xl opacity-50">{item.icon}</span>
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm opacity-60">{item.description}</p>
          <p className="text-xs mt-1">🔒 Authentication required</p>
        </div>
      </div>
    </div>
  );
} 