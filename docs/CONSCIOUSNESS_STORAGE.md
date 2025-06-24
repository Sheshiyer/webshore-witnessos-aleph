# Consciousness Profile Storage System

## Overview

The WitnessOS Webshore consciousness profile storage system provides persistent local storage for user onboarding data, enabling seamless return experiences without requiring users to repeat the consciousness data collection process.

## Features

### 🔐 **Secure Local Storage**
- **Data Obfuscation**: Basic encryption/obfuscation for sensitive personal data
- **Integrity Validation**: Checksum verification to ensure data hasn't been corrupted
- **Version Compatibility**: Automatic migration and validation for data structure changes
- **Privacy-First**: All data stored locally in browser, never transmitted to servers

### ⏰ **Cache Management**
- **30-Day Expiration**: Consciousness profiles expire after 30 days for data freshness
- **7-Day Progress Cache**: Onboarding progress expires after 7 days
- **Automatic Cleanup**: Expired data is automatically removed
- **Manual Reset**: Debug panel provides cache management controls

### 📊 **Progressive Persistence**
- **Step-by-Step Saving**: Form progress saved incrementally during onboarding
- **Resume Capability**: Users can resume onboarding from where they left off
- **Data Validation**: Ensures saved data matches current interface requirements
- **Graceful Degradation**: Falls back to fresh onboarding if data is invalid

### 🚀 **Skip Logic**
- **Automatic Detection**: Valid cached profiles bypass onboarding flow
- **Instant Access**: Returning users go directly to Portal Chamber Scene
- **Cache Notifications**: Users informed when profile is restored from cache
- **Debug Override**: Development mode allows forcing fresh onboarding

## Technical Implementation

### Core Components

#### **consciousness-storage.ts**
```typescript
// Core storage utilities
export const saveConsciousnessProfile = (profile: ConsciousnessProfile): boolean
export const loadConsciousnessProfile = (): ConsciousnessProfile | null
export const saveOnboardingProgress = (progress: OnboardingProgress): boolean
export const loadOnboardingProgress = (): OnboardingProgress | null
export const clearAllWitnessOSData = (): void
```

#### **useConsciousnessProfile.ts**
```typescript
// React hook for profile management
export const useConsciousnessProfile = (): ConsciousnessProfileState
export const useOnboardingFlow = (): OnboardingFlowState
```

#### **CacheNotification.tsx**
```typescript
// User notification component
export const CacheNotification: React.FC<CacheNotificationProps>
```

### Data Structure

#### **ConsciousnessProfile**
```typescript
interface ConsciousnessProfile {
  personalData: {
    fullName: string;
    name: string;
    preferredName: string;
    birthDate: string;
  };
  birthData: {
    birthDate: string;
    birthTime: string;
    birthLocation: [number, number];
    timezone: string;
  };
  location: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  preferences: {
    primaryShape: string;
    spectralDirection: string;
    consciousnessLevel: number;
  };
  archetypalSignature: {
    humanDesignType?: string;
    enneagramType?: number;
    // Additional archetype data
  };
}
```

#### **OnboardingProgress**
```typescript
interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  partialData: Partial<ConsciousnessProfile>;
  timestamp: number;
  version: string;
}
```

### Storage Configuration

```typescript
const STORAGE_CONFIG = {
  PROFILE_KEY: 'witnessOS_consciousness_profile',
  PROGRESS_KEY: 'witnessOS_onboarding_progress',
  CACHE_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
  VERSION: '1.0.0',
} as const;
```

## Usage Examples

### Basic Profile Management

```typescript
import { useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';

const MyComponent = () => {
  const {
    profile,
    isLoaded,
    hasCompletedOnboarding,
    saveProfile,
    clearProfile,
    cacheInfo
  } = useConsciousnessProfile();

  // Check if user has completed onboarding
  if (hasCompletedOnboarding) {
    return <PortalChamberScene userData={profile} />;
  }

  return <OnboardingFlow onComplete={saveProfile} />;
};
```

