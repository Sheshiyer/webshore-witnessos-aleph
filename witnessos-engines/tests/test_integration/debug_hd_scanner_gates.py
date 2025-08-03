#!/usr/bin/env python3
"""
Debug script to check what gates the AstrologyCalculator returns vs what HumanDesignScanner processes.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'witnessos-engines'))

from datetime import datetime
from shared.calculations.astrology import AstrologyCalculator
from engines.human_design import HumanDesignScanner
from engines.human_design_models import HumanDesignInput

def debug_gate_flow():
    """Debug the flow from AstrologyCalculator to HumanDesignScanner."""
    
    # Test data - Admin Shesh
    birth_datetime = datetime(1991, 8, 13, 13, 31, 0)
    latitude = 12.9716
    longitude = 77.5946
    timezone_str = "Asia/Kolkata"
    
    print("🔍 DEBUGGING GATE CALCULATION FLOW")
    print("=" * 50)
    
    # Step 1: Test AstrologyCalculator directly
    print("\n1️⃣ ASTROLOGY CALCULATOR RESULTS:")
    print("-" * 40)
    
    calc = AstrologyCalculator()
    hd_data = calc.calculate_human_design_data(birth_datetime, latitude, longitude, timezone_str)
    
    print("Personality Gates from AstrologyCalculator:")
    for planet, gate in hd_data['personality_gates'].items():
        print(f"  {planet:12}: Gate {gate:2}")
    
    print("\nDesign Gates from AstrologyCalculator:")
    for planet, gate in hd_data['design_gates'].items():
        print(f"  {planet:12}: Gate {gate:2}")
    
    # Step 2: Test HumanDesignScanner
    print("\n\n2️⃣ HUMAN DESIGN SCANNER RESULTS:")
    print("-" * 40)
    
    input_data = HumanDesignInput(
        birth_date=birth_datetime.date(),
        birth_time=birth_datetime.time(),
        birth_location=(latitude, longitude),
        timezone=timezone_str
    )
    
    scanner = HumanDesignScanner()
    result = scanner.calculate(input_data)
    
    print("Personality Gates from HumanDesignScanner:")
    for planet, gate_obj in result.chart.personality_gates.items():
        print(f"  {planet:12}: Gate {gate_obj.number:2}")
    
    print("\nDesign Gates from HumanDesignScanner:")
    for planet, gate_obj in result.chart.design_gates.items():
        print(f"  {planet:12}: Gate {gate_obj.number:2}")
    
    # Step 3: Compare key gates
    print("\n\n3️⃣ COMPARISON:")
    print("-" * 40)
    
    astro_personality_sun = hd_data['personality_gates'].get('sun', 'N/A')
    astro_design_sun = hd_data['design_gates'].get('sun', 'N/A')
    
    scanner_personality_sun = result.chart.personality_gates.get('sun')
    scanner_design_sun = result.chart.design_gates.get('sun')
    
    scanner_personality_sun_gate = scanner_personality_sun.number if scanner_personality_sun else 'N/A'
    scanner_design_sun_gate = scanner_design_sun.number if scanner_design_sun else 'N/A'
    
    print(f"Personality Sun:")
    print(f"  AstrologyCalculator: Gate {astro_personality_sun}")
    print(f"  HumanDesignScanner:  Gate {scanner_personality_sun_gate}")
    print(f"  Match: {astro_personality_sun == scanner_personality_sun_gate}")
    
    print(f"\nDesign Sun:")
    print(f"  AstrologyCalculator: Gate {astro_design_sun}")
    print(f"  HumanDesignScanner:  Gate {scanner_design_sun_gate}")
    print(f"  Match: {astro_design_sun == scanner_design_sun_gate}")
    
    # Step 4: Check raw data being passed to _process_gates
    print("\n\n4️⃣ RAW DATA ANALYSIS:")
    print("-" * 40)
    
    print("Raw data from AstrologyCalculator:")
    print(f"  personality_gates keys: {list(hd_data['personality_gates'].keys())}")
    print(f"  personality_positions keys: {list(hd_data['personality_positions'].keys())}")
    print(f"  design_gates keys: {list(hd_data['design_gates'].keys())}")
    print(f"  design_positions keys: {list(hd_data['design_positions'].keys())}")
    
    print(f"\nPersonality Sun longitude: {hd_data['personality_positions']['sun']['longitude']:.3f}°")
    print(f"Design Sun longitude: {hd_data['design_positions']['sun']['longitude']:.3f}°")

if __name__ == "__main__":
    debug_gate_flow()