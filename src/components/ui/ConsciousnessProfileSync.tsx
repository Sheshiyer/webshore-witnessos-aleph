/**
 * Consciousness Profile Sync Component
 * 
 * Sacred geometry-themed interface for managing consciousness profile synchronization
 * between local storage and cloud storage with conflict resolution
 */

'use client';

import { 
  useConsciousnessProfile,
  type MergeStrategy,
  type MergeOptions,
  type ProfileMergeResult,
  type ProfileConflict,
  type ConflictResolution
} from '@/hooks/useConsciousnessProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useConsciousness } from '@/hooks/useConsciousness';
import React, { useState } from 'react';
import { ConsciousnessConflictResolver } from './ConsciousnessConflictResolver';

interface ConsciousnessProfileSyncProps {
  className?: string;
  onSyncComplete?: () => void;
}

export const ConsciousnessProfileSync: React.FC<ConsciousnessProfileSyncProps> = ({
  className = '',
  onSyncComplete,
}) => {
  const { breathPhase } = useConsciousness();
  const { isAuthenticated, user } = useAuth();
  const {
    profile,
    cloudProfile,
    hasCloudProfile,
    isSyncing,
    syncError,
    lastSyncTime,
    uploadToCloud,
    downloadFromCloud,
    syncProfiles,
    deleteFromCloud,
    mergeResult,
    lastMergeTime,
    mergeInProgress,
    mergeProfiles,
    applyManualResolution
  } = useConsciousnessProfile();

  const [showDetails, setShowDetails] = useState(false);
  const [operation, setOperation] = useState<string | null>(null);
  const [selectedMergeStrategy, setSelectedMergeStrategy] = useState<MergeStrategy>('newest-wins');
  const [showMergeDetails, setShowMergeDetails] = useState(false);
  const [showConflictDetails, setShowConflictDetails] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showConflictResolver, setShowConflictResolver] = useState(false);
  const [conflictsToResolve, setConflictsToResolve] = useState<ProfileConflict[]>([]);

  if (!isAuthenticated) {
    return (
      <div className={`bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h3 className="text-2xl font-bold text-white mb-4">Authentication Required</h3>
          <p className="text-gray-300">
            Please log in to sync your consciousness profile to the cloud
          </p>
        </div>
      </div>
    );
  }

  const handleOperation = async (operationType: 'upload' | 'download' | 'sync' | 'delete') => {
    setOperation(operationType);
    
    try {
      let success = false;
      
      switch (operationType) {
        case 'upload':
          success = await uploadToCloud();
          break;
        case 'download':
          success = await downloadFromCloud();
          break;
        case 'sync':
          success = await syncProfiles();
          break;
        case 'delete':
          success = await deleteFromCloud();
          break;
      }
      
      if (success && onSyncComplete) {
        onSyncComplete();
      }
    } finally {
      setOperation(null);
    }
  };

  const handleAdvancedSync = async () => {
    const options: MergeOptions = {
      strategy: selectedMergeStrategy,
      mergeArchetypalSignature: true,
      preserveLocalChanges: selectedMergeStrategy === 'local-wins'
    };

    const success = await syncProfiles(options);
    if (success) {
      setStatusMessage('🔄✨ Advanced sync completed successfully');
      setShowMergeDetails(true);
    } else {
      setStatusMessage('❌ Advanced sync failed');
    }
  };

  const handleManualMerge = () => {
    if (profile && cloudProfile) {
      const options: MergeOptions = {
        strategy: selectedMergeStrategy,
        mergeArchetypalSignature: true
      };
      
      const result = mergeProfiles(profile, cloudProfile, options);
      setShowMergeDetails(true);
      setShowConflictDetails(true);
    }
  };

  const handleManualConflictResolution = () => {
    if (profile && cloudProfile) {
      // Generate conflicts using manual merge
      const result = mergeProfiles(profile, cloudProfile, { strategy: 'manual' });
      if (result.conflicts.length > 0) {
        setConflictsToResolve(result.conflicts);
        setShowConflictResolver(true);
      } else {
        setStatusMessage('✨ No conflicts detected between profiles');
      }
    }
  };

  const handleConflictResolution = async (resolutions: ConflictResolution[]) => {
    if (profile && cloudProfile) {
      const success = await applyManualResolution(profile, cloudProfile, resolutions);
      if (success) {
        setStatusMessage('✨ Conflicts resolved successfully');
        setShowConflictResolver(false);
        setConflictsToResolve([]);
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        setStatusMessage('❌ Failed to resolve conflicts');
      }
    }
  };

  const handleCancelConflictResolution = () => {
    setShowConflictResolver(false);
    setConflictsToResolve([]);
  };

  const getBreathOpacity = () => {
    return 0.7 + Math.sin(breathPhase) * 0.3;
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = () => {
    if (syncError) return 'text-red-400';
    if (hasCloudProfile && profile) return 'text-green-400';
    if (hasCloudProfile || profile) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getStatusIcon = () => {
    if (isSyncing) return '🔄';
    if (syncError) return '⚠️';
    if (hasCloudProfile && profile) return '☁️✨';
    if (hasCloudProfile) return '☁️';
    if (profile) return '💾';
    return '📭';
  };

  const getStatusText = () => {
    if (isSyncing) return 'Synchronizing...';
    if (syncError) return 'Sync Error';
    if (hasCloudProfile && profile) return 'Synchronized';
    if (hasCloudProfile) return 'Cloud Profile Available';
    if (profile) return 'Local Profile Only';
    return 'No Profile Found';
  };

  const renderMergeStrategySelector = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-blue-300">Merge Strategy</h4>
      <div className="grid grid-cols-2 gap-2">
        {[
          { value: 'newest-wins' as MergeStrategy, label: 'Newest Wins', desc: 'Most recent changes take priority' },
          { value: 'local-wins' as MergeStrategy, label: 'Local Wins', desc: 'Preserve local changes' },
          { value: 'cloud-wins' as MergeStrategy, label: 'Cloud Wins', desc: 'Use cloud version' },
          { value: 'most-complete' as MergeStrategy, label: 'Most Complete', desc: 'Choose fuller data' }
        ].map(({ value, label, desc }) => (
          <button
            key={value}
            onClick={() => setSelectedMergeStrategy(value)}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedMergeStrategy === value
                ? 'border-blue-400 bg-blue-900/30 text-blue-200'
                : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="font-medium text-sm">{label}</div>
            <div className="text-xs opacity-70 mt-1">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderMergeResult = () => {
    if (!mergeResult) return null;

    return (
      <div className="space-y-4 p-4 bg-gray-800/30 rounded-lg border border-gray-600">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-green-300">
            🔄✨ Merge Complete
          </h4>
          <button
            onClick={() => setShowMergeDetails(!showMergeDetails)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {showMergeDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="text-sm text-gray-300">
          <div className="mb-2">{mergeResult.summary}</div>
          <div className="text-xs text-gray-400">
            Strategy: {mergeResult.strategy} • {mergeResult.conflicts.length} conflicts resolved
          </div>
        </div>

        {showMergeDetails && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-purple-300">Conflict Details</span>
              <button
                onClick={() => setShowConflictDetails(!showConflictDetails)}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                {showConflictDetails ? 'Hide' : 'Show'} ({mergeResult.conflicts.length})
              </button>
            </div>

            {showConflictDetails && mergeResult.conflicts.length > 0 && (
              <div className="space-y-2">
                {mergeResult.conflicts.map((conflict, index) => (
                  <div key={index} className="p-3 bg-gray-900/50 rounded border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-yellow-300">{conflict.field}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          conflict.resolution === 'local' ? 'bg-blue-900/50 text-blue-300' :
                          conflict.resolution === 'cloud' ? 'bg-green-900/50 text-green-300' :
                          'bg-purple-900/50 text-purple-300'
                        }`}>
                          {conflict.resolution}
                        </span>
                        <span className="text-xs text-gray-400">
                          {Math.round(conflict.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-blue-400 mb-1">Local:</div>
                        <div className="text-gray-300 font-mono bg-gray-900/30 p-1 rounded">
                          {JSON.stringify(conflict.localValue, null, 2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-green-400 mb-1">Cloud:</div>
                        <div className="text-gray-300 font-mono bg-gray-900/30 p-1 rounded">
                          {JSON.stringify(conflict.cloudValue, null, 2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div 
            className="text-4xl transition-opacity duration-1000"
            style={{ opacity: getBreathOpacity() }}
          >
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Consciousness Profile Sync</h3>
            <p className={`text-lg ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-gray-400 hover:text-white transition-colors duration-300"
        >
          {showDetails ? '🔼' : '🔽'}
        </button>
      </div>

      {/* Status Details */}
      {showDetails && (
        <div className="bg-black/20 rounded-2xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Local Profile:</span>
              <span className="text-white ml-2">{profile ? '✅ Available' : '❌ Not Found'}</span>
            </div>
            <div>
              <span className="text-gray-400">Cloud Profile:</span>
              <span className="text-white ml-2">{hasCloudProfile ? '✅ Available' : '❌ Not Found'}</span>
            </div>
            <div>
              <span className="text-gray-400">Last Sync:</span>
              <span className="text-white ml-2">{formatLastSync(lastSyncTime)}</span>
            </div>
            <div>
              <span className="text-gray-400">User:</span>
              <span className="text-white ml-2">{user?.email || 'Unknown'}</span>
            </div>
          </div>
          
          {syncError && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-400">⚠️</span>
                <span className="text-red-300 font-medium">Sync Error</span>
              </div>
              <p className="text-red-200 text-sm mt-2">{syncError}</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload to Cloud */}
        <button
          onClick={() => handleOperation('upload')}
          disabled={!profile || isSyncing || operation === 'upload'}
          className={`
            p-4 rounded-2xl border-2 transition-all duration-300 text-left
            ${!profile || isSyncing ? 
              'border-gray-600 bg-gray-800/30 text-gray-500 cursor-not-allowed' : 
              'border-blue-500/50 bg-blue-900/30 text-blue-300 hover:border-blue-400 hover:bg-blue-800/40'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {operation === 'upload' ? '🔄' : '☁️⬆️'}
            </span>
            <div>
              <div className="font-medium">Upload to Cloud</div>
              <div className="text-xs opacity-70">Save local profile to cloud storage</div>
            </div>
          </div>
        </button>

        {/* Download from Cloud */}
        <button
          onClick={() => handleOperation('download')}
          disabled={!hasCloudProfile || isSyncing || operation === 'download'}
          className={`
            p-4 rounded-2xl border-2 transition-all duration-300 text-left
            ${!hasCloudProfile || isSyncing ? 
              'border-gray-600 bg-gray-800/30 text-gray-500 cursor-not-allowed' : 
              'border-green-500/50 bg-green-900/30 text-green-300 hover:border-green-400 hover:bg-green-800/40'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {operation === 'download' ? '🔄' : '☁️⬇️'}
            </span>
            <div>
              <div className="font-medium">Download from Cloud</div>
              <div className="text-xs opacity-70">Restore profile from cloud storage</div>
            </div>
          </div>
        </button>

        {/* Smart Sync */}
        <button
          onClick={() => handleOperation('sync')}
          disabled={isSyncing || operation === 'sync'}
          className={`
            p-4 rounded-2xl border-2 transition-all duration-300 text-left
            ${isSyncing ? 
              'border-gray-600 bg-gray-800/30 text-gray-500 cursor-not-allowed' : 
              'border-purple-500/50 bg-purple-900/30 text-purple-300 hover:border-purple-400 hover:bg-purple-800/40'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {operation === 'sync' ? '🔄' : '🔄✨'}
            </span>
            <div>
              <div className="font-medium">Smart Sync</div>
              <div className="text-xs opacity-70">Automatically resolve conflicts</div>
            </div>
          </div>
        </button>

        {/* Delete from Cloud */}
        <button
          onClick={() => handleOperation('delete')}
          disabled={!hasCloudProfile || isSyncing || operation === 'delete'}
          className={`
            p-4 rounded-2xl border-2 transition-all duration-300 text-left
            ${!hasCloudProfile || isSyncing ? 
              'border-gray-600 bg-gray-800/30 text-gray-500 cursor-not-allowed' : 
              'border-red-500/50 bg-red-900/30 text-red-300 hover:border-red-400 hover:bg-red-800/40'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {operation === 'delete' ? '🔄' : '☁️🗑️'}
            </span>
            <div>
              <div className="font-medium">Delete from Cloud</div>
              <div className="text-xs opacity-70">Remove cloud profile permanently</div>
            </div>
          </div>
        </button>

        {/* Advanced Sync */}
        <button
          onClick={handleAdvancedSync}
          disabled={!isAuthenticated || isSyncing || mergeInProgress || !profile || !hasCloudProfile}
          className={`p-4 rounded-lg border transition-all ${
            !isAuthenticated || isSyncing || mergeInProgress || !profile || !hasCloudProfile
              ? 'border-gray-600 bg-gray-800/30 text-gray-500 cursor-not-allowed'
              : 'border-purple-500 bg-purple-900/20 text-purple-300 hover:bg-purple-900/30 hover:border-purple-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">🔄✨</span>
            <div className="text-left">
              <div className="font-medium">Advanced Sync</div>
              <div className="text-xs opacity-70">Intelligent merge with conflict resolution</div>
            </div>
          </div>
        </button>

        {/* Manual Merge */}
        <button
          onClick={handleManualMerge}
          disabled={!isAuthenticated || !profile || !cloudProfile}
          className={`p-4 rounded-lg border transition-all ${
            !isAuthenticated || !profile || !cloudProfile
              ? 'border-gray-600 bg-gray-800/30 text-gray-500 cursor-not-allowed'
              : 'border-pink-500 bg-pink-900/20 text-pink-300 hover:bg-pink-900/30 hover:border-pink-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">🔀</span>
            <div className="text-left">
              <div className="font-medium">Manual Merge</div>
              <div className="text-xs opacity-70">Preview merge without saving</div>
            </div>
          </div>
        </button>

        {/* Manual Conflict Resolution */}
        <button
          onClick={handleManualConflictResolution}
          disabled={!isAuthenticated || !profile || !cloudProfile || isSyncing}
          className={`p-4 rounded-lg border transition-all ${
            !isAuthenticated || !profile || !cloudProfile || isSyncing
              ? 'border-gray-600 bg-gray-800/30 text-gray-500 cursor-not-allowed'
              : 'border-orange-500 bg-orange-900/20 text-orange-300 hover:bg-orange-900/30 hover:border-orange-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">🔀✨</span>
            <div className="text-left">
              <div className="font-medium">Manual Resolution</div>
              <div className="text-xs opacity-70">Resolve conflicts step by step</div>
            </div>
          </div>
        </button>
      </div>

      {/* Merge Strategy Selector */}
      {(profile && hasCloudProfile) && renderMergeStrategySelector()}

      {/* Merge Result Display */}
      {renderMergeResult()}

      {/* Conflict Resolution Modal */}
      {showConflictResolver && profile && cloudProfile && conflictsToResolve.length > 0 && (
        <ConsciousnessConflictResolver
          localProfile={profile}
          cloudProfile={cloudProfile}
          conflicts={conflictsToResolve}
          onResolve={handleConflictResolution}
          onCancel={handleCancelConflictResolution}
        />
      )}

      {/* Enhanced Status Display */}
      <div className="space-y-3">
        {/* Merge Status */}
        {mergeInProgress && (
          <div className="flex items-center space-x-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-purple-300">🔄✨ Performing intelligent merge...</span>
          </div>
        )}

        {/* Last Merge Time */}
        {lastMergeTime && (
          <div className="text-xs text-gray-400">
            Last merge: {new Date(lastMergeTime).toLocaleString()}
          </div>
        )}

        {/* ... existing expandable diagnostics ... */}
      </div>

      {/* Sync Progress */}
      {isSyncing && (
        <div className="mt-6 bg-black/20 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin text-2xl">🔄</div>
            <div>
              <div className="text-white font-medium">Synchronizing...</div>
              <div className="text-gray-400 text-sm">
                {operation === 'upload' && 'Uploading consciousness profile to cloud...'}
                {operation === 'download' && 'Downloading consciousness profile from cloud...'}
                {operation === 'sync' && 'Intelligently syncing profiles...'}
                {operation === 'delete' && 'Deleting cloud profile...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {!isSyncing && !syncError && lastSyncTime && (
        <div className="mt-6 bg-green-900/20 border border-green-500/30 rounded-2xl p-4">
          <div className="flex items-center space-x-2">
            <span className="text-green-400">✅</span>
            <span className="text-green-300 font-medium">Sync Successful</span>
          </div>
          <p className="text-green-200 text-sm mt-1">
            Your consciousness profile is synchronized across all devices
          </p>
        </div>
      )}

      {/* Status Message Display */}
      {statusMessage && (
        <div className="p-3 bg-gray-800/30 border border-gray-600 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{statusMessage}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsciousnessProfileSync; 