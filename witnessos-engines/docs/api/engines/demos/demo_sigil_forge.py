"""
Sigil Forge Synthesizer Demo

Demonstrates the Sigil Forge Synthesizer engine with various generation methods
and intention types using real validation data for personalization.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date
try:
    from engines.sigil_forge import SigilForgeSynthesizer
    from engines.sigil_forge_models import SigilForgeInput
except ImportError:
    # Fallback for direct execution
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    from ENGINES.engines.sigil_forge import SigilForgeSynthesizer
    from ENGINES.engines.sigil_forge_models import SigilForgeInput


def main():
    """Demo the Sigil Forge Synthesizer engine."""
    print("🔥 WitnessOS Sigil Forge Synthesizer Demo 🔥")
    print("=" * 60)
    
    # Load the engine
    try:
        engine = SigilForgeSynthesizer()
        print(f"✅ Loaded: {engine.engine_name} Engine (v{engine._version})")
        print(f"   Description: {engine.description}")
    except Exception as e:
        print(f"❌ Failed to load Sigil Forge Synthesizer engine: {e}")
        return
    
    # Demo with multiple sigil types and intentions
    test_cases = [
        {
            "name": "Personal Manifestation Sigil - Cumbipuram Nateshan Sheshnarayan",
            "intention": "I manifest abundance and creative success in all my endeavors",
            "generation_method": "personal",
            "birth_date": date(1991, 8, 13),
            "style": "mystical",
            "color_scheme": "golden",
            "charging_method": "visualization",
            "description": "Personalized sigil using real birth data for manifestation work"
        },
        {
            "name": "Traditional Love Attraction Sigil",
            "intention": "I attract loving and harmonious relationships into my life",
            "generation_method": "traditional",
            "connection_style": "sequential",
            "style": "minimal",
            "color_scheme": "red",
            "charging_method": "elemental",
            "description": "Classic letter elimination method for relationship work"
        },
        {
            "name": "Geometric Protection Sigil",
            "intention": "I am protected from all negative energies and influences",
            "generation_method": "geometric",
            "sacred_geometry": "triangle",
            "style": "geometric",
            "color_scheme": "silver",
            "include_border": True,
            "charging_method": "planetary",
            "description": "Sacred geometry based protection sigil"
        },
        {
            "name": "Hybrid Success Sigil",
            "intention": "I achieve professional success through authentic self-expression",
            "generation_method": "hybrid",
            "style": "ornate",
            "color_scheme": "purple",
            "add_activation_symbols": True,
            "charging_method": "personal",
            "description": "Combined traditional and geometric methods for career success"
        },
        {
            "name": "Organic Healing Sigil",
            "intention": "My body and mind heal completely and naturally",
            "generation_method": "traditional",
            "connection_style": "organic",
            "style": "organic",
            "color_scheme": "blue",
            "optimize_for_meditation": True,
            "charging_method": "visualization",
            "description": "Flowing organic style for healing and wellness"
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
            "generation_method": case["generation_method"],
            "style": case["style"],
            "color_scheme": case["color_scheme"]
        }
        
        # Add optional parameters
        if "birth_date" in case:
            input_data["birth_date"] = case["birth_date"]
        if "connection_style" in case:
            input_data["connection_style"] = case["connection_style"]
        if "sacred_geometry" in case:
            input_data["sacred_geometry"] = case["sacred_geometry"]
        if "include_border" in case:
            input_data["include_border"] = case["include_border"]
        if "add_activation_symbols" in case:
            input_data["add_activation_symbols"] = case["add_activation_symbols"]
        if "optimize_for_meditation" in case:
            input_data["optimize_for_meditation"] = case["optimize_for_meditation"]
        if "charging_method" in case:
            input_data["charging_method"] = case["charging_method"]
        
        try:
            # Create input model
            sigil_input = SigilForgeInput(**input_data)
            print(f"✅ Input created successfully")
            print(f"   Intention: {sigil_input.intention}")
            print(f"   Method: {sigil_input.generation_method}")
            print(f"   Style: {sigil_input.style}")
            print(f"   Color scheme: {sigil_input.color_scheme}")
            
            # Run calculation
            print(f"\n🔮 Forging sigil from intention...")
            result = engine.calculate(sigil_input)
            
            print(f"✅ Sigil forged successfully!")
            print(f"   Engine: {result.engine_name}")
            print(f"   Calculation time: {result.calculation_time:.4f}s")
            print(f"   Confidence: {result.confidence_score:.2f}")
            print(f"   Field signature: {result.field_signature}")
            
            # Show sigil analysis
            print(f"\n📊 SIGIL ANALYSIS:")
            raw_data = result.raw_data
            if 'sigil_analysis' in raw_data:
                analysis = raw_data['sigil_analysis']
                print(f"   Complexity: {analysis.complexity_score:.2f}")
                print(f"   Balance: {analysis.balance_score:.2f}")
                print(f"   Symmetry: {analysis.symmetry_score:.2f}")
                print(f"   Elements: {analysis.element_count}")
                print(f"   Energy flow: {analysis.energy_flow}")
            
            # Show method details
            if 'unique_letters' in raw_data:
                print(f"\n🔤 LETTER ANALYSIS:")
                print(f"   Unique letters: {raw_data['unique_letters']}")
                print(f"   Letter numbers: {raw_data['letter_numbers']}")
                print(f"   Method used: {raw_data['method_used']}")
            
            # Show correspondences
            if 'elemental_correspondences' in raw_data:
                elem = raw_data['elemental_correspondences']
                print(f"\n🌟 ELEMENTAL RESONANCE:")
                print(f"   Primary element: {elem['primary_element'].title()}")
                print(f"   Energy type: {elem['energy_type']}")
            
            if 'planetary_influences' in raw_data:
                planet = raw_data['planetary_influences']
                print(f"\n🪐 PLANETARY INFLUENCE:")
                print(f"   Primary planet: {planet['primary_planet'].title()}")
                print(f"   Best for: {planet['best_for']}")
            
            # Show file paths
            if 'image_path' in raw_data and raw_data['image_path']:
                print(f"\n📁 OUTPUT FILES:")
                print(f"   Image: {raw_data['image_path']}")
                if 'svg_path' in raw_data and raw_data['svg_path']:
                    print(f"   SVG: {raw_data['svg_path']}")
            
            # Show activation guidance preview
            if 'activation_guidance' in raw_data:
                guidance = raw_data['activation_guidance']
                print(f"\n🔥 ACTIVATION PREVIEW:")
                charging_lines = guidance.charging_instructions.split('\n')[:5]
                for line in charging_lines:
                    if line.strip():
                        print(f"   {line.strip()}")
                print(f"   ... (see full guidance in interpretation)")
            
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
            print(f"❌ Error forging sigil: {e}")
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
    
    print(f"\n🎯 Sigil Forge Synthesizer engine is fully operational!")
    print("Generated sigils are ready for charging, activation, and manifestation work.")
    print("Check the 'generated_sigils' directory for your symbolic creations.")
    print("\n🔥 Remember: The power is in your intention, the sigil is just the key! 🔥")


if __name__ == "__main__":
    main()
