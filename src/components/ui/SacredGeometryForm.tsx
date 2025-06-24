/**
 * Sacred Geometry Form Components for WitnessOS Webshore
 *
 * Form system with sacred geometry validation and archetypal visualization
 * Implements breath-synced UI transitions and spectral color coding
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import type { BirthData, PersonalData } from '@/types';
import React, { useEffect, useRef, useState } from 'react';

// Spectral channel color coding (North=Blue, East=Gold, South=Red, West=Green)
export const SPECTRAL_COLORS = {
  north: '#4A90E2', // Blue - Mental/Air
  east: '#F5A623', // Gold - Spiritual/Fire
  south: '#D0021B', // Red - Emotional/Water
  west: '#7ED321', // Green - Physical/Earth
} as const;

// Sacred shape types for form validation
export type SacredShape = 'triangle' | 'diamond' | 'droplet' | 'circle' | 'octagon';

export interface SacredGeometryFormData {
  personalData: PersonalData;
  birthData: BirthData;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  preferences: {
    primaryShape: SacredShape;
    spectralDirection: keyof typeof SPECTRAL_COLORS;
    consciousnessLevel: number;
  };
}

interface SacredGeometryFormProps {
  onSubmit: (data: SacredGeometryFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

// Sacred geometry validation patterns
const SACRED_PATTERNS = {
  triangle: /^[A-Za-z\s]{3,}$/, // Names with 3+ characters (trinity)
  diamond: /^[A-Za-z\s]{4,}$/, // Names with 4+ characters (stability)
  droplet: /^[A-Za-z\s]{5,}$/, // Names with 5+ characters (flow)
  circle: /^[A-Za-z\s]{6,}$/, // Names with 6+ characters (completion)
  octagon: /^[A-Za-z\s]{8,}$/, // Names with 8+ characters (infinity)
};

export const SacredGeometryForm: React.FC<SacredGeometryFormProps> = ({
  onSubmit,
  onValidationChange,
  className = '',
}) => {
  const { breathPhase, consciousnessLevel } = useConsciousness();
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState<SacredGeometryFormData>({
    personalData: {
      fullName: '',
      preferredName: '',
      birthDate: '',
      name: '', // Backward compatibility
    },
    birthData: {
      birthDate: '',
      birthTime: '',
      birthLocation: [0, 0],
      timezone: '',
      date: '', // Backward compatibility
      time: '', // Backward compatibility
      location: [0, 0], // Backward compatibility
    },
    location: {
      latitude: 0,
      longitude: 0,
      city: '',
      country: '',
    },
    preferences: {
      primaryShape: 'circle',
      spectralDirection: 'north',
      consciousnessLevel: 0.5,
    },
  });

  const [validation, setValidation] = useState({
    name: false,
    birthDate: false,
    birthTime: false,
    location: false,
    overall: false,
  });

  // Validate form data using sacred geometry patterns
  const validateField = (field: string, value: string): boolean => {
    switch (field) {
      case 'name':
        const pattern = SACRED_PATTERNS[formData.preferences.primaryShape];
        return pattern.test(value);
      case 'birthDate':
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
      case 'birthTime':
        return /^\d{2}:\d{2}$/.test(value);
      case 'location':
        return formData.location.city.length > 0 && formData.location.country.length > 0;
      default:
        return true;
    }
  };

  // Update validation state
  useEffect(() => {
    const newValidation = {
      name: validateField('name', formData.personalData.fullName),
      birthDate: validateField('birthDate', formData.birthData.birthDate),
      birthTime: validateField('birthTime', formData.birthData.birthTime),
      location: validateField('location', ''),
      overall: false,
    };

    newValidation.overall = Object.values(newValidation).every(Boolean);
    setValidation(newValidation);
    onValidationChange?.(newValidation.overall);
  }, [formData, onValidationChange]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation.overall) {
      // Sync backward compatibility fields
      const submissionData = {
        ...formData,
        personalData: {
          ...formData.personalData,
          name: formData.personalData.fullName,
        },
        birthData: {
          ...formData.birthData,
          date: formData.birthData.birthDate,
          time: formData.birthData.birthTime,
          location: formData.birthData.birthLocation,
        },
      };
      onSubmit(submissionData);
    }
  };

  // Get spectral color for current direction
  const getCurrentSpectralColor = () => {
    return SPECTRAL_COLORS[formData.preferences.spectralDirection];
  };

  // Breath-synced opacity for form elements
  const getBreathOpacity = () => {
    return 0.7 + Math.sin(breathPhase) * 0.3;
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`sacred-geometry-form ${className}`}
      style={{
        opacity: getBreathOpacity(),
        borderColor: getCurrentSpectralColor(),
        transition: 'all 0.3s ease',
      }}
    >
      <div className='form-container p-6 rounded-lg border-2 bg-black/80 backdrop-blur-sm'>
        {/* Sacred Shape Selector */}
        <div className='mb-6'>
          <label
            className='block text-sm font-medium mb-2'
            style={{ color: getCurrentSpectralColor() }}
          >
            Sacred Shape Resonance
          </label>
          <div className='grid grid-cols-5 gap-2'>
            {(Object.keys(SACRED_PATTERNS) as SacredShape[]).map(shape => (
              <button
                key={shape}
                type='button'
                onClick={() =>
                  setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, primaryShape: shape },
                  }))
                }
                className={`p-2 rounded border ${
                  formData.preferences.primaryShape === shape
                    ? 'border-current bg-current/20'
                    : 'border-gray-600 hover:border-current'
                }`}
                style={{ borderColor: getCurrentSpectralColor() }}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Spectral Direction Selector */}
        <div className='mb-6'>
          <label
            className='block text-sm font-medium mb-2'
            style={{ color: getCurrentSpectralColor() }}
          >
            Spectral Direction
          </label>
          <div className='grid grid-cols-4 gap-2'>
            {(Object.keys(SPECTRAL_COLORS) as Array<keyof typeof SPECTRAL_COLORS>).map(
              direction => (
                <button
                  key={direction}
                  type='button'
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, spectralDirection: direction },
                    }))
                  }
                  className={`p-2 rounded border capitalize ${
                    formData.preferences.spectralDirection === direction
                      ? 'border-current bg-current/20'
                      : 'border-gray-600 hover:border-current'
                  }`}
                  style={{
                    borderColor: SPECTRAL_COLORS[direction],
                    color: SPECTRAL_COLORS[direction],
                  }}
                >
                  {direction}
                </button>
              )
            )}
          </div>
        </div>

        {/* Name Input with Sacred Geometry Validation */}
        <div className='mb-4'>
          <label
            className='block text-sm font-medium mb-2'
            style={{ color: getCurrentSpectralColor() }}
          >
            Full Name
          </label>
          <input
            type='text'
            value={formData.personalData.fullName}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                personalData: { ...prev.personalData, fullName: e.target.value },
              }))
            }
            className={`w-full p-3 rounded border bg-black/50 text-white ${
              validation.name ? 'border-green-500' : 'border-red-500'
            }`}
            placeholder='Enter your full name...'
            style={{ borderColor: validation.name ? '#7ED321' : '#D0021B' }}
          />
          <div className='mt-1 text-xs text-gray-400'>
            Sacred pattern: {formData.preferences.primaryShape} (
            {SACRED_PATTERNS[formData.preferences.primaryShape].source})
          </div>
        </div>

        {/* Birth Date Input */}
        <div className='mb-4'>
          <label
            className='block text-sm font-medium mb-2'
            style={{ color: getCurrentSpectralColor() }}
          >
            Birth Date
          </label>
          <input
            type='date'
            value={formData.birthData.birthDate}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                birthData: {
                  ...prev.birthData,
                  birthDate: e.target.value,
                  date: e.target.value, // Backward compatibility
                },
              }))
            }
            className={`w-full p-3 rounded border bg-black/50 text-white ${
              validation.birthDate ? 'border-green-500' : 'border-red-500'
            }`}
            style={{ borderColor: validation.birthDate ? '#7ED321' : '#D0021B' }}
          />
        </div>

        {/* Birth Time Input */}
        <div className='mb-4'>
          <label
            className='block text-sm font-medium mb-2'
            style={{ color: getCurrentSpectralColor() }}
          >
            Birth Time
          </label>
          <input
            type='time'
            value={formData.birthData.birthTime}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                birthData: {
                  ...prev.birthData,
                  birthTime: e.target.value,
                  time: e.target.value, // Backward compatibility
                },
              }))
            }
            className={`w-full p-3 rounded border bg-black/50 text-white ${
              validation.birthTime ? 'border-green-500' : 'border-red-500'
            }`}
            style={{ borderColor: validation.birthTime ? '#7ED321' : '#D0021B' }}
          />
        </div>

        {/* Location Input */}
        <div className='mb-4'>
          <label
            className='block text-sm font-medium mb-2'
            style={{ color: getCurrentSpectralColor() }}
          >
            Birth Location
          </label>
          <div className='grid grid-cols-2 gap-2 mb-2'>
            <input
              type='text'
              value={formData.location.city}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, city: e.target.value },
                }))
              }
              className={`p-3 rounded border bg-black/50 text-white ${
                validation.location ? 'border-green-500' : 'border-red-500'
              }`}
              placeholder='City'
              style={{ borderColor: validation.location ? '#7ED321' : '#D0021B' }}
            />
            <input
              type='text'
              value={formData.location.country}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, country: e.target.value },
                }))
              }
              className={`p-3 rounded border bg-black/50 text-white ${
                validation.location ? 'border-green-500' : 'border-red-500'
              }`}
              placeholder='Country'
              style={{ borderColor: validation.location ? '#7ED321' : '#D0021B' }}
            />
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <input
              type='number'
              step='0.000001'
              value={formData.location.latitude}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, latitude: parseFloat(e.target.value) || 0 },
                  birthData: {
                    ...prev.birthData,
                    birthLocation: [parseFloat(e.target.value) || 0, prev.location.longitude],
                    location: [parseFloat(e.target.value) || 0, prev.location.longitude],
                  },
                }))
              }
              className='p-3 rounded border bg-black/50 text-white border-gray-600'
              placeholder='Latitude'
            />
            <input
              type='number'
              step='0.000001'
              value={formData.location.longitude}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, longitude: parseFloat(e.target.value) || 0 },
                  birthData: {
                    ...prev.birthData,
                    birthLocation: [prev.location.latitude, parseFloat(e.target.value) || 0],
                    location: [prev.location.latitude, parseFloat(e.target.value) || 0],
                  },
                }))
              }
              className='p-3 rounded border bg-black/50 text-white border-gray-600'
              placeholder='Longitude'
            />
          </div>
          <div className='mt-1 text-xs text-gray-400'>
            Geographical coordinates for consciousness mapping
          </div>
        </div>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={!validation.overall}
          className='w-full p-3 rounded font-medium transition-all duration-300 disabled:opacity-50'
          style={{
            backgroundColor: validation.overall ? getCurrentSpectralColor() : '#666',
            color: validation.overall ? '#000' : '#fff',
          }}
        >
          {validation.overall ? 'Initialize Consciousness Field' : 'Complete Sacred Pattern'}
        </button>
      </div>
    </form>
  );
};

export default SacredGeometryForm;
