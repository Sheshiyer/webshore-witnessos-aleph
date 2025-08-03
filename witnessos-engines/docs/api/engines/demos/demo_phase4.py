"""
Phase 4 Demo: Symbolic/Archetypal Engines

Demonstrates the Tarot Sequence Decoder, I-Ching Mutation Oracle, 
and Gene Keys Compass engines working together.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import date
from engines.tarot import TarotSequenceDecoder
from engines.iching import IChingMutationOracle
from engines.gene_keys import GeneKeysCompass
from engines.tarot_models import TarotInput
from engines.iching_models import IChingInput
from engines.gene_keys_models import GeneKeysInput


def demo_phase4_engines():
    """Demonstrate all Phase 4 engines with a cohesive reading."""
    
    print("🌟 WitnessOS Phase 4: Symbolic/Archetypal Engines Demo")
    print("=" * 60)
    print("🎴 Tarot Sequence Decoder | ☯️ I-Ching Mutation Oracle | 🧬 Gene Keys Compass")
    print("=" * 60)
    
    # Real user data for validation
    birth_date = date(1991, 8, 13)  # Cumbipuram Nateshan Sheshnarayan
    question = "What is my path to authentic self-expression?"

    print(f"\n👤 Real Reading for: Cumbipuram Nateshan Sheshnarayan - Birth Date {birth_date}")
    print(f"🎯 Question: {question}")
    print("\n" + "─" * 60)
    
    # Initialize all engines
    print("\n🔧 Initializing Engines...")
    try:
        tarot_engine = TarotSequenceDecoder()
        iching_engine = IChingMutationOracle()
        gene_keys_engine = GeneKeysCompass()
        print("✅ All engines initialized successfully")
    except Exception as e:
        print(f"❌ Engine initialization failed: {e}")
        return
    
    # 1. Gene Keys Reading (Foundation)
    print("\n🧬 GENE KEYS COMPASS - Archetypal Foundation")
    print("─" * 40)
    
    gene_keys_input = GeneKeysInput(
        birth_date=birth_date,
        focus_sequence="activation",
        include_programming_partner=True
    )
    
    try:
        gene_keys_result = gene_keys_engine.calculate(gene_keys_input)
        profile = gene_keys_result.raw_data['profile']
        primary = profile.primary_gene_key
        
        print(f"🌟 Life's Work: Gene Key {primary.number} - {primary.name}")
        print(f"🌑 Shadow: {primary.shadow}")
        print(f"🎁 Gift: {primary.gift}")
        print(f"✨ Siddhi: {primary.siddhi}")
        print(f"🎭 Life Theme: {primary.life_theme}")
        
        partner = profile.programming_partner
        print(f"🤝 Programming Partner: Gene Key {partner.number} - {partner.name}")
        
        print(f"\n💫 Core Guidance: {gene_keys_result.raw_data['guidance_summary']}")
        
    except Exception as e:
        print(f"❌ Gene Keys reading failed: {e}")
        return
    
    # 2. I-Ching Reading (Wisdom)
    print("\n☯️ I-CHING MUTATION ORACLE - Ancient Wisdom")
    print("─" * 40)
    
    iching_input = IChingInput(
        question=question,
        method="coins",
        include_changing_lines=True
    )
    
    try:
        iching_result = iching_engine.calculate(iching_input)
        reading = iching_result.raw_data['reading']
        
        print(f"📿 Primary Hexagram: #{reading.primary_hexagram.number} - {reading.primary_hexagram.name}")
        print(f"🈳 Chinese: {reading.primary_hexagram.chinese}")
        print(f"🏷️ Keywords: {', '.join(reading.primary_hexagram.keywords)}")
        print(f"⚖️ Judgment: {reading.primary_hexagram.judgment}")
        
        if reading.changing_lines:
            print(f"🔄 Changing Lines: {', '.join(map(str, reading.changing_lines))}")
            if reading.mutation_hexagram:
                print(f"🦋 Mutation to: {reading.mutation_hexagram.name}")
        
        print(f"\n💫 I-Ching Guidance: {iching_result.raw_data['guidance_summary']}")
        
    except Exception as e:
        print(f"❌ I-Ching reading failed: {e}")
        return
    
    # 3. Tarot Reading (Practical Guidance)
    print("\n🎴 TAROT SEQUENCE DECODER - Practical Guidance")
    print("─" * 40)
    
    tarot_input = TarotInput(
        question=question,
        spread_type="three_card",
        include_reversed=True
    )
    
    try:
        tarot_result = tarot_engine.calculate(tarot_input)
        drawn_cards = tarot_result.raw_data['drawn_cards']
        
        print(f"📋 Spread: {tarot_result.raw_data['spread_layout'].name}")
        
        for card in drawn_cards:
            status = "Reversed" if card.reversed else "Upright"
            print(f"🃏 {card.position_meaning}: {card.card.name} ({status})")
        
        print(f"\n🌟 Overall Theme: {tarot_result.raw_data['overall_theme']}")
        print(f"💫 Tarot Guidance: {tarot_result.raw_data['guidance_summary']}")
        
    except Exception as e:
        print(f"❌ Tarot reading failed: {e}")
        return
    
    # 4. Synthesis and Integration
    print("\n🌈 SYNTHESIS - Integrated Guidance")
    print("─" * 40)
    
    print("🔮 Multi-Modal Reading Summary:")
    print(f"   🧬 Archetypal Foundation: {primary.name} - Transform {primary.shadow} into {primary.gift}")
    print(f"   ☯️ Wisdom Guidance: {reading.primary_hexagram.name} - {', '.join(reading.primary_hexagram.keywords[:2])}")
    print(f"   🎴 Practical Steps: {len(drawn_cards)} cards revealing {tarot_result.raw_data['spread_layout'].name}")
    
    print(f"\n🎯 Unified Message:")
    print(f"   Your path to authentic self-expression is revealed through the archetypal")
    print(f"   pattern of {primary.name}, guided by the ancient wisdom of {reading.primary_hexagram.name},")
    print(f"   and supported by practical insights from the Tarot's {tarot_result.raw_data['spread_layout'].name}.")
    
    print(f"\n🛤️ Integration Steps:")
    print(f"   1. Contemplate your Gene Key {primary.number} daily")
    print(f"   2. Apply the I-Ching wisdom of {reading.primary_hexagram.name}")
    print(f"   3. Take practical action guided by the Tarot cards")
    print(f"   4. Notice synchronicities between all three systems")
    print(f"   5. Trust the unified message emerging from your reading")
    
    # 5. Field Resonance Analysis
    print("\n⚡ FIELD RESONANCE - Archetypal Patterns")
    print("─" * 40)
    
    # Combine resonance data from all engines
    total_archetypes = set()
    
    if 'field_resonance' in gene_keys_result.raw_data:
        total_archetypes.update(gene_keys_result.raw_data['field_resonance'].keys())
    
    if 'field_resonance' in iching_result.raw_data:
        total_archetypes.update(iching_result.raw_data['field_resonance'].keys())
    
    if 'field_resonance' in tarot_result.raw_data:
        total_archetypes.update(tarot_result.raw_data['field_resonance'].keys())
    
    print(f"🎭 Active Archetypal Fields: {len(total_archetypes)} patterns detected")
    print(f"🌊 Field Signature: Multi-modal consciousness debugging session")
    print(f"🔄 Reality Patch: Alignment with authentic self-expression pathway")
    
    print("\n" + "=" * 60)
    print("🎉 Phase 4 Demo Complete!")
    print("🌟 All three symbolic engines are working in harmony")
    print("🔮 WitnessOS archetypal guidance system is fully operational")
    print("=" * 60)


if __name__ == "__main__":
    demo_phase4_engines()
