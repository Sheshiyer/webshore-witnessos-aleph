#!/usr/bin/env python3
"""
Test the Human Design fix locally with Shesh's birth data.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, date, time
from engines.human_design import HumanDesignEngine

def test_shesh_fix():
    """Test the fix with Shesh's actual birth data."""
    
    print("🧪 TESTING HUMAN DESIGN FIX WITH SHESH'S DATA")
    print("=" * 60)
    
    # Shesh's birth data
    birth_data = {
        "birth_date": "1991-08-13",
        "birth_time": "13:31:00", 
        "birth_location": [12.9629, 77.5775],
        "timezone": "Asia/Kolkata"
    }
    
    print(f"Birth Date: {birth_data['birth_date']}")
    print(f"Birth Time: {birth_data['birth_time']}")
    print(f"Location: {birth_data['birth_location']}")
    print(f"Timezone: {birth_data['timezone']}")
    print()
    
    try:
        # Initialize engine
        engine = HumanDesignEngine()
        
        # Calculate Human Design chart
        result = engine.calculate(birth_data)
        
        if hasattr(result, 'chart') and result.chart:
            chart = result.chart
            
            print("🎯 PROFILE RESULTS:")
            print("-" * 30)
            if hasattr(chart, 'profile') and chart.profile:
                profile = chart.profile
                print(f"Profile: {profile.profile_name}")
                print(f"Personality Line: {profile.personality_line}")
                print(f"Design Line: {profile.design_line}")
                
                # Check if fix worked
                if profile.personality_line == 2 and profile.design_line == 4:
                    print("✅ SUCCESS: Profile is now 2/4 Hermit/Opportunist!")
                elif profile.personality_line == 6 and profile.design_line == 6:
                    print("❌ FAILED: Still showing 6/6 Role Model/Role Model")
                else:
                    print(f"🤔 UNEXPECTED: Got {profile.personality_line}/{profile.design_line}")
            
            print("\n🌟 PERSONALITY GATES:")
            print("-" * 30)
            if hasattr(chart, 'personality_gates') and chart.personality_gates:
                for planet, gate in chart.personality_gates.items():
                    if hasattr(gate, 'number') and hasattr(gate, 'line'):
                        print(f"{planet:12}: Gate {gate.number}.{gate.line}")
            
            print("\n🌙 DESIGN GATES:")
            print("-" * 30)
            if hasattr(chart, 'design_gates') and chart.design_gates:
                for planet, gate in chart.design_gates.items():
                    if hasattr(gate, 'number') and hasattr(gate, 'line'):
                        print(f"{planet:12}: Gate {gate.number}.{gate.line}")
            
            print("\n🔮 INCARNATION CROSS:")
            print("-" * 30)
            if hasattr(chart, 'incarnation_cross') and chart.incarnation_cross:
                cross = chart.incarnation_cross
                if hasattr(cross, 'name'):
                    print(f"Name: {cross.name}")
                if hasattr(cross, 'gates'):
                    gates = cross.gates
                    if isinstance(gates, dict):
                        print(f"Gates: {gates.get('conscious_sun', 'N/A')}/{gates.get('conscious_earth', 'N/A')} | {gates.get('unconscious_sun', 'N/A')}/{gates.get('unconscious_earth', 'N/A')}")
                    else:
                        print(f"Gates: {gates}")
                        
                # Check if incarnation cross is correct
                expected_gates = [4, 49, 23, 43]
                if hasattr(cross, 'gates') and isinstance(cross.gates, dict):
                    actual_gates = [
                        cross.gates.get('conscious_sun'),
                        cross.gates.get('conscious_earth'), 
                        cross.gates.get('unconscious_sun'),
                        cross.gates.get('unconscious_earth')
                    ]
                    if actual_gates == expected_gates:
                        print("✅ SUCCESS: Incarnation cross gates are correct!")
                    else:
                        print(f"❌ FAILED: Expected {expected_gates}, got {actual_gates}")
        
        else:
            print("❌ No chart data returned")
            print(f"Result: {result}")
            
    except Exception as e:
        print(f"❌ Error testing fix: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_shesh_fix()