### Onboarding Flow Management

```typescript
import { useOnboardingFlow } from '@/hooks/useConsciousnessProfile';

const OnboardingComponent = () => {
  const {
    shouldSkipOnboarding,
    getInitialStep,
    getPartialData,
    saveStepCompletion,
    completeOnboarding
  } = useOnboardingFlow();

  // Skip onboarding if valid cache exists
  if (shouldSkipOnboarding()) {
    return <PortalChamberScene />;
  }

  // Resume from saved progress
  const initialStep = getInitialStep();
  const partialData = getPartialData();

  return (
    <OnboardingFlow
      initialStep={initialStep}
      initialData={partialData}
      onStepComplete={saveStepCompletion}
      onComplete={completeOnboarding}
    />
  );
};
```

### Debug Cache Management

```typescript
import { useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';

const DebugPanel = () => {
  const {
    cacheInfo,
    clearProfile,
    clearProgress,
    clearAllData,
    refreshCacheInfo
  } = useConsciousnessProfile();

  return (
    <div>
      <p>Profile Cached: {cacheInfo.profile?.exists ? 'Yes' : 'No'}</p>
      <p>Profile Age: {Math.floor(cacheInfo.profile?.age / (24*60*60*1000))} days</p>
      
      <button onClick={clearProfile}>Clear Profile</button>
      <button onClick={clearProgress}>Clear Progress</button>
      <button onClick={clearAllData}>Clear All Data</button>
    </div>
  );
};
```

## Security Considerations

### Data Protection
- **Local Storage Only**: No consciousness data transmitted to external servers
- **Basic Obfuscation**: Data encoded using base64 and URI encoding
- **Checksum Validation**: Prevents tampering and detects corruption
- **Automatic Expiration**: Reduces long-term exposure of sensitive data

### Privacy Features
- **User Control**: Debug panel allows manual data clearing
- **Transparent Notifications**: Users informed when cached data is used
- **Graceful Degradation**: Invalid data automatically cleared
- **No Tracking**: No analytics or tracking of personal consciousness data

## Development Workflow

### Testing Cache Functionality

1. **Complete Onboarding**: Go through full consciousness data collection
2. **Verify Storage**: Check browser localStorage for encrypted data
3. **Refresh Page**: Confirm automatic profile restoration
4. **Test Expiration**: Manually adjust timestamps to test expiration
5. **Debug Panel**: Use cache management controls for testing

### Cache States to Test

- **Fresh User**: No cached data, full onboarding required
- **Returning User**: Valid cached profile, skip to portal
- **Partial Progress**: Incomplete onboarding, resume from saved step
- **Expired Cache**: Old data automatically cleared
- **Corrupted Data**: Invalid data gracefully handled

## Troubleshooting

### Common Issues

**Profile Not Restoring**
- Check browser localStorage is enabled
- Verify data hasn't expired (30-day limit)
- Check browser console for validation errors

**Onboarding Not Resuming**
- Progress cache expires after 7 days
- Check for version compatibility issues
- Verify step mapping in onboarding component

**Cache Notifications Not Showing**
- Ensure CacheNotification component is rendered
- Check notification state management
- Verify profile restoration logic

### Debug Commands

```javascript
// Browser console commands for debugging
localStorage.getItem('witnessOS_consciousness_profile');
localStorage.getItem('witnessOS_onboarding_progress');
localStorage.clear(); // Clear all data
```

## Future Enhancements

- **Cloud Sync**: Optional encrypted cloud backup
- **Multiple Profiles**: Support for family/shared device usage
- **Export/Import**: Consciousness profile portability
- **Advanced Encryption**: Stronger security for sensitive data
- **Compression**: Reduce storage footprint for complex profiles

---

*This storage system ensures a seamless, privacy-respecting consciousness exploration experience while maintaining data integrity and user control.*
