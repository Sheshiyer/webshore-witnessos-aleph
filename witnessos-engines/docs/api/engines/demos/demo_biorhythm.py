#!/usr/bin/env python3
"""
Demo script for WitnessOS Biorhythm Synchronizer Engine

Shows the complete biorhythm engine in action with real calculations,
critical day detection, and energy optimization guidance.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, timedelta
from ENGINES import get_engine, list_engines
from ENGINES.engines.biorhythm import BiorhythmEngine


def main():
    """Demo the Biorhythm Synchronizer engine."""
    print("⚡ WitnessOS Biorhythm Synchronizer Demo ⚡\n")
    
    # Show available engines
    print(f"Available engines: {list_engines()}")
    
    # Get the biorhythm engine
    try:
        biorhythm_engine = get_engine("biorhythm")()
        print(f"✅ Loaded: {biorhythm_engine}\n")
    except Exception as e:
        print(f"❌ Failed to load biorhythm engine: {e}")
        return
    
    # Demo with multiple examples - Using real birth data for validation
    test_cases = [
        {
            "name": "Cumbipuram Nateshan Sheshnarayan",  # Real test data for validation
            "birth_date": date(1991, 8, 13),
            "target_date": date.today(),
            "forecast_days": 7,
            "description": "Real biorhythm chart for validation - Current state"
        },
        {
            "name": "Cumbipuram Nateshan Sheshnarayan",
            "birth_date": date(1991, 8, 13),
            "target_date": date.today() + timedelta(days=5),
            "forecast_days": 14,
            "description": "Real biorhythm chart - Future forecast"
        },
        {
            "name": "Cumbipuram Nateshan Sheshnarayan",
            "birth_date": date(1991, 8, 13),
            "target_date": date.today(),
            "include_extended_cycles": True,
            "forecast_days": 10,
            "description": "Real biorhythm chart - Extended cycles analysis"
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"{'='*60}")
        print(f"EXAMPLE {i}: {case['description']} - {case['name']}")
        print(f"{'='*60}")
        
        # Prepare input
        input_data = {
            "birth_date": case["birth_date"],
            "target_date": case.get("target_date"),
            "include_extended_cycles": case.get("include_extended_cycles", False),
            "forecast_days": case.get("forecast_days", 7)
        }
        
        try:
            # Run calculation
            print(f"Calculating biorhythm for {case['name']}...")
            print(f"Birth date: {case['birth_date']}")
            print(f"Target date: {input_data['target_date']}")
            print(f"Extended cycles: {input_data['include_extended_cycles']}")
            print()
            
            result = biorhythm_engine.calculate(input_data)
            
            print(f"⏱️  Calculation completed in {result.calculation_time:.4f} seconds")
            print(f"🎯 Confidence score: {result.confidence_score:.2f}")
            print(f"🔮 Field signature: {result.field_signature}")
            print(f"📅 Days alive: {result.days_alive}")
            print()
            
            # Show the mystical interpretation
            print("🌟 MYSTICAL INTERPRETATION:")
            print(result.formatted_output)
            print()
            
            # Show core cycle data
            print("📊 CYCLE ANALYSIS:")
            print(f"   🔴 Physical: {result.physical_percentage:.1f}% ({result.physical_phase})")
            print(f"   🟡 Emotional: {result.emotional_percentage:.1f}% ({result.emotional_phase})")
            print(f"   🔵 Intellectual: {result.intellectual_percentage:.1f}% ({result.intellectual_phase})")
            print(f"   ⚡ Overall Energy: {result.overall_energy:.1f}%")
            print(f"   📈 Trend: {result.trend}")
            
            # Show extended cycles if included
            if result.intuitive_percentage is not None:
                print(f"   🟣 Intuitive: {result.intuitive_percentage:.1f}%")
                print(f"   🟠 Aesthetic: {result.aesthetic_percentage:.1f}%")
                print(f"   ⚪ Spiritual: {result.spiritual_percentage:.1f}%")
            print()
            
            # Show critical day status
            if result.critical_day:
                print("⚠️  CRITICAL DAY ACTIVE!")
            else:
                print("✅ No critical day detected")
            
            if result.critical_days_ahead:
                print(f"🔮 Critical days ahead: {len(result.critical_days_ahead)}")
                for critical_date in result.critical_days_ahead[:3]:  # Show first 3
                    days_until = (critical_date - result.target_date).days
                    print(f"   • {critical_date.strftime('%B %d')} ({days_until} days)")
            print()
            
            # Show energy optimization
            print("🔧 ENERGY OPTIMIZATION:")
            for cycle, guidance in result.energy_optimization.items():
                print(f"   {cycle.title()}: {guidance}")
            print()
            
            # Show forecast summary
            forecast = result.forecast_summary
            print("📈 FORECAST SUMMARY:")
            print(f"   Total forecast days: {forecast['total_days']}")
            print(f"   Critical days: {forecast['critical_days_count']}")
            print(f"   High energy days: {forecast['best_days_count']}")
            print(f"   Challenging days: {forecast['challenging_days_count']}")
            print(f"   Average energy: {forecast['average_energy']:.1f}%")
            print()
            
            # Show best and challenging days
            if result.best_days_ahead:
                print("🌟 BEST DAYS AHEAD:")
                for best_date in result.best_days_ahead[:3]:
                    days_until = (best_date - result.target_date).days
                    print(f"   • {best_date.strftime('%B %d')} ({days_until} days)")
                print()
            
            if result.challenging_days_ahead:
                print("⚠️  CHALLENGING DAYS AHEAD:")
                for challenge_date in result.challenging_days_ahead[:3]:
                    days_until = (challenge_date - result.target_date).days
                    print(f"   • {challenge_date.strftime('%B %d')} ({days_until} days)")
                print()
            
            # Show recommendations
            print("💡 RECOMMENDATIONS:")
            for j, rec in enumerate(result.recommendations[:5], 1):  # Show first 5
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
            
        except Exception as e:
            print(f"❌ Error calculating biorhythm: {e}")
            print()
    
    # Demo cycle synchronization analysis
    print(f"{'='*60}")
    print("CYCLE SYNCHRONIZATION ANALYSIS")
    print(f"{'='*60}")
    
    sync_test_date = date(1988, 3, 14)  # Pi Day birth
    input_data = {
        "birth_date": sync_test_date,
        "target_date": date.today(),
        "forecast_days": 30
    }
    
    try:
        result = biorhythm_engine.calculate(input_data)
        sync_data = result.cycle_synchronization
        
        print(f"Birth date: {sync_test_date}")
        print(f"Analysis date: {result.target_date}")
        print()
        
        print("🔄 SYNCHRONIZATION ANALYSIS:")
        print(f"   Synchronization score: {sync_data['synchronization_score']:.2f}")
        
        if sync_data['aligned_cycles']:
            print(f"   Aligned cycles: {', '.join(sync_data['aligned_cycles'])}")
        
        if sync_data['conflicting_cycles']:
            print(f"   Conflicting cycles: {sync_data['conflicting_cycles']}")
        
        if sync_data['synchronization_score'] > 0.5:
            print("   ✅ High synchronization - cycles working in harmony")
        elif sync_data['synchronization_score'] < -0.5:
            print("   ⚠️  Low synchronization - cycles in conflict")
        else:
            print("   ⚖️  Moderate synchronization - mixed cycle states")
        
        print()
        
    except Exception as e:
        print(f"❌ Error in synchronization analysis: {e}")
    
    # Show engine statistics
    print(f"{'='*60}")
    print("ENGINE STATISTICS")
    print(f"{'='*60}")
    
    stats = biorhythm_engine.get_stats()
    print(f"Engine: {stats['engine_name']}")
    print(f"Version: {stats['version']}")
    print(f"Total calculations: {stats['total_calculations']}")
    print(f"Last calculation time: {stats['last_calculation_time']:.4f}s")
    
    print(f"\n🎯 Biorhythm Synchronizer engine is fully operational!")
    print("Ready for integration into WitnessOS consciousness debugging workflows.")
    print("Use biorhythm awareness to optimize energy management and timing decisions.")


if __name__ == "__main__":
    main()
