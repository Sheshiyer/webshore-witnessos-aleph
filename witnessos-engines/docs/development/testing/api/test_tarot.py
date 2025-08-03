"""
Test script for Tarot Sequence Decoder Engine
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from engines.tarot import TarotSequenceDecoder
from engines.tarot_models import TarotInput


def test_tarot_engine():
    """Test the Tarot Sequence Decoder engine."""
    
    print("🎴 Testing Tarot Sequence Decoder Engine")
    print("=" * 50)
    
    # Initialize engine
    try:
        engine = TarotSequenceDecoder()
        print("✅ Engine initialized successfully")
    except Exception as e:
        print(f"❌ Engine initialization failed: {e}")
        return
    
    # Test single card reading
    print("\n🔮 Testing Single Card Reading")
    print("-" * 30)
    
    single_input = TarotInput(
        question="What do I need to know about my current path?",
        spread_type="single_card",
        include_reversed=True
    )
    
    try:
        result = engine.calculate(single_input)
        print(f"✅ Single card reading completed")
        print(f"📋 Spread: {result.raw_data['spread_layout'].name}")
        print(f"🎯 Question: {result.raw_data['question_asked']}")
        print(f"🃏 Card drawn: {result.raw_data['drawn_cards'][0].card.name}")
        print(f"🔄 Reversed: {result.raw_data['drawn_cards'][0].reversed}")
        print(f"💭 Theme: {result.raw_data['overall_theme']}")
        print(f"🎨 Elemental balance: {result.raw_data['elemental_balance']}")
    except Exception as e:
        print(f"❌ Single card reading failed: {e}")
        return
    
    # Test three card reading
    print("\n🔮 Testing Three Card Reading")
    print("-" * 30)
    
    three_input = TarotInput(
        question="How can I improve my relationships?",
        spread_type="three_card",
        include_reversed=True,
        focus_area="love"
    )
    
    try:
        result = engine.calculate(three_input)
        print(f"✅ Three card reading completed")
        print(f"📋 Spread: {result.raw_data['spread_layout'].name}")
        print(f"🎯 Question: {result.raw_data['question_asked']}")

        for i, card in enumerate(result.raw_data['drawn_cards']):
            print(f"🃏 Position {card.position}: {card.card.name} ({'Reversed' if card.reversed else 'Upright'})")
            print(f"   📍 Meaning: {card.position_meaning}")

        print(f"💭 Overall theme: {result.raw_data['overall_theme']}")
        print(f"🔑 Key insights: {len(result.raw_data['key_insights'])} insights generated")
        print(f"🎨 Archetypal patterns: {len(result.raw_data['archetypal_patterns'])} patterns found")
        
    except Exception as e:
        print(f"❌ Three card reading failed: {e}")
        return
    
    # Test Celtic Cross reading
    print("\n🔮 Testing Celtic Cross Reading")
    print("-" * 30)
    
    celtic_input = TarotInput(
        question="What should I focus on for my spiritual growth?",
        spread_type="celtic_cross",
        include_reversed=True,
        focus_area="spiritual"
    )
    
    try:
        result = engine.calculate(celtic_input)
        print(f"✅ Celtic Cross reading completed")
        print(f"📋 Spread: {result.raw_data['spread_layout'].name}")
        print(f"🎯 Question: {result.raw_data['question_asked']}")
        print(f"🃏 Cards drawn: {len(result.raw_data['drawn_cards'])} cards")

        # Show first 3 positions
        for i in range(min(3, len(result.raw_data['drawn_cards']))):
            card = result.raw_data['drawn_cards'][i]
            print(f"   Position {card.position}: {card.card.name} - {card.position_meaning}")

        print(f"💭 Overall theme: {result.raw_data['overall_theme'][:100]}...")
        print(f"🎨 Elemental balance: {result.raw_data['elemental_balance']}")
        print(f"🧘 Meditation focus: {result.raw_data['meditation_focus']}")
        print(f"⚡ Field resonance: {len(result.raw_data['field_resonance'])} archetypes")
        
    except Exception as e:
        print(f"❌ Celtic Cross reading failed: {e}")
        return
    
    print("\n🎉 All Tarot engine tests completed successfully!")
    print("🔮 The Tarot Sequence Decoder is ready for mystical guidance.")


if __name__ == "__main__":
    test_tarot_engine()
