/**
 * Create API Key Modal Component - WitnessOS Developer Dashboard
 * 
 * Modal for creating new API keys with scope selection and configuration
 * using cyberpunk theming and consciousness terminology.
 */

'use client';

import React, { useState, useEffect } from 'react';
import type { CreateAPIKeyModalProps, CreateAPIKeyRequest } from '@/types/api-keys';

export function CreateAPIKeyModal({
  isOpen,
  onClose,
  onCreateKey,
  availableScopes,
  userTier,
  currentKeyCount,
  maxKeys
}: CreateAPIKeyModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CreateAPIKeyRequest>({
    name: '',
    description: '',
    scopes: [],
    environment: 'live'
  });
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        name: '',
        description: '',
        scopes: [],
        environment: 'live'
      });
      setSelectedScopes(new Set());
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleScopeToggle = (scopeName: string) => {
    const newSelected = new Set(selectedScopes);
    if (newSelected.has(scopeName)) {
      newSelected.delete(scopeName);
    } else {
      newSelected.add(scopeName);
    }
    setSelectedScopes(newSelected);
    setFormData(prev => ({
      ...prev,
      scopes: Array.from(newSelected)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onCreateKey(formData);
      
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to create API key');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = formData.name.trim().length >= 3;
  const canProceedToStep3 = selectedScopes.size > 0;
  const canSubmit = canProceedToStep3 && !isSubmitting;

  const getAvailableScopesForTier = () => {
    return availableScopes.filter(scope => {
      if (userTier === 'enterprise') return true;
      if (userTier === 'pro') return scope.tier_required !== 'enterprise';
      return scope.tier_required === 'free';
    });
  };

  const getScopesByCategory = () => {
    const scopes = getAvailableScopesForTier();
    const categories: Record<string, typeof scopes> = {
      'Consciousness Engines': scopes.filter(s => s.scope_name.startsWith('engines:')),
      'User Management': scopes.filter(s => s.scope_name.startsWith('user:')),
      'Analytics & Monitoring': scopes.filter(s => s.scope_name.startsWith('analytics:')),
      'Advanced Features': scopes.filter(s => 
        s.scope_name.startsWith('webhooks:') || 
        s.scope_name.startsWith('batch:')
      )
    };
    
    return Object.entries(categories).filter(([_, scopes]) => scopes.length > 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-cyan-500/30 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 border-b border-cyan-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-cyan-300 font-mono">
                🔑 Create API Key
              </h2>
              <p className="text-gray-400 font-mono text-sm mt-1">
                Generate new access credentials for WitnessOS API
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-4 mt-4">
            {[1, 2, 3].map(stepNum => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm ${
                  step >= stepNum 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-8 h-0.5 ${
                    step > stepNum ? 'bg-cyan-600' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-cyan-400 text-sm font-mono mb-2">
                  Key Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                  placeholder="e.g., Raycast Extension, Mobile App, Development"
                  maxLength={50}
                />
                <div className="text-xs text-gray-500 font-mono mt-1">
                  {formData.name.length}/50 characters
                </div>
              </div>

              <div>
                <label className="block text-cyan-400 text-sm font-mono mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-black/50 border border-cyan-500/30 rounded-lg text-white font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors resize-none"
                  placeholder="Optional description of what this key will be used for..."
                  rows={3}
                  maxLength={200}
                />
                <div className="text-xs text-gray-500 font-mono mt-1">
                  {(formData.description || '').length}/200 characters
                </div>
              </div>

              <div>
                <label className="block text-cyan-400 text-sm font-mono mb-2">
                  Environment
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, environment: 'live' }))}
                    className={`p-3 rounded-lg border font-mono text-sm transition-all ${
                      formData.environment === 'live'
                        ? 'bg-cyan-600/20 border-cyan-400 text-cyan-300'
                        : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="font-bold">🌐 Live</div>
                    <div className="text-xs mt-1">Production environment</div>
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, environment: 'test' }))}
                    className={`p-3 rounded-lg border font-mono text-sm transition-all ${
                      formData.environment === 'test'
                        ? 'bg-purple-600/20 border-purple-400 text-purple-300'
                        : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="font-bold">🧪 Test</div>
                    <div className="text-xs mt-1">Development environment</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Permissions */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-cyan-300 font-mono mb-2">
                  Select Permissions
                </h3>
                <p className="text-gray-400 font-mono text-sm mb-4">
                  Choose which WitnessOS features this API key can access
                </p>
              </div>

              {getScopesByCategory().map(([category, scopes]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-purple-300 font-mono font-bold text-sm">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {scopes.map(scope => (
                      <label
                        key={scope.scope_name}
                        className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedScopes.has(scope.scope_name)}
                          onChange={() => handleScopeToggle(scope.scope_name)}
                          className="mt-1 w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="text-white font-mono text-sm">
                            {scope.scope_name}
                          </div>
                          <div className="text-gray-400 font-mono text-xs mt-1">
                            {scope.description}
                          </div>
                          <div className={`inline-block px-2 py-1 rounded text-xs font-mono mt-2 ${
                            scope.tier_required === 'enterprise' ? 'bg-purple-900/30 text-purple-300' :
                            scope.tier_required === 'pro' ? 'bg-yellow-900/30 text-yellow-300' :
                            'bg-green-900/30 text-green-300'
                          }`}>
                            {scope.tier_required.toUpperCase()} TIER
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {selectedScopes.size > 0 && (
                <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                  <div className="text-cyan-300 font-mono text-sm font-bold mb-2">
                    Selected Permissions ({selectedScopes.size})
                  </div>
                  <div className="space-y-1">
                    {Array.from(selectedScopes).map(scope => (
                      <div key={scope} className="text-cyan-400 font-mono text-xs">
                        • {scope}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-cyan-300 font-mono mb-2">
                  Review & Create
                </h3>
                <p className="text-gray-400 font-mono text-sm mb-4">
                  Confirm your API key configuration
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                <div>
                  <div className="text-gray-400 font-mono text-xs">NAME</div>
                  <div className="text-white font-mono">{formData.name}</div>
                </div>
                
                {formData.description && (
                  <div>
                    <div className="text-gray-400 font-mono text-xs">DESCRIPTION</div>
                    <div className="text-white font-mono text-sm">{formData.description}</div>
                  </div>
                )}
                
                <div>
                  <div className="text-gray-400 font-mono text-xs">ENVIRONMENT</div>
                  <div className={`font-mono ${
                    formData.environment === 'live' ? 'text-cyan-300' : 'text-purple-300'
                  }`}>
                    {formData.environment.toUpperCase()}
                  </div>
                </div>
                
                <div>
                  <div className="text-gray-400 font-mono text-xs">PERMISSIONS ({formData.scopes.length})</div>
                  <div className="space-y-1 mt-1">
                    {formData.scopes.map(scope => (
                      <div key={scope} className="text-cyan-400 font-mono text-xs">
                        • {scope}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="text-yellow-300 font-mono text-sm font-bold mb-2">
                  ⚠️ Important Security Notice
                </div>
                <div className="text-yellow-200 font-mono text-xs space-y-1">
                  <div>• Your API key will be shown only once after creation</div>
                  <div>• Store it securely - we cannot recover lost keys</div>
                  <div>• Never share your API key in public repositories</div>
                  <div>• You can revoke this key at any time from the dashboard</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mt-4">
              <div className="text-red-400 font-mono text-sm">
                <span className="text-red-500">[ERROR]</span> {error}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 border-t border-gray-700/50 p-6 flex items-center justify-between">
          <div className="text-gray-400 font-mono text-xs">
            {currentKeyCount}/{maxKeys} API keys used
          </div>
          
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-gray-700 text-gray-300 font-mono text-sm rounded hover:bg-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                ← Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedToStep2) ||
                  (step === 2 && !canProceedToStep3)
                }
                className="px-4 py-2 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 text-black font-mono font-bold text-sm rounded hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="px-6 py-2 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 text-black font-mono font-bold text-sm rounded hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Creating...
                  </>
                ) : (
                  '🔑 Create API Key'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
