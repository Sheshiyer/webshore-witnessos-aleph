/**
 * Onboarding Step Components - Individual conversational steps
 * 
 * Each step is designed to feel personal and intimate, creating a 
 * meaningful narrative-driven experience rather than a form.
 */

'use client';

import React, { useState } from 'react';
import { type ConsciousnessProfile } from './ConsciousnessDataCollector';

interface ArchetypalDirection {
  id: string;
  name: string;
  symbol: string;
  description: string;
  color: string;
  gradient: string;
  keywords: string[];
}

// Name Story Step
export const NameStoryStep: React.FC<{
  direction: ArchetypalDirection;
  onSubmit: (name: string) => void;
}> = ({ direction, onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="text-6xl mb-4">{direction.symbol}</div>
        <h2 className={`text-3xl font-bold mb-4 ${direction.color}`}>
          Welcome, {direction.name}
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          Your archetypal energy resonates with {direction.description.toLowerCase()}. 
          Every consciousness has a name that carries its essence through time and space.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-cyan-400 text-lg mb-3">
            What name carries your essence in this reality?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name..."
            className="w-full p-4 bg-gray-900/70 border border-gray-600 rounded-lg text-white text-lg
                     focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20
                     backdrop-blur-sm"
            autoFocus
          />
        </div>
        
        <button
          type="submit"
          disabled={!name.trim()}
          className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300
                     ${name.trim() 
                       ? `bg-gradient-to-r ${direction.gradient} hover:scale-105 text-white shadow-lg` 
                       : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
        >
          Continue Your Journey
        </button>
      </form>
    </div>
  );
};

// Birth Date Story Step
export const BirthDateStoryStep: React.FC<{
  direction: ArchetypalDirection;
  userName: string;
  onSubmit: (date: string) => void;
}> = ({ direction, userName, onSubmit }) => {
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date) {
      onSubmit(date);
    }
  };

  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="text-6xl mb-4">{direction.symbol}</div>
        <h2 className={`text-3xl font-bold mb-4 ${direction.color}`}>
          Beautiful, {userName.split(' ')[0]}
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          The moment you entered this reality carries profound significance. 
          The cosmic alignments at your birth created the unique archetypal signature 
          that flows through your {direction.name} essence.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-cyan-400 text-lg mb-3">
            When did your consciousness first touch this Earth?
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 bg-gray-900/70 border border-gray-600 rounded-lg text-white text-lg
                     focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20
                     backdrop-blur-sm"
            autoFocus
          />
        </div>
        
        <button
          type="submit"
          disabled={!date}
          className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300
                     ${date 
                       ? `bg-gradient-to-r ${direction.gradient} hover:scale-105 text-white shadow-lg` 
                       : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
        >
          Reveal the Cosmic Moment
        </button>
      </form>
    </div>
  );
};

// Birth Time Story Step
export const BirthTimeStoryStep: React.FC<{
  direction: ArchetypalDirection;
  userName: string;
  onSubmit: (time: string) => void;
}> = ({ direction, userName, onSubmit }) => {
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (time) {
      onSubmit(time);
    }
  };

  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="text-6xl mb-4">{direction.symbol}</div>
        <h2 className={`text-3xl font-bold mb-4 ${direction.color}`}>
          The Sacred Hour, {userName.split(' ')[0]}
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          Time is not linear in consciousness—it spirals. The exact moment of your arrival 
          determines the precise archetypal energies that were awakening as your {direction.name} 
          spirit chose this incarnation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-cyan-400 text-lg mb-3">
            At what sacred hour did you take your first breath?
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-4 bg-gray-900/70 border border-gray-600 rounded-lg text-white text-lg
                     focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20
                     backdrop-blur-sm"
            autoFocus
          />
          <p className="text-gray-500 text-sm mt-2">
            If unknown, choose the time that feels most resonant to your spirit
          </p>
        </div>
        
        <button
          type="submit"
          disabled={!time}
          className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300
                     ${time 
                       ? `bg-gradient-to-r ${direction.gradient} hover:scale-105 text-white shadow-lg` 
                       : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
        >
          Unlock the Temporal Gateway
        </button>
      </form>
    </div>
  );
};

// Birth Location Story Step
export const BirthLocationStoryStep: React.FC<{
  direction: ArchetypalDirection;
  userName: string;
  onSubmit: (city: string, country: string) => void;
}> = ({ direction, userName, onSubmit }) => {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim() && country.trim()) {
      onSubmit(city.trim(), country.trim());
    }
  };

  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="text-6xl mb-4">{direction.symbol}</div>
        <h2 className={`text-3xl font-bold mb-4 ${direction.color}`}>
          The Sacred Geography, {userName.split(' ')[0]}
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          Every location on Earth carries unique energetic signatures. The place where your 
          consciousness first anchored into physical reality influences your {direction.name} 
          archetypal expression and spiritual journey.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-cyan-400 text-lg mb-3">
              Sacred City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City of birth..."
              className="w-full p-4 bg-gray-900/70 border border-gray-600 rounded-lg text-white text-lg
                       focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20
                       backdrop-blur-sm"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-cyan-400 text-lg mb-3">
              Sacred Land
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country of birth..."
              className="w-full p-4 bg-gray-900/70 border border-gray-600 rounded-lg text-white text-lg
                       focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20
                       backdrop-blur-sm"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!city.trim() || !country.trim()}
          className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300
                     ${city.trim() && country.trim() 
                       ? `bg-gradient-to-r ${direction.gradient} hover:scale-105 text-white shadow-lg` 
                       : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
        >
          Complete the Sacred Map
        </button>
      </form>
    </div>
  );
};

// Confirmation Step
export const ConfirmationStep: React.FC<{
  direction: ArchetypalDirection;
  profile: ConsciousnessProfile;
  onConfirm: () => void;
}> = ({ direction, profile, onConfirm }) => {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="text-6xl mb-4">{direction.symbol}</div>
        <h2 className={`text-3xl font-bold mb-4 ${direction.color}`}>
          Your Consciousness Signature
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed">
          The archetypal pattern of your being has been revealed. Your {direction.name} essence 
          is ready to explore the infinite chambers of consciousness.
        </p>
      </div>

      <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-600">
        <div className="space-y-4 text-left">
          <div className="flex justify-between">
            <span className="text-gray-400">Name:</span>
            <span className="text-white">{profile.personalData.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Birth Date:</span>
            <span className="text-white">{profile.birthData.birthDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Birth Time:</span>
            <span className="text-white">{profile.birthData.birthTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Birth Location:</span>
            <span className="text-white">{profile.location.city}, {profile.location.country}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Archetypal Direction:</span>
            <span className={direction.color}>{direction.symbol} {direction.name}</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={onConfirm}
        className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300
                   bg-gradient-to-r ${direction.gradient} hover:scale-105 text-white shadow-lg`}
      >
        Enter the Portal Chamber 🌀
      </button>
    </div>
  );
};
