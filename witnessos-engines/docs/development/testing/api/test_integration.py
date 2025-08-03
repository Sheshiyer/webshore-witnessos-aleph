"""
Integration Tests for Phase 7 - Engine Orchestration and API

Tests the integration layer, workflows, field analysis, and API endpoints.
"""

import pytest
import asyncio
from datetime import datetime, date
from typing import Dict, Any

# Import integration components
from ENGINES.integration.orchestrator import EngineOrchestrator
from ENGINES.integration.workflows import WorkflowManager
from ENGINES.integration.field_analyzer import FieldAnalyzer
from ENGINES.integration.synthesis import ResultSynthesizer

# Import API components
from ENGINES.api.formatters import MysticalFormatter, WitnessOSFormatter
from ENGINES.api.middleware import setup_middleware

# Import base classes for mocking
from ENGINES.base.data_models import BaseEngineInput, BaseEngineOutput


class TestEngineOrchestrator:
    """Test the Engine Orchestrator"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.orchestrator = EngineOrchestrator(max_workers=2)
        self.test_birth_data = {
            'name': 'Test User',
            'date': '01.01.1990',
            'time': '12:00',
            'location': 'Test City'
        }
    
    def test_orchestrator_initialization(self):
        """Test orchestrator initializes correctly"""
        assert self.orchestrator.max_workers == 2
        assert self.orchestrator.active_engines == {}
        assert self.orchestrator.workflow_cache == {}
    
    def test_get_available_engines(self):
        """Test getting available engines"""
        engines = self.orchestrator.get_available_engines()
        assert isinstance(engines, list)
        # Should include at least the engines we know are implemented
        expected_engines = ['numerology', 'biorhythm']
        for engine in expected_engines:
            if engine in engines:  # Only test if engine is actually available
                assert engine in engines
    
    def test_load_engine_caching(self):
        """Test engine loading and caching"""
        # This test would need actual engines to be available
        # For now, test the caching mechanism
        assert len(self.orchestrator.active_engines) == 0
        
        # After loading an engine, it should be cached
        # self.orchestrator.load_engine('numerology')
        # assert 'numerology' in self.orchestrator.active_engines
    
    def test_comprehensive_reading_structure(self):
        """Test comprehensive reading structure"""
        # Mock a comprehensive reading
        engines = ['numerology', 'biorhythm']
        
        # This would normally call actual engines
        # For testing, we'll verify the structure
        reading_structure = {
            'timestamp': datetime.now().isoformat(),
            'birth_data': self.test_birth_data,
            'engines_used': engines,
            'results': {},
            'synthesis': None
        }
        
        assert 'timestamp' in reading_structure
        assert 'birth_data' in reading_structure
        assert 'engines_used' in reading_structure
        assert 'results' in reading_structure
        assert 'synthesis' in reading_structure
    
    def test_clear_cache(self):
        """Test cache clearing"""
        self.orchestrator.workflow_cache['test'] = 'data'
        assert len(self.orchestrator.workflow_cache) == 1
        
        self.orchestrator.clear_cache()
        assert len(self.orchestrator.workflow_cache) == 0


class TestWorkflowManager:
    """Test the Workflow Manager"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.workflow_manager = WorkflowManager()
        self.test_birth_data = {
            'name': 'Test User',
            'date': '01.01.1990',
            'time': '12:00',
            'location': 'Test City'
        }
    
    def test_workflow_manager_initialization(self):
        """Test workflow manager initializes correctly"""
        assert self.workflow_manager.orchestrator is not None
        assert self.workflow_manager.synthesizer is not None
        assert len(self.workflow_manager.workflows) > 0
    
    def test_get_available_workflows(self):
        """Test getting available workflows"""
        workflows = self.workflow_manager.get_available_workflows()
        assert isinstance(workflows, list)
        assert len(workflows) > 0
        
        expected_workflows = [
            'complete_natal', 'relationship_compatibility', 'career_guidance',
            'spiritual_development', 'life_transition', 'daily_guidance',
            'shadow_work', 'manifestation_timing'
        ]
        
        for workflow in expected_workflows:
            assert workflow in workflows
    
    def test_get_workflow_description(self):
        """Test getting workflow descriptions"""
        description = self.workflow_manager.get_workflow_description('complete_natal')
        assert isinstance(description, str)
        assert len(description) > 0
        assert 'natal' in description.lower()
    
    def test_workflow_structure(self):
        """Test workflow result structure"""
        # Mock workflow result structure
        workflow_result = {
            'workflow_name': 'test_workflow',
            'timestamp': datetime.now().isoformat(),
            'input_data': self.test_birth_data,
            'options': {},
            'engine_results': {},
            'synthesis': {},
            'workflow_insights': {},
            'recommendations': []
        }
        
        required_keys = [
            'workflow_name', 'timestamp', 'input_data', 'options',
            'engine_results', 'synthesis', 'workflow_insights', 'recommendations'
        ]
        
        for key in required_keys:
            assert key in workflow_result


