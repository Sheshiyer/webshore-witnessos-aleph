/**
 * Consciousness Conflict Resolver Component
 * 
 * Sacred geometry-themed interface for manual resolution of consciousness profile conflicts
 * Allows users to make granular decisions about each conflict with visual comparison
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import { 
  type ProfileConflict, 
  type MergeOptions 
} from '@/hooks/useConsciousnessProfile';
import { type ConsciousnessProfile } from './ConsciousnessDataCollector';
import React, { useState, useCallback } from 'react';

interface ConflictResolution {
  field: string;
  resolution: 'local' | 'cloud' | 'custom';
  customValue?: any;
}

interface ConsciousnessConflictResolverProps {
  localProfile: ConsciousnessProfile;
  cloudProfile: ConsciousnessProfile;
  conflicts: ProfileConflict[];
  onResolve: (resolutions: ConflictResolution[]) => void;
  onCancel: () => void;
  className?: string;
}

export const ConsciousnessConflictResolver: React.FC<ConsciousnessConflictResolverProps> = ({
  localProfile,
  cloudProfile,
  conflicts,
  onResolve,
  onCancel,
  className = ''
}) => {
  const { breathPhase } = useConsciousness();
  const [resolutions, setResolutions] = useState<ConflictResolution[]>(() =>
    conflicts.map(conflict => ({
      field: conflict.field,
      resolution: conflict.resolution === 'local' ? 'local' : 'cloud',
      customValue: undefined
    }))
  );
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);
  const [showCustomEditor, setShowCustomEditor] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState('');

  const getBreathOpacity = () => 0.7 + Math.sin(breathPhase) * 0.3;

  const handleResolutionChange = useCallback((field: string, resolution: 'local' | 'cloud' | 'custom', customVal?: any) => {
    setResolutions(prev => prev.map(res => 
      res.field === field 
        ? { ...res, resolution, customValue: customVal }
        : res
    ));
  }, []);

  const handleCustomValueSubmit = (field: string) => {
    try {
      const parsedValue = JSON.parse(customValue);
      handleResolutionChange(field, 'custom', parsedValue);
      setShowCustomEditor(null);
      setCustomValue('');
    } catch (error) {
      // If JSON parsing fails, treat as string
      handleResolutionChange(field, 'custom', customValue);
      setShowCustomEditor(null);
      setCustomValue('');
    }
  };

  const handleResolveAll = () => {
    onResolve(resolutions);
  };

  const getFieldDisplayName = (field: string) => {
    const fieldMap: Record<string, string> = {
      'personalData.fullName': 'Full Name',
      'personalData.preferredName': 'Preferred Name',
      'personalData.birthDate': 'Birth Date',
      'birthData.birthDate': 'Birth Date',
      'birthData.birthTime': 'Birth Time',
      'birthData.timezone': 'Timezone',
      'location.city': 'City',
      'location.country': 'Country',
      'location.latitude': 'Latitude',
      'location.longitude': 'Longitude',
      'preferences.spectralDirection': 'Spectral Direction',
      'preferences.primaryShape': 'Primary Shape',
      'preferences.consciousnessLevel': 'Consciousness Level',
      'archetypalSignature.humanDesignType': 'Human Design Type',
      'archetypalSignature.enneagramType': 'Enneagram Type',
      'archetypalSignature.numerologyPath': 'Numerology Path'
    };
    return fieldMap[field] || field;
  };

  const getFieldIcon = (field: string) => {
    if (field.startsWith('personalData')) return '👤';
    if (field.startsWith('birthData')) return '🌟';
    if (field.startsWith('location')) return '🌍';
    if (field.startsWith('preferences')) return '⚙️';
    if (field.startsWith('archetypalSignature')) return '🔮';
    return '📝';
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getResolutionColor = (resolution: string) => {
    switch (resolution) {
      case 'local': return 'border-blue-400 bg-blue-900/30 text-blue-300';
      case 'cloud': return 'border-green-400 bg-green-900/30 text-green-300';
      case 'custom': return 'border-purple-400 bg-purple-900/30 text-purple-300';
      default: return 'border-gray-400 bg-gray-900/30 text-gray-300';
    }
  };

  const currentConflict = conflicts[currentConflictIndex];
  const currentResolution = resolutions.find(r => r.field === currentConflict?.field);

  if (!currentConflict) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm ${className}`}>
      <div 
        className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-white/10"
        style={{ opacity: getBreathOpacity() }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔀✨</div>
          <h2 className="text-3xl font-bold text-white mb-2">Consciousness Conflict Resolution</h2>
          <p className="text-gray-300">
            Resolve {conflicts.length} conflicts between your local and cloud consciousness profiles
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Conflict {currentConflictIndex + 1} of {conflicts.length}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(((currentConflictIndex + 1) / conflicts.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentConflictIndex + 1) / conflicts.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Conflict */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">{getFieldIcon(currentConflict.field)}</span>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {getFieldDisplayName(currentConflict.field)}
              </h3>
              <p className="text-gray-400 text-sm">
                Field: {currentConflict.field} • Confidence: {Math.round(currentConflict.confidence * 100)}%
              </p>
            </div>
          </div>

          {/* Value Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Local Value */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-blue-400">💾</span>
                <h4 className="font-medium text-blue-300">Local Value</h4>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {formatValue(currentConflict.localValue)}
                </pre>
              </div>
            </div>

            {/* Cloud Value */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-green-400">☁️</span>
                <h4 className="font-medium text-green-300">Cloud Value</h4>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {formatValue(currentConflict.cloudValue)}
                </pre>
              </div>
            </div>
          </div>

          {/* Resolution Options */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Choose Resolution:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Use Local */}
              <button
                onClick={() => handleResolutionChange(currentConflict.field, 'local')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  currentResolution?.resolution === 'local'
                    ? getResolutionColor('local')
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span>💾</span>
                  <span className="font-medium">Use Local</span>
                </div>
                <div className="text-xs opacity-70">
                  Keep the value from your device
                </div>
              </button>

              {/* Use Cloud */}
              <button
                onClick={() => handleResolutionChange(currentConflict.field, 'cloud')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  currentResolution?.resolution === 'cloud'
                    ? getResolutionColor('cloud')
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span>☁️</span>
                  <span className="font-medium">Use Cloud</span>
                </div>
                <div className="text-xs opacity-70">
                  Keep the value from cloud storage
                </div>
              </button>

              {/* Custom Value */}
              <button
                onClick={() => setShowCustomEditor(currentConflict.field)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  currentResolution?.resolution === 'custom'
                    ? getResolutionColor('custom')
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <span>✏️</span>
                  <span className="font-medium">Custom Value</span>
                </div>
                <div className="text-xs opacity-70">
                  Enter your own value
                </div>
              </button>
            </div>

            {/* Custom Value Editor */}
            {showCustomEditor === currentConflict.field && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mt-4">
                <h5 className="font-medium text-purple-300 mb-3">Enter Custom Value</h5>
                <div className="space-y-3">
                  <textarea
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="Enter your custom value (JSON format for objects)"
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-gray-300 font-mono text-sm"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCustomValueSubmit(currentConflict.field)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Apply Custom Value
                    </button>
                    <button
                      onClick={() => setShowCustomEditor(null)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Show Custom Value Preview */}
            {currentResolution?.resolution === 'custom' && currentResolution.customValue !== undefined && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                <h5 className="font-medium text-purple-300 mb-2">Custom Value Preview</h5>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                    {formatValue(currentResolution.customValue)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            
            {currentConflictIndex > 0 && (
              <button
                onClick={() => setCurrentConflictIndex(prev => prev - 1)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {currentConflictIndex < conflicts.length - 1 ? (
              <button
                onClick={() => setCurrentConflictIndex(prev => prev + 1)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleResolveAll}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all"
              >
                ✨ Resolve All Conflicts
              </button>
            )}
          </div>
        </div>

        {/* Conflict Summary */}
        <div className="mt-6 bg-gray-800/30 rounded-xl p-4">
          <h4 className="font-medium text-white mb-3">Resolution Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-blue-400 font-medium">
                {resolutions.filter(r => r.resolution === 'local').length}
              </div>
              <div className="text-gray-400">Using Local</div>
            </div>
            <div className="text-center">
              <div className="text-green-400 font-medium">
                {resolutions.filter(r => r.resolution === 'cloud').length}
              </div>
              <div className="text-gray-400">Using Cloud</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-medium">
                {resolutions.filter(r => r.resolution === 'custom').length}
              </div>
              <div className="text-gray-400">Custom Values</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 