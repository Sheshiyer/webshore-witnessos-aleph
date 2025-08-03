#!/usr/bin/env python3
"""
Direct test of Face Reading Engine without API server
"""

import sys
import os
from datetime import datetime, date, time

# Add the engines directory to the path
sys.path.append('witnessos-engines')

try:
    from engines.face_reading import FaceReadingEngine
    from engines.face_reading_models import FaceReadingInput
    
    def test_face_reading_direct():
        """Test Face Reading engine directly."""
        print("🎭 Testing Face Reading Engine - Direct Test")
        print("=" * 60)
        
        # Create engine instance
        engine = FaceReadingEngine()
        print(f"✅ Engine initialized: {engine.engine_name}")
        
        # Create test input
        test_input = FaceReadingInput(
            birth_date=date(1991, 8, 13),
            birth_time=time(13, 31),
            birth_location=(12.9629, 77.5775),  # Bengaluru coordinates
            timezone="Asia/Kolkata",
            analysis_mode="photo",
            analysis_depth="detailed",
            include_twelve_houses=True,
            include_five_elements=True,
            include_age_points=True,
            include_health_indicators=True,
            integrate_with_vedic=True,
            integrate_with_tcm=True,
            store_biometric_data=False,
            processing_consent=True
        )
        
        print("✅ Test input created")
        
        # Run calculation
        try:
            result = engine.calculate(test_input)
            print("✅ Calculation completed successfully!")
            
            # Display results
            print(f"\n📊 Results:")
            print(f"Engine: {result.engine_name}")
            print(f"Calculation Time: {result.calculation_time:.3f}s")
            print(f"Confidence Score: {result.confidence_score:.2f}")
            
            # Constitutional summary
            print(f"\n🧬 Constitutional Summary:")
            print(result.constitutional_summary)
            
            # Five Elements
            print(f"\n🌟 Five Elements Constitution:")
            print(f"Dominant: {result.five_elements.dominant_element}")
            print(f"Secondary: {result.five_elements.secondary_element}")
            print(f"Type: {result.five_elements.constitutional_type}")
            
            # Element percentages
            print(f"Wood: {result.five_elements.wood_percentage:.1f}%")
            print(f"Fire: {result.five_elements.fire_percentage:.1f}%")
            print(f"Earth: {result.five_elements.earth_percentage:.1f}%")
            print(f"Metal: {result.five_elements.metal_percentage:.1f}%")
            print(f"Water: {result.five_elements.water_percentage:.1f}%")
            
            # Twelve Houses
            print(f"\n🏛️  Twelve Houses Analysis:")
            print(f"Overall Harmony: {result.twelve_houses.overall_harmony:.2f}")
            print(f"Dominant Houses: {', '.join(result.twelve_houses.dominant_houses)}")
            
            # Age Points
            print(f"\n⏰ Age Points Analysis:")
            print(f"Current Age Point: {result.age_points.current_age_point}")
            print(f"Location: {result.age_points.age_point_location}")
            print(f"Quality: {result.age_points.age_point_quality}")
            
            # Integration
            print(f"\n🔗 Biometric Integration:")
            print(f"Consciousness Alignment: {result.biometric_integration.consciousness_alignment_score:.2f}")
            
            # Recommendations
            print(f"\n💡 Recommendations:")
            for i, rec in enumerate(result.multi_modal_recommendations[:3], 1):
                print(f"{i}. {rec}")
            
            # Privacy
            print(f"\n🔒 Privacy Compliance:")
            for key, value in result.privacy_compliance.items():
                print(f"{key.replace('_', ' ').title()}: {value}")
            
            print(f"\n🎉 Face Reading Engine test completed successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Calculation failed: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    if __name__ == "__main__":
        success = test_face_reading_direct()
        if success:
            print("\n✅ Face Reading Engine is working correctly!")
        else:
            print("\n❌ Face Reading Engine test failed")
            
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running from the correct directory")
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    import traceback
    traceback.print_exc()
