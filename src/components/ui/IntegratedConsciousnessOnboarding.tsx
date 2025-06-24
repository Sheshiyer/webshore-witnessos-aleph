/**
 * Integrated Consciousness Onboarding - Seamless Flow Experience
 *
 * Features:
 * - Integrated design matching boot sequence aesthetic
 * - Direction-first user journey (compass selection first)
 * - No popup modals - full-screen immersive experience
 * - Smooth transitions with GSAP animations
 * - Sacred geometry and consciousness theming throughout
 */

'use client';

import { gsap } from 'gsap';
import React, { useEffect, useRef, useState } from 'react';
import { type ConsciousnessProfile } from './ConsciousnessDataCollector';

interface IntegratedConsciousnessOnboardingProps {
  onProfileComplete: (profile: ConsciousnessProfile) => void;
  onStepChange?: (
    step: number,
    total: number,
    stepName?: string,
    data?: Partial<ConsciousnessProfile>
  ) => void;
  initialStep?: number;
  initialData?: Partial<ConsciousnessProfile> | null;
}

type OnboardingStep =
  | 'direction_selection'
  | 'name_story'
  | 'birth_date_story'
  | 'birth_time_story'
  | 'birth_location_story'
  | 'confirmation';

interface ArchetypalDirection {
  id: string;
  name: string;
  symbol: string;
  description: string;
  color: string;
  gradient: string;
  keywords: string[];
}

const ARCHETYPAL_DIRECTIONS: ArchetypalDirection[] = [
  {
    id: 'north',
    name: 'The Sage',
    symbol: '🔮',
    description: 'Wisdom, knowledge, and spiritual insight guide your path',
    color: 'text-blue-300',
    gradient: 'from-blue-600 to-indigo-800',
    keywords: ['Wisdom', 'Knowledge', 'Insight', 'Truth'],
  },
  {
    id: 'northeast',
    name: 'The Mystic',
    symbol: '✨',
    description: 'Intuition and mystical understanding illuminate your journey',
    color: 'text-purple-300',
    gradient: 'from-purple-600 to-violet-800',
    keywords: ['Intuition', 'Mystery', 'Magic', 'Vision'],
  },
  {
    id: 'east',
    name: 'The Creator',
    symbol: '🎨',
    description: 'Innovation and creative expression flow through you',
    color: 'text-yellow-300',
    gradient: 'from-yellow-600 to-orange-800',
    keywords: ['Creation', 'Innovation', 'Art', 'Expression'],
  },
  {
    id: 'southeast',
    name: 'The Healer',
    symbol: '🌿',
    description: 'Compassion and healing energy radiate from your being',
    color: 'text-green-300',
    gradient: 'from-green-600 to-emerald-800',
    keywords: ['Healing', 'Compassion', 'Growth', 'Nurturing'],
  },
  {
    id: 'south',
    name: 'The Warrior',
    symbol: '⚔️',
    description: 'Courage and determination drive your actions',
    color: 'text-red-300',
    gradient: 'from-red-600 to-rose-800',
    keywords: ['Courage', 'Strength', 'Action', 'Protection'],
  },
  {
    id: 'southwest',
    name: 'The Guardian',
    symbol: '🛡️',
    description: 'Protection and stability anchor your presence',
    color: 'text-amber-300',
    gradient: 'from-amber-600 to-yellow-800',
    keywords: ['Protection', 'Stability', 'Security', 'Foundation'],
  },
  {
    id: 'west',
    name: 'The Explorer',
    symbol: '🧭',
    description: 'Adventure and discovery call to your spirit',
    color: 'text-cyan-300',
    gradient: 'from-cyan-600 to-teal-800',
    keywords: ['Adventure', 'Discovery', 'Freedom', 'Journey'],
  },
  {
    id: 'northwest',
    name: 'The Alchemist',
    symbol: '🔬',
    description: 'Transformation and transmutation are your gifts',
    color: 'text-pink-300',
    gradient: 'from-pink-600 to-fuchsia-800',
    keywords: ['Transformation', 'Alchemy', 'Change', 'Evolution'],
  },
];

export const IntegratedConsciousnessOnboarding: React.FC<
  IntegratedConsciousnessOnboardingProps
