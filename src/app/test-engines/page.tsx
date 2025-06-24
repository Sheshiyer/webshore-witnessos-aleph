/**
 * Engine Testing Page
 * 
 * Phase 5.7 Critical Step: Test remaining engine components
 * This page allows testing all 10 consciousness engine components
 */

'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the test suite to avoid SSR issues
const EngineTestSuite = dynamic(
  () => import('@/components/testing/EngineTestSuite'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading Engine Test Suite...</p>
          <p className="text-sm text-gray-400 mt-2">Initializing consciousness engine components</p>
        </div>
      </div>
    )
  }
);

export default function TestEnginesPage() {
  return (
    <div className="w-full h-screen">
      <EngineTestSuite />
    </div>
  );
}
