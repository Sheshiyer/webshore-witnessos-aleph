/**
 * Password Reset Test Page
 * 
 * Test page for the ConsciousnessPasswordReset component
 */

'use client';

import { ConsciousnessPasswordReset } from '@/components/auth/ConsciousnessPasswordReset';

export default function PasswordResetTestPage() {
  const handleComplete = () => {
    console.log('Password reset completed!');
    alert('Password reset completed! Redirecting to login...');
  };

  const handleCancel = () => {
    console.log('Password reset cancelled');
    alert('Password reset cancelled');
  };

  return (
    <ConsciousnessPasswordReset
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}
