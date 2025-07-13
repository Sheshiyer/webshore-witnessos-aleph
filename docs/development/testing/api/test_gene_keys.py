"""
Test script for Gene Keys Compass Engine
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import date
from engines.gene_keys import GeneKeysCompass
from engines.gene_keys_models import GeneKeysInput


def test_gene_keys_engine():
    """Test the Gene Keys Compass engine."""
    
    print("🧬 Testing Gene Keys Compass Engine")
    print("=" * 50)
    
    # Initialize engine
    try:
        engine = GeneKeysCompass()
        print("✅ Engine initialized successfully")
    except Exception as e:
        print(f"❌ Engine initialization failed: {e}")
        return
    
    # Test Activation Sequence
    print("\n🔥 Testing Activation Sequence")
    print("-" * 30)
    
    activation_input = GeneKeysInput(
        birth_date=date(1985, 6, 15),
        focus_sequence="activation",
        include_programming_partner=True
    )
    
    try:
        result = engine.calculate(activation_input)
        print(f"✅ Activation sequence calculated")
        profile = result.raw_data['profile']
        
        primary = profile.primary_gene_key
        print(f"🌟 Life's Work: Gene Key {primary.number} - {primary.name}")
        print(f"🌑 Shadow: {primary.shadow}")
        print(f"🎁 Gift: {primary.gift}")
        print(f"✨ Siddhi: {primary.siddhi}")
        print(f"🎭 Life Theme: {primary.life_theme}")
        
        partner = profile.programming_partner
        print(f"🤝 Programming Partner: Gene Key {partner.number} - {partner.name}")
        
        print(f"🔥 Activation Sequence Gates:")
        for gate in profile.activation_sequence.gates:
            print(f"   {gate.name}: Gene Key {gate.gene_key.number} - {gate.gene_key.name}")
        
        print(f"🎯 Guidance: {result.raw_data['guidance_summary']}")
        
    except Exception as e:
        print(f"❌ Activation sequence failed: {e}")
        return
    
    # Test Venus Sequence
    print("\n💕 Testing Venus Sequence")
    print("-" * 30)
    
    venus_input = GeneKeysInput(
        birth_date=date(1990, 12, 25),
        focus_sequence="venus",
        pathworking_focus="relationships"
    )
    
    try:
        result = engine.calculate(venus_input)
        print(f"✅ Venus sequence calculated")
        profile = result.raw_data['profile']
        
        print(f"💕 Venus Sequence Gates:")
        for gate in profile.venus_sequence.gates:
            print(f"   {gate.name}: Gene Key {gate.gene_key.number} - {gate.gene_key.name}")
            print(f"      Shadow: {gate.gene_key.shadow} | Gift: {gate.gene_key.gift}")
        
        print(f"🛤️ Pathworking guidance: {len(result.raw_data['pathworking_guidance'])} steps")
        print(f"🔑 Key insights: {len(result.raw_data['key_insights'])} insights")
        
    except Exception as e:
        print(f"❌ Venus sequence failed: {e}")
        return
    
    # Test Pearl Sequence
    print("\n💎 Testing Pearl Sequence")
    print("-" * 30)
    
    pearl_input = GeneKeysInput(
        birth_date=date(1975, 3, 8),
        focus_sequence="pearl",
        pathworking_focus="vocation"
    )
    
    try:
        result = engine.calculate(pearl_input)
        print(f"✅ Pearl sequence calculated")
        profile = result.raw_data['profile']
        
        print(f"💎 Pearl Sequence Gates:")
        for gate in profile.pearl_sequence.gates:
            print(f"   {gate.name}: Gene Key {gate.gene_key.number} - {gate.gene_key.name}")
        
        vocation_key = profile.pearl_sequence.gates[0].gene_key
        print(f"💼 Vocation Theme: {vocation_key.life_theme}")
        print(f"🎯 Primary guidance: {result.raw_data['guidance_summary']}")
        
    except Exception as e:
        print(f"❌ Pearl sequence failed: {e}")
        return
    
    # Test All Sequences
    print("\n🌟 Testing All Sequences")
    print("-" * 30)
    
    all_input = GeneKeysInput(
        birth_date=date(1988, 9, 21),
        focus_sequence="all",
        include_programming_partner=True
    )
    
    try:
        result = engine.calculate(all_input)
        print(f"✅ All sequences calculated")
        profile = result.raw_data['profile']
        
        print(f"🧬 Complete Profile for {result.raw_data['birth_date']}:")
        
        # Show primary information
        primary = profile.primary_gene_key
        print(f"🌟 Primary: Gene Key {primary.number} - {primary.name}")
        print(f"   {primary.shadow} → {primary.gift} → {primary.siddhi}")
        
        # Show sequence summary
        print(f"🔥 Activation: {len(profile.activation_sequence.gates)} gates")
        print(f"💕 Venus: {len(profile.venus_sequence.gates)} gates")
        print(f"💎 Pearl: {len(profile.pearl_sequence.gates)} gates")
        
        print(f"🛤️ Pathworking: {len(result.raw_data['pathworking_guidance'])} guidance steps")
        print(f"⚡ Field resonance: {len(result.raw_data['field_resonance'])} archetypes")
        
    except Exception as e:
        print(f"❌ All sequences failed: {e}")
        return
    
    # Test formatted output
    print("\n📜 Testing Formatted Output")
    print("-" * 30)
    
    try:
        formatted = result.formatted_output
        print("✅ Formatted output generated")
        print(f"📝 Output length: {len(formatted)} characters")
        print(f"📋 First 300 characters:")
        print(formatted[:300] + "..." if len(formatted) > 300 else formatted)
        
    except Exception as e:
        print(f"❌ Formatted output failed: {e}")
        return
    
    print("\n🎉 All Gene Keys engine tests completed successfully!")
    print("🧬 The Gene Keys Compass is ready for archetypal guidance.")


if __name__ == "__main__":
    test_gene_keys_engine()
