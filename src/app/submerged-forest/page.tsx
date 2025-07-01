/**
 * Submerged Forest - Protected Consciousness Practice Terrain
 * 
 * Sacred symbolic forest for authenticated consciousness exploration
 */

'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

function SubmergedForestContent() {
  const { user } = useAuth();

  return (
    <div className="w-full h-screen bg-gradient-to-b from-green-950 via-blue-950 to-black flex items-center justify-center">
      <div className="text-center text-white space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold mb-4">Submerged Forest</h1>
          <p className="text-lg text-green-300">Greetings, {user?.name || 'Forest Walker'}</p>
        </div>
        
        <div className="space-y-4">
          <p className="text-xl text-gray-300">Sacred Grove Awakening</p>
          <p className="text-sm text-gray-400">The symbolic forest recognizes your consciousness signature.</p>
          
          <div className="mt-8 p-6 bg-black/30 rounded-2xl border border-green-500/30 max-w-md mx-auto">
            <p className="text-green-300 text-sm">
              🌲 Forest pathways opening<br/>
              💧 Submerged wisdom accessible<br/>
              🌿 Symbolic terrain materializing...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubmergedForestPage() {
  return (
    <ProtectedRoute>
      <SubmergedForestContent />
    </ProtectedRoute>
  );
}
