/**
 * Authentication Test Page
 * 
 * Dedicated page for testing authentication functionality
 */

'use client';

import { AuthTestComponent } from '@/components/auth/AuthTestComponent';

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <AuthTestComponent />
    </div>
  );
}
