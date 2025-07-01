'use client';

import { useState } from 'react';
import UnifiedAdminDebugSystem from './UnifiedAdminDebugSystem';

export default function AdminDebugPanelWrapper() {
  const [isAdminPanelVisible, setIsAdminPanelVisible] = useState(false);

  const toggleAdminPanel = () => {
    setIsAdminPanelVisible(prev => !prev);
  };

  return (
    <UnifiedAdminDebugSystem 
      isVisible={isAdminPanelVisible}
      onToggleVisibility={toggleAdminPanel}
    />
  );
} 