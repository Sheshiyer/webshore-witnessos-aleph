"""
Test script for Enneagram Resonator Engine
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from engines.enneagram import EnneagramResonator
from engines.enneagram_models import EnneagramInput


def test_enneagram_engine():
    """Test the Enneagram Resonator engine."""
    
    print("🎭 Testing Enneagram Resonator Engine")
    print("=" * 50)
    
    # Initialize engine
    try:
        engine = EnneagramResonator()
        print("✅ Engine initialized successfully")
    except Exception as e:
        print(f"❌ Engine initialization failed: {e}")
        return
    
    # Test self-selection method
    print("\n🎯 Testing Self-Selection Method")
    print("-" * 30)
    
    self_select_input = EnneagramInput(
        identification_method="self_select",
        selected_type=4,
        include_wings=True,
        include_instincts=True,
        include_arrows=True,
        focus_area="growth"
    )
    
    try:
        result = engine.calculate(self_select_input)
        print(f"✅ Self-selection analysis completed")
        profile = result.raw_data['profile']
        
        primary = profile.primary_type
        print(f"🌟 Type: {primary.number} - {primary.name}")
        print(f"🏛️ Center: {profile.center.name}")
        print(f"💫 Core Motivation: {primary.core_motivation}")
        print(f"😰 Core Fear: {primary.core_fear}")
        print(f"⚡ Vice: {primary.vice} | Virtue: {primary.virtue}")
        
        if profile.wing:
            print(f"🪶 Wing: {profile.wing.name}")
        
        if profile.instinctual_variant:
            print(f"🧬 Instinct: {profile.instinctual_variant.name}")
        
        print(f"🎯 Guidance: {result.raw_data['guidance_summary']}")
        
    except Exception as e:
        print(f"❌ Self-selection test failed: {e}")
        return
    
    # Test assessment method
    print("\n📝 Testing Assessment Method")
    print("-" * 30)
    
    # Sample assessment responses
    assessment_responses = {
        "q1": "1",  # Look for the right way to solve it
        "q2": "1",  # Being corrupt or making mistakes
        "q3": "1",  # Additional question response
    }
    
    assessment_input = EnneagramInput(
        identification_method="assessment",
        assessment_responses=assessment_responses,
        include_wings=True,
        include_instincts=False,
        include_arrows=True,
        focus_area="relationships"
    )
    
    try:
        result = engine.calculate(assessment_input)
        print(f"✅ Assessment analysis completed")
        profile = result.raw_data['profile']
        
        primary = profile.primary_type
        print(f"🌟 Type: {primary.number} - {primary.name}")
        print(f"📊 Confidence: {profile.assessment_confidence:.2f}")
        print(f"🏛️ Center: {profile.center.name} - {profile.center.description}")
        
        if profile.integration_direction:
            print(f"⬆️ Integration: Move toward Type {profile.integration_direction.direction}")
        
        if profile.disintegration_direction:
            print(f"⬇️ Stress: Watch for Type {profile.disintegration_direction.direction} patterns")
        
        print(f"🌱 Growth guidance: {len(result.raw_data['growth_guidance'])} recommendations")
        
    except Exception as e:
        print(f"❌ Assessment test failed: {e}")
        return
    
    # Test intuitive method
    print("\n🔮 Testing Intuitive Method")
    print("-" * 30)
    
    intuitive_input = EnneagramInput(
        identification_method="intuitive",
        behavioral_description="I am very creative and emotionally intense. I often feel different from others and struggle with feeling misunderstood. I have a strong need for authenticity and can be quite moody. I'm drawn to beauty and meaning in life.",
        include_wings=True,
        include_instincts=True,
        include_arrows=True,
        focus_area="spirituality"
    )
    
    try:
        result = engine.calculate(intuitive_input)
        print(f"✅ Intuitive analysis completed")
        profile = result.raw_data['profile']
        
        primary = profile.primary_type
        print(f"🌟 Type: {primary.number} - {primary.name}")
        print(f"📊 Confidence: {profile.assessment_confidence:.2f}")
        print(f"🎭 Keywords: {', '.join(primary.keywords)}")
        print(f"🔥 Passion: {primary.passion} | Holy Idea: {primary.holy_idea}")
        
        if profile.wing:
            print(f"🪶 Wing: {profile.wing.name}")
            print(f"   Traits: {', '.join(profile.wing.traits)}")
        
        print(f"🎯 Center Analysis: {result.raw_data['center_analysis']}")
        print(f"🛤️ Integration Path: {result.raw_data['integration_path']}")
        
    except Exception as e:
        print(f"❌ Intuitive test failed: {e}")
        return
    
    # Test different type
    print("\n🎪 Testing Different Type (Type 7)")
    print("-" * 30)
    
    type7_input = EnneagramInput(
        identification_method="self_select",
        selected_type=7,
        include_wings=True,
        include_instincts=True,
        include_arrows=True,
        focus_area="career"
    )
    
    try:
        result = engine.calculate(type7_input)
        print(f"✅ Type 7 analysis completed")
        profile = result.raw_data['profile']
        
        primary = profile.primary_type
        print(f"🌟 Type: {primary.number} - {primary.name}")
        print(f"🏛️ Center: {profile.center.name} - {profile.center.core_emotion}")
        print(f"💫 Core Motivation: {primary.core_motivation}")
        print(f"🎯 Basic Proposition: {primary.basic_proposition}")
        
        # Show growth recommendations
        print(f"🌱 Growth Recommendations:")
        for i, rec in enumerate(primary.growth_recommendations[:3], 1):
            print(f"   {i}. {rec}")
        
        print(f"⚡ Field resonance: {len(result.raw_data['field_resonance'])} archetypes")
        
    except Exception as e:
        print(f"❌ Type 7 test failed: {e}")
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
    
    print("\n🎉 All Enneagram engine tests completed successfully!")
    print("🎭 The Enneagram Resonator is ready for personality analysis.")


if __name__ == "__main__":
    test_enneagram_engine()
