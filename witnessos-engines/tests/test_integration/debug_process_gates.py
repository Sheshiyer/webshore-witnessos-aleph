#!/usr/bin/env python3
"""
Debug script to trace exactly what data is passed to _process_gates method.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'witnessos-engines'))

from datetime import datetime
from shared.calculations.astrology import AstrologyCalculator
from engines.human_design import HumanDesignScanner
from engines.human_design_models import HumanDesignInput

def debug_process_gates_data():
    """Debug what data is actually passed to _process_gates."""
    
    # Test data - Admin Shesh
    birth_datetime = datetime(1991, 8, 13, 13, 31, 0)
    latitude = 12.9716
    longitude = 77.5946
    timezone_str = "Asia/Kolkata"
    
    print("🔍 DEBUGGING _PROCESS_GATES DATA FLOW")
    print("=" * 50)
    
    # Step 1: Get raw data from AstrologyCalculator
    print("\n1️⃣ RAW ASTROLOGY CALCULATOR DATA:")
    print("-" * 40)
    
    calc = AstrologyCalculator()
    hd_data = calc.calculate_human_design_data(birth_datetime, latitude, longitude, timezone_str)
    
    print("\n📊 PERSONALITY DATA:")
    print(f"personality_gates: {hd_data['personality_gates']}")
    print(f"personality_positions (first 3):")
    for i, (planet, pos) in enumerate(hd_data['personality_positions'].items()):
        if i < 3:  # Show first 3 for brevity
            print(f"  {planet}: {pos}")
    
    print("\n📊 DESIGN DATA:")
    print(f"design_gates: {hd_data['design_gates']}")
    print(f"design_positions (first 3):")
    for i, (planet, pos) in enumerate(hd_data['design_positions'].items()):
        if i < 3:  # Show first 3 for brevity
            print(f"  {planet}: {pos}")
    
    # Step 2: Manually call _process_gates to see what it receives
    print("\n\n2️⃣ MANUAL _PROCESS_GATES CALL:")
    print("-" * 40)
    
    scanner = HumanDesignScanner()
    
    # Test personality gates processing
    print("\n🔸 Processing Personality Gates:")
    personality_processed = scanner._process_gates(
        hd_data['personality_gates'],
        hd_data['personality_positions'],
        "personality"
    )
    
    print("Processed personality gates:")
    for planet, gate_obj in personality_processed.items():
        print(f"  {planet:12}: Gate {gate_obj.number:2}")
    
    # Test design gates processing
    print("\n🔸 Processing Design Gates:")
    design_processed = scanner._process_gates(
        hd_data['design_gates'],
        hd_data['design_positions'],
        "design"
    )
    
    print("Processed design gates:")
    for planet, gate_obj in design_processed.items():
        print(f"  {planet:12}: Gate {gate_obj.number:2}")
    
    # Step 3: Compare with full HumanDesignScanner calculation
    print("\n\n3️⃣ FULL HUMAN DESIGN SCANNER:")
    print("-" * 40)
    
    input_data = HumanDesignInput(
        birth_date=birth_datetime.date(),
        birth_time=birth_datetime.time(),
        birth_location=(latitude, longitude),
        timezone=timezone_str
    )
    
    result = scanner.calculate(input_data)
    
    print("Full scanner personality gates:")
    for planet, gate_obj in result.chart.personality_gates.items():
        print(f"  {planet:12}: Gate {gate_obj.number:2}")
    
    print("\nFull scanner design gates:")
    for planet, gate_obj in result.chart.design_gates.items():
        print(f"  {planet:12}: Gate {gate_obj.number:2}")
    
    # Step 4: Check if there's a data mismatch
    print("\n\n4️⃣ DATA CONSISTENCY CHECK:")
    print("-" * 40)
    
    manual_personality_sun = personality_processed.get('sun')
    manual_design_sun = design_processed.get('sun')
    full_personality_sun = result.chart.personality_gates.get('sun')
    full_design_sun = result.chart.design_gates.get('sun')
    
    print(f"Manual _process_gates Personality Sun: Gate {manual_personality_sun.number if manual_personality_sun else 'N/A'}")
    print(f"Full scanner Personality Sun:         Gate {full_personality_sun.number if full_personality_sun else 'N/A'}")
    print(f"Match: {manual_personality_sun.number == full_personality_sun.number if manual_personality_sun and full_personality_sun else False}")
    
    print(f"\nManual _process_gates Design Sun: Gate {manual_design_sun.number if manual_design_sun else 'N/A'}")
    print(f"Full scanner Design Sun:         Gate {full_design_sun.number if full_design_sun else 'N/A'}")
    print(f"Match: {manual_design_sun.number == full_design_sun.number if manual_design_sun and full_design_sun else False}")

if __name__ == "__main__":
    debug_process_gates_data()