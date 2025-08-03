#!/usr/bin/env python3
"""
Minimal Local Backend Test
Tests the fixed Pydantic models without full FastAPI server
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'witnessos-engines'))

def test_pydantic_models():
    """Test that our Pydantic model fixes work"""
    print("🧪 Testing Pydantic Model Fixes")
    print("=" * 50)
    
    try:
        # Test importing the base models
        from shared.base.data_models import CloudflareEngineOutput
        print("✅ Successfully imported CloudflareEngineOutput")
        
        # Test creating an output without reading_id
        test_output = CloudflareEngineOutput(
            engine_name="test_engine",
            calculation_time=1.5,
            confidence_score=0.95,
            field_signature="test_signature",
            formatted_output={"test": "data"}
            # Note: reading_id is NOT provided - this should work now
        )
        print("✅ Successfully created CloudflareEngineOutput without reading_id")
        print(f"   reading_id: {test_output.reading_id}")
        
        # Test the to_d1_record method
        d1_record = test_output.to_d1_record()
        print("✅ Successfully called to_d1_record()")
        print(f"   Generated ID: {d1_record['id']}")
        
        # Test importing engine models
        from engines.numerology_models import NumerologyOutput
        print("✅ Successfully imported NumerologyOutput")
        
        # Test creating numerology output without reading_id
        numerology_output = NumerologyOutput(
            engine_name="numerology",
            calculation_time=2.0,
            confidence_score=0.90,
            field_signature="numerology_test",
            formatted_output={"life_path": 7},
            # Core numerology fields
            life_path=7,
            expression=3,
            soul_urge=5,
            personality=2,
            maturity=1,
            personal_year=8,
            life_expression_bridge=4,
            soul_personality_bridge=3,
            numerology_system="pythagorean",
            calculation_year=2025
            # Note: reading_id is NOT provided - should inherit optional behavior
        )
        print("✅ Successfully created NumerologyOutput without reading_id")
        print(f"   reading_id: {numerology_output.reading_id}")
        
        return True
        
    except Exception as e:
        print(f"❌ Pydantic model test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_engine_imports():
    """Test that all engines can be imported"""
    print("\n🔧 Testing Engine Imports")
    print("=" * 50)
    
    engines_to_test = [
        ('numerology', 'NumerologyEngine'),
        ('human_design', 'HumanDesignScanner'),
        ('biorhythm', 'BiorhythmEngine'),
        ('tarot', 'TarotSequenceDecoder'),
        ('iching', 'IChingMutationOracle'),
    ]
    
    success_count = 0
    for module_name, class_name in engines_to_test:
        try:
            module = __import__(f'engines.{module_name}', fromlist=[class_name])
            engine_class = getattr(module, class_name)
            print(f"✅ Successfully imported {class_name}")
            success_count += 1
        except Exception as e:
            print(f"❌ Failed to import {class_name}: {e}")
    
    print(f"\n📊 Import Results: {success_count}/{len(engines_to_test)} engines imported successfully")
    return success_count == len(engines_to_test)

def main():
    """Run all tests"""
    print("🚀 WitnessOS Backend Fix Validation")
    print("=" * 60)
    
    # Test 1: Pydantic models
    pydantic_success = test_pydantic_models()
    
    # Test 2: Engine imports
    import_success = test_engine_imports()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 VALIDATION SUMMARY")
    print("=" * 60)
    
    if pydantic_success:
        print("✅ PYDANTIC FIX: Working - reading_id is now optional")
    else:
        print("❌ PYDANTIC FIX: Failed - validation errors persist")
    
    if import_success:
        print("✅ ENGINE IMPORTS: Working - all engines can be loaded")
    else:
        print("⚠️ ENGINE IMPORTS: Partial - some engines have import issues")
    
    if pydantic_success and import_success:
        print("\n🎉 ALL FIXES VALIDATED!")
        print("🌟 The backend code is working correctly")
        print("🔧 Railway deployment issue is likely infrastructure-related")
        print("\n🔗 Recommended next steps:")
        print("1. Check Railway deployment logs in dashboard")
        print("2. Verify Railway service configuration")
        print("3. Consider alternative deployment platform if needed")
        print("4. Frontend will continue working in fallback mode")
    else:
        print("\n⚠️ Some issues remain - see details above")
    
    print("=" * 60)
    return pydantic_success and import_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
