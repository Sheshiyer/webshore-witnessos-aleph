"""
Human Design Gate Sequence Mapping
Based on the I-Ching wheel and zodiac positions.
"""

# Gate sequence per zodiac sign (30° each)
# Each sign contains approximately 5.33 gates
ZODIAC_GATE_SEQUENCE = {
    # Aries (0° - 30°)
    'aries': [25, 51, 21, 26],
    
    # Taurus (30° - 60°) 
    'taurus': [27, 24, 2, 23],
    
    # Gemini (60° - 90°)
    'gemini': [8, 20, 16, 35],
    
    # Cancer (90° - 120°)
    'cancer': [45, 12, 15, 52],
    
    # Leo (120° - 150°)
    'leo': [39, 53, 62, 56],
    
    # Virgo (150° - 180°)
    'virgo': [31, 33, 7, 4],
    
    # Libra (180° - 210°)
    'libra': [29, 59, 40, 64],
    
    # Scorpio (210° - 240°)
    'scorpio': [47, 6, 46, 18],
    
    # Sagittarius (240° - 270°)
    'sagittarius': [48, 57, 32, 50],
    
    # Capricorn (270° - 300°)
    'capricorn': [28, 44, 1, 43],
    
    # Aquarius (300° - 330°)
    'aquarius': [14, 34, 9, 5],
    
    # Pisces (330° - 360°)
    'pisces': [26, 11, 10, 58]
}

# Flattened sequence for direct lookup
GATE_SEQUENCE = []
for sign_gates in ZODIAC_GATE_SEQUENCE.values():
    GATE_SEQUENCE.extend(sign_gates)

# Add remaining gates to complete the 64
# (This is a simplified version - the actual sequence is more complex)
remaining_gates = []
for i in range(1, 65):
    if i not in GATE_SEQUENCE:
        remaining_gates.append(i)

# Complete the sequence (this would need the actual I-Ching wheel mapping)
COMPLETE_GATE_SEQUENCE = GATE_SEQUENCE + remaining_gates

def longitude_to_gate_and_line(longitude: float) -> tuple[int, int]:
    """
    Convert zodiac longitude to Human Design gate and line.
    
    Args:
        longitude: Longitude in degrees (0-360)
        
    Returns:
        Tuple of (gate_number, line_number)
    """
    # Normalize longitude to 0-360
    longitude = longitude % 360
    
    # Determine zodiac sign (30° each)
    sign_index = int(longitude // 30)
    position_in_sign = longitude % 30
    
    # Get gates for this sign
    sign_names = list(ZODIAC_GATE_SEQUENCE.keys())
    if sign_index < len(sign_names):
        sign_name = sign_names[sign_index]
        sign_gates = ZODIAC_GATE_SEQUENCE[sign_name]
    else:
        # Fallback for edge cases
        sign_gates = [1, 2, 3, 4]  # Default
    
    # Calculate which gate within the sign
    degrees_per_gate = 30.0 / len(sign_gates)
    gate_index = int(position_in_sign // degrees_per_gate)
    
    # Ensure we don't exceed the available gates
    if gate_index >= len(sign_gates):
        gate_index = len(sign_gates) - 1
    
    gate_number = sign_gates[gate_index]
    
    # Calculate line within the gate (6 lines per gate)
    position_in_gate = position_in_sign % degrees_per_gate
    line_size = degrees_per_gate / 6.0
    line_number = int(position_in_gate // line_size) + 1
    
    # Ensure line is between 1-6
    line_number = max(1, min(6, line_number))
    
    return gate_number, line_number

def longitude_to_color_and_tone(longitude: float, gate_number: int, line_number: int) -> tuple[int, int]:
    """
    Calculate color and tone from longitude position.
    
    Args:
        longitude: Longitude in degrees
        gate_number: Gate number (1-64)
        line_number: Line number (1-6)
        
    Returns:
        Tuple of (color, tone) both 1-6
    """
    # This is a simplified calculation
    # The actual calculation would require more precise ephemeris data
    
    # Use fractional part for sub-divisions
    fractional_degrees = (longitude * 1000) % 1000
    
    # Color (1-6) - each line has 6 colors
    color = int((fractional_degrees / 1000) * 6) + 1
    color = max(1, min(6, color))
    
    # Tone (1-6) - each color has 6 tones  
    tone_fraction = ((fractional_degrees * 6) % 1000) / 1000
    tone = int(tone_fraction * 6) + 1
    tone = max(1, min(6, tone))
    
    return color, tone

# Test the mapping with known values
if __name__ == "__main__":
    # Test with some known positions
    test_positions = [
        (140.0935, "Current Sun position"),
        (19.6875, "Expected Gate 4 center"),
        (272.8125, "Expected Gate 49 center"),
    ]
    
    for longitude, description in test_positions:
        gate, line = longitude_to_gate_and_line(longitude)
        color, tone = longitude_to_color_and_tone(longitude, gate, line)
        print(f"{description}: {longitude:.4f}° → Gate {gate}.{line}.{color}.{tone}")
