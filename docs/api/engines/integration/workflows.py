"""
Workflow Manager - Predefined Multi-Engine Workflows

Provides common workflow patterns for different types of readings
and consciousness analysis scenarios.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, date
import logging

try:
    from .orchestrator import EngineOrchestrator
    from .synthesis import ResultSynthesizer
except ImportError:
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from orchestrator import EngineOrchestrator
    from synthesis import ResultSynthesizer


class WorkflowManager:
    """
    Manages predefined workflows for common reading scenarios
    """
    
    def __init__(self):
        self.orchestrator = EngineOrchestrator()
        self.synthesizer = ResultSynthesizer()
        self.logger = logging.getLogger(__name__)
        
        # Define workflow templates
        self.workflows = {
            'complete_natal': self._complete_natal_workflow,
            'relationship_compatibility': self._relationship_compatibility_workflow,
            'career_guidance': self._career_guidance_workflow,
            'spiritual_development': self._spiritual_development_workflow,
            'life_transition': self._life_transition_workflow,
            'daily_guidance': self._daily_guidance_workflow,
            'shadow_work': self._shadow_work_workflow,
            'manifestation_timing': self._manifestation_timing_workflow
        }
    
    def run_workflow(self, workflow_name: str, input_data: Dict, 
                    options: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Run a predefined workflow
        
        Args:
            workflow_name: Name of the workflow to run
            input_data: Input data for the workflow
            options: Optional workflow customization options
        """
        if workflow_name not in self.workflows:
            raise ValueError(f"Unknown workflow: {workflow_name}")
        
        self.logger.info(f"Starting workflow: {workflow_name}")
        
        # Run the workflow
        workflow_func = self.workflows[workflow_name]
        results = workflow_func(input_data, options or {})
        
        # Synthesize results
        synthesis = self.synthesizer.synthesize_reading(results['engine_results'])
        
        # Combine workflow results with synthesis
        final_result = {
            'workflow_name': workflow_name,
            'timestamp': datetime.now().isoformat(),
            'input_data': input_data,
            'options': options,
            'engine_results': results['engine_results'],
            'synthesis': synthesis,
            'workflow_insights': results.get('workflow_insights', {}),
            'recommendations': results.get('recommendations', [])
        }
        
        self.logger.info(f"Completed workflow: {workflow_name}")
        return final_result
    
    def _complete_natal_workflow(self, input_data: Dict, options: Dict) -> Dict[str, Any]:
        """
        Complete natal chart analysis using all available engines
        """
        birth_data = input_data
        
        # Define engines for complete natal reading
        engines = ['numerology', 'biorhythm', 'human_design', 'vimshottari', 'gene_keys']
        
        # Add divination engines if requested
        if options.get('include_divination', True):
            engines.extend(['tarot', 'iching'])
        
        # Run engines
        engine_results = self.orchestrator.create_comprehensive_reading(birth_data, engines)
        
        # Workflow-specific insights
        workflow_insights = {
            'natal_themes': self._extract_natal_themes(engine_results['results']),
            'life_purpose_synthesis': self._synthesize_life_purpose(engine_results['results']),
            'personality_integration': self._analyze_personality_integration(engine_results['results'])
        }
        
        recommendations = self._generate_natal_recommendations(engine_results['results'])
        
        return {
            'engine_results': engine_results['results'],
            'workflow_insights': workflow_insights,
            'recommendations': recommendations
        }
    
    def _relationship_compatibility_workflow(self, input_data: Dict, options: Dict) -> Dict[str, Any]:
        """
        Relationship compatibility analysis for two people
        """
        person1_data = input_data['person1']
        person2_data = input_data['person2']
        
        # Run engines for both people
        person1_results = self.orchestrator.create_comprehensive_reading(
            person1_data, ['numerology', 'biorhythm', 'human_design', 'gene_keys']
        )
        person2_results = self.orchestrator.create_comprehensive_reading(
            person2_data, ['numerology', 'biorhythm', 'human_design', 'gene_keys']
        )
        
        # Compatibility analysis
        compatibility = self._analyze_compatibility(
            person1_results['results'], 
            person2_results['results']
        )
        
        workflow_insights = {
            'compatibility_score': compatibility['overall_score'],
            'strengths': compatibility['strengths'],
            'challenges': compatibility['challenges'],
            'growth_opportunities': compatibility['growth_opportunities']
        }
        
        recommendations = self._generate_relationship_recommendations(compatibility)
        
        # Combine results
        combined_results = {
            'person1': person1_results['results'],
            'person2': person2_results['results'],
            'compatibility': compatibility
        }
        
        return {
            'engine_results': combined_results,
            'workflow_insights': workflow_insights,
            'recommendations': recommendations
        }
    
    def _career_guidance_workflow(self, input_data: Dict, options: Dict) -> Dict[str, Any]:
        """
        Career and life purpose guidance workflow
        """
        birth_data = input_data
        
        # Focus on engines that provide career insights
        engines = ['numerology', 'human_design', 'gene_keys', 'vimshottari']
        
        engine_results = self.orchestrator.create_comprehensive_reading(birth_data, engines)
        
        # Career-specific analysis
        career_analysis = self._analyze_career_potential(engine_results['results'])
        
        workflow_insights = {
            'career_themes': career_analysis['themes'],
            'natural_talents': career_analysis['talents'],
            'optimal_work_environment': career_analysis['environment'],
            'timing_considerations': career_analysis['timing']
        }
        
        recommendations = self._generate_career_recommendations(career_analysis)
        
        return {
            'engine_results': engine_results['results'],
            'workflow_insights': workflow_insights,
            'recommendations': recommendations
        }
    
    def _spiritual_development_workflow(self, input_data: Dict, options: Dict) -> Dict[str, Any]:
        """
        Spiritual development and consciousness evolution workflow
        """
        birth_data = input_data
        
        # Focus on spiritual/consciousness engines
        engines = ['gene_keys', 'human_design', 'iching', 'vimshottari']
        
        # Add sacred geometry if available
        if 'sacred_geometry' in self.orchestrator.get_available_engines():
            engines.append('sacred_geometry')
        
        engine_results = self.orchestrator.create_comprehensive_reading(birth_data, engines)
        
        # Spiritual development analysis
        spiritual_analysis = self._analyze_spiritual_path(engine_results['results'])
        
        workflow_insights = {
            'current_evolutionary_stage': spiritual_analysis['stage'],
            'shadow_work_areas': spiritual_analysis['shadow_areas'],
            'gift_activation_potential': spiritual_analysis['gifts'],
            'spiritual_practices': spiritual_analysis['practices']
        }
        
        recommendations = self._generate_spiritual_recommendations(spiritual_analysis)
        
        return {
            'engine_results': engine_results['results'],
            'workflow_insights': workflow_insights,
            'recommendations': recommendations
        }
    
    def _life_transition_workflow(self, input_data: Dict, options: Dict) -> Dict[str, Any]:
        """
        Life transition guidance workflow
        """
        birth_data = input_data
        transition_type = options.get('transition_type', 'general')
        
        # Focus on timing and transition engines
        engines = ['biorhythm', 'vimshottari', 'tarot', 'iching']
        
        engine_results = self.orchestrator.create_comprehensive_reading(birth_data, engines)
        
        # Transition-specific analysis
        transition_analysis = self._analyze_transition_timing(
            engine_results['results'], 
            transition_type
        )
        
        workflow_insights = {
            'transition_timing': transition_analysis['timing'],
            'supportive_energies': transition_analysis['support'],
            'potential_challenges': transition_analysis['challenges'],
            'optimal_strategies': transition_analysis['strategies']
        }
        
        recommendations = self._generate_transition_recommendations(transition_analysis)
        
        return {
            'engine_results': engine_results['results'],
            'workflow_insights': workflow_insights,
            'recommendations': recommendations
        }
    
    def _daily_guidance_workflow(self, input_data: Dict, options: Dict) -> Dict[str, Any]:
        """
        Daily guidance and energy optimization workflow
        """
        birth_data = input_data
        target_date = options.get('target_date', date.today())
        
        # Focus on daily/cyclical engines
        engines = ['biorhythm', 'numerology']
        
        # Add divination for daily guidance
        if options.get('include_divination', True):
            engines.extend(['tarot', 'iching'])
        
        engine_results = self.orchestrator.create_comprehensive_reading(birth_data, engines)
        
        # Daily guidance analysis
        daily_analysis = self._analyze_daily_energies(engine_results['results'], target_date)
        
        workflow_insights = {
            'energy_forecast': daily_analysis['forecast'],
            'optimal_activities': daily_analysis['activities'],
            'timing_recommendations': daily_analysis['timing'],
            'awareness_points': daily_analysis['awareness']
        }
        
        recommendations = self._generate_daily_recommendations(daily_analysis)
        
        return {
            'engine_results': engine_results['results'],
            'workflow_insights': workflow_insights,
            'recommendations': recommendations
        }
    
    def _shadow_work_workflow(self, input_data: Dict, options: Dict) -> Dict[str, Any]:
        """
        Shadow work and integration workflow
        """
        birth_data = input_data
        
        # Focus on engines that reveal shadow aspects
        engines = ['gene_keys', 'human_design', 'enneagram']
        
        # Add divination for shadow exploration
        engines.extend(['tarot', 'iching'])
        
        engine_results = self.orchestrator.create_comprehensive_reading(birth_data, engines)
        
        # Shadow work analysis
        shadow_analysis = self._analyze_shadow_patterns(engine_results['results'])
        
        workflow_insights = {
            'shadow_themes': shadow_analysis['themes'],
            'integration_opportunities': shadow_analysis['integration'],
            'gift_potential': shadow_analysis['gifts'],
            'healing_pathways': shadow_analysis['healing']
        }
        
        recommendations = self._generate_shadow_work_recommendations(shadow_analysis)
        
        return {
            'engine_results': engine_results['results'],
            'workflow_insights': workflow_insights,
            'recommendations': recommendations
        }
    
    def _manifestation_timing_workflow(self, input_data: Dict, options: Dict) -> Dict[str, Any]:
        """
        Manifestation timing and energy alignment workflow
        """
        birth_data = input_data
        intention = options.get('intention', '')
        
        # Focus on timing and energy engines
        engines = ['biorhythm', 'vimshottari', 'numerology']
        
        # Add sacred geometry for manifestation support
        if 'sacred_geometry' in self.orchestrator.get_available_engines():
            engines.append('sacred_geometry')
        
        engine_results = self.orchestrator.create_comprehensive_reading(birth_data, engines)
        
        # Manifestation timing analysis
        timing_analysis = self._analyze_manifestation_timing(
            engine_results['results'], 
            intention
        )
        
        workflow_insights = {
            'optimal_timing': timing_analysis['timing'],
            'energy_alignment': timing_analysis['alignment'],
            'supportive_practices': timing_analysis['practices'],
            'manifestation_strategy': timing_analysis['strategy']
        }
        
        recommendations = self._generate_manifestation_recommendations(timing_analysis)
        
        return {
            'engine_results': engine_results['results'],
            'workflow_insights': workflow_insights,
            'recommendations': recommendations
        }
    
    def get_available_workflows(self) -> List[str]:
        """Get list of available workflows"""
        return list(self.workflows.keys())
    
    def get_workflow_description(self, workflow_name: str) -> str:
        """Get description of a specific workflow"""
        descriptions = {
            'complete_natal': 'Comprehensive natal chart analysis using all engines',
            'relationship_compatibility': 'Two-person compatibility analysis',
            'career_guidance': 'Career and life purpose guidance',
            'spiritual_development': 'Spiritual evolution and consciousness development',
            'life_transition': 'Guidance for major life transitions',
            'daily_guidance': 'Daily energy optimization and guidance',
            'shadow_work': 'Shadow integration and healing work',
            'manifestation_timing': 'Optimal timing for manifestation and goal achievement'
        }
        return descriptions.get(workflow_name, 'No description available')
    
    # Simplified helper methods (would be fully implemented)
    def _extract_natal_themes(self, results: Dict) -> List[str]:
        return ['Life purpose', 'Personality integration', 'Karmic patterns']
    
    def _synthesize_life_purpose(self, results: Dict) -> str:
        return 'Integrated life purpose synthesis'
    
    def _analyze_personality_integration(self, results: Dict) -> Dict:
        return {'integration_level': 'High', 'areas_for_growth': []}
    
    def _generate_natal_recommendations(self, results: Dict) -> List[str]:
        return ['Focus on personal development', 'Explore creative expression']
    
    def _analyze_compatibility(self, person1: Dict, person2: Dict) -> Dict:
        return {
            'overall_score': 0.75,
            'strengths': ['Communication', 'Shared values'],
            'challenges': ['Different life rhythms'],
            'growth_opportunities': ['Mutual learning']
        }
    
    def _generate_relationship_recommendations(self, compatibility: Dict) -> List[str]:
        return ['Practice active listening', 'Honor different rhythms']
    
    def _analyze_career_potential(self, results: Dict) -> Dict:
        return {
            'themes': ['Leadership', 'Communication'],
            'talents': ['Strategic thinking', 'Empathy'],
            'environment': 'Collaborative team setting',
            'timing': 'Current period favorable for career growth'
        }
    
    def _generate_career_recommendations(self, analysis: Dict) -> List[str]:
        return ['Develop leadership skills', 'Seek mentorship opportunities']
    
    def _analyze_spiritual_path(self, results: Dict) -> Dict:
        return {
            'stage': 'Integration phase',
            'shadow_areas': ['Control patterns'],
            'gifts': ['Intuitive wisdom'],
            'practices': ['Meditation', 'Shadow work']
        }
    
    def _generate_spiritual_recommendations(self, analysis: Dict) -> List[str]:
        return ['Daily meditation practice', 'Work with shadow aspects']
    
    def _analyze_transition_timing(self, results: Dict, transition_type: str) -> Dict:
        return {
            'timing': 'Favorable for next 3 months',
            'support': ['Strong intuitive guidance'],
            'challenges': ['Resistance to change'],
            'strategies': ['Gradual implementation']
        }
    
    def _generate_transition_recommendations(self, analysis: Dict) -> List[str]:
        return ['Take gradual steps', 'Trust intuitive guidance']
    
    def _analyze_daily_energies(self, results: Dict, target_date: date) -> Dict:
        return {
            'forecast': 'High creative energy',
            'activities': ['Creative projects', 'Communication'],
            'timing': 'Morning hours most productive',
            'awareness': ['Avoid overcommitment']
        }
    
    def _generate_daily_recommendations(self, analysis: Dict) -> List[str]:
        return ['Focus on creative work in morning', 'Schedule rest periods']
    
    def _analyze_shadow_patterns(self, results: Dict) -> Dict:
        return {
            'themes': ['Control', 'Perfectionism'],
            'integration': ['Self-compassion practices'],
            'gifts': ['Attention to detail', 'High standards'],
            'healing': ['Inner child work']
        }
    
    def _generate_shadow_work_recommendations(self, analysis: Dict) -> List[str]:
        return ['Practice self-compassion', 'Explore inner child healing']
    
    def _analyze_manifestation_timing(self, results: Dict, intention: str) -> Dict:
        return {
            'timing': 'Next new moon cycle optimal',
            'alignment': 'Strong energy alignment present',
            'practices': ['Visualization', 'Gratitude'],
            'strategy': 'Focus on feeling states'
        }
    
    def _generate_manifestation_recommendations(self, analysis: Dict) -> List[str]:
        return ['Begin manifestation work at new moon', 'Focus on feeling states']
