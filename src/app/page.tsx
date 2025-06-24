'use client';

import { type ConsciousnessProfile } from '@/components/ui/ConsciousnessDataCollector';
import EnhancedWitnessOSBootSequence from '@/components/ui/EnhancedWitnessOSBootSequence';
import IntegratedConsciousnessOnboarding from '@/components/ui/IntegratedConsciousnessOnboarding';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';

// Debug components (development only)

// Dynamic import for Enhanced Portal Chamber to avoid SSR issues
const EnhancedPortalChamberScene = dynamic(
  () => import('@/components/procedural-scenes/EnhancedPortalChamberScene'),
  {
    ssr: false,
    loading: () => <EnhancedWitnessOSBootSequence />,
  }
);

// Import consciousness profile hook
import { useOnboardingFlow } from '@/hooks/useConsciousnessProfile';

export default function Home() {
  const onboardingFlow = useOnboardingFlow();

  const [bootComplete, setBootComplete] = useState(false);
  const [dataCollectionComplete, setDataCollectionComplete] = useState(false);
  const [userProfile, setUserProfile] = useState<ConsciousnessProfile | null>(null);
  const [userInitialized, setUserInitialized] = useState(false);
  const [initialStep, setInitialStep] = useState(0);
  const [partialData, setPartialData] = useState<Partial<ConsciousnessProfile> | null>(null);
  const [showCacheNotification, setShowCacheNotification] = useState(false);

  // Import cache notification component
  const CacheNotification = dynamic(() => import('@/components/ui/CacheNotification'), {
    ssr: false,
  });

  // Check for cached profile on mount
  useEffect(() => {
    console.log('🔍 DEBUG: Onboarding flow state:', {
      isLoaded: onboardingFlow.isLoaded,
      shouldSkip: onboardingFlow.shouldSkipOnboarding(),
      hasProfile: !!onboardingFlow.profile,
      hasProgress: !!onboardingFlow.onboardingProgress,
      bootComplete,
      dataCollectionComplete,
    });

    if (onboardingFlow.isLoaded) {
      if (onboardingFlow.shouldSkipOnboarding()) {
        // Use cached profile
        console.log('✅ Using cached consciousness profile');
        setUserProfile(onboardingFlow.profile);
        setDataCollectionComplete(true);
        setShowCacheNotification(true);
      } else if (onboardingFlow.onboardingProgress) {
        // Resume onboarding from saved progress
        console.log('🔄 Resuming onboarding from step:', onboardingFlow.getInitialStep());
        setInitialStep(onboardingFlow.getInitialStep());
        setPartialData(onboardingFlow.getPartialData());
      } else {
        console.log('🆕 Starting fresh onboarding - no cache found');
      }
    }
  }, [
    onboardingFlow.isLoaded,
    onboardingFlow.isProfileValid, // Use the actual dependency instead of the function
    onboardingFlow.profile,
    onboardingFlow.onboardingProgress,
    bootComplete,
    dataCollectionComplete,
  ]);

  const handleBootComplete = () => {
    setBootComplete(true);
  };

  const handleProfileComplete = (profile: ConsciousnessProfile) => {
    // Save to localStorage
    const success = onboardingFlow.completeOnboarding(profile);
    if (success) {
      console.log('Consciousness profile saved to localStorage');
    } else {
      console.warn('Failed to save consciousness profile');
    }

    setUserProfile(profile);
    setDataCollectionComplete(true);
  };

  const handleStepProgress = (
    step: number,
    totalSteps: number,
    stepName: string,
    data: Partial<ConsciousnessProfile>
  ) => {
    // Save progress incrementally
    const success = onboardingFlow.saveStepCompletion(step, totalSteps, stepName, data);
    if (success) {
      console.log(`Onboarding progress saved: ${stepName} (${step}/${totalSteps})`);
    }
  };

  const handleUserInitialization = () => {
    setUserInitialized(true);
  };

  // Debug: Clear cache with Ctrl+Shift+C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        console.log('🔥 DEBUG: Clearing all cache data...');
        onboardingFlow.clearAllData();
        setUserProfile(null);
        setDataCollectionComplete(false);
        setBootComplete(false);
        setInitialStep(0);
        setPartialData(null);
        setShowCacheNotification(false);
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onboardingFlow]);

  // Show loading while checking cache
  if (onboardingFlow.isLoading) {
    console.log('🔄 Showing loading screen - checking cache...');
    return <EnhancedWitnessOSBootSequence onBootComplete={() => {}} />;
  }

  // Show boot sequence first
  if (!bootComplete) {
    console.log('🚀 Showing boot sequence...');
    return <EnhancedWitnessOSBootSequence onBootComplete={handleBootComplete} />;
  }

  // Show data collection after boot (unless cached profile exists)
  if (!dataCollectionComplete && !onboardingFlow.isLoading) {
    console.log(
      '📝 Showing onboarding with initialStep:',
      initialStep,
      'partialData:',
      partialData
    );
    return (
      <IntegratedConsciousnessOnboarding
        onProfileComplete={handleProfileComplete}
        onStepChange={(step, total, stepName, data) => {
          // Save progress incrementally
          if (stepName && data) {
            handleStepProgress(step, total, stepName, data);
          }
        }}
        initialStep={initialStep}
        initialData={partialData}
      />
    );
  }

  // Show Portal Chamber after data collection
  return (
    <div className='w-full h-screen overflow-hidden bg-black'>
      <Suspense fallback={<EnhancedWitnessOSBootSequence />}>
        <EnhancedPortalChamberScene
          enableBreathDetection={true}
          enableInfiniteZoom={true}
          enablePerformanceStats={true}
          onPortalEnter={handleUserInitialization}
          onConsciousnessEvolution={consciousness => {
            console.log('Consciousness evolution:', consciousness);
          }}
          onLayerTransition={layer => {
            console.log('Layer transition:', layer);
          }}
          userData={{
            ...(userProfile?.birthData.birthDate && {
              birthDate: new Date(userProfile.birthData.birthDate),
            }),
            ...(userProfile?.birthData.birthTime && {
              birthTime: userProfile.birthData.birthTime,
            }),
            ...(userProfile?.personalData.fullName && {
              name: userProfile.personalData.fullName,
            }),
          }}
          humanDesignType={userProfile?.archetypalSignature.humanDesignType || 'generator'}
          enneagramType={userProfile?.archetypalSignature.enneagramType || 9}
        />
      </Suspense>

      {/* Cache Notification */}
      {showCacheNotification && (
        <CacheNotification onDismiss={() => setShowCacheNotification(false)} />
      )}
    </div>
  );
}
