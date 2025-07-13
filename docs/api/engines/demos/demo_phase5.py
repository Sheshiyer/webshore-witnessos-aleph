"""
Phase 5 Demo: Psychological/Pattern Engines

Demonstrates the Enneagram Resonator engine with comprehensive
personality analysis and growth guidance.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from engines.enneagram import EnneagramResonator
from engines.enneagram_models import EnneagramInput


def demo_phase5_engines():
    """Demonstrate the Enneagram Resonator with comprehensive analysis."""
    
    print("🎭 WitnessOS Phase 5: Psychological/Pattern Engines Demo")
    print("=" * 60)
    print("🧠 Enneagram Resonator - Deep Personality Pattern Analysis")
    print("=" * 60)
    
    # Initialize engine
    print("\n🔧 Initializing Enneagram Resonator...")
    try:
        enneagram_engine = EnneagramResonator()
        print("✅ Engine initialized successfully")
    except Exception as e:
        print(f"❌ Engine initialization failed: {e}")
        return
    
    # Demo 1: Self-Selection Analysis
    print("\n🎯 DEMO 1: Self-Selection Analysis")
    print("─" * 40)
    print("Scenario: User knows they are Type 4 (The Individualist)")
    
    self_select_input = EnneagramInput(
        identification_method="self_select",
        selected_type=4,
        include_wings=True,
        include_instincts=True,
        include_arrows=True,
        focus_area="growth"
    )
    
    try:
        result = enneagram_engine.calculate(self_select_input)
        profile = result.raw_data['profile']
        primary = profile.primary_type
        
        print(f"🌟 Core Type: {primary.number} - {primary.name}")
        print(f"🏛️ Center: {profile.center.name} ({profile.center.core_emotion})")
        print(f"💫 Core Motivation: {primary.core_motivation}")
        print(f"😰 Core Fear: {primary.core_fear}")
        print(f"⚡ Vice → Virtue: {primary.vice} → {primary.virtue}")
        
        if profile.wing:
            print(f"🪶 Wing: {profile.wing.name}")
            print(f"   Adds: {', '.join(profile.wing.traits[:3])}")
        
        if profile.instinctual_variant:
            print(f"🧬 Instinct: {profile.instinctual_variant.name}")
        
        if profile.integration_direction:
            print(f"⬆️ Growth: Move toward Type {profile.integration_direction.direction}")
        
        print(f"\n💫 Guidance: {result.raw_data['guidance_summary']}")
        
    except Exception as e:
        print(f"❌ Self-selection demo failed: {e}")
        return
    
    # Demo 2: Assessment-Based Analysis
    print("\n📝 DEMO 2: Assessment-Based Analysis")
    print("─" * 40)
    print("Scenario: User takes assessment and shows Type 1 patterns")
    
    # Simulate Type 1 responses
    assessment_responses = {
        "q1": "1",  # Look for the right way to solve it
        "q2": "1",  # Being corrupt or making mistakes
        "q3": "1",  # Additional Type 1 response
        "q4": "1",  # Another Type 1 response
    }
    
    assessment_input = EnneagramInput(
        identification_method="assessment",
        assessment_responses=assessment_responses,
        include_wings=True,
        include_instincts=True,
        include_arrows=True,
        focus_area="relationships"
    )
    
    try:
        result = enneagram_engine.calculate(assessment_input)
        profile = result.raw_data['profile']
        primary = profile.primary_type
        
        print(f"🌟 Identified Type: {primary.number} - {primary.name}")
        print(f"📊 Confidence: {profile.assessment_confidence:.0%}")
        print(f"🎭 Alternative Names: {', '.join(primary.alternative_names)}")
        print(f"🔥 Passion: {primary.passion} | Holy Idea: {primary.holy_idea}")
        
        if profile.wing:
            print(f"🪶 Wing: {profile.wing.name}")
        
        print(f"🎯 Center Analysis: {result.raw_data['center_analysis']}")
        
        # Show growth recommendations
        print(f"\n🌱 Growth Recommendations:")
        for i, rec in enumerate(result.raw_data['growth_guidance'][:4], 1):
            print(f"   {i}. {rec}")
        
    except Exception as e:
        print(f"❌ Assessment demo failed: {e}")
        return
    
    # Demo 3: Intuitive Description Analysis
    print("\n🔮 DEMO 3: Intuitive Description Analysis")
    print("─" * 40)
    print("Scenario: User describes their behavioral patterns")
    
    description = """
    I'm very enthusiastic and love exploring new possibilities. I get excited about 
    many different projects and ideas, but sometimes struggle to follow through. 
    I don't like being restricted or limited, and I tend to avoid negative emotions. 
    I'm optimistic and always looking for the next adventure or experience.
    """
    
    intuitive_input = EnneagramInput(
        identification_method="intuitive",
        behavioral_description=description.strip(),
        include_wings=True,
        include_instincts=True,
        include_arrows=True,
        focus_area="career"
    )
    
    try:
        result = enneagram_engine.calculate(intuitive_input)
        profile = result.raw_data['profile']
        primary = profile.primary_type
        
        print(f"🌟 Identified Type: {primary.number} - {primary.name}")
        print(f"📊 Confidence: {profile.assessment_confidence:.0%}")
        print(f"🎭 Keywords: {', '.join(primary.keywords)}")
        print(f"🎯 Basic Proposition: {primary.basic_proposition}")
        
        if profile.integration_direction:
            print(f"⬆️ Integration Path: {result.raw_data['integration_path']}")
        
        if profile.disintegration_direction:
            print(f"⬇️ Stress Pattern: Move away from Type {profile.disintegration_direction.direction} behaviors")
        
        print(f"\n💫 Career Guidance: Focus on roles that allow {primary.core_motivation.lower()}")
        
    except Exception as e:
        print(f"❌ Intuitive demo failed: {e}")
        return
    
    # Demo 4: Comprehensive Type 8 Analysis
    print("\n💪 DEMO 4: Comprehensive Type 8 Analysis")
    print("─" * 40)
    print("Scenario: Deep dive into The Challenger personality")
    
    type8_input = EnneagramInput(
        identification_method="self_select",
        selected_type=8,
        include_wings=True,
        include_instincts=True,
        include_arrows=True,
        focus_area="spirituality"
    )
    
    try:
        result = enneagram_engine.calculate(type8_input)
        profile = result.raw_data['profile']
        primary = profile.primary_type
        
        print(f"🌟 Type: {primary.number} - {primary.name}")
        print(f"🏛️ Center: {profile.center.name} - {profile.center.description}")
        print(f"💫 Core Motivation: {primary.core_motivation}")
        print(f"🎯 Trap: {primary.trap}")
        
        # Show levels of development
        if primary.levels_of_development:
            print(f"\n📊 Levels of Development:")
            healthy = primary.levels_of_development.get("healthy", {})
            if healthy:
                print(f"   🟢 Healthy: {list(healthy.values())[0]}")
            
            average = primary.levels_of_development.get("average", {})
            if average:
                print(f"   🟡 Average: {list(average.values())[0]}")
            
            unhealthy = primary.levels_of_development.get("unhealthy", {})
            if unhealthy:
                print(f"   🔴 Unhealthy: {list(unhealthy.values())[0]}")
        
        if profile.instinctual_variant:
            print(f"\n🧬 Instinctual Focus: {profile.instinctual_variant.description}")
        
        print(f"\n⚡ Field Resonance: {len(result.raw_data['field_resonance'])} archetypal patterns")
        
    except Exception as e:
        print(f"❌ Type 8 demo failed: {e}")
        return
    
    # Demo 5: Formatted Output
    print("\n📜 DEMO 5: Formatted Output Sample")
    print("─" * 40)
    
    try:
        formatted = result.formatted_output
        print("✅ Formatted analysis generated")
        print(f"📝 Output length: {len(formatted)} characters")
        print(f"\n📋 Sample output:")
        print("─" * 30)
        print(formatted[:400] + "..." if len(formatted) > 400 else formatted)
        
    except Exception as e:
        print(f"❌ Formatted output demo failed: {e}")
        return
    
    # Summary
    print("\n🌈 PHASE 5 SUMMARY")
    print("─" * 40)
    print("🎭 Enneagram Resonator Capabilities:")
    print("   ✅ Three identification methods (assessment, self-select, intuitive)")
    print("   ✅ Complete 9-type system with wings and arrows")
    print("   ✅ Instinctual variants and centers analysis")
    print("   ✅ Growth guidance and development levels")
    print("   ✅ Focus area customization (growth, relationships, career, spirituality)")
    print("   ✅ Archetypal field resonance analysis")
    
    print(f"\n🔮 Psychological Pattern Recognition:")
    print(f"   🧠 Deep personality structure analysis")
    print(f"   🎯 Core motivations and fears identification")
    print(f"   🌱 Personalized growth pathways")
    print(f"   ⚡ Integration with WitnessOS consciousness framework")
    
    print("\n" + "=" * 60)
    print("🎉 Phase 5 Demo Complete!")
    print("🧠 Enneagram Resonator is fully operational")
    print("🎭 Psychological pattern analysis ready for consciousness exploration")
    print("=" * 60)


if __name__ == "__main__":
    demo_phase5_engines()