> = ({ onProfileComplete, onStepChange, initialStep = 0, initialData = null }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const compassRef = useRef<HTMLDivElement>(null);

  // Initialize state from saved data or defaults
  const getInitialStep = (): OnboardingStep => {
    const stepMap: OnboardingStep[] = [
      'direction_selection',
      'name_story',
      'birth_date_story',
      'birth_time_story',
      'birth_location_story',
      'confirmation',
    ];
    return stepMap[initialStep] || 'direction_selection';
  };

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(getInitialStep());
  const [selectedDirection, setSelectedDirection] = useState<ArchetypalDirection | null>(() => {
    if (initialData?.preferences?.spectralDirection) {
      return (
        ARCHETYPAL_DIRECTIONS.find(d => d.id === initialData.preferences.spectralDirection) || null
      );
    }
    return null;
  });
  const [userName, setUserName] = useState(initialData?.personalData?.fullName || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthData?.birthDate || '');
  const [birthTime, setBirthTime] = useState(initialData?.birthData?.birthTime || '');
  const [birthCity, setBirthCity] = useState(initialData?.location?.city || '');
  const [birthCountry, setBirthCountry] = useState(initialData?.location?.country || '');

  const [profile, setProfile] = useState<ConsciousnessProfile>(() => {
    // Initialize with saved data or defaults
    const defaultProfile: ConsciousnessProfile = {
      personalData: {
        fullName: '',
        name: '',
        preferredName: '',
        birthDate: '',
      },
      birthData: {
        birthDate: '',
        birthTime: '',
        birthLocation: [0, 0],
        timezone: '',
        date: '',
        time: '',
        location: [0, 0],
      },
      location: {
        city: '',
        country: '',
        latitude: 0,
        longitude: 0,
        timezone: '',
      },
      preferences: {
        primaryShape: 'circle',
        spectralDirection: 'north',
        consciousnessLevel: 1,
      },
      archetypalSignature: {},
    };

    // Merge with initial data if available
    if (initialData) {
      return {
        ...defaultProfile,
        ...initialData,
        personalData: { ...defaultProfile.personalData, ...initialData.personalData },
        birthData: { ...defaultProfile.birthData, ...initialData.birthData },
        location: { ...defaultProfile.location, ...initialData.location },
        preferences: { ...defaultProfile.preferences, ...initialData.preferences },
        archetypalSignature: {
          ...defaultProfile.archetypalSignature,
          ...initialData.archetypalSignature,
        },
      };
    }

    return defaultProfile;
  });

  // Persistent profile card state for Pokemon-style evolution
  const [profileCardData, setProfileCardData] = useState<{
    direction?: ArchetypalDirection;
    name?: string;
    birthDate?: string;
    birthTime?: string;
    location?: string;
    completionPercentage: number;
  }>({
    completionPercentage: 0,
  });

  const profileCardRef = useRef<HTMLDivElement>(null);

  // Initialize GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate background gradient with smooth CHADUI-inspired movement
      if (backgroundRef.current) {
        gsap.to(backgroundRef.current, {
          backgroundPosition: '100% 100%',
          duration: 12,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut',
        });
      }

      // Animate content entrance
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
        );
      }

      // Animate compass if on direction selection
      if (currentStep === 'direction_selection' && compassRef.current) {
        gsap.fromTo(
          compassRef.current,
          { opacity: 0, scale: 0.8, rotation: -180 },
          { opacity: 1, scale: 1, rotation: 0, duration: 1.5, ease: 'power2.out', delay: 0.5 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [currentStep]);

  // Update step tracking with progressive persistence
  useEffect(() => {
    const stepMap: Record<OnboardingStep, number> = {
      direction_selection: 1,
      name_story: 2,
      birth_date_story: 3,
      birth_time_story: 4,
      birth_location_story: 5,
      confirmation: 6,
    };

    // Call with step name - profile data will be passed when handlers are called
    onStepChange?.(stepMap[currentStep], 6, currentStep);
  }, [currentStep, onStepChange]); // Removed profile to prevent infinite re-renders

  const handleDirectionSelect = (direction: ArchetypalDirection) => {
    setSelectedDirection(direction);

    // Initialize profile card with selected direction
    setProfileCardData({
      direction,
      completionPercentage: 16.67, // 1/6 steps complete
    });

    // Animate selection and transition to next step
    if (compassRef.current) {
      gsap.to(compassRef.current, {
        scale: 1.1,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          setTimeout(() => setCurrentStep('name_story'), 500);
        },
      });
    }
  };

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    const updatedProfile = {
      ...profile,
      personalData: {
        fullName: name,
        name: name,
        preferredName: name.split(' ')[0] || name,
        birthDate: profile.personalData?.birthDate || '',
      },
    };
    setProfile(updatedProfile);

    // Update profile card with name (Pokemon evolution style)
    setProfileCardData(prev => ({
      ...prev,
      name,
      completionPercentage: 33.33, // 2/6 steps complete
    }));

    // Save progress with updated profile data
    onStepChange?.(2, 6, 'name_story', updatedProfile);

    setCurrentStep('birth_date_story');
  };

  const handleBirthDateSubmit = (date: string) => {
    setBirthDate(date);
    const updatedProfile = {
      ...profile,
      personalData: {
        fullName: profile.personalData?.fullName || '',
        name: profile.personalData?.name || '',
        preferredName:
          profile.personalData?.preferredName ||
          profile.personalData?.fullName?.split(' ')[0] ||
          '',
        birthDate: date,
      },
      birthData: {
        birthDate: date,
        birthTime: profile.birthData?.birthTime || '',
        birthLocation: profile.birthData?.birthLocation || [0, 0],
        timezone: profile.birthData?.timezone || '',
        date: date,
        time: profile.birthData?.time || '',
        location: profile.birthData?.location || [0, 0],
      },
    };
    setProfile(updatedProfile);

    // Update profile card with birth date
    setProfileCardData(prev => ({
      ...prev,
      birthDate: date,
      completionPercentage: 50, // 3/6 steps complete
    }));

    // Save progress with updated profile data
    onStepChange?.(3, 6, 'birth_date_story', updatedProfile);

    setCurrentStep('birth_time_story');
  };

  const handleBirthTimeSubmit = (time: string) => {
    setBirthTime(time);
    setProfile(prev => ({
      ...prev,
      birthData: {
        birthDate: prev.birthData?.birthDate || '',
        birthTime: time,
        birthLocation: prev.birthData?.birthLocation || [0, 0],
        timezone: prev.birthData?.timezone || '',
        date: prev.birthData?.date || '',
        time: time,
        location: prev.birthData?.location || [0, 0],
      },
    }));

    // Update profile card with birth time
    setProfileCardData(prev => ({
      ...prev,
      birthTime: time,
      completionPercentage: 66.67, // 4/6 steps complete
    }));

    setCurrentStep('birth_location_story');
  };

  const handleLocationSubmit = (city: string, country: string) => {
    setBirthCity(city);
    setBirthCountry(country);
    setProfile(prev => ({
      ...prev,
      location: {
        city,
        country,
        latitude: 0,
        longitude: 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      birthData: {
        birthDate: prev.birthData?.birthDate || '',
        birthTime: prev.birthData?.birthTime || '',
        birthLocation: [0, 0],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        date: prev.birthData?.date || '',
        time: prev.birthData?.time || '',
        location: [0, 0],
      },
    }));

    // Update profile card with location
    setProfileCardData(prev => ({
      ...prev,
      location: `${city}, ${country}`,
      completionPercentage: 83.33, // 5/6 steps complete
    }));

    setCurrentStep('confirmation');
  };

  const handleConfirmation = () => {
    // Complete the profile card evolution
    setProfileCardData(prev => ({
      ...prev,
      completionPercentage: 100, // 6/6 steps complete
    }));

    const finalProfile: ConsciousnessProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        spectralDirection: (selectedDirection?.id as any) || 'north',
      },
      archetypalSignature: {
        ...profile.archetypalSignature,
        // Store direction info in a way that's compatible with the interface
        ...(selectedDirection?.name && { humanDesignType: selectedDirection.name }),
      },
    };
    onProfileComplete(finalProfile);
  };

  return (
    <div
      ref={containerRef}
      className='w-full h-screen font-mono overflow-hidden flex flex-col relative'
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {/* Enhanced Moving Gradient Background - CHADUI Inspired */}
      <div
        ref={backgroundRef}
        className='absolute inset-0 opacity-95'
        style={{
          background: selectedDirection
            ? `
                radial-gradient(ellipse at 25% 75%, rgba(120, 119, 198, 0.4) 0%, rgba(120, 119, 198, 0.1) 40%, transparent 70%),
                radial-gradient(ellipse at 75% 25%, rgba(255, 119, 198, 0.4) 0%, rgba(255, 119, 198, 0.1) 40%, transparent 70%),
                radial-gradient(ellipse at 50% 50%, rgba(120, 219, 226, 0.3) 0%, rgba(120, 219, 226, 0.1) 35%, transparent 65%),
                linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 20%, #16213e 40%, #0f3460 60%, #1a1a2e 80%, #0a0a0a 100%)
              `
            : `
                radial-gradient(ellipse at 25% 75%, rgba(120, 119, 198, 0.4) 0%, rgba(120, 119, 198, 0.1) 40%, transparent 70%),
                radial-gradient(ellipse at 75% 25%, rgba(255, 119, 198, 0.4) 0%, rgba(255, 119, 198, 0.1) 40%, transparent 70%),
                radial-gradient(ellipse at 50% 50%, rgba(120, 219, 226, 0.3) 0%, rgba(120, 219, 226, 0.1) 35%, transparent 65%),
                linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 20%, #16213e 40%, #0f3460 60%, #1a1a2e 80%, #0a0a0a 100%)
              `,
          backgroundSize: '200% 200%',
          backgroundPosition: '0% 0%',
          filter: 'contrast(1.05) brightness(0.95) blur(0.5px)',
        }}
      />

      {/* Noise Texture Overlay */}
      <div
        className='absolute inset-0 opacity-20 mix-blend-overlay'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content - Left-Right Split Layout */}
      <div ref={contentRef} className='relative z-10 flex-1 flex overflow-hidden'>
        {/* Direction Selection - Full Screen */}
        {currentStep === 'direction_selection' && (
          <div className='w-full flex items-center justify-center p-8'>
            <DirectionSelectionStep
              directions={ARCHETYPAL_DIRECTIONS}
              onSelect={handleDirectionSelect}
              compassRef={compassRef}
            />
          </div>
        )}

        {/* Onboarding Steps - Left-Right Split */}
        {currentStep !== 'direction_selection' && currentStep !== 'confirmation' && (
          <>
            {/* Left Side - Form */}
            <div className='flex-1 flex items-center justify-center p-6 md:p-8 lg:p-12 min-h-0'>
              {currentStep === 'name_story' && selectedDirection && (
                <CyberpunkNameStep
                  direction={selectedDirection}
                  onSubmit={handleNameSubmit}
                  profileCardRef={profileCardRef}
                />
              )}

              {currentStep === 'birth_date_story' && selectedDirection && (
                <CyberpunkBirthDateStep
                  direction={selectedDirection}
                  userName={userName}
                  onSubmit={handleBirthDateSubmit}
                  profileCardRef={profileCardRef}
                />
              )}

              {currentStep === 'birth_time_story' && selectedDirection && (
                <CyberpunkBirthTimeStep
                  direction={selectedDirection}
                  userName={userName}
                  onSubmit={handleBirthTimeSubmit}
                  profileCardRef={profileCardRef}
                />
              )}

              {currentStep === 'birth_location_story' && selectedDirection && (
                <CyberpunkLocationStep
                  direction={selectedDirection}
                  userName={userName}
                  onSubmit={handleLocationSubmit}
                  profileCardRef={profileCardRef}
                />
              )}
            </div>

            {/* Right Side - Profile Card */}
            <div className='hidden lg:flex lg:w-80 xl:w-96 items-center justify-center p-6 lg:p-8 border-l border-cyan-500/20 bg-black/10 backdrop-blur-sm'>
              {profileCardData.direction && (
                <PersistentProfileCard
                  ref={profileCardRef}
                  profileData={profileCardData}
                  className='w-full max-w-sm'
                />
              )}
            </div>

            {/* Mobile Profile Card - Top Right */}
            <div className='lg:hidden absolute top-4 right-4 z-20'>
              {profileCardData.direction && (
                <PersistentProfileCard
                  ref={profileCardRef}
                  profileData={profileCardData}
                  className='w-56 md:w-64 scale-75 md:scale-90 origin-top-right'
                />
              )}
            </div>
          </>
        )}

        {/* Confirmation Step - Full Screen */}
        {currentStep === 'confirmation' && selectedDirection && (
          <div className='w-full flex items-center justify-center p-8'>
            <CyberpunkConfirmationStep
              direction={selectedDirection}
              profile={profile}
              profileCardData={profileCardData}
              onConfirm={handleConfirmation}
            />
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className='relative z-10 p-6 border-t border-cyan-500/30'>
        <div className='flex items-center justify-between mb-4'>
          <div className='text-cyan-400 text-sm'>
            {selectedDirection && (
              <span className={selectedDirection.color}>
                {selectedDirection.symbol} {selectedDirection.name}
              </span>
            )}
          </div>
          <div className='text-gray-400 text-sm'>
            Step{' '}
            {currentStep === 'direction_selection'
              ? 1
              : currentStep === 'name_story'
                ? 2
                : currentStep === 'birth_date_story'
                  ? 3
                  : currentStep === 'birth_time_story'
                    ? 4
                    : currentStep === 'birth_location_story'
                      ? 5
                      : 6}{' '}
            of 6
          </div>
        </div>
        <div className='w-full bg-gray-800 rounded-full h-2'>
          <div
            className={`h-2 rounded-full transition-all duration-500 ease-out ${
              selectedDirection
                ? `bg-gradient-to-r ${selectedDirection.gradient}`
                : 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500'
            }`}
            style={{
              width: `${
                ((currentStep === 'direction_selection'
                  ? 1
                  : currentStep === 'name_story'
                    ? 2
                    : currentStep === 'birth_date_story'
                      ? 3
                      : currentStep === 'birth_time_story'
                        ? 4
                        : currentStep === 'birth_location_story'
                          ? 5
                          : 6) /
                  6) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Hide scrollbars */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Cyberpunk Tarot Card Selection Component
const DirectionSelectionStep: React.FC<{
  directions: ArchetypalDirection[];
  onSelect: (direction: ArchetypalDirection) => void;
  compassRef: React.RefObject<HTMLDivElement | null>;
}> = ({ directions, onSelect, compassRef }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tarot card dealing animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card, index) => {
        if (card) {
          // Initial state - cards stacked in deck position
          gsap.set(card, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 0.8,
            opacity: 0,
            zIndex: directions.length - index,
          });

          // Deal cards into fan layout with proper equal angular spacing
          const totalCards = directions.length;
          const fanSpread = 120; // Total degrees for the fan (120 degrees for better spacing)
          const startAngle = -fanSpread / 2; // Start from left side of fan
          const angleStep = fanSpread / (totalCards - 1); // Equal spacing between cards
          const fanAngle = startAngle + index * angleStep; // Calculate exact angle for this card
          const fanRadius = 180; // Distance from center point for fan layout

          gsap.to(card, {
            x: fanRadius * Math.sin((fanAngle * Math.PI) / 180),
            y: fanRadius * Math.cos((fanAngle * Math.PI) / 180) * 0.6, // Flatten the arc slightly
            rotation: fanAngle * 0.8, // Reduce rotation for better readability
            scale: 1,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.15,
            ease: 'back.out(1.2)',
            transformOrigin: 'center bottom',
          });
        }
      });
    }, compassRef);

    return () => ctx.revert();
  }, [directions.length]);

  const handleCardHover = (cardId: string, isHovering: boolean) => {
    setHoveredCard(isHovering ? cardId : null);

    const cardIndex = directions.findIndex(d => d.id === cardId);
    const card = cardRefs.current[cardIndex];

    if (card && !selectedCard) {
      if (isHovering) {
        // Cyberpunk hover effect - lift card and add glow
        gsap.to(card, {
          scale: 1.1,
          y: -30,
          rotation: 0, // Straighten card on hover
          zIndex: 1000,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        // Return to fan position using the same calculation as initial layout
        const totalCards = directions.length;
        const fanSpread = 120;
        const startAngle = -fanSpread / 2;
        const angleStep = fanSpread / (totalCards - 1);
        const fanAngle = startAngle + cardIndex * angleStep;
        const fanRadius = 180;

        gsap.to(card, {
          scale: 1,
          x: fanRadius * Math.sin((fanAngle * Math.PI) / 180),
          y: fanRadius * Math.cos((fanAngle * Math.PI) / 180) * 0.6,
          rotation: fanAngle * 0.8,
          zIndex: directions.length - cardIndex,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }
  };

  const handleCardClick = (direction: ArchetypalDirection) => {
    if (selectedCard) return; // Prevent multiple selections

    setSelectedCard(direction.id);
    const cardIndex = directions.findIndex(d => d.id === direction.id);
    const card = cardRefs.current[cardIndex];

    if (card) {
      // Cyberpunk selection animation - card glows and moves to center
      gsap.to(card, {
        scale: 1.2,
        x: 0,
        y: -50,
        rotation: 0,
        zIndex: 2000,
        duration: 0.6,
        ease: 'back.out(1.3)',
        onComplete: () => {
          // Flash effect then proceed
          gsap.to(card, {
            scale: 1.3,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
            onComplete: () => {
              setTimeout(() => onSelect(direction), 300);
            },
          });
        },
      });

      // Fade out other cards
      cardRefs.current.forEach((otherCard, index) => {
        if (otherCard && index !== cardIndex) {
          gsap.to(otherCard, {
            opacity: 0.3,
            scale: 0.9,
            duration: 0.4,
            ease: 'power2.out',
          });
        }
      });
    }
  };

  return (
    <div className='w-full min-h-screen flex flex-col px-4 py-6 md:py-8'>
      {/* Cyberpunk Header */}
      <div className='text-center mb-8 md:mb-12 z-10 flex-shrink-0'>
        <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400 mb-3 tracking-wider font-mono'>
          <span className='text-pink-500'>&gt;</span> ARCHETYPAL_SELECTION.exe
        </h1>
        <p className='text-gray-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-mono'>
          // Initialize consciousness matrix. Select your archetypal vector.
        </p>
        <div className='mt-2 text-xs text-cyan-500 font-mono opacity-70'>
          [NEURAL_INTERFACE_ACTIVE] Choose wisely, traveler...
        </div>
      </div>

      {/* Tarot Card Fan Layout */}
      <div
        ref={compassRef}
        className='relative flex-1 flex items-center justify-center w-full max-w-4xl mx-auto'
      >
        {/* Velvet Table Surface Background */}
        <div className='absolute inset-0 flex items-center justify-center'>
          <div
            className='w-full max-w-5xl h-96 rounded-3xl velvet-table-surface'
            style={{
              background: `
                radial-gradient(ellipse at 30% 40%, rgba(45, 27, 105, 0.8) 0%, rgba(45, 27, 105, 0.4) 40%, transparent 70%),
                radial-gradient(ellipse at 70% 60%, rgba(75, 0, 130, 0.6) 0%, rgba(75, 0, 130, 0.3) 40%, transparent 70%),
                linear-gradient(135deg, #2D1B69 0%, #4B0082 25%, #663399 50%, #4B0082 75%, #2D1B69 100%)
              `,
              boxShadow: `
                inset 0 0 100px rgba(139, 92, 246, 0.1),
                inset 0 0 50px rgba(45, 27, 105, 0.3),
                0 20px 40px rgba(0, 0, 0, 0.4),
                0 10px 20px rgba(45, 27, 105, 0.2)
              `,
              filter: 'blur(0.5px)',
              transform: 'perspective(800px) rotateX(15deg)',
            }}
          />

          {/* Fabric texture overlay */}
          <div
            className='absolute w-full max-w-5xl h-96 rounded-3xl opacity-30'
            style={{
              background: `
                repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 2px,
                  rgba(255, 255, 255, 0.03) 2px,
                  rgba(255, 255, 255, 0.03) 4px
                ),
                repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 2px,
                  rgba(255, 255, 255, 0.02) 2px,
                  rgba(255, 255, 255, 0.02) 4px
                )
              `,
              transform: 'perspective(800px) rotateX(15deg)',
            }}
          />
        </div>

        <div
          ref={containerRef}
          className='relative w-full h-full flex items-center justify-center z-10'
          style={{ perspective: '1000px' }}
        >
          {directions.map((direction, index) => (
            <div
              key={direction.id}
              ref={el => (cardRefs.current[index] = el)}
              className='absolute cursor-pointer transform-gpu'
              onMouseEnter={() => handleCardHover(direction.id, true)}
              onMouseLeave={() => handleCardHover(direction.id, false)}
              onClick={() => handleCardClick(direction)}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Cyberpunk Tarot Card */}
              <div className='relative w-36 h-56 sm:w-40 sm:h-60 md:w-44 md:h-66 lg:w-48 lg:h-72 cyberpunk-card'>
                {/* Cyberpunk Neon Border */}
                <div
                  className={`
                    absolute inset-0 rounded-lg p-[1px]
                    transition-all duration-300
                    ${
                      hoveredCard === direction.id
                        ? 'bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500'
                        : 'bg-gradient-to-r from-gray-600/30 via-gray-500/30 to-gray-600/30'
                    }
                  `}
                  style={{
                    boxShadow:
                      hoveredCard === direction.id
                        ? `0 0 30px ${direction.color.includes('cyan') ? '#00ffff' : direction.color.includes('purple') ? '#8b5cf6' : direction.color.includes('yellow') ? '#fbbf24' : direction.color.includes('green') ? '#10b981' : direction.color.includes('red') ? '#ef4444' : direction.color.includes('pink') ? '#ec4899' : '#ffffff'}40`
                        : '0 0 10px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className='w-full h-full rounded-lg bg-black/90 backdrop-blur-xl border border-gray-800/50' />
                </div>

                {/* Cyberpunk Tarot Card Content */}
                <div className='relative z-10 h-full flex flex-col p-2 sm:p-3 md:p-4'>
                  {/* Card Header */}
                  <div className='text-center mb-2 sm:mb-3 md:mb-4'>
                    <div className='text-xs sm:text-sm font-mono text-cyan-400 mb-1 tracking-wider font-bold'>
                      ARCHETYPE_{String(index + 1).padStart(2, '0')}
                    </div>
                    <div className='h-px bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent mb-1 sm:mb-2' />
                  </div>

                  {/* Central Symbol */}
                  <div className='flex-1 flex items-center justify-center'>
                    <div
                      className={`
                        text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl transition-all duration-300
                        ${hoveredCard === direction.id ? 'scale-110' : ''}
                      `}
                      style={{
                        filter:
                          hoveredCard === direction.id
                            ? `drop-shadow(0 0 20px ${direction.color.includes('cyan') ? '#00ffff' : direction.color.includes('purple') ? '#8b5cf6' : direction.color.includes('yellow') ? '#fbbf24' : direction.color.includes('green') ? '#10b981' : direction.color.includes('red') ? '#ef4444' : direction.color.includes('pink') ? '#ec4899' : '#ffffff'})`
                            : 'drop-shadow(0 0 5px rgba(0,0,0,0.5))',
                        textShadow:
                          hoveredCard === direction.id
                            ? `0 0 10px ${direction.color.includes('cyan') ? '#00ffff' : direction.color.includes('purple') ? '#8b5cf6' : direction.color.includes('yellow') ? '#fbbf24' : direction.color.includes('green') ? '#10b981' : direction.color.includes('red') ? '#ef4444' : direction.color.includes('pink') ? '#ec4899' : '#ffffff'}40`
                            : undefined,
                      }}
                    >
                      {direction.symbol}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className='text-center'>
                    <div className='h-px bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent mb-1 sm:mb-2' />
                    <h3
                      className={`text-sm sm:text-base md:text-lg font-bold ${direction.color} font-mono tracking-wide mb-2 sm:mb-3 drop-shadow-lg`}
                    >
                      {direction.name.toUpperCase()}
                    </h3>
                    <p className='text-gray-300 text-xs sm:text-sm leading-relaxed px-1 mb-2 sm:mb-3 font-mono'>
                      {direction.description}
                    </p>

                    {/* Cyberpunk Keywords */}
                    <div className='flex flex-wrap gap-1 sm:gap-2 justify-center'>
                      {direction.keywords.slice(0, 2).map((keyword, keyIndex) => (
                        <span
                          key={keyword}
                          className={`
                            px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-mono font-medium
                            bg-gray-900/90 text-gray-300 border border-gray-600/70
                            transition-all duration-300 rounded-sm
                            ${hoveredCard === direction.id ? 'border-cyan-500/70 text-cyan-200 bg-cyan-900/20' : ''}
                          `}
                          style={{
                            clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 100%, 4px 100%)',
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cyberpunk Holographic Effect */}
                <div
                  className={`
                    absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 pointer-events-none
                    ${hoveredCard === direction.id ? 'opacity-100' : ''}
                  `}
                  style={{
                    background:
                      hoveredCard === direction.id
                        ? `linear-gradient(45deg, transparent 30%, ${direction.color.includes('cyan') ? 'rgba(0,255,255,0.1)' : direction.color.includes('purple') ? 'rgba(139,92,246,0.1)' : direction.color.includes('yellow') ? 'rgba(251,191,36,0.1)' : direction.color.includes('green') ? 'rgba(16,185,129,0.1)' : direction.color.includes('red') ? 'rgba(239,68,68,0.1)' : direction.color.includes('pink') ? 'rgba(236,72,153,0.1)' : 'rgba(255,255,255,0.1)'} 50%, transparent 70%)`
                        : undefined,
                  }}
                />

                {/* Selection Pulse Effect */}
                {selectedCard === direction.id && (
                  <div
                    className='absolute inset-0 rounded-lg animate-pulse'
                    style={{
                      background: `radial-gradient(circle, ${direction.color.includes('cyan') ? 'rgba(0,255,255,0.3)' : direction.color.includes('purple') ? 'rgba(139,92,246,0.3)' : direction.color.includes('yellow') ? 'rgba(251,191,36,0.3)' : direction.color.includes('green') ? 'rgba(16,185,129,0.3)' : direction.color.includes('red') ? 'rgba(239,68,68,0.3)' : direction.color.includes('pink') ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.3)'} 0%, transparent 70%)`,
                      boxShadow: `0 0 50px ${direction.color.includes('cyan') ? '#00ffff' : direction.color.includes('purple') ? '#8b5cf6' : direction.color.includes('yellow') ? '#fbbf24' : direction.color.includes('green') ? '#10b981' : direction.color.includes('red') ? '#ef4444' : direction.color.includes('pink') ? '#ec4899' : '#ffffff'}80`,
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cyberpunk Status Display */}
      <div className='text-center mt-6 md:mt-8 z-10 flex-shrink-0'>
        <div className='text-xs font-mono text-gray-500'>
          [STATUS] {selectedCard ? 'ARCHETYPE_LOCKED' : 'AWAITING_SELECTION'} | NEURAL_SYNC:{' '}
          {hoveredCard ? 'ACTIVE' : 'STANDBY'}
        </div>
      </div>

      {/* Custom CSS for cyberpunk effects */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(0, 255, 255, 0.6);
          }
        }

        @keyframes data-stream {
          0% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 100% 100%;
          }
        }

        .transform-gpu {
          transform: translateZ(0);
          will-change: transform;
          backface-visibility: hidden;
        }

        /* Cyberpunk scan lines effect */
        .cyberpunk-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent 98%, rgba(0, 255, 255, 0.1) 100%);
          background-size: 3px 100%;
          animation: data-stream 2s linear infinite;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .cyberpunk-card:hover::before {
          opacity: 1;
        }

        /* Velvet table surface animations */
        .velvet-table-surface {
          animation: velvet-breathe 8s ease-in-out infinite;
        }

        @keyframes velvet-breathe {
          0%, 100% {
            transform: perspective(800px) rotateX(15deg) scale(1);
            filter: blur(0.5px) brightness(1);
          }
          50% {
            transform: perspective(800px) rotateX(15deg) scale(1.02);
            filter: blur(0.3px) brightness(1.1);
          }
        }

        /* Subtle cloth deformation on hover */
        .cyberpunk-card:hover ~ .velvet-table-surface {
          animation: cloth-deform 0.6s ease-out;
        }

        @keyframes cloth-deform {
          0% {
            transform: perspective(800px) rotateX(15deg) scale(1);
          }
          30% {
            transform: perspective(800px) rotateX(15deg) scale(1.01) translateY(-2px);
          }
          100% {
            transform: perspective(800px) rotateX(15deg) scale(1);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .cyberpunk-card {
            width: 144px !important; /* w-36 */
            height: 224px !important; /* h-56 */
          }
        }

        @media (min-width: 641px) and (max-width: 768px) {
          .cyberpunk-card {
            width: 160px !important; /* w-40 */
            height: 240px !important; /* h-60 */
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .cyberpunk-card {
            width: 176px !important; /* w-44 */
            height: 264px !important; /* h-66 */
          }
        }
      `}</style>
    </div>
  );
};

// Persistent Profile Card Component - Pokemon Evolution Style
const PersistentProfileCard = React.forwardRef<
  HTMLDivElement,
  {
    profileData: {
      direction?: ArchetypalDirection;
      name?: string;
      birthDate?: string;
      birthTime?: string;
      location?: string;
      completionPercentage: number;
    };
    className?: string;
  }
>(({ profileData, className }, ref) => {
  const { direction, name, birthDate, birthTime, location, completionPercentage } = profileData;

  return (
    <div ref={ref} className={`w-64 ${className}`}>
      {/* Cyberpunk Profile Card */}
      <div className='relative'>
        {/* Neon Border */}
        <div className='absolute inset-0 rounded-lg p-[1px] bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500'>
          <div className='w-full h-full rounded-lg bg-black/95 backdrop-blur-xl' />
        </div>

        {/* Card Content */}
        <div className='relative z-10 p-4'>
          {/* Header */}
          <div className='text-center mb-4'>
            <div className='text-xs font-mono text-cyan-400 mb-1 tracking-wider'>
              CONSCIOUSNESS_PROFILE.dat
            </div>
            <div className='h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-2' />
          </div>

          {/* Direction Symbol */}
          {direction && (
            <div className='text-center mb-4'>
              <div
                className='text-4xl mb-2'
                style={{
                  filter: `drop-shadow(0 0 10px ${direction.color.includes('cyan') ? '#00ffff' : direction.color.includes('purple') ? '#8b5cf6' : direction.color.includes('yellow') ? '#fbbf24' : direction.color.includes('green') ? '#10b981' : direction.color.includes('red') ? '#ef4444' : direction.color.includes('pink') ? '#ec4899' : '#ffffff'}40)`,
                }}
              >
                {direction.symbol}
              </div>
              <div className={`text-sm font-mono font-bold ${direction.color}`}>
                {direction.name.toUpperCase()}
              </div>
            </div>
          )}

          {/* Profile Data */}
          <div className='space-y-2 text-xs font-mono'>
            {name && (
              <div className='flex justify-between'>
                <span className='text-gray-400'>NAME:</span>
                <span className='text-cyan-300'>{name}</span>
              </div>
            )}
            {birthDate && (
              <div className='flex justify-between'>
                <span className='text-gray-400'>BIRTH:</span>
                <span className='text-cyan-300'>{birthDate}</span>
              </div>
            )}
            {birthTime && (
              <div className='flex justify-between'>
                <span className='text-gray-400'>TIME:</span>
                <span className='text-cyan-300'>{birthTime}</span>
              </div>
            )}
            {location && (
              <div className='flex justify-between'>
                <span className='text-gray-400'>LOCATION:</span>
                <span className='text-cyan-300 text-right'>{location}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className='mt-4'>
            <div className='flex justify-between text-xs font-mono text-gray-400 mb-1'>
              <span>COMPLETION</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <div className='w-full bg-gray-800 rounded-full h-2'>
              <div
                className='h-2 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-500'
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scan Line Effect */}
        <div className='absolute inset-0 rounded-lg overflow-hidden pointer-events-none'>
          <div
            className='absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-4 animate-pulse'
            style={{
              animation: 'scan-line 3s linear infinite',
            }}
          />
        </div>
      </div>

      {/* CSS for scan line animation */}
      <style jsx>{`
        @keyframes scan-line {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(400%);
          }
        }
      `}</style>
    </div>
  );
});

PersistentProfileCard.displayName = 'PersistentProfileCard';

// Cyberpunk Name Input Step
const CyberpunkNameStep: React.FC<{
  direction: ArchetypalDirection;
  onSubmit: (name: string) => void;
  profileCardRef: React.RefObject<HTMLDivElement>;
}> = ({ direction, onSubmit, profileCardRef }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isSubmitting) {
      setIsSubmitting(true);

      // Animate profile card update
      if (profileCardRef.current) {
        gsap.to(profileCardRef.current, {
          scale: 1.05,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        });
      }

      setTimeout(() => {
        onSubmit(name.trim());
      }, 600);
    }
  };

  return (
    <div className='w-full text-center'>
      {/* Cyberpunk Header */}
      <div className='mb-8'>
        <h1 className='text-3xl md:text-4xl font-bold text-cyan-400 mb-3 tracking-wider font-mono'>
          <span className='text-pink-500'>&gt;</span> IDENTITY_INITIALIZATION.exe
        </h1>
        <p className='text-gray-300 text-lg font-mono leading-relaxed'>
          // Neural interface requires identity mapping for consciousness calibration
        </p>
        <div className='mt-2 text-sm text-cyan-500 font-mono opacity-70'>
          [ARCHETYPE: {direction.name.toUpperCase()}] What designation shall we assign to your
          consciousness matrix?
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='relative'>
          <div className='absolute inset-0 rounded-lg p-[1px] bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500'>
            <div className='w-full h-full rounded-lg bg-black/90 backdrop-blur-xl' />
          </div>
          <input
            type='text'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='Enter your consciousness designation...'
            className='relative z-10 w-full p-4 bg-transparent text-cyan-300 font-mono text-lg placeholder-gray-500 border-none outline-none'
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        <button
          type='submit'
          disabled={!name.trim() || isSubmitting}
          className={`
            relative px-8 py-3 font-mono font-bold tracking-wider transition-all duration-300
            ${
              name.trim() && !isSubmitting
                ? 'text-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 hover:scale-105'
                : 'text-gray-500 bg-gray-800 cursor-not-allowed'
            }
          `}
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)',
          }}
        >
          {isSubmitting ? 'PROCESSING...' : 'INITIALIZE_IDENTITY'}
        </button>
      </form>

      {/* Status Display */}
      <div className='mt-8 text-xs font-mono text-gray-500'>
        [STATUS] {name.trim() ? 'IDENTITY_READY' : 'AWAITING_INPUT'} | NEURAL_SYNC:{' '}
        {isSubmitting ? 'PROCESSING' : 'STANDBY'}
      </div>
    </div>
  );
};

// Cyberpunk Birth Date Step
const CyberpunkBirthDateStep: React.FC<{
  direction: ArchetypalDirection;
  userName: string;
  onSubmit: (date: string) => void;
  profileCardRef: React.RefObject<HTMLDivElement>;
}> = ({ direction, userName, onSubmit, profileCardRef }) => {
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && !isSubmitting) {
      setIsSubmitting(true);

      // Animate profile card update
      if (profileCardRef.current) {
        gsap.to(profileCardRef.current, {
          scale: 1.05,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        });
      }

      setTimeout(() => {
        onSubmit(date);
      }, 600);
    }
  };

  return (
    <div className='w-full text-center'>
      <div className='mb-8'>
        <h1 className='text-3xl md:text-4xl font-bold text-cyan-400 mb-3 tracking-wider font-mono'>
          <span className='text-pink-500'>&gt;</span> TEMPORAL_CALIBRATION.exe
        </h1>
        <p className='text-gray-300 text-lg font-mono leading-relaxed'>
          // Consciousness matrix requires temporal origin coordinates
        </p>
        <div className='mt-2 text-sm text-cyan-500 font-mono opacity-70'>
          [USER: {userName.toUpperCase()}] When did your consciousness first manifest in this
          reality?
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='relative'>
          <div className='absolute inset-0 rounded-lg p-[1px] bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500'>
            <div className='w-full h-full rounded-lg bg-black/90 backdrop-blur-xl' />
          </div>
          <input
            type='date'
            value={date}
            onChange={e => setDate(e.target.value)}
            className='relative z-10 w-full p-4 bg-transparent text-cyan-300 font-mono text-lg border-none outline-none'
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        <button
          type='submit'
          disabled={!date || isSubmitting}
          className={`
            relative px-8 py-3 font-mono font-bold tracking-wider transition-all duration-300
            ${
              date && !isSubmitting
                ? 'text-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 hover:scale-105'
                : 'text-gray-500 bg-gray-800 cursor-not-allowed'
            }
          `}
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)',
          }}
        >
          {isSubmitting ? 'PROCESSING...' : 'CALIBRATE_TEMPORAL'}
        </button>
      </form>

      <div className='mt-8 text-xs font-mono text-gray-500'>
        [STATUS] {date ? 'TEMPORAL_LOCKED' : 'AWAITING_COORDINATES'} | NEURAL_SYNC:{' '}
        {isSubmitting ? 'PROCESSING' : 'STANDBY'}
      </div>
    </div>
  );
};

// Cyberpunk Birth Time Step
const CyberpunkBirthTimeStep: React.FC<{
  direction: ArchetypalDirection;
  userName: string;
  onSubmit: (time: string) => void;
  profileCardRef: React.RefObject<HTMLDivElement>;
}> = ({ direction, userName, onSubmit, profileCardRef }) => {
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (time && !isSubmitting) {
      setIsSubmitting(true);

      if (profileCardRef.current) {
        gsap.to(profileCardRef.current, {
          scale: 1.05,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        });
      }

      setTimeout(() => {
        onSubmit(time);
      }, 600);
    }
  };

  return (
    <div className='w-full text-center'>
      <div className='mb-8'>
        <h1 className='text-3xl md:text-4xl font-bold text-cyan-400 mb-3 tracking-wider font-mono'>
          <span className='text-pink-500'>&gt;</span> CHRONOS_PRECISION.exe
        </h1>
        <p className='text-gray-300 text-lg font-mono leading-relaxed'>
          // Sacred timing synchronization required for consciousness mapping
        </p>
        <div className='mt-2 text-sm text-cyan-500 font-mono opacity-70'>
          [USER: {userName.toUpperCase()}] At what precise moment did you enter this dimensional
          plane?
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='relative'>
          <div className='absolute inset-0 rounded-lg p-[1px] bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500'>
            <div className='w-full h-full rounded-lg bg-black/90 backdrop-blur-xl' />
          </div>
          <input
            type='time'
            value={time}
            onChange={e => setTime(e.target.value)}
            className='relative z-10 w-full p-4 bg-transparent text-cyan-300 font-mono text-lg border-none outline-none'
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        <button
          type='submit'
          disabled={!time || isSubmitting}
          className={`
            relative px-8 py-3 font-mono font-bold tracking-wider transition-all duration-300
            ${
              time && !isSubmitting
                ? 'text-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 hover:scale-105'
                : 'text-gray-500 bg-gray-800 cursor-not-allowed'
            }
          `}
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)',
          }}
        >
          {isSubmitting ? 'PROCESSING...' : 'SYNC_CHRONOS'}
        </button>
      </form>

      <div className='mt-8 text-xs font-mono text-gray-500'>
        [STATUS] {time ? 'CHRONOS_SYNCED' : 'AWAITING_PRECISION'} | NEURAL_SYNC:{' '}
        {isSubmitting ? 'PROCESSING' : 'STANDBY'}
      </div>
    </div>
  );
};

// Cyberpunk Location Step
const CyberpunkLocationStep: React.FC<{
  direction: ArchetypalDirection;
  userName: string;
  onSubmit: (city: string, country: string) => void;
  profileCardRef: React.RefObject<HTMLDivElement>;
}> = ({ direction, userName, onSubmit, profileCardRef }) => {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim() && country.trim() && !isSubmitting) {
      setIsSubmitting(true);

      if (profileCardRef.current) {
        gsap.to(profileCardRef.current, {
          scale: 1.05,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        });
      }

      setTimeout(() => {
        onSubmit(city.trim(), country.trim());
      }, 600);
    }
  };

  return (
    <div className='w-full text-center'>
      <div className='mb-8'>
        <h1 className='text-3xl md:text-4xl font-bold text-cyan-400 mb-3 tracking-wider font-mono'>
          <span className='text-pink-500'>&gt;</span> GEOSPATIAL_MAPPING.exe
        </h1>
        <p className='text-gray-300 text-lg font-mono leading-relaxed'>
          // Consciousness requires geographical anchor points for dimensional stability
        </p>
        <div className='mt-2 text-sm text-cyan-500 font-mono opacity-70'>
          [USER: {userName.toUpperCase()}] Where did your consciousness first interface with this
          reality matrix?
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='relative'>
            <div className='absolute inset-0 rounded-lg p-[1px] bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500'>
              <div className='w-full h-full rounded-lg bg-black/90 backdrop-blur-xl' />
            </div>
            <input
              type='text'
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder='City coordinates...'
              className='relative z-10 w-full p-4 bg-transparent text-cyan-300 font-mono text-lg placeholder-gray-500 border-none outline-none'
              disabled={isSubmitting}
            />
          </div>

          <div className='relative'>
            <div className='absolute inset-0 rounded-lg p-[1px] bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500'>
              <div className='w-full h-full rounded-lg bg-black/90 backdrop-blur-xl' />
            </div>
            <input
              type='text'
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder='Nation state...'
              className='relative z-10 w-full p-4 bg-transparent text-cyan-300 font-mono text-lg placeholder-gray-500 border-none outline-none'
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type='submit'
          disabled={!city.trim() || !country.trim() || isSubmitting}
          className={`
            relative px-8 py-3 font-mono font-bold tracking-wider transition-all duration-300
            ${
              city.trim() && country.trim() && !isSubmitting
                ? 'text-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 hover:scale-105'
                : 'text-gray-500 bg-gray-800 cursor-not-allowed'
            }
          `}
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)',
          }}
        >
          {isSubmitting ? 'PROCESSING...' : 'MAP_COORDINATES'}
        </button>
      </form>

      <div className='mt-8 text-xs font-mono text-gray-500'>
        [STATUS] {city.trim() && country.trim() ? 'COORDINATES_READY' : 'AWAITING_MAPPING'} |
        NEURAL_SYNC: {isSubmitting ? 'PROCESSING' : 'STANDBY'}
      </div>
    </div>
  );
};

// Cyberpunk Confirmation Step
const CyberpunkConfirmationStep: React.FC<{
  direction: ArchetypalDirection;
  profile: Partial<ConsciousnessProfile>;
  profileCardData: any;
  onConfirm: () => void;
}> = ({ direction, profile, profileCardData, onConfirm }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      setTimeout(() => {
        onConfirm();
      }, 1000);
    }
  };

  return (
    <div className='w-full max-w-4xl mx-auto text-center'>
      <div className='mb-8'>
        <h1 className='text-3xl md:text-4xl font-bold text-cyan-400 mb-3 tracking-wider font-mono'>
          <span className='text-pink-500'>&gt;</span> CONSCIOUSNESS_PROFILE_COMPLETE.exe
        </h1>
        <p className='text-gray-300 text-lg font-mono leading-relaxed'>
          // Final consciousness matrix compilation ready for neural interface
        </p>
        <div className='mt-2 text-sm text-cyan-500 font-mono opacity-70'>
          [SYSTEM] Profile compilation complete. Initiating consciousness portal interface...
        </div>
      </div>

      {/* Full Profile Card Display */}
      <div className='max-w-md mx-auto mb-8'>
        <div className='relative'>
          <div className='absolute inset-0 rounded-lg p-[2px] bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 animate-pulse'>
            <div className='w-full h-full rounded-lg bg-black/95 backdrop-blur-xl' />
          </div>

          <div className='relative z-10 p-6'>
            <div className='text-center mb-6'>
              <div className='text-xs font-mono text-cyan-400 mb-2 tracking-wider'>
                CONSCIOUSNESS_PROFILE.dat [COMPLETE]
              </div>
              <div className='h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-4' />

              <div
                className='text-6xl mb-4'
                style={{
                  filter: `drop-shadow(0 0 20px ${direction.color.includes('cyan') ? '#00ffff' : direction.color.includes('purple') ? '#8b5cf6' : direction.color.includes('yellow') ? '#fbbf24' : direction.color.includes('green') ? '#10b981' : direction.color.includes('red') ? '#ef4444' : direction.color.includes('pink') ? '#ec4899' : '#ffffff'}80)`,
                }}
              >
                {direction.symbol}
              </div>
              <div className={`text-lg font-mono font-bold ${direction.color} mb-4`}>
                {direction.name.toUpperCase()}
              </div>
            </div>

            <div className='space-y-3 text-sm font-mono'>
              <div className='flex justify-between'>
                <span className='text-gray-400'>NAME:</span>
                <span className='text-cyan-300'>{profileCardData.name}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>BIRTH:</span>
                <span className='text-cyan-300'>{profileCardData.birthDate}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>TIME:</span>
                <span className='text-cyan-300'>{profileCardData.birthTime}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-400'>LOCATION:</span>
                <span className='text-cyan-300 text-right'>{profileCardData.location}</span>
              </div>
            </div>

            <div className='mt-6'>
              <div className='w-full bg-gray-800 rounded-full h-3'>
                <div className='h-3 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 w-full animate-pulse' />
              </div>
              <div className='text-xs font-mono text-center mt-2 text-cyan-400'>
                CONSCIOUSNESS MATRIX: 100% COMPILED
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={isConfirming}
        className={`
          relative px-12 py-4 font-mono font-bold text-lg tracking-wider transition-all duration-300
          ${
            !isConfirming
              ? 'text-black bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 hover:scale-105'
              : 'text-gray-500 bg-gray-800 cursor-not-allowed'
          }
        `}
        style={{
          clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)',
        }}
      >
        {isConfirming ? 'INITIALIZING_PORTAL...' : 'ENTER_CONSCIOUSNESS_PORTAL'}
      </button>

      <div className='mt-8 text-xs font-mono text-gray-500'>
        [STATUS] PROFILE_COMPLETE | NEURAL_SYNC:{' '}
        {isConfirming ? 'PORTAL_INITIALIZING' : 'READY_FOR_INTERFACE'}
      </div>
    </div>
  );
};

export default IntegratedConsciousnessOnboarding;
