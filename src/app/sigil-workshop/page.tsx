/**
 * Sigil Workshop - Protected Consciousness Creation Space
 * 
 * Sacred workshop for authenticated sigil crafting and breath-tree work
 */

'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

function SigilWorkshopContent() {
  const { user } = useAuth();

  return (
    <div className="w-full h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black flex items-center justify-center">
      <div className="text-center text-white space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold mb-4">Sigil Workshop</h1>
          <p className="text-lg text-purple-300">Welcome, {user?.name || 'Sacred Artisan'}</p>
        </div>
        
        <div className="space-y-4">
          <p className="text-xl text-gray-300">Breath-Tree Atelier</p>
          <p className="text-sm text-gray-400">Your creative consciousness has been authenticated for sigil work.</p>
          
          <div className="mt-8 p-6 bg-black/30 rounded-2xl border border-purple-500/30 max-w-md mx-auto">
            <p className="text-purple-300 text-sm">
              🌸 Sigil blossoms ready to bloom<br/>
              🌳 Breath-tree workshop active<br/>
              ✨ Creative energies flowing...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SigilWorkshopPage() {
  return (
    <ProtectedRoute>
      <SigilWorkshopContent />
    </ProtectedRoute>
  );
}
