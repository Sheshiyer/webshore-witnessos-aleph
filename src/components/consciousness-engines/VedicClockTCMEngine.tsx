import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VedicClockTCMInput, VedicClockTCMOutput } from '../../types/engines';

interface VedicClockTCMEngineProps {
  onCalculate?: (result: VedicClockTCMOutput) => void;
  userProfile?: any;
}

const VedicClockTCMEngine: React.FC<VedicClockTCMEngineProps> = ({
  onCalculate,
  userProfile
}) => {
  const [input, setInput] = useState<Partial<VedicClockTCMInput>>({
    analysis_depth: 'detailed',
    include_predictions: true,
    prediction_hours: 24,
    optimization_focus: ['energy', 'spiritual']
  });
  const [result, setResult] = useState<VedicClockTCMOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-populate from user profile
  useEffect(() => {
    if (userProfile?.birthData) {
      setInput(prev => ({
        ...prev,
        birth_date: userProfile.birthData.birthDate,
        birth_time: userProfile.birthData.birthTime,
        birth_location: userProfile.birthData.coordinates || [0, 0],
        timezone: userProfile.birthData.timezone || 'UTC'
      }));
    }
  }, [userProfile]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch('/api/engines/vedicclock_tcm/calculate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ input })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const calculationResult = await response.json();
      setResult(calculationResult.data);
      onCalculate?.(calculationResult.data);
    } catch (error) {
      console.error('VedicClock-TCM calculation failed:', error);
      // TODO: Add proper error handling UI
    } finally {
      setIsCalculating(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCurrentTCMOrgan = () => {
    const hour = currentTime.getHours();
    const organSchedule = {
      1: 'Liver', 3: 'Lung', 5: 'Large Intestine', 7: 'Stomach',
      9: 'Spleen', 11: 'Heart', 13: 'Small Intestine', 15: 'Bladder',
      17: 'Kidney', 19: 'Pericardium', 21: 'Triple Heater', 23: 'Gallbladder'
    };
    
    const organHour = Math.floor((hour - 1) / 2) * 2 + 1;
    return organSchedule[organHour as keyof typeof organSchedule] || 'Heart';
  };

  return (
    <motion.div
      className="vedicclock-tcm-engine"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="engine-header">
        <div className="title-section">
          <h2>🕐 VedicClock-TCM Integration</h2>
          <p>Multi-dimensional consciousness optimization combining Vedic time cycles with TCM organ rhythms</p>
        </div>
        
        <div className="current-state-display">
          <div className="time-display">
            <span className="current-time">{formatTime(currentTime)}</span>
            <span className="current-organ">Current: {getCurrentTCMOrgan()}</span>
          </div>
        </div>
      </div>

      <div className="engine-inputs">
        <div className="input-section">
          <h3>Birth Information</h3>
          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="birth_date">Birth Date</label>
              <input
                id="birth_date"
                type="date"
                value={input.birth_date || ''}
                onChange={(e) => setInput(prev => ({ ...prev, birth_date: e.target.value }))}
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="birth_time">Birth Time</label>
              <input
                id="birth_time"
                type="time"
                value={input.birth_time || ''}
                onChange={(e) => setInput(prev => ({ ...prev, birth_time: e.target.value }))}
                required
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                value={input.timezone || 'UTC'}
                onChange={(e) => setInput(prev => ({ ...prev, timezone: e.target.value }))}
              >
                <option value="UTC">UTC</option>
                <option value="Asia/Kolkata">Asia/Kolkata</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
          </div>
        </div>

        <div className="input-section">
          <h3>Analysis Parameters</h3>
          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="analysis_depth">Analysis Depth</label>
              <select
                id="analysis_depth"
                value={input.analysis_depth || 'detailed'}
                onChange={(e) => setInput(prev => ({ 
                  ...prev, 
                  analysis_depth: e.target.value as 'basic' | 'detailed' | 'comprehensive'
                }))}
              >
                <option value="basic">Basic</option>
                <option value="detailed">Detailed</option>
                <option value="comprehensive">Comprehensive</option>
              </select>
            </div>
            
            <div className="input-group">
              <label htmlFor="prediction_hours">Prediction Hours</label>
              <input
                id="prediction_hours"
                type="number"
                min="1"
                max="168"
                value={input.prediction_hours || 24}
                onChange={(e) => setInput(prev => ({ 
                  ...prev, 
                  prediction_hours: parseInt(e.target.value) 
                }))}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Optimization Focus</label>
            <div className="checkbox-group">
              {['energy', 'creativity', 'health', 'spiritual', 'career'].map(focus => (
                <label key={focus} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={input.optimization_focus?.includes(focus) || false}
                    onChange={(e) => {
                      const currentFocus = input.optimization_focus || [];
                      if (e.target.checked) {
                        setInput(prev => ({ 
                          ...prev, 
                          optimization_focus: [...currentFocus, focus] 
                        }));
                      } else {
                        setInput(prev => ({ 
                          ...prev, 
                          optimization_focus: currentFocus.filter(f => f !== focus) 
                        }));
                      }
                    }}
                  />
                  {focus.charAt(0).toUpperCase() + focus.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={handleCalculate}
        disabled={isCalculating || !input.birth_date || !input.birth_time}
        className="calculate-button"
      >
        {isCalculating ? 'Analyzing Consciousness Patterns...' : 'Generate Optimization Report'}
      </button>

      {result && (
        <motion.div 
          className="engine-results"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="results-header">
            <h3>Consciousness Optimization Report</h3>
            <div className="resonance-indicator">
              <span className="resonance-label">Personal Resonance:</span>
              <div className="resonance-bar">
                <div 
                  className="resonance-fill"
                  style={{ width: `${result.personal_resonance_score * 100}%` }}
                />
              </div>
              <span className="resonance-value">
                {(result.personal_resonance_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="results-content">
            <div className="result-section">
              <h4>🎯 Primary Focus</h4>
              <p>{result.consciousness_optimization.primary_focus}</p>
            </div>

            <div className="result-section">
              <h4>⚡ Current Energy State</h4>
              <div className="energy-grid">
                <div className="energy-item">
                  <strong>Dasha:</strong> {result.vimshottari_context.mahadasha_lord}
                </div>
                <div className="energy-item">
                  <strong>TCM Organ:</strong> {result.tcm_organ_state.primary_organ}
                </div>
                <div className="energy-item">
                  <strong>Element:</strong> {result.tcm_organ_state.element}
                </div>
                <div className="energy-item">
                  <strong>Harmony:</strong> {result.elemental_synthesis.synthesis_quality}
                </div>
              </div>
            </div>

            <div className="result-section">
              <h4>🧘 Recommended Practices</h4>
              <ul className="practices-list">
                {result.consciousness_optimization.optimal_practices.map((practice, index) => (
                  <li key={index}>{practice}</li>
                ))}
              </ul>
            </div>

            <div className="result-section">
              <h4>📚 Today's Curriculum</h4>
              <p>{result.daily_curriculum}</p>
            </div>

            {result.upcoming_windows && result.upcoming_windows.length > 0 && (
              <div className="result-section">
                <h4>🔮 Upcoming Optimization Windows</h4>
                <div className="windows-list">
                  {result.upcoming_windows.slice(0, 3).map((window, index) => (
                    <div key={index} className="window-item">
                      <div className="window-time">
                        {new Date(window.start_time).toLocaleTimeString()} - 
                        {new Date(window.end_time).toLocaleTimeString()}
                      </div>
                      <div className="window-type">{window.opportunity_type}</div>
                      <div className="window-potency">
                        Potency: {(window.potency_score * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="formatted-output">
            <details>
              <summary>View Complete Analysis</summary>
              <pre>{result.formatted_output}</pre>
            </details>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default VedicClockTCMEngine;
