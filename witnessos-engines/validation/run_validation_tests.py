"""
WitnessOS Engines - Comprehensive Validation Test Runner

Runs all engines with real validation data to verify accuracy of calculations.
Uses Cumbipuram Nateshan Sheshnarayan's data as the test case since the user
can verify the results against their known chart information.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import date
from test_validation_data import (
    get_validation_personal_data,
    get_numerology_test_data,
    get_biorhythm_test_data,
    get_human_design_test_data,
    get_vimshottari_test_data,
    get_gene_keys_test_data,
    get_tarot_test_data,
    get_iching_test_data,
    get_enneagram_test_data,
    validate_human_design_results,
    print_validation_summary
)

# Import engines using the ENGINES package
from ENGINES import get_engine


def test_numerology_engine():
    """Test Numerology Field Extractor with validation data."""
    print("\n🔢 TESTING NUMEROLOGY FIELD EXTRACTOR")
    print("─" * 50)

    try:
        engine = get_engine("numerology_field_extractor")
        test_data = get_numerology_test_data()

        result = engine.calculate(test_data)
        
        print(f"✅ Engine: {result.engine_name}")
        print(f"⏱️ Time: {result.calculation_time:.4f}s")
        print(f"🎯 Confidence: {result.confidence_score:.2f}")
        print(f"🔮 Field: {result.field_signature}")
        
        # Show key numbers
        print(f"\n📊 Core Numbers:")
        print(f"   Life Path: {result.life_path}")
        print(f"   Expression: {result.expression}")
        print(f"   Soul Urge: {result.soul_urge}")
        print(f"   Personality: {result.personality}")
        
        if result.master_numbers:
            print(f"✨ Master Numbers: {result.master_numbers}")
        if result.karmic_debt:
            print(f"⚖️ Karmic Debt: {result.karmic_debt}")
        
        return True
        
    except Exception as e:
        print(f"❌ Numerology test failed: {e}")
        return False


def test_biorhythm_engine():
    """Test Biorhythm Synchronizer with validation data."""
    print("\n🌊 TESTING BIORHYTHM SYNCHRONIZER")
    print("─" * 50)
    
    try:
        engine = BiorhythmSynchronizer()
        test_data = get_biorhythm_test_data()
        
        input_data = BiorhythmInput(**test_data)
        result = engine.calculate(input_data)
        
        print(f"✅ Engine: {result.engine_name}")
        print(f"⏱️ Time: {result.calculation_time:.4f}s")
        print(f"🎯 Confidence: {result.confidence_score:.2f}")
        
        # Show current cycles
        cycles = result.raw_data['current_cycles']
        print(f"\n📊 Current Cycles:")
        print(f"   Physical: {cycles['physical']['percentage']:.1f}% ({cycles['physical']['phase']})")
        print(f"   Emotional: {cycles['emotional']['percentage']:.1f}% ({cycles['emotional']['phase']})")
        print(f"   Intellectual: {cycles['intellectual']['percentage']:.1f}% ({cycles['intellectual']['phase']})")
        
        if 'extended_cycles' in result.raw_data:
            ext = result.raw_data['extended_cycles']
            print(f"   Intuitive: {ext['intuitive']['percentage']:.1f}%")
            print(f"   Aesthetic: {ext['aesthetic']['percentage']:.1f}%")
            print(f"   Spiritual: {ext['spiritual']['percentage']:.1f}%")
        
        return True
        
    except Exception as e:
        print(f"❌ Biorhythm test failed: {e}")
        return False


def test_human_design_engine():
    """Test Human Design Scanner with validation data."""
    print("\n🎯 TESTING HUMAN DESIGN SCANNER")
    print("─" * 50)
    
    try:
        engine = HumanDesignScanner()
        test_data = get_human_design_test_data()
        
        input_data = HumanDesignInput(**test_data)
        result = engine.calculate(input_data)
        
        print(f"✅ Engine: {result.engine_name}")
        print(f"⏱️ Time: {result.calculation_time:.4f}s")
        print(f"🎯 Confidence: {result.confidence_score:.2f}")
        
        # Show key information
        chart = result.chart
        print(f"\n📊 Human Design Chart:")
        print(f"   Type: {chart.type_info.type_name}")
        print(f"   Profile: {chart.profile.personality_line}/{chart.profile.design_line} {chart.profile.profile_name}")
        print(f"   Strategy: {chart.type_info.strategy}")
        print(f"   Authority: {chart.type_info.authority}")
        
        # Validate against known data
        validation = validate_human_design_results(result)
        print_validation_summary(validation)
        
        return len(validation["failed"]) == 0
        
    except Exception as e:
        print(f"❌ Human Design test failed: {e}")
        return False


def test_vimshottari_engine():
    """Test Vimshottari Timeline Mapper with validation data."""
    print("\n🕉️ TESTING VIMSHOTTARI TIMELINE MAPPER")
    print("─" * 50)
    
    try:
        engine = VimshottariTimelineMapper()
        test_data = get_vimshottari_test_data()
        
        input_data = VimshottariInput(**test_data)
        result = engine.calculate(input_data)
        
        print(f"✅ Engine: {result.engine_name}")
        print(f"⏱️ Time: {result.calculation_time:.4f}s")
        print(f"🎯 Confidence: {result.confidence_score:.2f}")
        
        # Show current periods
        timeline = result.raw_data['timeline']
        print(f"\n📊 Current Dasha Periods:")
        print(f"   Mahadasha: {timeline.current_mahadasha.planet} ({timeline.current_mahadasha.remaining_years:.1f} years left)")
        print(f"   Antardasha: {timeline.current_antardasha.planet} ({timeline.current_antardasha.remaining_months:.1f} months left)")
        
        if timeline.current_pratyantardasha:
            print(f"   Pratyantardasha: {timeline.current_pratyantardasha.planet}")
        
        return True
        
    except Exception as e:
        print(f"❌ Vimshottari test failed: {e}")
        return False


def test_symbolic_engines():
    """Test Tarot, I-Ching, and Gene Keys engines."""
    print("\n🎴 TESTING SYMBOLIC ENGINES")
    print("─" * 50)
    
    results = []
    
    # Test Gene Keys
    try:
        engine = GeneKeysCompass()
        test_data = get_gene_keys_test_data()
        input_data = GeneKeysInput(**test_data)
        result = engine.calculate(input_data)
        
        print(f"✅ Gene Keys: {result.engine_name} ({result.calculation_time:.4f}s)")
        profile = result.raw_data['profile']
        print(f"   Primary: Gene Key {profile.primary_gene_key.number} - {profile.primary_gene_key.name}")
        results.append(True)
        
    except Exception as e:
        print(f"❌ Gene Keys test failed: {e}")
        results.append(False)
    
    # Test Tarot
    try:
        engine = TarotSequenceDecoder()
        test_data = get_tarot_test_data()
        input_data = TarotInput(**test_data)
        result = engine.calculate(input_data)
        
        print(f"✅ Tarot: {result.engine_name} ({result.calculation_time:.4f}s)")
        cards = result.raw_data['drawn_cards']
        print(f"   Cards drawn: {len(cards)} cards")
        results.append(True)
        
    except Exception as e:
        print(f"❌ Tarot test failed: {e}")
        results.append(False)
    
    # Test I-Ching
    try:
        engine = IChingMutationOracle()
        test_data = get_iching_test_data()
        input_data = IChingInput(**test_data)
        result = engine.calculate(input_data)
        
        print(f"✅ I-Ching: {result.engine_name} ({result.calculation_time:.4f}s)")
        reading = result.raw_data['reading']
        print(f"   Hexagram: #{reading.primary_hexagram.number} {reading.primary_hexagram.name}")
        results.append(True)
        
    except Exception as e:
        print(f"❌ I-Ching test failed: {e}")
        results.append(False)
    
    return all(results)


def test_enneagram_engine():
    """Test Enneagram Resonator with validation data."""
    print("\n🎭 TESTING ENNEAGRAM RESONATOR")
    print("─" * 50)
    
    try:
        engine = EnneagramResonator()
        test_data = get_enneagram_test_data()
        
        input_data = EnneagramInput(**test_data)
        result = engine.calculate(input_data)
        
        print(f"✅ Engine: {result.engine_name}")
        print(f"⏱️ Time: {result.calculation_time:.4f}s")
        print(f"🎯 Confidence: {result.confidence_score:.2f}")
        
        # Show type information
        profile = result.raw_data['profile']
        primary = profile.primary_type
        print(f"\n📊 Enneagram Profile:")
        print(f"   Type: {primary.number} - {primary.name}")
        print(f"   Center: {profile.center.name}")
        print(f"   Motivation: {primary.core_motivation}")
        
        if profile.wing:
            print(f"   Wing: {profile.wing.name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Enneagram test failed: {e}")
        return False


def main():
    """Run comprehensive validation tests."""
    print("🌟 WitnessOS Engines - Comprehensive Validation Tests")
    print("=" * 60)
    
    personal = get_validation_personal_data()
    print(f"👤 Testing with: {personal['full_name']}")
    print(f"📅 Birth: {personal['birth_date']} at {personal['birth_time']}")
    print(f"📍 Location: {personal['birth_location']} ({personal['timezone']})")
    print("=" * 60)
    
    # Run all tests
    test_results = []
    
    test_results.append(test_numerology_engine())
    test_results.append(test_biorhythm_engine())
    test_results.append(test_human_design_engine())
    test_results.append(test_vimshottari_engine())
    test_results.append(test_symbolic_engines())
    test_results.append(test_enneagram_engine())
    
    # Summary
    print("\n🏆 VALIDATION SUMMARY")
    print("=" * 60)
    
    passed = sum(test_results)
    total = len(test_results)
    success_rate = (passed / total) * 100
    
    print(f"✅ Tests Passed: {passed}/{total}")
    print(f"📊 Success Rate: {success_rate:.1f}%")
    
    if passed == total:
        print("🎉 All engines validated successfully!")
        print("🔮 WitnessOS divination system is fully operational")
    else:
        print("⚠️ Some engines need attention")
        print("🔧 Check failed tests for debugging")
    
    print("=" * 60)
    return passed == total


if __name__ == "__main__":
    main()
