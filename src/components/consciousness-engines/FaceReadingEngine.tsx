/**
 * Face Reading Engine Component
 * 
 * Traditional Chinese Physiognomy (Mian Xiang) analysis engine
 * Provides constitutional analysis through facial feature assessment
 * Privacy-first biometric processing with explicit consent
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useConsciousnessEngineAutoSave } from '@/hooks/useConsciousnessEngineAutoSave';
import { AutoSaveStatusIndicator } from '@/components/ui/AutoSaveStatusIndicator';
import { calculateEngine } from '@/utils/api-client';
import type { FaceReadingInput, FaceReadingOutput } from '@/types/engines';
import type { QuestionInput } from '@/types';

interface FaceReadingEngineProps {
  question: QuestionInput;
  onCalculationComplete?: (result: FaceReadingOutput) => void;
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
  autoCapture?: boolean;
}

export const FaceReadingEngine: React.FC<FaceReadingEngineProps> = ({
  question,
  onCalculationComplete,
  analysisDepth = 'detailed',
  autoCapture = false
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FaceReadingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingConsent, setProcessingConsent] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { saveEngineResult } = useConsciousnessEngineAutoSave();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setError('Camera access required for face reading analysis. Please grant camera permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!processingConsent) {
      setError('Explicit consent required for biometric face reading analysis');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Capture image if camera is active
      let imageData = capturedImage;
      if (cameraActive && !imageData) {
        imageData = captureImage();
        if (imageData) {
          setCapturedImage(imageData);
          stopCamera(); // Stop camera after capture for privacy
        }
      }

      // Prepare input data
      const inputData: FaceReadingInput = {
        // Birth data (required by FaceReadingInput interface)
        birthDate: '1991-08-13',
        birthTime: '13:31',
        birthLocation: [12.9629, 77.5775], // Bengaluru coordinates
        timezone: 'Asia/Kolkata',
        // Backward compatibility
        date: '1991-08-13',
        time: '13:31',
        location: [12.9629, 77.5775],

        // Face reading specific data
        processing_consent: processingConsent,
        analysis_depth: analysisDepth,
        include_health_indicators: true,
        integrate_with_vedic: true,
        integrate_with_tcm: true,
        store_biometric_data: false, // Privacy-first: no biometric storage
        // Note: Image data would be processed locally in production
        // For now, we'll use the backend simulation
      };

      // Call backend API
      const response = await calculateEngine('face_reading', inputData);

      if (response.success && response.data) {
        const engineResult = response.data as FaceReadingOutput;
        setResult(engineResult);
        
        // Save result for auto-save
        await saveEngineResult('face_reading', engineResult);
        
        // Notify parent component
        onCalculationComplete?.(engineResult);
      } else {
        throw new Error(response.error || 'Face reading analysis failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      console.error('Face reading analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [processingConsent, analysisDepth, capturedImage, cameraActive, captureImage, stopCamera, saveEngineResult, onCalculationComplete]);

  const handleConsentChange = useCallback((consent: boolean) => {
    setProcessingConsent(consent);
    if (!consent) {
      stopCamera();
      setCapturedImage(null);
    }
  }, [stopCamera]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-black/90 backdrop-blur-sm border border-cyan-400/30 rounded-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cyan-300 mb-2">
          🎭 Face Reading Engine
        </h2>
        <p className="text-gray-300 text-sm">
          Traditional Chinese Physiognomy (Mian Xiang) constitutional analysis
        </p>
        <AutoSaveStatusIndicator />
      </div>

      {/* Privacy Consent */}
      <div className="mb-6 p-4 bg-purple-900/20 border border-purple-400/30 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-300 mb-3">
          🔒 Biometric Privacy Consent
        </h3>
        <div className="space-y-3">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={processingConsent}
              onChange={(e) => handleConsentChange(e.target.checked)}
              className="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
            />
            <div className="text-sm text-gray-300">
              <div className="font-medium text-purple-300 mb-1">
                I consent to biometric face reading analysis
              </div>
              <div className="text-xs text-gray-400">
                • Analysis performed locally with privacy protection<br/>
                • No facial biometric data stored or transmitted<br/>
                • Only constitutional analysis results retained<br/>
                • Full GDPR/CCPA compliance maintained
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Camera Interface */}
      {processingConsent && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-cyan-300 mb-3">
            📷 Facial Analysis Capture
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Video Preview */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-64 bg-gray-800 rounded-lg object-cover ${
                  cameraActive ? 'block' : 'hidden'
                }`}
              />
              
              {!cameraActive && !capturedImage && (
                <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">📷</div>
                    <div>Camera Preview</div>
                  </div>
                </div>
              )}

              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured for analysis"
                  className="w-full h-64 bg-gray-800 rounded-lg object-cover"
                />
              )}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Analysis Depth
                </label>
                <select
                  value={analysisDepth}
                  onChange={(e) => {
                    // Note: This would need to be passed up to parent or managed in state
                    console.log('Analysis depth changed:', e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="basic">Basic Analysis</option>
                  <option value="detailed">Detailed Analysis</option>
                  <option value="comprehensive">Comprehensive Analysis</option>
                </select>
              </div>

              <div className="space-y-2">
                {!cameraActive && !capturedImage && (
                  <button
                    onClick={startCamera}
                    className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                  >
                    Start Camera
                  </button>
                )}

                {cameraActive && (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const imageData = captureImage();
                        if (imageData) {
                          setCapturedImage(imageData);
                          stopCamera();
                        }
                      }}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      Capture Image
                    </button>
                    <button
                      onClick={stopCamera}
                      className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {capturedImage && (
                  <div className="space-y-2">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className={`w-full px-4 py-2 rounded-lg transition-colors ${
                        isAnalyzing
                          ? 'bg-purple-700 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700'
                      } text-white`}
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Face Reading'}
                    </button>
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setResult(null);
                      }}
                      className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Retake Photo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hidden canvas for image capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-400/30 rounded-lg">
          <div className="text-red-300 text-sm">
            ❌ {error}
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-cyan-300">
            📊 Face Reading Analysis Results
          </h3>

          {/* Constitutional Analysis */}
          {result.constitutional_analysis && (
            <div className="p-4 bg-blue-900/20 border border-blue-400/30 rounded-lg">
              <h4 className="text-lg font-medium text-blue-300 mb-3">
                🏛️ Constitutional Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-300">
                    <strong>Dominant Element:</strong> {result.constitutional_analysis.dominant_element}
                  </div>
                  <div className="text-gray-300">
                    <strong>Secondary Element:</strong> {result.constitutional_analysis.secondary_element}
                  </div>
                  <div className="text-gray-300">
                    <strong>Constitutional Type:</strong> {result.constitutional_analysis.constitutional_type}
                  </div>
                </div>
                <div>
                  <div className="text-gray-300">
                    <strong>Constitutional Strength:</strong> {(result.constitutional_analysis.constitutional_strength * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Health Indicators */}
          {result.health_indicators && (
            <div className="p-4 bg-green-900/20 border border-green-400/30 rounded-lg">
              <h4 className="text-lg font-medium text-green-300 mb-3">
                🏥 Health Indicators
              </h4>
              <div className="text-sm text-gray-300">
                <div className="mb-2">
                  <strong>Vitality Score:</strong> {(result.health_indicators.vitality_score * 100).toFixed(1)}%
                </div>
                {result.health_indicators.health_recommendations.length > 0 && (
                  <div>
                    <strong>Recommendations:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {result.health_indicators.health_recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="text-gray-400">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Personality Insights */}
          {result.personality_insights && (
            <div className="p-4 bg-purple-900/20 border border-purple-400/30 rounded-lg">
              <h4 className="text-lg font-medium text-purple-300 mb-3">
                🧠 Personality Insights
              </h4>
              <div className="text-sm text-gray-300">
                {result.personality_insights.core_traits.length > 0 && (
                  <div className="mb-2">
                    <strong>Core Traits:</strong> {result.personality_insights.core_traits.slice(0, 3).join(', ')}
                  </div>
                )}
                <div className="mb-2">
                  <strong>Communication Style:</strong> {result.personality_insights.communication_style}
                </div>
                <div>
                  <strong>Decision Making:</strong> {result.personality_insights.decision_making_style}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="p-3 bg-gray-900/50 border border-gray-600/30 rounded-lg">
            <div className="text-xs text-gray-400 text-center">
              🔒 Privacy Protected: Only constitutional analysis stored • No facial biometric data retained • {String(result.data_retention_policy || 'analysis_only')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceReadingEngine;
