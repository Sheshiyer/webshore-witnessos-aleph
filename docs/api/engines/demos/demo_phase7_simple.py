"""
Phase 7 Simple Demo: Integration Components

Demonstrates the Phase 7 integration components without API dependencies.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date
import json

# Import integration components directly
from integration.orchestrator import EngineOrchestrator
from integration.workflows import WorkflowManager
from integration.field_analyzer import FieldAnalyzer
from integration.synthesis import ResultSynthesizer
from base.data_models import BaseEngineOutput


def create_mock_engine_result(engine_name: str, data: dict) -> BaseEngineOutput:
    """Create a mock engine result for demonstration"""
    result = BaseEngineOutput(
        engine_name=engine_name,
        calculation_time=0.123,
        formatted_output=f"{engine_name} calculation completed with mock data",
        raw_data=data,
        recommendations=[f"Follow {engine_name} guidance", "Integrate insights gradually"],
        archetypal_themes=["seeker", "teacher", "creator"]
    )
    return result


def demo_orchestrator():
    """Demo the orchestrator component"""
    print("🎯 ORCHESTRATOR DEMO")
    print("=" * 20)
    
    orchestrator = EngineOrchestrator(max_workers=2)
    print(f"✅ Orchestrator initialized with {orchestrator.max_workers} workers")
    
    available_engines = orchestrator.get_available_engines()
    print(f"📊 Available engines: {available_engines}")
    
    # Create mock results
    mock_results = {
        'numerology': create_mock_engine_result('numerology', {
            'life_path': 7,
            'expression': 11,
            'themes': ['spiritual_seeker', 'master_teacher']
        }),
        'biorhythm': create_mock_engine_result('biorhythm', {
            'physical_cycle': 0.85,
            'emotional_cycle': 0.23,
            'optimal_periods': ['morning', 'late_evening']
        })
    }
    
    print(f"✅ Mock results created for {len(mock_results)} engines")
    return mock_results


def demo_workflows():
    """Demo the workflow manager"""
    print("\n🌊 WORKFLOW MANAGER DEMO")
    print("=" * 25)
    
    workflow_manager = WorkflowManager()
    
    workflows = workflow_manager.get_available_workflows()
    print(f"📋 Available workflows: {workflows}")
    
    for workflow in workflows[:3]:  # Show first 3
        description = workflow_manager.get_workflow_description(workflow)
        print(f"   - {workflow}: {description}")
    
    print(f"✅ Workflow manager operational with {len(workflows)} workflows")


def demo_field_analyzer(engine_results):
    """Demo the field analyzer"""
    print("\n🔮 FIELD ANALYZER DEMO")
    print("=" * 20)
    
    field_analyzer = FieldAnalyzer()
    
    print("🔍 Analyzing consciousness field...")
    field_signature = field_analyzer.analyze_field_signature(engine_results)
    
    print(f"✅ Field analysis completed")
    print(f"📊 Field coherence: {field_signature['field_coherence']['overall_score']:.2f}")
    print(f"🎵 Dominant frequencies: {len(field_signature['dominant_frequencies'])}")
    print(f"🧠 Consciousness level: {field_signature['consciousness_level']['primary_level']}")
    
    return field_signature


def demo_synthesizer(engine_results):
    """Demo the result synthesizer"""
    print("\n🔄 RESULT SYNTHESIZER DEMO")
    print("=" * 25)
    
    synthesizer = ResultSynthesizer()
    
    print("🧬 Synthesizing results...")
    synthesis = synthesizer.synthesize_reading(engine_results)
    
    print(f"✅ Synthesis completed")
    print(f"🔗 Correlations: {len(synthesis['correlations']['numerical_patterns'])}")
    print(f"🎭 Unified themes: {len(synthesis['unified_themes'])}")
    print(f"🔧 Reality patches: {len(synthesis['reality_patches'])}")
    
    return synthesis


def demo_integration_workflow():
    """Demo complete integration workflow"""
    print("\n🚀 COMPLETE INTEGRATION WORKFLOW")
    print("=" * 35)
    
    print("1. Initializing components...")
    orchestrator = EngineOrchestrator()
    workflow_manager = WorkflowManager()
    field_analyzer = FieldAnalyzer()
    synthesizer = ResultSynthesizer()
    
    print("2. Creating mock engine results...")
    engine_results = {
        'numerology': create_mock_engine_result('numerology', {
            'life_path': 7,
            'expression': 11,
            'soul_urge': 3,
            'themes': ['spiritual_seeker', 'master_teacher', 'creative_communicator']
        }),
        'biorhythm': create_mock_engine_result('biorhythm', {
            'physical_cycle': 0.85,
            'emotional_cycle': 0.23,
            'intellectual_cycle': -0.67,
            'optimal_periods': ['morning', 'late_evening']
        }),
        'human_design': create_mock_engine_result('human_design', {
            'type': 'Generator',
            'authority': 'Sacral',
            'profile': '2/4',
            'incarnation_cross': 'Right Angle Cross of Explanation'
        })
    }
    
    print("3. Analyzing field signature...")
    field_signature = field_analyzer.analyze_field_signature(engine_results)
    
    print("4. Synthesizing results...")
    synthesis = synthesizer.synthesize_reading(engine_results)
    
    print("5. Creating comprehensive reading...")
    comprehensive_reading = {
        'timestamp': datetime.now().isoformat(),
        'engines_used': list(engine_results.keys()),
        'engine_results': engine_results,
        'field_signature': field_signature,
        'synthesis': synthesis,
        'integration_status': 'COMPLETE'
    }
    
    print(f"✅ Integration workflow completed successfully!")
    print(f"📊 Engines processed: {len(engine_results)}")
    print(f"🔮 Field coherence: {field_signature['field_coherence']['overall_score']:.2f}")
    print(f"🧬 Synthesis correlations: {len(synthesis['correlations']['numerical_patterns'])}")
    
    return comprehensive_reading


def main():
    """Run the Phase 7 simple demo"""
    print("🚀 WITNESSOS PHASE 7 SIMPLE DEMO")
    print("=" * 40)
    print("Demonstrating integration components:")
    print("- Engine orchestration")
    print("- Workflow management")
    print("- Field analysis")
    print("- Result synthesis")
    print("=" * 40)
    
    try:
        # 1. Demo individual components
        engine_results = demo_orchestrator()
        demo_workflows()
        field_signature = demo_field_analyzer(engine_results)
        synthesis = demo_synthesizer(engine_results)
        
        # 2. Demo complete integration workflow
        comprehensive_reading = demo_integration_workflow()
        
        print("\n🎉 PHASE 7 SIMPLE DEMO COMPLETED!")
        print("=" * 35)
        print("✅ All integration components working")
        print("✅ Engine orchestration functional")
        print("✅ Workflow management operational")
        print("✅ Field analysis active")
        print("✅ Result synthesis working")
        print("✅ Complete integration workflow successful")
        
        # Save demo output
        demo_output = {
            'demo_timestamp': datetime.now().isoformat(),
            'demo_type': 'phase7_simple',
            'components_tested': [
                'orchestrator',
                'workflow_manager',
                'field_analyzer',
                'synthesizer'
            ],
            'status': 'SUCCESS',
            'field_coherence': field_signature['field_coherence']['overall_score'],
            'synthesis_correlations': len(synthesis['correlations']['numerical_patterns']),
            'engines_processed': len(engine_results)
        }
        
        output_file = 'demos/phase7_simple_output.json'
        with open(output_file, 'w') as f:
            json.dump(demo_output, f, indent=2, default=str)
        
        print(f"\n📄 Demo output saved to: {output_file}")
        print("\n🔮 WitnessOS Phase 7 integration layer is operational!")
        
    except Exception as e:
        print(f"❌ Demo error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
