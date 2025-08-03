"""
Test script for I-Ching Mutation Oracle Engine
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from engines.iching import IChingMutationOracle
from engines.iching_models import IChingInput


def test_iching_engine():
    """Test the I-Ching Mutation Oracle engine."""
    
    print("☯️ Testing I-Ching Mutation Oracle Engine")
    print("=" * 50)
    
    # Initialize engine
    try:
        engine = IChingMutationOracle()
        print("✅ Engine initialized successfully")
    except Exception as e:
        print(f"❌ Engine initialization failed: {e}")
        return
    
    # Test coins method reading
    print("\n🪙 Testing Coins Method Reading")
    print("-" * 30)
    
    coins_input = IChingInput(
        question="What should I focus on in my personal development?",
        method="coins",
        include_changing_lines=True
    )
    
    try:
        result = engine.calculate(coins_input)
        print(f"✅ Coins reading completed")
        reading = result.raw_data['reading']
        print(f"📿 Primary Hexagram: #{reading.primary_hexagram.number} - {reading.primary_hexagram.name}")
        print(f"🈳 Chinese: {reading.primary_hexagram.chinese}")
        print(f"🔺 Trigrams: {' over '.join(reading.primary_hexagram.trigrams)}")
        print(f"🏷️ Keywords: {', '.join(reading.primary_hexagram.keywords)}")
        
        if reading.changing_lines:
            print(f"🔄 Changing Lines: {', '.join(map(str, reading.changing_lines))}")
            if reading.mutation_hexagram:
                print(f"🦋 Mutation to: {reading.mutation_hexagram.name}")
        else:
            print("🔄 No changing lines")
            
        print(f"🎯 Guidance: {result.raw_data['guidance_summary']}")
        
    except Exception as e:
        print(f"❌ Coins reading failed: {e}")
        return
    
    # Test yarrow method reading
    print("\n🌾 Testing Yarrow Stalks Method Reading")
    print("-" * 30)
    
    yarrow_input = IChingInput(
        question="How can I improve my relationships with others?",
        method="yarrow",
        focus_area="relationships",
        include_changing_lines=True
    )
    
    try:
        result = engine.calculate(yarrow_input)
        print(f"✅ Yarrow reading completed")
        reading = result.raw_data['reading']
        print(f"📿 Primary Hexagram: #{reading.primary_hexagram.number} - {reading.primary_hexagram.name}")
        print(f"🎯 Question: {result.raw_data['question_asked']}")
        print(f"🔮 Method: {result.raw_data['method_used']}")
        
        if reading.changing_lines:
            print(f"🔄 Changing Lines: {len(reading.changing_lines)} lines changing")
            if reading.mutation_hexagram:
                print(f"🦋 Mutation: {reading.mutation_hexagram.name}")
        
        print(f"🌟 Elements: {', '.join(result.raw_data['trigram_elements'])}")
        print(f"🔑 Key insights: {len(result.raw_data['key_insights'])} insights generated")
        
    except Exception as e:
        print(f"❌ Yarrow reading failed: {e}")
        return
    
    # Test random method reading
    print("\n🎲 Testing Random Method Reading")
    print("-" * 30)
    
    random_input = IChingInput(
        question="What is the nature of the current situation?",
        method="random",
        include_changing_lines=True
    )
    
    try:
        result = engine.calculate(random_input)
        print(f"✅ Random reading completed")
        reading = result.raw_data['reading']
        print(f"📿 Primary Hexagram: #{reading.primary_hexagram.number} - {reading.primary_hexagram.name}")
        print(f"⚖️ Judgment: {reading.primary_hexagram.judgment[:80]}...")
        print(f"🖼️ Image: {reading.primary_hexagram.image[:80]}...")
        
        # Show line structure
        print(f"📊 Line Structure:")
        for line in reading.primary_lines:
            line_symbol = "━━━" if line.type == "yang" else "━ ━"
            changing_mark = " (changing)" if line.changing else ""
            print(f"   Line {line.position}: {line_symbol} ({line.type}){changing_mark}")
        
        if reading.mutation_hexagram:
            print(f"🦋 Mutation to: {reading.mutation_hexagram.name}")
            print(f"🔮 Future guidance: {reading.mutation_hexagram.divination[:60]}...")
        
        print(f"⚡ Field resonance: {len(result.raw_data['field_resonance'])} archetypes")
        
    except Exception as e:
        print(f"❌ Random reading failed: {e}")
        return
    
    # Test formatted output
    print("\n📜 Testing Formatted Output")
    print("-" * 30)
    
    try:
        formatted = result.formatted_output
        print("✅ Formatted output generated")
        print(f"📝 Output length: {len(formatted)} characters")
        print(f"📋 First 200 characters:")
        print(formatted[:200] + "..." if len(formatted) > 200 else formatted)
        
    except Exception as e:
        print(f"❌ Formatted output failed: {e}")
        return
    
    print("\n🎉 All I-Ching engine tests completed successfully!")
    print("☯️ The I-Ching Mutation Oracle is ready for wisdom guidance.")


if __name__ == "__main__":
    test_iching_engine()
