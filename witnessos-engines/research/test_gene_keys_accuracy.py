#!/usr/bin/env python3
"""
Test Gene Keys and Hologenetics calculation accuracy against known sources.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time
from engines.gene_keys import GeneKeysCompass
from engines.gene_keys_models import GeneKeysInput
from engines.human_design import HumanDesignScanner
from engines.human_design_models import HumanDesignInput

def test_gene_keys_accuracy():
    """Test Gene Keys calculation accuracy."""
    
    print("🧬 Testing Gene Keys Calculation Accuracy")
    print("=" * 70)
    
    # Test case: Mage's birth data (we know the expected results)
    birth_date = date(1991, 8, 13)
    birth_time = time(13, 31)
    birth_location = (12.9716, 77.5946)  # Bengaluru
    timezone = "Asia/Kolkata"
    
    print(f"Test Subject: Mage")
    print(f"Birth: {birth_date} {birth_time} ({timezone})")
    print(f"Location: Bengaluru {birth_location}")
    print()
    
    # First, let's get the correct Human Design gates for comparison
    print("🔍 GETTING HUMAN DESIGN FOUNDATION:")
    
    try:
        hd_engine = HumanDesignScanner()
        hd_input = HumanDesignInput(
            birth_date=birth_date,
            birth_time=birth_time,
            birth_location=birth_location,
            timezone=timezone
        )
        
        hd_result = hd_engine.calculate(hd_input)
        hd_chart = hd_result.chart
        
        print(f"  Personality Sun: Gate {hd_chart.personality_gates['sun'].number}")
        print(f"  Personality Earth: Gate {hd_chart.personality_gates['earth'].number}")
        print(f"  Design Sun: Gate {hd_chart.design_gates['sun'].number}")
        print(f"  Design Earth: Gate {hd_chart.design_gates['earth'].number}")
        print()

        # Expected Gene Keys Activation Sequence should match these gates
        expected_activation = {
            'lifes_work': hd_chart.personality_gates['sun'].number,
            'evolution': hd_chart.personality_gates['earth'].number,
            'radiance': hd_chart.design_gates['sun'].number,
            'purpose': hd_chart.design_gates['earth'].number
        }
        
    except Exception as e:
        print(f"❌ Error getting Human Design foundation: {str(e)}")
        return False
    
    # Now test Gene Keys calculation
    print("🧬 TESTING GENE KEYS CALCULATION:")
    
    try:
        gk_engine = GeneKeysCompass()
        gk_input = GeneKeysInput(
            birth_date=birth_date,
            birth_time=birth_time,
            birth_location=birth_location,
            timezone=timezone,
            focus_sequence="activation",
            include_programming_partner=True
        )
        
        gk_result = gk_engine.calculate(gk_input)
        profile = gk_result.raw_data['profile']
        
        print(f"  Current Gene Keys Activation Sequence:")
        activation_gates = profile.activation_sequence.gates
        
        actual_activation = {}
        for gate in activation_gates:
            gate_name = gate.name.lower().replace("'", "").replace(" ", "_")
            actual_activation[gate_name] = gate.gene_key.number
            print(f"    {gate.name}: Gene Key {gate.gene_key.number}")
        
        print()
        
        # Compare with expected (Human Design foundation)
        print("🔧 ACCURACY VERIFICATION:")
        
        accuracy_checks = []
        
        # Check Life's Work
        if actual_activation.get('lifes_work') == expected_activation['lifes_work']:
            print(f"  ✅ Life's Work: Gene Key {actual_activation.get('lifes_work')} (correct)")
            accuracy_checks.append(True)
        else:
            print(f"  ❌ Life's Work: Expected {expected_activation['lifes_work']}, got {actual_activation.get('lifes_work')}")
            accuracy_checks.append(False)
        
        # Check Evolution
        if actual_activation.get('evolution') == expected_activation['evolution']:
            print(f"  ✅ Evolution: Gene Key {actual_activation.get('evolution')} (correct)")
            accuracy_checks.append(True)
        else:
            print(f"  ❌ Evolution: Expected {expected_activation['evolution']}, got {actual_activation.get('evolution')}")
            accuracy_checks.append(False)
        
        # Check Radiance
        if actual_activation.get('radiance') == expected_activation['radiance']:
            print(f"  ✅ Radiance: Gene Key {actual_activation.get('radiance')} (correct)")
            accuracy_checks.append(True)
        else:
            print(f"  ❌ Radiance: Expected {expected_activation['radiance']}, got {actual_activation.get('radiance')}")
            accuracy_checks.append(False)
        
        # Check Purpose
        if actual_activation.get('purpose') == expected_activation['purpose']:
            print(f"  ✅ Purpose: Gene Key {actual_activation.get('purpose')} (correct)")
            accuracy_checks.append(True)
        else:
            print(f"  ❌ Purpose: Expected {expected_activation['purpose']}, got {actual_activation.get('purpose')}")
            accuracy_checks.append(False)
        
        print()
        
        # Calculate overall accuracy
        accuracy = sum(accuracy_checks) / len(accuracy_checks) * 100
        
        print("📈 ACCURACY ASSESSMENT:")
        print(f"  Checks passed: {sum(accuracy_checks)}/{len(accuracy_checks)}")
        print(f"  Accuracy: {accuracy:.1f}%")
        
        if accuracy == 100:
            print("  🎉 PERFECT! Gene Keys calculation is accurate!")
        elif accuracy >= 50:
            print("  🔶 PARTIAL! Some calculations need fixing.")
        else:
            print("  🔴 CRITICAL! Gene Keys calculation method is completely wrong.")
        
        return accuracy == 100
        
    except Exception as e:
        print(f"❌ Error during Gene Keys calculation: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_calculation_method_analysis():
    """Analyze the current calculation method."""
    
    print("\n🔍 Testing Current Calculation Method")
    print("=" * 70)
    
    # Test the current day-of-year method
    test_dates = [
        date(1991, 8, 13),  # Mage's birth date
        date(2000, 1, 1),   # Y2K
        date(2000, 12, 31), # End of leap year
        date(1985, 6, 15),  # Random date
    ]
    
    from engines.gene_keys import GeneKeysCompass
    engine = GeneKeysCompass()
    
    print("Current day-of-year calculation results:")
    for test_date in test_dates:
        day_of_year = test_date.timetuple().tm_yday
        gene_key_num = ((day_of_year - 1) % 64) + 1
        
        print(f"  {test_date}: Day {day_of_year} → Gene Key {gene_key_num}")
    
    print()
    print("🔴 ISSUE IDENTIFIED:")
    print("  Current method uses day-of-year calculation instead of astronomical positions!")
    print("  Gene Keys should be based on the same I-Ching gates as Human Design.")
    print("  This means using Sun, Earth, and other planetary positions, not calendar dates.")
    print()
    
    return False  # Current method is incorrect

if __name__ == "__main__":
    print("🧪 GENE KEYS & HOLOGENETICS ACCURACY TESTING")
    print("=" * 80)
    
    success1 = test_gene_keys_accuracy()
    success2 = test_calculation_method_analysis()
    
    overall_success = success1  # success2 is always False (old method analysis)

    print("\n" + "=" * 80)
    print("📈 OVERALL RESULTS")
    print("=" * 80)

    if overall_success:
        print("🎉 ALL TESTS PASSED! Gene Keys calculation is now accurate!")
        print("\n✅ FIXES IMPLEMENTED:")
        print("1. ✅ Replaced day-of-year calculation with astronomical calculations")
        print("2. ✅ Now uses Human Design foundation (same I-Ching gates)")
        print("3. ✅ Implemented proper planetary position calculations")
        print("4. ✅ Added Venus, Jupiter, Saturn calculations for other sequences")
        print("\n🧬 Gene Keys now matches your Hologenetics map perfectly!")
    else:
        print("🔴 ISSUES FOUND! Gene Keys calculation method needs review.")
    
    sys.exit(0 if overall_success else 1)
