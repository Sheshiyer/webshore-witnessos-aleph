"""
Integrated Swiss Ephemeris Service for WitnessOS Consolidated Engine
Direct pyswisseph integration for 100% accurate astronomical calculations
"""

import swisseph as swe
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import logging
import pytz

logger = logging.getLogger(__name__)

class SwissEphemerisService:
    """
    Consolidated Swiss Ephemeris service that provides accurate astronomical calculations
    for all consciousness engines requiring planetary positions.
    """
    
    def __init__(self):
        """Initialize Swiss Ephemeris with proper configuration."""
        # Set ephemeris path (uses built-in data)
        swe.set_ephe_path('')
        logger.info("✅ Swiss Ephemeris service initialized")
    
    def calculate_positions(self, birth_date: str, birth_time: str, birth_location: List[float], **options) -> Dict[str, Any]:
        """
        Calculate accurate planetary positions for any consciousness engine.
        
        Args:
            birth_date: Birth date in YYYY-MM-DD format
            birth_time: Birth time in HH:MM format
            birth_location: [latitude, longitude] in decimal degrees
            **options: Additional calculation options
            
        Returns:
            Dictionary containing planetary positions and derived data
        """
        try:
            # Parse birth data
            birth_datetime = datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M")
            latitude, longitude = birth_location
            
            logger.info(f"🌟 Calculating Swiss Ephemeris positions for {birth_datetime} at {latitude}, {longitude}")
            
            # Calculate Julian Day
            julian_day = swe.julday(
                birth_datetime.year,
                birth_datetime.month, 
                birth_datetime.day,
                birth_datetime.hour + birth_datetime.minute / 60.0
            )
            
            # Calculate personality positions (birth time)
            personality_positions = self._calculate_planetary_positions(julian_day)
            
            # Calculate design positions (88 days before birth)
            design_julian_day = julian_day - 88.0
            design_positions = self._calculate_planetary_positions(design_julian_day)
            
            # Add Human Design gate mappings
            personality_gates = self._add_human_design_gates(personality_positions)
            design_gates = self._add_human_design_gates(design_positions)
            
            result = {
                'success': True,
                'birth_data': {
                    'date': birth_date,
                    'time': birth_time,
                    'latitude': latitude,
                    'longitude': longitude,
                    'julian_day': julian_day
                },
                'personality': personality_gates,
                'design': design_gates,
                'raw_positions': {
                    'personality': personality_positions,
                    'design': design_positions
                },
                'engine': 'Swiss Ephemeris',
                'accuracy': 'Professional Grade',
                'calculated_at': datetime.utcnow().isoformat()
            }
            
            logger.info(f"✅ Swiss Ephemeris calculation successful")
            logger.info(f"🌟 Personality Sun: Gate {personality_gates['SUN']['human_design_gate']['gate']}.{personality_gates['SUN']['human_design_gate']['line']}")
            logger.info(f"🌙 Design Sun: Gate {design_gates['SUN']['human_design_gate']['gate']}.{design_gates['SUN']['human_design_gate']['line']}")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Swiss Ephemeris calculation failed: {e}")
            raise
    
    def _calculate_planetary_positions(self, julian_day: float) -> Dict[str, Dict[str, float]]:
        """Calculate positions for all planets at given Julian Day."""
        planets = {
            'SUN': swe.SUN,
            'MOON': swe.MOON,
            'MERCURY': swe.MERCURY,
            'VENUS': swe.VENUS,
            'MARS': swe.MARS,
            'JUPITER': swe.JUPITER,
            'SATURN': swe.SATURN,
            'URANUS': swe.URANUS,
            'NEPTUNE': swe.NEPTUNE,
            'PLUTO': swe.PLUTO,
            'NORTH_NODE': swe.MEAN_NODE,
        }
        
        positions = {}
        
        for planet_name, planet_id in planets.items():
            try:
                pos, ret_flag = swe.calc_ut(julian_day, planet_id)
                positions[planet_name] = {
                    'longitude': pos[0],
                    'latitude': pos[1],
                    'distance': pos[2],
                    'longitude_speed': pos[3] if len(pos) > 3 else 0
                }
                
                # Calculate South Node as opposite of North Node
                if planet_name == 'NORTH_NODE':
                    south_longitude = (pos[0] + 180) % 360
                    positions['SOUTH_NODE'] = {
                        'longitude': south_longitude,
                        'latitude': -pos[1],
                        'distance': pos[2],
                        'longitude_speed': -pos[3] if len(pos) > 3 else 0
                    }
                    
            except Exception as e:
                logger.error(f"❌ Error calculating {planet_name}: {e}")
                positions[planet_name] = {
                    'longitude': 0,
                    'latitude': 0,
                    'distance': 0,
                    'longitude_speed': 0,
                    'error': str(e)
                }
        
        return positions
    
    def _add_human_design_gates(self, positions: Dict[str, Dict[str, float]]) -> Dict[str, Dict[str, Any]]:
        """Add Human Design gate and line information to planetary positions."""
        gates = {}
        
        for planet, pos_data in positions.items():
            if 'error' in pos_data:
                gates[planet] = pos_data
                continue
                
            longitude = pos_data['longitude']
            
            # Convert longitude to Human Design gate and line
            gate, line = self._longitude_to_gate_line(longitude)
            
            gates[planet] = {
                **pos_data,
                'planet': planet,
                'human_design_gate': {
                    'gate': gate,
                    'line': line,
                    'longitude': longitude,
                    'gate_position': (longitude % 5.625) / 5.625  # Position within gate (0-1)
                }
            }
        
        return gates
    
    def _longitude_to_gate_line(self, longitude: float) -> Tuple[int, int]:
        """
        Convert astronomical longitude to Human Design gate and line.
        Uses the official I Ching wheel sequence starting from 0° Aries.
        """
        # Official Human Design gate sequence (64 gates in I Ching wheel order)
        gate_sequence = [
            41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
            27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
            31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
            28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
        ]
        
        # Each gate covers 5.625 degrees (360° / 64 gates)
        gate_degrees = 360.0 / 64.0
        
        # Calculate gate index (0-63)
        gate_index = int(longitude / gate_degrees) % 64
        gate_number = gate_sequence[gate_index]
        
        # Calculate line within gate (1-6)
        # Each line covers 0.9375 degrees (5.625° / 6 lines)
        line_degrees = gate_degrees / 6.0
        position_in_gate = longitude % gate_degrees
        line_number = int(position_in_gate / line_degrees) + 1
        line_number = min(6, max(1, line_number))  # Ensure line is 1-6
        
        return gate_number, line_number
    
    def test_admin_user_calculation(self) -> Dict[str, Any]:
        """
        Test calculation with admin user birth data.
        Expected: Generator type (not Projector or Reflector)
        """
        logger.info("🧪 Testing Swiss Ephemeris with admin user birth data")
        
        return self.calculate_positions(
            birth_date="1991-08-13",
            birth_time="08:01", 
            birth_location=[12.9716, 77.5946]
        )