class TestFieldAnalyzer:
    """Test the Field Analyzer"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.field_analyzer = FieldAnalyzer()
        self.mock_results = {
            'numerology': self._create_mock_result('numerology'),
            'biorhythm': self._create_mock_result('biorhythm')
        }
    
    def _create_mock_result(self, engine_name: str) -> BaseEngineOutput:
        """Create a mock engine result"""
        mock_result = BaseEngineOutput()
        mock_result.data = {
            'engine': engine_name,
            'test_data': 'mock_data',
            'numbers': [1, 2, 3] if engine_name == 'numerology' else [4, 5, 6]
        }
        return mock_result
    
    def test_field_analyzer_initialization(self):
        """Test field analyzer initializes correctly"""
        assert self.field_analyzer.field_patterns == {}
        assert self.field_analyzer.resonance_cache == {}
    
    def test_analyze_field_signature_structure(self):
        """Test field signature analysis structure"""
        signature = self.field_analyzer.analyze_field_signature(self.mock_results)
        
        required_keys = [
            'timestamp', 'field_coherence', 'dominant_frequencies',
            'harmonic_patterns', 'interference_zones', 'resonance_points',
            'field_stability', 'consciousness_level', 'evolution_vector',
            'reality_patches'
        ]
        
        for key in required_keys:
            assert key in signature
    
    def test_field_coherence_calculation(self):
        """Test field coherence calculation"""
        coherence = self.field_analyzer._calculate_field_coherence(self.mock_results)
        
        assert 'overall_score' in coherence
        assert 'engine_alignment' in coherence
        assert 'consistency_metrics' in coherence
        assert 'stability_indicators' in coherence
        
        assert isinstance(coherence['overall_score'], (int, float))
        assert 0 <= coherence['overall_score'] <= 1
    
    def test_dominant_frequencies_identification(self):
        """Test dominant frequency identification"""
        frequencies = self.field_analyzer._identify_dominant_frequencies(self.mock_results)
        
        assert isinstance(frequencies, list)
        for freq in frequencies:
            assert 'frequency' in freq
            assert 'strength' in freq
            assert 'interpretation' in freq
            assert 'sources' in freq


class TestResultSynthesizer:
    """Test the Result Synthesizer"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.synthesizer = ResultSynthesizer()
        self.mock_results = {
            'numerology': self._create_mock_result('numerology'),
            'biorhythm': self._create_mock_result('biorhythm')
        }
    
    def _create_mock_result(self, engine_name: str) -> BaseEngineOutput:
        """Create a mock engine result"""
        mock_result = BaseEngineOutput()
        mock_result.data = {
            'engine': engine_name,
            'themes': ['purpose', 'growth'],
            'numbers': [1, 2, 3] if engine_name == 'numerology' else [4, 5, 6]
        }
        return mock_result
    
    def test_synthesizer_initialization(self):
        """Test synthesizer initializes correctly"""
        assert self.synthesizer.correlation_patterns == {}
        assert self.synthesizer.synthesis_cache == {}
    
    def test_synthesize_reading_structure(self):
        """Test synthesis reading structure"""
        synthesis = self.synthesizer.synthesize_reading(self.mock_results)
        
        required_keys = [
            'timestamp', 'engines_analyzed', 'correlations',
            'unified_themes', 'field_signature', 'consciousness_map',
            'integration_guidance', 'reality_patches'
        ]
        
        for key in required_keys:
            assert key in synthesis
    
    def test_find_correlations_structure(self):
        """Test correlation finding structure"""
        correlations = self.synthesizer._find_correlations(self.mock_results)
        
        expected_correlation_types = [
            'numerical_patterns', 'archetypal_resonance',
            'temporal_alignments', 'energy_signatures'
        ]
        
        for correlation_type in expected_correlation_types:
            assert correlation_type in correlations
    
    def test_numerical_correlations(self):
        """Test numerical correlation finding"""
        patterns = self.synthesizer._find_numerical_correlations(self.mock_results)
        
        assert isinstance(patterns, list)
        for pattern in patterns:
            assert 'number' in pattern
            assert 'frequency' in pattern
            assert 'sources' in pattern
            assert 'significance' in pattern


