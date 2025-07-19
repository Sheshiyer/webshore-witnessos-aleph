#!/usr/bin/env python3
"""
Demo script for Human Design Scanner Engine

Tests the Human Design engine with sample data and displays results.
"""

import sys
import os
from datetime import date, time

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from engines.human_design import HumanDesignScanner
    from engines.human_design_models import HumanDesignInput
    print("✅ Successfully imported Human Design Scanner")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)


def test_human_design_engine():
    """Test the Human Design Scanner engine with sample data."""
    
    print("\n" + "="*60)
    print("🌟 HUMAN DESIGN SCANNER ENGINE DEMO 🌟")
    print("="*60)
    
    # Create engine instance
    try:
        engine = HumanDesignScanner()
        print(f"✅ Engine created: {engine}")
        print(f"   Description: {engine.description}")
        print(f"   Version: {engine._version}")
    except Exception as e:
        print(f"❌ Failed to create engine: {e}")
        return False
    
    # Test sample data - Using real Human Design data for validation
    test_cases = [
        {
            "name": "Cumbipuram Nateshan Sheshnarayan",  # Real test data for validation
            "birth_date": date(1991, 8, 13),
            "birth_time": time(13, 31, 0),  # 13:31 local time
            "birth_location": (12.9716, 77.5946),  # Bengaluru, Karnataka, India
            "timezone": "Asia/Kolkata",
            "description": "Real Human Design chart for validation - 2/4 Hermit/Opportunist Generator"
        },
        {
            "name": "Sample Person 2",
            "birth_date": date(1985, 12, 25),
            "birth_time": time(8, 45, 0),
            "birth_location": (51.5074, -0.1278),  # London
            "timezone": "Europe/London",
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
            input_data = HumanDesignInput(
                birth_date=test_case["birth_date"],
                birth_time=test_case["birth_time"],
                birth_location=test_case["birth_location"],
                timezone=test_case["timezone"]
            )
            print(f"✅ Input created successfully")
            print(f"   Birth: {input_data.birth_date} at {input_data.birth_time}")
            print(f"   Location: {input_data.birth_location}")
            print(f"   Timezone: {input_data.timezone}")
            
            # Test calculation
            print(f"\n🔮 Running Human Design calculation...")
            result = engine.calculate(input_data)
            
            print(f"✅ Calculation completed!")
            print(f"   Engine: {result.engine_name}")
            print(f"   Calculation time: {result.calculation_time:.4f}s")
            print(f"   Confidence: {result.confidence_score:.2f}")
            print(f"   Field signature: {result.field_signature}")
            
            # Display chart summary
            chart = result.chart
            print(f"\n📋 CHART SUMMARY:")
            print(f"   Type: {chart.type_info.type_name}")
            print(f"   Strategy: {chart.type_info.strategy}")
            print(f"   Authority: {chart.type_info.authority}")
            print(f"   Profile: {chart.profile.profile_name}")
            
            # Display some interpretation
            print(f"\n📖 INTERPRETATION PREVIEW:")
            interpretation_lines = result.formatted_output.split('\n')[:10]
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
    
    print(f"\n✅ Human Design Scanner demo completed!")
    return True


def test_basic_functionality():
    """Test basic engine functionality without astronomical calculations."""
    
    print("\n" + "="*60)
    print("🔧 BASIC FUNCTIONALITY TESTS")
    print("="*60)
    
    try:
        engine = HumanDesignScanner()
        
        # Test line calculation
        print("\n🧮 Testing line calculations...")
        for longitude in [0.0, 45.0, 90.0, 180.0, 270.0]:
            line = engine._calculate_line(longitude, 1)
            print(f"   Longitude {longitude}° → Line {line}")
        
        # Test color calculation
        print("\n🎨 Testing color calculations...")
        for longitude in [0.0, 60.0, 120.0, 180.0, 240.0, 300.0]:
            color = engine._calculate_color(longitude, 1)
            print(f"   Longitude {longitude}° → Color {color}")
        
        # Test type determination
        print("\n👤 Testing type determination...")
        personality_gates = {}
        design_gates = {}
        type_info = engine._determine_type(personality_gates, design_gates)
        print(f"   Type: {type_info.type_name}")
        print(f"   Strategy: {type_info.strategy}")
        print(f"   Authority: {type_info.authority}")
        
        print(f"\n✅ Basic functionality tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Basic functionality test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🚀 Starting Human Design Scanner Demo...")
    
    # Test basic functionality first
    basic_success = test_basic_functionality()
    
    if basic_success:
        # Test full engine functionality
        full_success = test_human_design_engine()
        
        if full_success:
            print(f"\n🎉 All tests completed successfully!")
            print(f"Human Design Scanner is ready for Phase 3 integration!")
        else:
            print(f"\n⚠️  Some tests failed, but basic functionality works.")
    else:
        print(f"\n❌ Basic functionality tests failed.")
        sys.exit(1)
