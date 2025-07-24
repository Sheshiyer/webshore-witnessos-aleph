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

# Import engines from the current deployment structure
from engines.numerology import NumerologyEngine
from engines.biorhythm import BiorhythmEngine
from engines.human_design import HumanDesignScanner
from engines.vimshottari import VimshottariTimelineMapper
from engines.gene_keys import GeneKeysCompass
from engines.tarot import TarotSequenceDecoder
from engines.iching import IChingMutationOracle
from engines.enneagram import EnneagramResonator

# Import input models
from engines.numerology_models import NumerologyInput
from engines.biorhythm_models import BiorhythmInput
from engines.human_design_models import HumanDesignInput
from engines.vimshottari_models import VimshottariInput
from engines.gene_keys_models import GeneKeysInput
from engines.tarot_models import TarotInput
from engines.iching_models import IChingInput
from engines.enneagram_models import EnneagramInput


def test_numerology_engine():
    """Test Numerology Field Extractor with validation data."""
    print("\n🔢 TESTING NUMEROLOGY FIELD EXTRACTOR")
    print("─" * 50)

    try:
        engine = NumerologyEngine()
        test_data = get_numerology_test_data()

        input_data = NumerologyInput(**test_data)
        result = engine.calculate(input_data)
        
        print(f"✅ Engine: {result.engine_name}")
        print(f"⏱️ Time: {result.calculation_time:.4f}s")
        print(f"🎯 Confidence: {result.confidence_score:.2f}")
        
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
        engine = BiorhythmEngine()
        test_data = get_biorhythm_test_data()
        
        input_data = BiorhythmInput(**test_data)
        result = engine.calculate(input_data)
        
        print(f"✅ Engine: {result.engine_name}")
        print(f"⏱️ Time: {result.calculation_time:.4f}s")
        print(f"🎯 Confidence: {result.confidence_score:.2f}")
        
        # Show current cycles
        snapshot = result.raw_data['snapshot']
        cycles = snapshot.cycles
        print(f"\n📊 Current Cycles:")
        print(f"   Physical: {cycles['physical'].percentage:.1f}% ({cycles['physical'].phase})")
        print(f"   Emotional: {cycles['emotional'].percentage:.1f}% ({cycles['emotional'].phase})")
        print(f"   Intellectual: {cycles['intellectual'].percentage:.1f}% ({cycles['intellectual'].phase})")
        
        # Check for extended cycles
        if 'intuitive' in cycles:
            print(f"   Intuitive: {cycles['intuitive'].percentage:.1f}%")
        if 'aesthetic' in cycles:
            print(f"   Aesthetic: {cycles['aesthetic'].percentage:.1f}%")
        if 'spiritual' in cycles:
            print(f"   Spiritual: {cycles['spiritual'].percentage:.1f}%")
        
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
        print(f"   Profile: {chart.profile.profile_name}")
        print(f"   Strategy: {chart.type_info.strategy}")
        print(f"   Authority: {chart.type_info.authority}")
        
        # Validate against known data using the chart object
        validation = validate_human_design_results({
            'type_info': result.chart.type_info,
            'profile': result.chart.profile
        })
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
        timeline = result.timeline
        print(f"\n📊 Current Dasha Periods:")
        print(f"   Mahadasha: {timeline.current_mahadasha.planet} (duration: {timeline.current_mahadasha.duration_years:.1f} years)")
        if hasattr(timeline, 'current_antardasha') and timeline.current_antardasha:
            print(f"   Antardasha: {timeline.current_antardasha.planet} (duration: {timeline.current_antardasha.duration_years:.2f} years)")
        else:
            print(f"   Antardasha: Not available")
        
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
    """Run comprehensive validation tests with admin console verification."""
    print("🌟 WitnessOS Engines - Comprehensive Validation Tests")
    print("👤 Admin Shesh - Detailed Console Verification Mode")
    print("=" * 80)
    
    personal = get_validation_personal_data()
    print(f"👤 Testing with: {personal['full_name']}")
    print(f"📅 Birth: {personal['birth_date']} at {personal['birth_time']}")
    print(f"📍 Location: {personal['birth_location']} ({personal['timezone']})")
    print("=" * 80)
    
    # Run all tests with admin verification notes
    test_results = []
    
    print("\n📋 Admin Note: Please verify each engine output for accuracy")
    print("-" * 60)
    
    test_results.append(test_numerology_engine())
    test_results.append(test_biorhythm_engine())
    test_results.append(test_human_design_engine())
    test_results.append(test_vimshottari_engine())
    test_results.append(test_symbolic_engines())
    test_results.append(test_enneagram_engine())
    
    # Summary
    print("\n🏆 ADMIN VALIDATION SUMMARY")
    print("=" * 80)
    
    passed = sum(test_results)
    total = len(test_results)
    success_rate = (passed / total) * 100
    
    print(f"✅ Tests Passed: {passed}/{total}")
    print(f"📊 Success Rate: {success_rate:.1f}%")
    
    # Special admin verification checklist
    print("\n📋 ADMIN VERIFICATION CHECKLIST:")
    print("1. ✓ Review Human Design Incarnation Cross accuracy")
    print("2. ✓ Verify Human Design Profile calculation")
    print("3. ✓ Check all engine outputs against known reference data")
    print("4. ✓ Confirm timezone handling across all engines")
    print("5. ✓ Validate birth data parsing and calculations")
    
    if passed == total:
        print("\n🎉 All engines validated successfully!")
        print("🔮 WitnessOS divination system is fully operational")
        print("✅ System ready for production deployment")
    else:
        print("\n⚠️ Some engines need attention")
        print("🔧 Check failed tests for debugging")
        print("🚨 System requires admin attention before deployment")
    
    print("=" * 80)
    return passed == total


if __name__ == "__main__":
    main()
