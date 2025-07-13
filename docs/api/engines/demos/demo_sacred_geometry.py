"""
Sacred Geometry Mapper Demo

Demonstrates the Sacred Geometry Mapper engine with various pattern types
and personalized geometry generation using real validation data.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date
try:
    from engines.sacred_geometry import SacredGeometryMapper
    from engines.sacred_geometry_models import SacredGeometryInput
except ImportError:
    # Fallback for direct execution
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    from ENGINES.engines.sacred_geometry import SacredGeometryMapper
    from ENGINES.engines.sacred_geometry_models import SacredGeometryInput


def main():
    """Demo the Sacred Geometry Mapper engine."""
    print("🔺 WitnessOS Sacred Geometry Mapper Demo 🔺")
    print("=" * 60)
    
    # Load the engine
    try:
        engine = SacredGeometryMapper()
        print(f"✅ Loaded: {engine.engine_name} Engine (v{engine._version})")
        print(f"   Description: {engine.description}")
    except Exception as e:
        print(f"❌ Failed to load Sacred Geometry Mapper engine: {e}")
        return
    
    # Demo with multiple pattern types using validation data
    test_cases = [
        {
            "name": "Personal Sacred Geometry - Cumbipuram Nateshan Sheshnarayan",
            "intention": "Align with my authentic geometric essence",
            "pattern_type": "personal",
            "birth_date": date(1991, 8, 13),
            "color_scheme": "golden",
            "size": 512,
            "description": "Personalized geometry based on real birth data"
        },
        {
            "name": "Golden Spiral Manifestation",
            "intention": "Expand consciousness through growth patterns",
            "pattern_type": "golden_spiral",
            "spiral_turns": 5,
            "color_scheme": "rainbow",
            "size": 512,
            "description": "Golden ratio spiral for expansion work"
        },
        {
            "name": "Flower of Life Unity",
            "intention": "Connect with universal oneness",
            "pattern_type": "flower_of_life",
            "layer_count": 3,
            "color_scheme": "chakra",
            "size": 512,
            "description": "Sacred pattern of creation and unity"
        },
        {
            "name": "Sri Yantra Divine Union",
            "intention": "Balance masculine and feminine energies",
            "pattern_type": "sri_yantra",
            "color_scheme": "golden",
            "size": 512,
            "include_construction_lines": True,
            "description": "Ancient yantra for spiritual transformation"
        },
        {
            "name": "Mandala Meditation Focus",
            "intention": "Create sacred space for contemplation",
            "pattern_type": "mandala",
            "petal_count": 12,
            "layer_count": 4,
            "color_scheme": "monochrome",
            "size": 512,
            "meditation_focus": True,
            "description": "Traditional mandala for meditation practice"
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n{'='*60}")
        print(f"EXAMPLE {i}: {case['name']}")
        print(f"   {case['description']}")
        print(f"{'='*60}")
        
        # Prepare input data
        input_data = {
            "intention": case["intention"],
            "pattern_type": case["pattern_type"],
            "color_scheme": case["color_scheme"],
            "size": case["size"]
        }
        
        # Add optional parameters
        if "birth_date" in case:
            input_data["birth_date"] = case["birth_date"]
        if "petal_count" in case:
            input_data["petal_count"] = case["petal_count"]
        if "layer_count" in case:
            input_data["layer_count"] = case["layer_count"]
        if "spiral_turns" in case:
            input_data["spiral_turns"] = case["spiral_turns"]
        if "include_construction_lines" in case:
            input_data["include_construction_lines"] = case["include_construction_lines"]
        if "meditation_focus" in case:
            input_data["meditation_focus"] = case["meditation_focus"]
        
        try:
            # Create input model
            geometry_input = SacredGeometryInput(**input_data)
            print(f"✅ Input created successfully")
            print(f"   Intention: {geometry_input.intention}")
            print(f"   Pattern: {geometry_input.pattern_type}")
            print(f"   Color scheme: {geometry_input.color_scheme}")
            print(f"   Size: {geometry_input.size}px")
            
            # Run calculation
            print(f"\n🔮 Generating sacred geometry...")
            result = engine.calculate(geometry_input)
            
            print(f"✅ Generation completed!")
            print(f"   Engine: {result.engine_name}")
            print(f"   Calculation time: {result.calculation_time:.4f}s")
            print(f"   Confidence: {result.confidence_score:.2f}")
            print(f"   Field signature: {result.field_signature}")
            
            # Show pattern analysis
            print(f"\n📊 PATTERN ANALYSIS:")
            if hasattr(result, 'mathematical_properties'):
                math_props = result.mathematical_properties
                print(f"   Pattern type: {math_props.get('pattern_type', 'Unknown')}")
                print(f"   Symmetry order: {math_props.get('symmetry_order', 1)}")
                print(f"   Golden ratio present: {math_props.get('golden_ratio_present', False)}")
                print(f"   Fractal dimension: {math_props.get('fractal_dimension', 1.0):.3f}")
            
            # Show sacred ratios
            if hasattr(result, 'sacred_ratios'):
                print(f"\n✨ SACRED RATIOS:")
                for ratio_name, ratio_value in result.sacred_ratios.items():
                    ratio_display = ratio_name.replace('_', ' ').title()
                    print(f"   {ratio_display}: {ratio_value:.6f}")
            
            # Show meditation points
            if hasattr(result, 'meditation_points'):
                print(f"\n🧘 MEDITATION POINTS: {len(result.meditation_points)} focal points")
            
            # Show energy flow
            if hasattr(result, 'energy_flow'):
                energy = result.energy_flow
                print(f"\n⚡ ENERGY FLOW:")
                print(f"   Type: {energy.get('flow_type', 'Unknown').title()}")
                print(f"   Direction: {energy.get('direction', 'Unknown').replace('_', ' ').title()}")
            
            # Show file paths
            if hasattr(result, 'image_path') and result.image_path:
                print(f"\n📁 OUTPUT FILES:")
                print(f"   Image: {result.image_path}")
                if hasattr(result, 'svg_path') and result.svg_path:
                    print(f"   SVG: {result.svg_path}")
            
            # Show mystical interpretation preview
            print(f"\n🌟 INTERPRETATION PREVIEW:")
            interpretation = result.formatted_output
            preview_lines = interpretation.split('\n')[:8]
            for line in preview_lines:
                print(f"   {line}")
            if len(interpretation.split('\n')) > 8:
                print(f"   ... (truncated)")
            
            # Show recommendations
            print(f"\n💡 RECOMMENDATIONS ({len(result.recommendations)}):")
            for j, rec in enumerate(result.recommendations[:4], 1):
                print(f"   {j}. {rec}")
            if len(result.recommendations) > 4:
                print(f"   ... and {len(result.recommendations) - 4} more")
            
            # Show reality patches
            print(f"\n🔧 REALITY PATCHES ({len(result.reality_patches)}):")
            for patch in result.reality_patches[:3]:
                print(f"   • {patch}")
            if len(result.reality_patches) > 3:
                print(f"   ... and {len(result.reality_patches) - 3} more")
            
            # Show archetypal themes
            print(f"\n🎭 ARCHETYPAL THEMES ({len(result.archetypal_themes)}):")
            for theme in result.archetypal_themes[:4]:
                print(f"   • {theme}")
            if len(result.archetypal_themes) > 4:
                print(f"   ... and {len(result.archetypal_themes) - 4} more")
            
        except Exception as e:
            print(f"❌ Error generating sacred geometry: {e}")
            import traceback
            traceback.print_exc()
    
    # Show engine statistics
    print(f"\n{'='*60}")
    print("ENGINE STATISTICS")
    print(f"{'='*60}")
    
    try:
        stats = engine.get_stats()
        print(f"Engine: {stats['engine_name']}")
        print(f"Version: {stats['version']}")
        print(f"Total calculations: {stats['total_calculations']}")
        print(f"Last calculation time: {stats['last_calculation_time']:.4f}s")
    except Exception as e:
        print(f"Could not retrieve engine statistics: {e}")
    
    print(f"\n🎯 Sacred Geometry Mapper engine is fully operational!")
    print("Generated sacred geometry patterns are ready for meditation and manifestation work.")
    print("Check the 'generated_geometry' directory for your visual patterns.")


if __name__ == "__main__":
    main()
