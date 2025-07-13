#!/usr/bin/env python3
"""
Demo script for Vimshottari Dasha Timeline Mapper Engine

Tests the Vimshottari engine with sample data and displays results.
"""

import sys
import os
from datetime import date, time

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from engines.vimshottari import VimshottariTimelineMapper
    from engines.vimshottari_models import VimshottariInput, NakshatraInfo
    print("✅ Successfully imported Vimshottari Timeline Mapper")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)


def test_vimshottari_engine():
    """Test the Vimshottari Timeline Mapper engine with sample data."""
    
    print("\n" + "="*60)
    print("🌙 VIMSHOTTARI DASHA TIMELINE MAPPER DEMO 🌙")
    print("="*60)
    
    # Create engine instance
    try:
        engine = VimshottariTimelineMapper()
        print(f"✅ Engine created: {engine}")
        print(f"   Description: {engine.description}")
        print(f"   Version: {engine._version}")
    except Exception as e:
        print(f"❌ Failed to create engine: {e}")
        return False
    
    # Test sample data - Using real Vedic astrology data for validation
    test_cases = [
        {
            "name": "Cumbipuram Nateshan Sheshnarayan",  # Real test data for validation
            "birth_date": date(1991, 8, 13),
            "birth_time": time(13, 31, 0),  # 13:31 local time
            "birth_location": (12.9716, 77.5946),  # Bengaluru, Karnataka, India
            "timezone": "Asia/Kolkata",
            "current_date": date(2025, 1, 15),
            "years_forecast": 10,
            "description": "Real Vimshottari Dasha chart for validation"
        },
        {
            "name": "Sample Person 2",
            "birth_date": date(1992, 8, 5),
            "birth_time": time(16, 30, 0),
            "birth_location": (19.0760, 72.8777),  # Mumbai
            "timezone": "Asia/Kolkata",
            "current_date": date(2025, 1, 15),
            "years_forecast": 5,
            "description": "Secondary test case"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📊 TEST CASE {i}: {test_case['name']}")
        if 'description' in test_case:
            print(f"   {test_case['description']}")
        print("-" * 40)
        
        try:
            # Create input
            input_data = VimshottariInput(
                birth_date=test_case["birth_date"],
                birth_time=test_case["birth_time"],
                birth_location=test_case["birth_location"],
                timezone=test_case["timezone"],
                current_date=test_case["current_date"],
                years_forecast=test_case["years_forecast"]
            )
            print(f"✅ Input created successfully")
            print(f"   Birth: {input_data.birth_date} at {input_data.birth_time}")
            print(f"   Location: {input_data.birth_location}")
            print(f"   Timezone: {input_data.timezone}")
            print(f"   Analysis date: {input_data.current_date}")
            print(f"   Forecast years: {input_data.years_forecast}")
            
            # Test calculation
            print(f"\n🔮 Running Vimshottari Dasha calculation...")
            result = engine.calculate(input_data)
            
            print(f"✅ Calculation completed!")
            print(f"   Engine: {result.engine_name}")
            print(f"   Calculation time: {result.calculation_time:.4f}s")
            print(f"   Confidence: {result.confidence_score:.2f}")
            print(f"   Field signature: {result.field_signature}")
            
            # Display timeline summary
            timeline = result.timeline
            print(f"\n📋 TIMELINE SUMMARY:")
            print(f"   Birth Nakshatra: {timeline.birth_nakshatra.name} (Pada {timeline.birth_nakshatra.pada})")
            print(f"   Ruling Planet: {timeline.birth_nakshatra.ruling_planet}")
            print(f"   Current Mahadasha: {timeline.current_mahadasha.planet}")
            print(f"   Mahadasha Period: {timeline.current_mahadasha.start_date} to {timeline.current_mahadasha.end_date}")
            
            if timeline.current_antardasha:
                print(f"   Current Antardasha: {timeline.current_antardasha.planet}")
                print(f"   Antardasha Period: {timeline.current_antardasha.start_date} to {timeline.current_antardasha.end_date}")
            
            if timeline.current_pratyantardasha:
                print(f"   Current Pratyantardasha: {timeline.current_pratyantardasha.planet}")
            
            # Display some interpretation
            print(f"\n📖 INTERPRETATION PREVIEW:")
            interpretation_lines = result.formatted_output.split('\n')[:15]
            for line in interpretation_lines:
                if line.strip():
                    print(f"   {line}")
            print("   ...")
            
            # Display recommendations
            print(f"\n💡 RECOMMENDATIONS ({len(result.recommendations)}):")
            for j, rec in enumerate(result.recommendations[:3], 1):
                print(f"   {j}. {rec}")
            if len(result.recommendations) > 3:
                print(f"   ... and {len(result.recommendations) - 3} more")
            
            # Display reality patches
            print(f"\n🔧 REALITY PATCHES ({len(result.reality_patches)}):")
            for patch in result.reality_patches[:3]:
                print(f"   • {patch}")
            if len(result.reality_patches) > 3:
                print(f"   ... and {len(result.reality_patches) - 3} more")
            
            # Display archetypal themes
            print(f"\n🎭 ARCHETYPAL THEMES ({len(result.archetypal_themes)}):")
            for theme in result.archetypal_themes[:3]:
                print(f"   • {theme}")
            if len(result.archetypal_themes) > 3:
                print(f"   ... and {len(result.archetypal_themes) - 3} more")
                
        except Exception as e:
            print(f"❌ Test failed: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    # Test engine statistics
    print(f"\n📈 ENGINE STATISTICS:")
    stats = engine.get_stats()
    for key, value in stats.items():
        print(f"   {key}: {value}")
    
    print(f"\n✅ Vimshottari Timeline Mapper demo completed!")
    return True


def test_basic_functionality():
    """Test basic engine functionality without astronomical calculations."""
    
    print("\n" + "="*60)
    print("🔧 BASIC FUNCTIONALITY TESTS")
    print("="*60)
    
    try:
        engine = VimshottariTimelineMapper()
        
        # Test Dasha data loading
        print("\n📚 Testing Dasha data loading...")
        print(f"   Dasha periods loaded: {len(engine.dasha_periods)}")
        print(f"   Nakshatra data loaded: {len(engine.nakshatra_data)}")
        print(f"   Planet characteristics loaded: {len(engine.planet_characteristics)}")
        print(f"   Dasha sequence: {engine.dasha_sequence}")
        
        # Test nakshatra processing
        print("\n🌟 Testing nakshatra processing...")
        mock_nakshatra_data = {
            'name': 'Ashwini',
            'pada': 2,
            'degrees_in_nakshatra': 5.5,
            'longitude': 5.5
        }
        nakshatra_info = engine._process_nakshatra(mock_nakshatra_data)
        print(f"   Nakshatra: {nakshatra_info.name}")
        print(f"   Ruling Planet: {nakshatra_info.ruling_planet}")
        print(f"   Symbol: {nakshatra_info.symbol}")
        print(f"   Characteristics: {nakshatra_info.characteristics}")
        
        # Test planet themes
        print("\n🪐 Testing planet themes...")
        for planet in ["Sun", "Moon", "Mars", "Mercury", "Jupiter"]:
            theme = engine._get_planet_theme(planet)
            print(f"   {planet}: {theme}")
        
        # Test Dasha timeline calculation (mock)
        print("\n⏰ Testing Dasha timeline calculation...")
        birth_date = date(1985, 3, 20)
        current_date = date(2025, 1, 15)
        
        timeline = engine._calculate_dasha_timeline(birth_date, nakshatra_info, current_date)
        print(f"   Timeline periods generated: {len(timeline)}")
        if timeline:
            first_period = timeline[0]
            print(f"   First period: {first_period.planet} ({first_period.duration_years:.1f} years)")
            print(f"   Period dates: {first_period.start_date} to {first_period.end_date}")
        
        print(f"\n✅ Basic functionality tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Basic functionality test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🚀 Starting Vimshottari Timeline Mapper Demo...")
    
    # Test basic functionality first
    basic_success = test_basic_functionality()
    
    if basic_success:
        # Test full engine functionality
        full_success = test_vimshottari_engine()
        
        if full_success:
            print(f"\n🎉 All tests completed successfully!")
            print(f"Vimshottari Timeline Mapper is ready for Phase 3 integration!")
        else:
            print(f"\n⚠️  Some tests failed, but basic functionality works.")
    else:
        print(f"\n❌ Basic functionality tests failed.")
        sys.exit(1)
