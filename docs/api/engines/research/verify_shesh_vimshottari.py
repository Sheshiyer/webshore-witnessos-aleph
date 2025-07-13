#!/usr/bin/env python3
"""
Verify WitnessOS Vimshottari calculation against Shesh's reference data.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time
from engines.vimshottari import VimshottariTimelineMapper
from engines.vimshottari_models import VimshottariInput

def analyze_reference_data():
    """Analyze the reference Vimshottari data from the screenshots."""
    
    print("🔍 Analyzing Reference Vimshottari Data")
    print("=" * 70)
    
    # Reference data from screenshots
    reference_data = {
        "current_periods": {
            "mahadasha": {
                "planet": "Rahu",
                "start": "13-9-2008 17:48",
                "end": "14-9-2026 5:48"
            },
            "antardasha": {
                "planet": "Moon", 
                "start": "25-2-2024 20:30",
                "end": "26-8-2025 17:30"
            },
            "pratyantardasha": {
                "planet": "Venus",
                "start": "30-4-2025 0:33", 
                "end": "30-7-2025 8:3"
            },
            "sookshmaadasha": {
                "planet": "Mars",
                "start": "27-5-2025 10:0",
                "end": "1-6-2025 17:50"
            }
        },
        "mahadasha_sequence": [
            ("Sun", "14-09-1991 11:48"),
            ("Moon", "13-09-2001 23:48"), 
            ("Mars", "13-09-2008 17:48"),
            ("Rahu", "14-09-2026 05:48"),  # Current - highlighted in green
            ("Jupiter", "14-09-2042 05:48"),
            ("Saturn", "13-09-2061 23:48"),
            ("Mercury", "14-09-2078 05:48"),
            ("Ketu", "13-09-2085 23:48"),
            ("Venus", "14-09-2105 23:48")
        ]
    }
    
    print("📊 REFERENCE DATA ANALYSIS:")
    print(f"Current Mahadasha: {reference_data['current_periods']['mahadasha']['planet']}")
    print(f"  Period: {reference_data['current_periods']['mahadasha']['start']} to {reference_data['current_periods']['mahadasha']['end']}")
    
    print(f"Current Antardasha: {reference_data['current_periods']['antardasha']['planet']}")
    print(f"  Period: {reference_data['current_periods']['antardasha']['start']} to {reference_data['current_periods']['antardasha']['end']}")
    
    print(f"Current Pratyantardasha: {reference_data['current_periods']['pratyantardasha']['planet']}")
    print(f"  Period: {reference_data['current_periods']['pratyantardasha']['start']} to {reference_data['current_periods']['pratyantardasha']['end']}")
    
    print("\n📅 MAHADASHA SEQUENCE:")
    for planet, end_date in reference_data['mahadasha_sequence']:
        marker = "👉" if planet == "Rahu" else "  "
        print(f"{marker} {planet}: ends {end_date}")
    
    return reference_data

def reverse_engineer_birth_nakshatra(reference_data):
    """Reverse engineer what birth nakshatra would produce the reference sequence."""

    print("\n🔍 REVERSE ENGINEERING BIRTH NAKSHATRA")
    print("=" * 70)

    # Reference sequence: Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury → Ketu → Venus
    ref_sequence = ["Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus"]

    # Standard Vimshottari sequence
    standard_sequence = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

    print("📊 SEQUENCE ANALYSIS:")
    print(f"Reference: {' → '.join(ref_sequence)}")
    print(f"Standard:  {' → '.join(standard_sequence)}")
    print()

    # Find where reference sequence starts in standard sequence
    for i, planet in enumerate(standard_sequence):
        if planet == ref_sequence[0]:  # Sun
            print(f"✅ Found match! Reference starts with {planet} at position {i} in standard sequence")

            # Check if the sequence matches
            matches = True
            for j, ref_planet in enumerate(ref_sequence):
                std_index = (i + j) % len(standard_sequence)
                std_planet = standard_sequence[std_index]
                if ref_planet != std_planet:
                    matches = False
                    print(f"❌ Mismatch at position {j}: expected {ref_planet}, got {std_planet}")
                    break
                else:
                    print(f"✅ Position {j}: {ref_planet} matches {std_planet}")

            if matches:
                print(f"\n🎉 PERFECT MATCH! Birth nakshatra should be ruled by {planet}")
                return planet
            break

    print("\n❌ No perfect match found - need to investigate further")
    return None

def find_birth_nakshatra_for_planet(ruling_planet):
    """Find which nakshatras are ruled by the given planet."""

    # Nakshatra ruling planets (repeating pattern)
    nakshatra_lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"] * 3

    nakshatras = []
    for i, lord in enumerate(nakshatra_lords):
        if lord == ruling_planet:
            nakshatras.append(i + 1)  # Nakshatra numbers are 1-based

    return nakshatras

def test_with_estimated_birth_data(reference_data):
    """Test our calculation with estimated birth data based on the reference."""

    print("\n🧮 TESTING OUR CALCULATION")
    print("=" * 70)

    # First, reverse engineer the birth nakshatra
    birth_ruling_planet = reverse_engineer_birth_nakshatra(reference_data)

    if not birth_ruling_planet:
        print("❌ Cannot proceed without knowing birth nakshatra ruling planet")
        return None, reference_data

    # Find possible birth nakshatras
    possible_nakshatras = find_birth_nakshatra_for_planet(birth_ruling_planet)
    print(f"\n📍 Possible birth nakshatras for {birth_ruling_planet}: {possible_nakshatras}")

    # Use the first one for testing (we can refine this later)
    birth_nakshatra_num = possible_nakshatras[0]
    print(f"Using nakshatra #{birth_nakshatra_num} for testing")

    print("⚠️  NOTE: Using estimated birth data since exact birth details not provided")
    print("This is for calculation logic verification, not personal accuracy")
    print()

    # Calculate birth date based on reference timeline
    # CORRECTED ANALYSIS:
    # Sun: ends 14-09-1991 11:48 (6 years) - FIRST period
    # Moon: ends 13-09-2001 23:48 (10 years)
    # Mars: ends 13-09-2008 17:48 (7 years)
    # Rahu: ends 14-09-2026 05:48 (18 years) - CURRENT

    # Working backwards from Sun ending in 1991:
    # Sun period = 6 years, so Sun started around 1985
    # Birth was during Sun period (since Sun is first in sequence)

    print("📊 TIMELINE ANALYSIS:")
    print("Sun ended: 14-09-1991 (first period)")
    print("Sun duration: 6 years")
    print("Estimated Sun start: ~1985")
    print("Birth must be during Sun period")
    print()

    # We need to find a birth date/time that puts Moon in a Sun-ruled nakshatra
    # Let's try different dates around the estimated period

    # Sun-ruled nakshatras:
    # Krittika (#3): 26°40' - 40°00' (Aries/Taurus)
    # Uttara Phalguni (#12): 146°40' - 160°00' (Leo/Virgo)
    # Uttara Ashadha (#21): 266°40' - 280°00' (Sagittarius/Capricorn)

    # Let's try a date when Moon might be in Krittika (around 26-40 degrees)
    # This typically happens when Moon is in late Aries or early Taurus

    birth_date = date(1985, 4, 20)  # Spring time, Moon likely in Aries/Taurus region
    birth_time = time(11, 48)  # From the reference timestamp
    birth_location = (12.9716, 77.5946)  # Using Bengaluru as placeholder
    timezone = "Asia/Kolkata"
    current_date = date(2025, 5, 30)
    
    print(f"Estimated Birth: {birth_date} {birth_time} ({timezone})")
    print(f"Current Date: {current_date}")
    print()
    
    # Create input
    input_data = VimshottariInput(
        birth_date=birth_date,
        birth_time=birth_time,
        birth_location=birth_location,
        timezone=timezone,
        current_date=current_date,
        years_forecast=10
    )
    
    # Initialize engine
    engine = VimshottariTimelineMapper()
    
    try:
        print("🔄 Calculating with WitnessOS...")
        result = engine.calculate(input_data)
        
        print("✅ Calculation completed!")
        print()

        # Extract results
        timeline = result.timeline
        current_mahadasha = timeline.current_mahadasha
        current_antardasha = timeline.current_antardasha
        birth_nakshatra = timeline.birth_nakshatra

        print("📊 OUR CALCULATION RESULTS:")
        print(f"Birth Nakshatra: {birth_nakshatra.name} (ruled by {birth_nakshatra.ruling_planet})")
        print(f"Current Mahadasha: {current_mahadasha.planet}")
        print(f"  Period: {current_mahadasha.start_date} to {current_mahadasha.end_date}")
        print(f"  Duration: {current_mahadasha.duration_years:.2f} years")

        if current_antardasha:
            print(f"Current Antardasha: {current_antardasha.planet}")
            print(f"  Period: {current_antardasha.start_date} to {current_antardasha.end_date}")
            print(f"  Duration: {current_antardasha.duration_years:.2f} years")

        # Check if birth nakshatra matches expected
        expected_ruling_planet = birth_ruling_planet
        actual_ruling_planet = birth_nakshatra.ruling_planet

        print(f"\n🔍 BIRTH NAKSHATRA VERIFICATION:")
        print(f"Expected ruling planet: {expected_ruling_planet}")
        print(f"Actual ruling planet: {actual_ruling_planet}")

        if expected_ruling_planet != actual_ruling_planet:
            print(f"❌ MISMATCH! Need to adjust birth data to get {expected_ruling_planet}-ruled nakshatra")
            print(f"Current nakshatra {birth_nakshatra.name} is ruled by {actual_ruling_planet}")
            return None, reference_data
        else:
            print(f"✅ MATCH! Birth nakshatra ruling planet is correct")
        
        print("\n📅 OUR MAHADASHA SEQUENCE:")
        for i, period in enumerate(timeline.all_mahadashas[:9]):
            marker = "👉" if period.planet == current_mahadasha.planet else "  "
            print(f"{marker} {period.planet}: {period.start_date} to {period.end_date} ({period.duration_years:.0f} years)")
        
        return result, reference_data
        
    except Exception as e:
        print(f"❌ Error during calculation: {str(e)}")
        import traceback
        traceback.print_exc()
        return None, reference_data

def compare_calculations(our_result, reference_data):
    """Compare our calculations with the reference data."""
    
    if not our_result:
        print("\n❌ Cannot compare - our calculation failed")
        return False
    
    print("\n🔍 COMPARISON ANALYSIS")
    print("=" * 70)
    
    timeline = our_result.timeline
    current_mahadasha = timeline.current_mahadasha
    current_antardasha = timeline.current_antardasha
    
    # Compare current periods
    ref_maha = reference_data['current_periods']['mahadasha']
    ref_antar = reference_data['current_periods']['antardasha']
    
    print("📊 CURRENT PERIOD COMPARISON:")
    
    # Mahadasha comparison
    maha_match = current_mahadasha.planet == ref_maha['planet']
    print(f"Mahadasha: Our={current_mahadasha.planet}, Ref={ref_maha['planet']} {'✅' if maha_match else '❌'}")
    
    # Antardasha comparison  
    antar_match = current_antardasha and current_antardasha.planet == ref_antar['planet']
    antar_planet = current_antardasha.planet if current_antardasha else "None"
    print(f"Antardasha: Our={antar_planet}, Ref={ref_antar['planet']} {'✅' if antar_match else '❌'}")
    
    # Sequence comparison
    print("\n📅 SEQUENCE COMPARISON:")
    our_sequence = [(p.planet, p.end_date.strftime("%d-%m-%Y")) for p in timeline.all_mahadashas[:9]]
    ref_sequence = [(planet, end_date.split()[0]) for planet, end_date in reference_data['mahadasha_sequence']]
    
    sequence_matches = 0
    for i, ((our_planet, our_end), (ref_planet, ref_end)) in enumerate(zip(our_sequence, ref_sequence)):
        planet_match = our_planet == ref_planet
        if planet_match:
            sequence_matches += 1
        marker = "✅" if planet_match else "❌"
        print(f"{i+1}. {our_planet} vs {ref_planet} {marker}")
    
    # Calculate overall accuracy
    checks = [maha_match, antar_match, sequence_matches >= 7]  # Allow some sequence flexibility
    accuracy = sum(checks) / len(checks) * 100
    
    print(f"\n📈 ACCURACY ASSESSMENT:")
    print(f"Current Mahadasha: {'✅' if maha_match else '❌'}")
    print(f"Current Antardasha: {'✅' if antar_match else '❌'}")
    print(f"Sequence Match: {sequence_matches}/9 planets ({'✅' if sequence_matches >= 7 else '❌'})")
    print(f"Overall Accuracy: {accuracy:.1f}%")
    
    if accuracy >= 80:
        print("🎉 GOOD MATCH! Our calculation logic appears consistent!")
        print("📝 Note: Minor differences may be due to:")
        print("   - Different birth time/location used for testing")
        print("   - Slight variations in astronomical calculations")
        print("   - Different precision in time calculations")
    else:
        print("🔴 SIGNIFICANT DIFFERENCES! Need to investigate:")
        print("   - Birth data accuracy")
        print("   - Calculation methodology")
        print("   - Reference source accuracy")
    
    return accuracy >= 80

if __name__ == "__main__":
    print("🧪 VIMSHOTTARI REFERENCE DATA VERIFICATION")
    print("=" * 80)
    
    # Analyze reference data
    reference_data = analyze_reference_data()
    
    # Test our calculation
    our_result, ref_data = test_with_estimated_birth_data(reference_data)
    
    # Compare results
    success = compare_calculations(our_result, ref_data)
    
    print("\n" + "=" * 80)
    print("📈 VERIFICATION SUMMARY")
    print("=" * 80)
    
    if success:
        print("🎉 VERIFICATION SUCCESSFUL!")
        print("Our Vimshottari calculation logic appears to be consistent with the reference data!")
    else:
        print("🔍 FURTHER INVESTIGATION NEEDED")
        print("Some differences found - may need to check calculation details or birth data accuracy.")
    
    sys.exit(0 if success else 1)
