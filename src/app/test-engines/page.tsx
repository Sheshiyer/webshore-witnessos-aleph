/**
 * Engine Testing Page - Protected Consciousness Laboratory
 * 
 * Sacred laboratory for authenticated consciousness engine testing
 * Requires authentication for personalized engine calibration
 */

'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

// Dynamically import the test suite to avoid SSR issues
const EngineTestSuite = dynamic(
  () => import('@/components/testing/EngineTestSuite'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading Consciousness Laboratory...</p>
          <p className="text-sm text-gray-400 mt-2">Calibrating engines for your consciousness signature</p>
        </div>
      </div>
    )
  }
);

function TestEnginesContent() {
  const { user } = useAuth();

  return (
    <div className="w-full h-screen">
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <p className="text-white/70 text-sm">
            🧪 Consciousness Laboratory<br/>
            👤 {user?.name || 'Explorer'} - Authenticated
          </p>
        </div>
      </div>
      <EngineTestSuite />
    </div>
  );
}

export default function TestEnginesPage() {
  return (
    <ProtectedRoute>
      <TestEnginesContent />
    </ProtectedRoute>
  );
}