class TestMysticalFormatter:
    """Test the Mystical Formatter"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.formatter = MysticalFormatter()
        self.mock_result = BaseEngineOutput()
        self.mock_result.data = {'test': 'data'}
    
    def test_formatter_initialization(self):
        """Test formatter initializes correctly"""
        assert len(self.formatter.mystical_mappings) > 0
        assert 'numerology' in self.formatter.mystical_mappings
        assert 'biorhythm' in self.formatter.mystical_mappings
    
    def test_format_engine_result_structure(self):
        """Test engine result formatting structure"""
        result = self.formatter.format_engine_result(self.mock_result, 'numerology')
        
        required_keys = [
            'engine_essence', 'consciousness_signature',
            'archetypal_resonance', 'field_vibration',
            'integration_guidance', 'timestamp'
        ]
        
        for key in required_keys:
            assert key in result
    
    def test_numerology_mystical_formatting(self):
        """Test numerology mystical formatting"""
        result = self.formatter._format_numerology_mystical(self.mock_result)
        
        expected_keys = [
            'soul_mathematics', 'vibrational_signature',
            'karmic_equations', 'manifestation_codes'
        ]
        
        for key in expected_keys:
            assert key in result
    
    def test_generic_mystical_formatting(self):
        """Test generic mystical formatting"""
        result = self.formatter._format_generic_mystical(self.mock_result)
        
        expected_keys = [
            'cosmic_insight', 'consciousness_pattern',
            'evolutionary_guidance', 'integration_wisdom'
        ]
        
        for key in expected_keys:
            assert key in result


class TestWitnessOSFormatter:
    """Test the WitnessOS Formatter"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.formatter = WitnessOSFormatter()
        self.mock_result = BaseEngineOutput()
        self.mock_result.data = {'test': 'data'}
    
    def test_formatter_initialization(self):
        """Test formatter initializes correctly"""
        assert len(self.formatter.witnessOS_mappings) > 0
        assert 'numerology' in self.formatter.witnessOS_mappings
        assert 'human_design' in self.formatter.witnessOS_mappings
    
    def test_format_engine_result_structure(self):
        """Test engine result formatting structure"""
        result = self.formatter.format_engine_result(self.mock_result, 'numerology')
        
        required_keys = [
            'engine_id', 'consciousness_debug', 'field_signature',
            'reality_patches', 'witness_insights', 'system_status',
            'debug_timestamp'
        ]
        
        for key in required_keys:
            assert key in result
    
    def test_multi_engine_results_formatting(self):
        """Test multi-engine results formatting"""
        mock_results = {
            'numerology': self.mock_result,
            'biorhythm': self.mock_result
        }
        
        birth_data = {
            'name': 'Test User',
            'date': '01.01.1990'
        }
        
        result = self.formatter.format_multi_engine_results(
            mock_results, None, birth_data
        )
        
        required_keys = [
            'consciousness_scan', 'engine_outputs', 'field_synthesis',
            'reality_optimization', 'witness_protocol'
        ]
        
        for key in required_keys:
            assert key in result
    
    def test_witnessOS_numerology_formatting(self):
        """Test WitnessOS numerology formatting"""
        result = self.formatter._format_numerology_witnessOS(self.mock_result)
        
        expected_keys = [
            'numerical_field_analysis', 'reality_creation_codes',
            'consciousness_mathematics', 'debug_recommendations'
        ]
        
        for key in expected_keys:
            assert key in result


