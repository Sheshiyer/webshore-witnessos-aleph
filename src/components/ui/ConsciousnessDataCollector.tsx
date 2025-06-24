/**
 * Consciousness Data Collector for WitnessOS Webshore
 *
 * Comprehensive data collection interface combining sacred geometry forms
 * with compass sigil navigation and archetypal visualization
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import type { BirthData, PersonalData } from '@/types';
import React, { useEffect, useState } from 'react';
import CompassSigilInterface, { type CompassDirection } from './CompassSigilInterface';
import { type SacredGeometryFormData } from './SacredGeometryForm';

export interface ConsciousnessProfile {
  personalData: PersonalData;
  birthData: BirthData;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    timezone: string;
  };
  preferences: {
    primaryShape: string;
    spectralDirection: CompassDirection;
    consciousnessLevel: number;
  };
  archetypalSignature: {
    humanDesignType?: string;
    enneagramType?: number;
    numerologyPath?: number;
  };
}

interface ConsciousnessDataCollectorProps {
  onProfileComplete: (profile: ConsciousnessProfile) => void;
  onStepChange?: (step: number, totalSteps: number) => void;
  className?: string;
}

type CollectionStep =
  | 'compass'
  | 'name_greeting'
  | 'name_input'
  | 'birth_date_story'
  | 'birth_date_input'
  | 'birth_time_story'
  | 'birth_time_input'
  | 'birth_location_story'
  | 'birth_location_input'
  | 'confirmation';

export const ConsciousnessDataCollector: React.FC<ConsciousnessDataCollectorProps> = ({
  onProfileComplete,
  onStepChange,
  className = '',
}) => {
  const { breathPhase, consciousnessLevel } = useConsciousness();

  const [currentStep, setCurrentStep] = useState<CollectionStep>('compass');
  const [selectedDirection, setSelectedDirection] = useState<CompassDirection>('north');
  const [formData, setFormData] = useState<Partial<SacredGeometryFormData>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [profile, setProfile] = useState<Partial<ConsciousnessProfile>>({});

  // Conversational state
  const [userName, setUserName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [birthCountry, setBirthCountry] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const steps: CollectionStep[] = [
    'compass',
    'name_greeting',
    'name_input',
    'birth_date_story',
    'birth_date_input',
    'birth_time_story',
    'birth_time_input',
    'birth_location_story',
    'birth_location_input',
    'confirmation',
  ];
  const currentStepIndex = steps.indexOf(currentStep);

  // Notify parent of step changes
  useEffect(() => {
    onStepChange?.(currentStepIndex + 1, steps.length);
  }, [currentStep, currentStepIndex, onStepChange]);

  // Handle compass direction selection
  const handleDirectionSelect = (direction: CompassDirection) => {
    setSelectedDirection(direction);
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        spectralDirection: direction,
        consciousnessLevel,
        primaryShape: 'circle', // Default, will be updated in form
      },
    }));
  };

  // Handle compass center activation (proceed to next step)
  const handleCompassActivate = () => {
    if (selectedDirection) {
      setCurrentStep('name_greeting');
    }
  };

  // Typing animation effect
  const typeText = (text: string, callback?: () => void) => {
    setIsTyping(true);
    setTimeout(
      () => {
        setIsTyping(false);
        callback?.();
      },
      text.length * 50 + 1000
    ); // Simulate typing speed
  };

  // Handle conversational input progression
  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setProfile(prev => ({
      ...prev,
      personalData: {
        fullName: name,
        name: name,
        preferredName: name.split(' ')[0] || name,
        birthDate: prev.personalData?.birthDate || '',
      },
    }));
    setCurrentStep('birth_date_story');
  };

  const handleBirthDateSubmit = (date: string) => {
    setBirthDate(date);
    setProfile(prev => ({
      ...prev,
      personalData: {
        fullName: prev.personalData?.fullName || '',
        name: prev.personalData?.name || '',
        preferredName:
          prev.personalData?.preferredName || prev.personalData?.fullName?.split(' ')[0] || '',
        birthDate: date,
      },
      birthData: {
        birthDate: date,
        birthTime: prev.birthData?.birthTime || '',
        birthLocation: prev.birthData?.birthLocation || [0, 0],
        timezone: prev.birthData?.timezone || '',
        date: date,
        time: prev.birthData?.time || '',
        location: prev.birthData?.location || [0, 0],
      },
    }));
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
    setCurrentStep('birth_location_story');
  };

  const handleLocationSubmit = (city: string, country: string) => {
    setBirthCity(city);
    setBirthCountry(country);
    // TODO: Geocode city/country to lat/lng
    setProfile(prev => ({
      ...prev,
      location: {
        city,
        country,
        latitude: 0, // Will be geocoded
        longitude: 0, // Will be geocoded
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      birthData: {
        birthDate: prev.birthData?.birthDate || '',
        birthTime: prev.birthData?.birthTime || '',
        birthLocation: [0, 0], // Will be geocoded
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        date: prev.birthData?.date || '',
        time: prev.birthData?.time || '',
        location: [0, 0], // Will be geocoded
      },
    }));
    setCurrentStep('confirmation');
  };

  // Handle form submission
  const handleFormSubmit = (data: SacredGeometryFormData) => {
    setFormData(data);
    setProfile(prev => ({
      ...prev,
      personalData: data.personalData,
      birthData: data.birthData,
      location: {
        ...data.location,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      preferences: {
        ...prev.preferences,
        ...data.preferences,
      },
    }));
    setCurrentStep('confirmation');
  };

  // Handle profile confirmation
  const handleConfirmProfile = () => {
    if (profile.personalData && profile.birthData && profile.location && profile.preferences) {
      const completeProfile: ConsciousnessProfile = {
        personalData: profile.personalData,
        birthData: profile.birthData,
        location: profile.location,
        preferences: profile.preferences,
        archetypalSignature: {
          // These will be calculated by the engines
        },
      };
      onProfileComplete(completeProfile);
    }
  };

  // Navigate between steps
  const goToStep = (step: CollectionStep) => {
    setCurrentStep(step);
  };

  // Get breath-synchronized opacity
  const getBreathOpacity = () => {
    return 0.8 + Math.sin(breathPhase) * 0.2;
  };

  // Conversational UI Components
  const ConversationBubble: React.FC<{
    text: string;
    isUser?: boolean;
    delay?: number;
    onComplete?: () => void;
  }> = ({ text, isUser = false, delay = 0, onComplete }) => {
    const [displayText, setDisplayText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
      if (delay > 0) {
        setTimeout(() => {
          let index = 0;
          const timer = setInterval(() => {
            if (index <= text.length) {
              setDisplayText(text.slice(0, index));
              index++;
            } else {
              clearInterval(timer);
              setIsComplete(true);
              onComplete?.();
            }
          }, 30);
          return () => clearInterval(timer);
        }, delay);
      } else {
        setDisplayText(text);
        setIsComplete(true);
        onComplete?.();
      }
    }, [text, delay, onComplete]);

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
        <div
          className={`max-w-md p-4 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white ml-8'
              : 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 text-cyan-100 mr-8 border border-cyan-500/30'
          }`}
          style={{
            opacity: getBreathOpacity(),
            boxShadow: isUser
              ? '0 4px 20px rgba(6, 182, 212, 0.3)'
              : '0 4px 20px rgba(139, 92, 246, 0.3)',
          }}
        >
          <p className='text-lg leading-relaxed'>
            {displayText}
            {!isComplete && !isUser && <span className='animate-pulse text-cyan-400'>|</span>}
          </p>
        </div>
      </div>
    );
  };

  const ConversationInput: React.FC<{
    placeholder: string;
    onSubmit: (value: string) => void;
    type?: 'text' | 'date' | 'time';
    validation?: (value: string) => boolean;
  }> = ({ placeholder, onSubmit, type = 'text', validation }) => {
    const [value, setValue] = useState('');
    const [isValid, setIsValid] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim() && (!validation || validation(value))) {
        onSubmit(value.trim());
        setValue('');
      } else {
        setIsValid(false);
        setTimeout(() => setIsValid(true), 2000);
      }
    };

    return (
      <form onSubmit={handleSubmit} className='flex justify-end mb-6'>
        <div className='max-w-md w-full ml-8'>
          <input
            type={type}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            className={`w-full p-4 rounded-2xl bg-black/50 border-2 text-white text-lg
              ${
                isValid
                  ? 'border-cyan-500/50 focus:border-cyan-400'
                  : 'border-red-500 animate-pulse'
              }
              focus:outline-none focus:ring-2 focus:ring-cyan-400/30
              backdrop-blur-sm`}
            style={{
              opacity: getBreathOpacity(),
              boxShadow: '0 4px 20px rgba(6, 182, 212, 0.2)',
            }}
            autoFocus
          />
          <button
            type='submit'
            className='mt-3 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600
              text-white rounded-full hover:from-cyan-500 hover:to-blue-500
              transition-all duration-300 float-right'
            style={{
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
            }}
          >
            Continue ✨
          </button>
        </div>
      </form>
    );
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className='flex justify-center mb-8'>
      <div className='flex space-x-4'>
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isActive ? 'bg-current scale-125' : isCompleted ? 'bg-green-500' : 'bg-gray-600'
              }`}
              style={{
                opacity: getBreathOpacity(),
              }}
            />
          );
        })}
      </div>
    </div>
  );

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'compass':
        return (
          <div className='text-center'>
            <h2 className='text-2xl font-bold mb-4 text-cyan-400'>
              Choose Your Spectral Direction
            </h2>
            <p className='text-gray-300 mb-8 max-w-md mx-auto'>
              Select the archetypal direction that resonates with your current consciousness state.
              This will influence your sacred geometry patterns and color harmonics.
            </p>
            <div className='flex justify-center'>
              <CompassSigilInterface
                onDirectionSelect={handleDirectionSelect}
                onCenterActivate={handleCompassActivate}
                currentDirection={selectedDirection}
                size={300}
                showLabels={true}
                enableBreathSync={true}
              />
            </div>
            <p className='text-sm text-gray-400 mt-4'>
              Click the center ⊕ to proceed with {selectedDirection} direction
            </p>
          </div>
        );

      case 'name_greeting':
        return (
          <div className='max-w-2xl mx-auto'>
            <ConversationBubble
              text="Welcome, consciousness explorer. I am WitnessOS, your guide through the sacred geometries of self-discovery. Before we begin this journey together, I'd love to know what to call you."
              delay={500}
              onComplete={() => setTimeout(() => setCurrentStep('name_input'), 1500)}
            />
          </div>
        );

      case 'name_input':
        return (
          <div className='max-w-2xl mx-auto'>
            <ConversationBubble text="Welcome, consciousness explorer. I am WitnessOS, your guide through the sacred geometries of self-discovery. Before we begin this journey together, I'd love to know what to call you." />
            <ConversationInput
              placeholder='Enter your name...'
              onSubmit={handleNameSubmit}
              validation={name => name.length >= 2}
            />
          </div>
        );

      case 'birth_date_story':
        return (
          <div className='max-w-2xl mx-auto'>
            <ConversationBubble text="Welcome, consciousness explorer. I am WitnessOS, your guide through the sacred geometries of self-discovery. Before we begin this journey together, I'd love to know what to call you." />
            <ConversationBubble text={userName} isUser />
            <ConversationBubble
              text={`Beautiful, ${userName.split(' ')[0]}. Your name carries its own vibrational signature. Now, to map your consciousness blueprint, I need to understand the cosmic moment of your arrival. When did your soul choose to incarnate in this reality?`}
              delay={1000}
              onComplete={() => setTimeout(() => setCurrentStep('birth_date_input'), 1500)}
            />
          </div>
        );

      case 'birth_date_input':
        return (
          <div className='max-w-2xl mx-auto'>
            <ConversationBubble text="Welcome, consciousness explorer. I am WitnessOS, your guide through the sacred geometries of self-discovery. Before we begin this journey together, I'd love to know what to call you." />
            <ConversationBubble text={userName} isUser />
            <ConversationBubble
              text={`Beautiful, ${userName.split(' ')[0]}. Your name carries its own vibrational signature. Now, to map your consciousness blueprint, I need to understand the cosmic moment of your arrival. When did your soul choose to incarnate in this reality?`}
            />
            <ConversationInput
              placeholder='YYYY-MM-DD'
              onSubmit={handleBirthDateSubmit}
              type='date'
              validation={date => date.length === 10 && !isNaN(Date.parse(date))}
            />
          </div>
        );

      case 'birth_time_story':
        return (
          <div className='max-w-2xl mx-auto'>
            <ConversationBubble text={userName} isUser />
            <ConversationBubble text={birthDate} isUser />
            <ConversationBubble
              text={`${birthDate}... I can feel the cosmic energies of that moment. The planets were dancing in their eternal patterns. To complete your celestial blueprint, what time did you take your first breath? Even an approximate time helps me understand your soul's chosen moment.`}
              delay={1000}
              onComplete={() => setTimeout(() => setCurrentStep('birth_time_input'), 1500)}
            />
          </div>
        );

      case 'birth_time_input':
        return (
          <div className='max-w-2xl mx-auto'>
            <ConversationBubble text={userName} isUser />
            <ConversationBubble text={birthDate} isUser />
            <ConversationBubble
              text={`${birthDate}... I can feel the cosmic energies of that moment. The planets were dancing in their eternal patterns. To complete your celestial blueprint, what time did you take your first breath? Even an approximate time helps me understand your soul's chosen moment.`}
            />
            <ConversationInput
              placeholder='HH:MM (24-hour format)'
              onSubmit={handleBirthTimeSubmit}
              type='time'
              validation={time => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)}
            />
          </div>
        );

      case 'birth_location_story':
        return (
          <div className='max-w-2xl mx-auto'>
            <ConversationBubble text={userName} isUser />
            <ConversationBubble text={`${birthDate} at ${birthTime}`} isUser />
            <ConversationBubble
              text={`Perfect. ${birthTime} on ${birthDate} - what a sacred moment in time. Now, the final piece of your cosmic coordinates: where on this beautiful Earth did you choose to begin this incarnation? The location anchors your energy to specific ley lines and geographical consciousness fields.`}
              delay={1000}
              onComplete={() => setTimeout(() => setCurrentStep('birth_location_input'), 1500)}
            />
          </div>
        );

      case 'birth_location_input':
        return (
          <div className='max-w-2xl mx-auto'>
            <ConversationBubble text={userName} isUser />
            <ConversationBubble text={`${birthDate} at ${birthTime}`} isUser />
            <ConversationBubble
              text={`Perfect. ${birthTime} on ${birthDate} - what a sacred moment in time. Now, the final piece of your cosmic coordinates: where on this beautiful Earth did you choose to begin this incarnation? The location anchors your energy to specific ley lines and geographical consciousness fields.`}
            />
            {!birthCity ? (
              <ConversationInput
                placeholder='City where you were born...'
                onSubmit={city => setBirthCity(city)}
                validation={city => city.length >= 2}
              />
            ) : (
              <div className='space-y-4'>
                <ConversationBubble text={birthCity} isUser />
                <ConversationInput
                  placeholder='Country...'
                  onSubmit={country => handleLocationSubmit(birthCity, country)}
                  validation={country => country.length >= 2}
                />
              </div>
            )}
          </div>
        );

      case 'confirmation':
        return (
          <div className='max-w-2xl mx-auto'>
            <ConversationBubble text={userName} isUser />
            <ConversationBubble text={`${birthDate} at ${birthTime}`} isUser />
            <ConversationBubble text={`${birthCity}, ${birthCountry}`} isUser />
            <ConversationBubble
              text={`Magnificent, ${userName.split(' ')[0]}. Your consciousness coordinates are now complete:

✨ Soul Identity: ${userName}
🌟 Incarnation Moment: ${birthDate} at ${birthTime}
🌍 Earth Anchor: ${birthCity}, ${birthCountry}
🧭 Spectral Direction: ${selectedDirection}

I can feel the unique vibrational signature of your being. These coordinates will allow me to calculate your archetypal patterns, consciousness frequencies, and sacred geometry alignments.

Are you ready to initialize the consciousness engines and begin your journey of self-discovery?`}
              delay={1000}
            />
            <div className='flex justify-center mt-8 space-x-4'>
              <button
                onClick={handleConfirmProfile}
                className='px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600
                  text-white rounded-2xl hover:from-cyan-500 hover:to-blue-500
                  transition-all duration-300 text-lg font-medium'
                style={{
                  boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)',
                }}
              >
                Initialize Engines ✨
              </button>
              <button
                onClick={() => setCurrentStep('compass')}
                className='px-6 py-4 border-2 border-gray-600 text-gray-300
                  rounded-2xl hover:border-gray-400 hover:text-white
                  transition-all duration-300'
              >
                Start Over
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`consciousness-data-collector min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex flex-col justify-center items-center p-8 ${className}`}
      style={{
        opacity: getBreathOpacity(),
        transition: 'opacity 0.3s ease',
      }}
    >
      {renderStepIndicator()}
      <div className='w-full max-w-4xl'>{renderStepContent()}</div>
    </div>
  );
};

export default ConsciousnessDataCollector;
