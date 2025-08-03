#!/usr/bin/env python3
"""
Demo script for WitnessOS Numerology Field Extractor Engine

Shows the complete numerology engine in action with real calculations
and mystical interpretations.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date
from ENGINES import get_engine, list_engines
from ENGINES.engines.numerology import NumerologyEngine


def main():
    """Demo the Numerology Field Extractor engine."""
    print("🔢 WitnessOS Numerology Field Extractor Demo 🔢\n")

    # Show available engines
    print(f"Available engines: {list_engines()}")

    # Get the numerology engine
    try:
        numerology_engine = get_engine("numerology")()
        print(f"✅ Loaded: {numerology_engine}\n")
    except Exception as e:
        print(f"❌ Failed to load numerology engine: {e}")
        return

    # Demo with multiple examples - Using real numerology data for validation
    test_cases = [
        {
            "name": "Cumbipuram Nateshan Sheshnarayan",  # Real test data for validation
            "birth_date": date(1991, 8, 13),
            "system": "pythagorean",
            "description": "Real numerology chart for validation - Pythagorean system"
        },
        {
            "name": "Cumbipuram Nateshan Sheshnarayan",
            "birth_date": date(1991, 8, 13),
            "system": "chaldean",
            "description": "Real numerology chart for validation - Chaldean system"
        },
        {
            "name": "Alexander Magnus",
            "birth_date": date(1992, 7, 21),
            "system": "chaldean",
            "description": "Historical name using Chaldean system"
        }
    ]

    for i, case in enumerate(test_cases, 1):
        print(f"{'='*60}")
        print(f"EXAMPLE {i}: {case['description']}")
        print(f"{'='*60}")

        # Prepare input
        input_data = {
            "full_name": case["name"],
            "birth_date": case["birth_date"],
            "system": case["system"],
            "current_year": 2024
        }

        try:
            # Run calculation
            print(f"Calculating numerology for {case['name']} ({case['system']} system)...")
            result = numerology_engine.calculate(input_data)

            print(f"⏱️  Calculation completed in {result.calculation_time:.4f} seconds")
            print(f"🎯 Confidence score: {result.confidence_score:.2f}")
            print(f"🔮 Field signature: {result.field_signature}")
            print()

            # Show the mystical interpretation
            print("🌟 MYSTICAL INTERPRETATION:")
            print(result.formatted_output)
            print()

            # Show core numbers
            print("📊 CORE NUMBERS:")
            print(f"   Life Path: {result.life_path}")
            print(f"   Expression: {result.expression}")
            print(f"   Soul Urge: {result.soul_urge}")
            print(f"   Personality: {result.personality}")
            print(f"   Maturity: {result.maturity}")
            print(f"   Personal Year: {result.personal_year}")
            print()

            # Show special numbers
            if result.master_numbers:
                print(f"✨ MASTER NUMBERS: {', '.join(map(str, result.master_numbers))}")
            if result.karmic_debt:
                print(f"⚖️  KARMIC DEBT: {', '.join(map(str, result.karmic_debt))}")
            if result.master_numbers or result.karmic_debt:
                print()

            # Show recommendations
            print("💡 RECOMMENDATIONS:")
            for j, rec in enumerate(result.recommendations, 1):
                print(f"   {j}. {rec}")
            print()

            # Show reality patches
            print("🔧 REALITY PATCHES:")
            for patch in result.reality_patches:
                print(f"   • {patch}")
            print()

            # Show archetypal themes
            print("🎭 ARCHETYPAL THEMES:")
            for theme in result.archetypal_themes:
                print(f"   • {theme}")
            print()

            # Show name breakdown
            breakdown = result.name_breakdown
            print("🔤 NAME ANALYSIS:")
            print(f"   Full name: {breakdown['full_name']}")
            print(f"   Letters only: {breakdown['letters_only']}")
            print(f"   Vowels: {breakdown['vowels']}")
            print(f"   Consonants: {breakdown['consonants']}")
            print(f"   Total letters: {breakdown['total_letters']}")
            print()

        except Exception as e:
            print(f"❌ Error calculating numerology: {e}")
            print()

    # Demo comparison between systems
    print(f"{'='*60}")
    print("SYSTEM COMPARISON: Pythagorean vs Chaldean")
    print(f"{'='*60}")

    test_name = "Cumbipuram Nateshan Sheshnarayan"  # Real test data for validation
    test_date = date(1991, 8, 13)

    for system in ["pythagorean", "chaldean"]:
        print(f"\n{system.upper()} SYSTEM:")

        input_data = {
            "full_name": test_name,
            "birth_date": test_date,
            "system": system
        }

        try:
            result = numerology_engine.calculate(input_data)
            print(f"   Life Path: {result.life_path}")
            print(f"   Expression: {result.expression}")
            print(f"   Soul Urge: {result.soul_urge}")
            print(f"   Personality: {result.personality}")

        except Exception as e:
            print(f"   Error: {e}")

    # Show engine statistics
    print(f"\n{'='*60}")
    print("ENGINE STATISTICS")
    print(f"{'='*60}")

    stats = numerology_engine.get_stats()
    print(f"Engine: {stats['engine_name']}")
    print(f"Version: {stats['version']}")
    print(f"Total calculations: {stats['total_calculations']}")
    print(f"Last calculation time: {stats['last_calculation_time']:.4f}s")

    print(f"\n🎯 Numerology Field Extractor engine is fully operational!")
    print("Ready for integration into WitnessOS consciousness debugging workflows.")


if __name__ == "__main__":
    main()