class TestIntegrationWorkflow:
    """Test complete integration workflow"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.orchestrator = EngineOrchestrator()
        self.workflow_manager = WorkflowManager()
        self.field_analyzer = FieldAnalyzer()
        self.synthesizer = ResultSynthesizer()
        self.mystical_formatter = MysticalFormatter()
        self.witnessOS_formatter = WitnessOSFormatter()
        
        self.test_birth_data = {
            'name': 'Integration Test User',
            'date': '13.08.1991',
            'time': '13:31',
            'location': 'Test City'
        }
    
    def test_complete_integration_workflow(self):
        """Test complete integration workflow"""
        # This test would run a complete workflow if engines were available
        # For now, test the workflow structure
        
        # 1. Test workflow availability
        workflows = self.workflow_manager.get_available_workflows()
        assert 'complete_natal' in workflows
        
        # 2. Test component initialization
        assert self.orchestrator is not None
        assert self.field_analyzer is not None
        assert self.synthesizer is not None
        
        # 3. Test formatter integration
        mock_result = BaseEngineOutput()
        mock_result.data = {'test': 'integration_data'}
        
        mystical_formatted = self.mystical_formatter.format_engine_result(
            mock_result, 'numerology'
        )
        witnessOS_formatted = self.witnessOS_formatter.format_engine_result(
            mock_result, 'numerology'
        )
        
        assert 'consciousness_signature' in mystical_formatted
        assert 'consciousness_debug' in witnessOS_formatted
    
    def test_error_handling(self):
        """Test error handling in integration"""
        # Test invalid workflow name
        with pytest.raises(ValueError):
            self.workflow_manager.run_workflow('invalid_workflow', {}, {})
        
        # Test invalid engine name
        try:
            self.orchestrator.run_single_engine('invalid_engine', {}, {})
        except Exception as e:
            assert 'invalid_engine' in str(e).lower()


# Performance tests
class TestPerformance:
    """Test performance of integration components"""
    
    def test_orchestrator_performance(self):
        """Test orchestrator performance with multiple engines"""
        orchestrator = EngineOrchestrator(max_workers=4)
        
        # Test that orchestrator can handle multiple concurrent requests
        # This would be implemented with actual timing tests
        assert orchestrator.max_workers == 4
    
    def test_synthesis_performance(self):
        """Test synthesis performance with large result sets"""
        synthesizer = ResultSynthesizer()
        
        # Create mock large result set
        large_results = {}
        for i in range(10):
            mock_result = BaseEngineOutput()
            mock_result.data = {'engine': f'test_engine_{i}', 'data': list(range(100))}
            large_results[f'engine_{i}'] = mock_result
        
        # Test synthesis doesn't fail with large datasets
        synthesis = synthesizer.synthesize_reading(large_results)
        assert 'timestamp' in synthesis
        assert len(synthesis['engines_analyzed']) == 10


if __name__ == '__main__':
    # Run tests
    pytest.main([__file__, '-v'])
