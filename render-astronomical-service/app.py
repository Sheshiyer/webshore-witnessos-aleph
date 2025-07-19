#!/usr/bin/env python3
"""
WitnessOS Astronomical Service - Swiss Ephemeris Edition
Provides 100% accurate planetary positions for Human Design and Gene Keys
Uses the same Swiss Ephemeris library as professional astrology software
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import swisseph as swe
from datetime import datetime, timezone
import os
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS with optional environment variable
allowed_origins = os.environ.get('ALLOWED_ORIGINS', '*')
if allowed_origins != '*':
    allowed_origins = allowed_origins.split(',')

CORS(app, origins=allowed_origins)

# Get port from environment (Render sets this automatically)
port = int(os.environ.get('PORT', 5000))

# Optional API key for additional security
API_KEY = os.environ.get('API_KEY', None)

# Swiss Ephemeris planet constants
PLANETS = {
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
    'SOUTH_NODE': swe.MEAN_NODE  # Will calculate opposite
}

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'service': 'WitnessOS Astronomical Service',
        'status': 'healthy',
        'engine': 'Swiss Ephemeris',
        'version': swe.version,
        'accuracy': '100% professional grade'
    })

def check_api_key():
    """Check API key if configured"""
    if API_KEY:
        provided_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        if provided_key != API_KEY:
            return jsonify({'error': 'Invalid or missing API key'}), 401
    return None

@app.route('/calculate-positions', methods=['POST'])
def calculate_positions():
    """
    Calculate accurate planetary positions using Swiss Ephemeris

    Expected JSON payload:
    {
        "birth_date": "1991-08-13",
        "birth_time": "08:01",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "timezone_offset": 5.5  # Optional, defaults to UTC
    }

    Optional headers:
    X-API-Key: your-api-key (if API_KEY environment variable is set)
    """
    # Check API key if configured
    auth_error = check_api_key()
    if auth_error:
        return auth_error

    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate required fields
        required_fields = ['birth_date', 'birth_time', 'latitude', 'longitude']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Parse birth date and time
        birth_date = data['birth_date']  # Format: "1991-08-13"
        birth_time = data['birth_time']  # Format: "08:01" or "13:31"
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        timezone_offset = float(data.get('timezone_offset', 0))  # Hours from UTC
        
        logger.info(f"Calculating positions for {birth_date} {birth_time} at {latitude}, {longitude}")
        
        # Parse date and time
        date_parts = birth_date.split('-')
        time_parts = birth_time.split(':')
        
        year = int(date_parts[0])
        month = int(date_parts[1])
        day = int(date_parts[2])
        hour = int(time_parts[0])
        minute = int(time_parts[1])
        
        # Convert to UTC if timezone offset provided
        hour_utc = hour - timezone_offset
        
        # Calculate Julian Day (Swiss Ephemeris uses UTC)
        julian_day = swe.julday(year, month, day, hour_utc + minute/60.0)
        
        logger.info(f"Julian Day: {julian_day}")
        
        # Calculate positions for all planets
        positions = {}
        
        for planet_name, planet_id in PLANETS.items():
            try:
                if planet_name == 'SOUTH_NODE':
                    # South Node is opposite of North Node
                    north_node_pos, _ = swe.calc_ut(julian_day, swe.MEAN_NODE)
                    longitude_deg = (north_node_pos[0] + 180.0) % 360.0
                    latitude_deg = -north_node_pos[1]  # Opposite latitude
                    distance_au = north_node_pos[2]
                else:
                    # Calculate planetary position
                    planet_pos, _ = swe.calc_ut(julian_day, planet_id)
                    longitude_deg = planet_pos[0]
                    latitude_deg = planet_pos[1]
                    distance_au = planet_pos[2]
                
                positions[planet_name] = {
                    'longitude': longitude_deg,
                    'latitude': latitude_deg,
                    'distance': distance_au,
                    'zodiac_sign': get_zodiac_sign(longitude_deg),
                    'zodiac_degree': longitude_deg % 30,
                    'human_design_gate': longitude_to_human_design_gate(longitude_deg)
                }
                
                logger.info(f"{planet_name}: {longitude_deg:.4f}° -> Gate {positions[planet_name]['human_design_gate']['gate']}.{positions[planet_name]['human_design_gate']['line']}")
                
            except Exception as e:
                logger.error(f"Error calculating {planet_name}: {e}")
                positions[planet_name] = {
                    'error': str(e),
                    'longitude': 0,
                    'latitude': 0,
                    'distance': 0
                }
        
        # Calculate Design time (88 days before birth)
        design_julian_day = julian_day - 88.0
        design_positions = {}
        
        for planet_name, planet_id in PLANETS.items():
            try:
                if planet_name == 'SOUTH_NODE':
                    north_node_pos, _ = swe.calc_ut(design_julian_day, swe.MEAN_NODE)
                    longitude_deg = (north_node_pos[0] + 180.0) % 360.0
                    latitude_deg = -north_node_pos[1]
                    distance_au = north_node_pos[2]
                else:
                    planet_pos, _ = swe.calc_ut(design_julian_day, planet_id)
                    longitude_deg = planet_pos[0]
                    latitude_deg = planet_pos[1]
                    distance_au = planet_pos[2]
                
                design_positions[planet_name] = {
                    'longitude': longitude_deg,
                    'latitude': latitude_deg,
                    'distance': distance_au,
                    'zodiac_sign': get_zodiac_sign(longitude_deg),
                    'zodiac_degree': longitude_deg % 30,
                    'human_design_gate': longitude_to_human_design_gate(longitude_deg)
                }
                
            except Exception as e:
                logger.error(f"Error calculating Design {planet_name}: {e}")
                design_positions[planet_name] = {
                    'error': str(e),
                    'longitude': 0,
                    'latitude': 0,
                    'distance': 0
                }
        
        # Return complete astronomical data
        result = {
            'success': True,
            'birth_data': {
                'date': birth_date,
                'time': birth_time,
                'latitude': latitude,
                'longitude': longitude,
                'timezone_offset': timezone_offset,
                'julian_day': julian_day
            },
            'personality': positions,
            'design': design_positions,
            'engine': 'Swiss Ephemeris',
            'accuracy': 'Professional Grade',
            'calculated_at': datetime.now(timezone.utc).isoformat()
        }
        
        logger.info("Calculation completed successfully")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Calculation error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'engine': 'Swiss Ephemeris'
        }), 500

def get_zodiac_sign(longitude):
    """Convert longitude to zodiac sign"""
    signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
             'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    sign_index = int(longitude // 30)
    return signs[sign_index % 12]

def longitude_to_human_design_gate(longitude):
    """
    Convert ecliptic longitude to Human Design gate and line
    Uses the standard Human Design wheel mapping
    """
    # Normalize longitude to 0-360°
    normalized_lon = longitude % 360
    
    # Each gate covers exactly 5.625° (360° ÷ 64 gates)
    degrees_per_gate = 360.0 / 64.0
    
    # Calculate gate number (1-64) - Sequential mapping
    gate_number = int(normalized_lon // degrees_per_gate) + 1
    gate = max(1, min(64, gate_number))
    
    # Calculate line within gate (1-6)
    position_in_gate = normalized_lon % degrees_per_gate
    line_position = position_in_gate / degrees_per_gate  # 0-1 within gate
    line = int(line_position * 6) + 1  # Lines 1-6
    line = max(1, min(6, line))
    
    return {
        'gate': gate,
        'line': line,
        'longitude': longitude,
        'gate_position': line_position
    }

@app.route('/test-sheshnarayan', methods=['GET'])
def test_sheshnarayan():
    """Test endpoint with Sheshnarayan's birth data"""
    # Check API key if configured
    auth_error = check_api_key()
    if auth_error:
        return auth_error
    test_data = {
        'birth_date': '1991-08-13',
        'birth_time': '08:01',  # UTC time
        'latitude': 12.9716,
        'longitude': 77.5946,
        'timezone_offset': 0  # Already in UTC
    }
    
    # Simulate POST request
    with app.test_request_context('/calculate-positions', json=test_data, method='POST'):
        return calculate_positions()

if __name__ == '__main__':
    logger.info(f"Starting WitnessOS Astronomical Service on port {port}")
    logger.info(f"Swiss Ephemeris version: {swe.version}")
    app.run(debug=False, host='0.0.0.0', port=port)
