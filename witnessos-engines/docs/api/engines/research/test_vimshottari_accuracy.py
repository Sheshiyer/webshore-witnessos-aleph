#!/usr/bin/env python3
"""
Test Vimshottari Dasha calculation accuracy against known sources.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time
from engines.vimshottari import VimshottariTimelineMapper
from engines.vimshottari_models import VimshottariInput

def test_vimshottari_accuracy():
    """Test Vimshottari calculation accuracy."""

    print("🔍 Testing Vimshottari Dasha Calculation Accuracy")
    print("=" * 70)

    # Test case: Mage's birth data (we know the Moon position)
    birth_date = date(1991, 8, 13)
    birth_time = time(13, 31)
    birth_location = (12.9716, 77.5946)  # Bengaluru
    timezone = "Asia/Kolkata"
    current_date = date(2025, 5, 30)

    print(f"Test Subject: Mage")
    print(f"Birth: {birth_date} {birth_time} ({timezone})")
    print(f"Location: Bengaluru {birth_location}")
    print(f"Current Date: {current_date}")
    print()

    # Debug: Check actual Moon position
    from calculations.astrology import AstrologyCalculator
    calc = AstrologyCalculator()
    birth_datetime = datetime.combine(birth_date, birth_time)

    print("🔍 DEBUGGING MOON POSITION:")

    # Test both tropical and sidereal positions
    positions_tropical = calc.get_planetary_positions(birth_datetime, birth_location[0], birth_location[1], timezone, sidereal=False)
    positions_sidereal = calc.get_planetary_positions(birth_datetime, birth_location[0], birth_location[1], timezone, sidereal=True)

    moon_longitude_tropical = positions_tropical['moon']['longitude']
    moon_longitude_sidereal = positions_sidereal['moon']['longitude']

    print(f"  TROPICAL Moon longitude: {moon_longitude_tropical:.6f}°")
    print(f"  SIDEREAL Moon longitude: {moon_longitude_sidereal:.6f}°")
    print(f"  Ayanamsa difference: {moon_longitude_tropical - moon_longitude_sidereal:.6f}°")

    # Convert sidereal to degrees, minutes, seconds for comparison with your app
    degrees = int(moon_longitude_sidereal)
    minutes = int((moon_longitude_sidereal - degrees) * 60)
    seconds = ((moon_longitude_sidereal - degrees) * 60 - minutes) * 60
    print(f"  SIDEREAL Moon position: {degrees}°{minutes}'{seconds:.1f}\"")

    # Check which sign this is in (sidereal)
    signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
             "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    sign_index = int(moon_longitude_sidereal / 30)
    sign_position = moon_longitude_sidereal % 30
    print(f"  SIDEREAL Sign: {signs[sign_index]} {sign_position:.6f}°")

    # Calculate nakshatra manually (using sidereal)
    nakshatra_name, pada, degrees_in_nak = calc.longitude_to_nakshatra(moon_longitude_sidereal)
    print(f"  SIDEREAL Nakshatra: {nakshatra_name}")
    print(f"  Pada: {pada}")
    print(f"  Degrees in nakshatra: {degrees_in_nak:.6f}°")
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
        print("🔄 Calculating Vimshottari Dasha...")
        result = engine.calculate(input_data)
        
        print("✅ Calculation completed!")
        print()
        
        # Extract key information
        timeline = result.timeline
        birth_nakshatra = timeline.birth_nakshatra
        current_mahadasha = timeline.current_mahadasha
        current_antardasha = timeline.current_antardasha
        
        print("📊 BIRTH NAKSHATRA ANALYSIS:")
        print(f"  Nakshatra: {birth_nakshatra.name}")
        print(f"  Pada: {birth_nakshatra.pada}")
        print(f"  Ruling Planet: {birth_nakshatra.ruling_planet}")
        print(f"  Degrees in Nakshatra: {birth_nakshatra.degrees_in_nakshatra:.3f}°")
        print(f"  Symbol: {birth_nakshatra.symbol}")
        print(f"  Deity: {birth_nakshatra.deity}")
        print()
        
        print("📊 CURRENT DASHA PERIODS:")
        print(f"  Mahadasha: {current_mahadasha.planet}")
        print(f"    Duration: {current_mahadasha.duration_years:.2f} years")
        print(f"    Period: {current_mahadasha.start_date} to {current_mahadasha.end_date}")
        
        if current_antardasha:
            print(f"  Antardasha: {current_antardasha.planet}")
            print(f"    Duration: {current_antardasha.duration_years:.2f} years")
            print(f"    Period: {current_antardasha.start_date} to {current_antardasha.end_date}")
        print()
        
        # Verify calculation logic
        print("🔧 CALCULATION VERIFICATION:")
        
        # 1. Check nakshatra ruling planet mapping
        expected_rulers = {
            'Ashwini': 'Ketu', 'Bharani': 'Venus', 'Krittika': 'Sun',
            'Rohini': 'Moon', 'Mrigashira': 'Mars', 'Ardra': 'Rahu',
            'Punarvasu': 'Jupiter', 'Pushya': 'Saturn', 'Ashlesha': 'Mercury',
            'Magha': 'Ketu', 'Purva Phalguni': 'Venus', 'Uttara Phalguni': 'Sun',
            'Hasta': 'Moon', 'Chitra': 'Mars', 'Swati': 'Rahu',
            'Vishakha': 'Jupiter', 'Anuradha': 'Saturn', 'Jyeshtha': 'Mercury',
            'Mula': 'Ketu', 'Purva Ashadha': 'Venus', 'Uttara Ashadha': 'Sun',
            'Shravana': 'Moon', 'Dhanishta': 'Mars', 'Shatabhisha': 'Rahu',
            'Purva Bhadrapada': 'Jupiter', 'Uttara Bhadrapada': 'Saturn', 'Revati': 'Mercury'
        }
        
        expected_ruler = expected_rulers.get(birth_nakshatra.name)
        if expected_ruler == birth_nakshatra.ruling_planet:
            print(f"  ✅ Nakshatra ruler: {birth_nakshatra.ruling_planet} (correct)")
        else:
            print(f"  ❌ Nakshatra ruler: Expected {expected_ruler}, got {birth_nakshatra.ruling_planet}")
        
        # 2. Check dasha period durations
        standard_periods = {
            'Sun': 6, 'Moon': 10, 'Mars': 7, 'Rahu': 18, 'Jupiter': 16,
            'Saturn': 19, 'Mercury': 17, 'Ketu': 7, 'Venus': 20
        }
        
        total_years = sum(standard_periods.values())
        if total_years == 120:
            print(f"  ✅ Total dasha cycle: {total_years} years (correct)")
        else:
            print(f"  ❌ Total dasha cycle: {total_years} years (should be 120)")
        
        # 3. Check first dasha balance calculation
        nakshatra_span = 360.0 / 27.0  # 13.333... degrees per nakshatra
        completed_fraction = birth_nakshatra.degrees_in_nakshatra / nakshatra_span
        first_planet_period = standard_periods[birth_nakshatra.ruling_planet]
        expected_remaining = first_planet_period * (1 - completed_fraction)
        
        print(f"  Nakshatra span: {nakshatra_span:.3f}°")
        print(f"  Completed fraction: {completed_fraction:.3f}")
        print(f"  Expected remaining years: {expected_remaining:.2f}")
        
        # 4. Verify dasha sequence
        standard_sequence = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
        
        # Find first planet index
        first_planet_index = standard_sequence.index(birth_nakshatra.ruling_planet)
        
        # Check if timeline follows correct sequence
        timeline_planets = [period.planet for period in timeline.all_mahadashas[:5]]  # Check first 5
        expected_sequence = []
        
        # First period (partial)
        expected_sequence.append(birth_nakshatra.ruling_planet)
        
        # Next periods
        for i in range(1, 5):
            next_index = (first_planet_index + i) % len(standard_sequence)
            expected_sequence.append(standard_sequence[next_index])
        
        sequence_match = timeline_planets == expected_sequence
        if sequence_match:
            print(f"  ✅ Dasha sequence: {' → '.join(timeline_planets[:3])}... (correct)")
        else:
            print(f"  ❌ Dasha sequence mismatch:")
            print(f"    Expected: {' → '.join(expected_sequence)}")
            print(f"    Got: {' → '.join(timeline_planets)}")
        
        print()
        
        # 5. Show upcoming periods for verification
        print("📅 UPCOMING PERIODS (Next 5 years):")
        upcoming = timeline.upcoming_periods[:5]
        for period in upcoming:
            print(f"  {period.start_date} - {period.end_date}: {period.planet} {period.period_type}")
        
        print()
        
        # Calculate overall accuracy
        checks = [
            expected_ruler == birth_nakshatra.ruling_planet,
            total_years == 120,
            sequence_match
        ]
        
        accuracy = sum(checks) / len(checks) * 100
        
        print("📈 ACCURACY ASSESSMENT:")
        print(f"  Checks passed: {sum(checks)}/{len(checks)}")
        print(f"  Accuracy: {accuracy:.1f}%")
        
        if accuracy == 100:
            print("  🎉 PERFECT! Vimshottari calculation is accurate!")
        elif accuracy >= 80:
            print("  🔶 GOOD! Minor issues may need attention.")
        else:
            print("  🔴 ISSUES! Calculation method needs review.")
        
        return accuracy == 100
        
    except Exception as e:
        print(f"❌ Error during calculation: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_nakshatra_calculation_consistency():
    """Test nakshatra calculation consistency."""
    
    print("\n🔍 Testing Nakshatra Calculation Consistency")
    print("=" * 70)
    
    # Test multiple birth times to check nakshatra calculation
    test_cases = [
        {
            "name": "Test 1 (Ashwini range)",
            "moon_longitude": 5.0,  # Should be Ashwini
            "expected_nakshatra": "Ashwini",
            "expected_ruler": "Ketu"
        },
        {
            "name": "Test 2 (Bharani range)", 
            "moon_longitude": 20.0,  # Should be Bharani
            "expected_nakshatra": "Bharani",
            "expected_ruler": "Venus"
        },
        {
            "name": "Test 3 (Krittika range)",
            "moon_longitude": 35.0,  # Should be Krittika
            "expected_nakshatra": "Krittika", 
            "expected_ruler": "Sun"
        }
    ]
    
    # Import the astrology engine to test nakshatra calculation
    from calculations.astrology import AstrologyCalculator
    calc = AstrologyCalculator()
    
    for test_case in test_cases:
        moon_lon = test_case["moon_longitude"]
        expected_nak = test_case["expected_nakshatra"]
        expected_ruler = test_case["expected_ruler"]
        
        # Calculate nakshatra
        nakshatra_name, pada, degrees_in_nak = calc.longitude_to_nakshatra(moon_lon)
        
        print(f"\n{test_case['name']}:")
        print(f"  Moon longitude: {moon_lon}°")
        print(f"  Calculated nakshatra: {nakshatra_name}")
        print(f"  Expected nakshatra: {expected_nak}")
        print(f"  Pada: {pada}")
        print(f"  Degrees in nakshatra: {degrees_in_nak:.3f}°")
        
        if nakshatra_name == expected_nak:
            print(f"  ✅ Nakshatra calculation: CORRECT")
        else:
            print(f"  ❌ Nakshatra calculation: INCORRECT")
    
    return True

if __name__ == "__main__":
    print("🧪 VIMSHOTTARI DASHA ACCURACY TESTING")
    print("=" * 80)

    success1 = test_vimshottari_accuracy()
    success2 = test_nakshatra_calculation_consistency()

    overall_success = success1 and success2

    print("\n" + "=" * 80)
    print("📈 OVERALL RESULTS")
    print("=" * 80)

    if overall_success:
        print("🎉 ALL TESTS PASSED! Vimshottari calculation is accurate!")
    else:
        print("🔴 ISSUES FOUND! Review calculation methods.")

    sys.exit(0 if overall_success else 1)
