"""
Engine Orchestrator - Multi-Engine Workflow System

Coordinates multiple divination engines to create comprehensive readings
and consciousness field analysis.
"""

import asyncio
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    from ..base.engine_interface import BaseEngine
    from ..base.data_models import BaseEngineInput, BaseEngineOutput, EngineError
    from .. import get_engine, list_engines
except ImportError:
    # Fallback for direct execution
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from base.engine_interface import BaseEngine
    from base.data_models import BaseEngineInput, BaseEngineOutput, EngineError

    def get_engine(name):
        return None

    def list_engines():
        return ['numerology', 'biorhythm', 'human_design', 'vimshottari', 'gene_keys', 'tarot', 'iching']


class EngineOrchestrator:
    """
    Orchestrates multiple engines for complex divination workflows
    """
    
    def __init__(self, max_workers: int = 4):
        """Initialize the orchestrator with thread pool for parallel execution"""
        self.max_workers = max_workers
        self.logger = logging.getLogger(__name__)
        self.active_engines = {}
        self.workflow_cache = {}
        
    def load_engine(self, engine_name: str, config: Optional[Dict] = None) -> BaseEngine:
        """Load and cache an engine instance"""
        if engine_name not in self.active_engines:
            try:
                engine_class = get_engine(engine_name)
                self.active_engines[engine_name] = engine_class(config)
                self.logger.info(f"Loaded engine: {engine_name}")
            except Exception as e:
                raise EngineError(f"Failed to load engine {engine_name}: {str(e)}")
        
        return self.active_engines[engine_name]
    
    def run_single_engine(self, engine_name: str, input_data: BaseEngineInput, 
                         config: Optional[Dict] = None) -> BaseEngineOutput:
        """Run a single engine with input data"""
        engine = self.load_engine(engine_name, config)
        return engine.process(input_data)
    
    def run_parallel_engines(self, engine_configs: List[Dict]) -> Dict[str, BaseEngineOutput]:
        """
        Run multiple engines in parallel
        
        Args:
            engine_configs: List of dicts with 'name', 'input', and optional 'config'
        """
        results = {}
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all engine tasks
            future_to_engine = {}
            for config in engine_configs:
                engine_name = config['name']
                input_data = config['input']
                engine_config = config.get('config')
                
                future = executor.submit(
                    self.run_single_engine, 
                    engine_name, 
                    input_data, 
                    engine_config
                )
                future_to_engine[future] = engine_name
            
            # Collect results as they complete
            for future in as_completed(future_to_engine):
                engine_name = future_to_engine[future]
                try:
                    result = future.result()
                    results[engine_name] = result
                    self.logger.info(f"Completed engine: {engine_name}")
                except Exception as e:
                    self.logger.error(f"Engine {engine_name} failed: {str(e)}")
                    results[engine_name] = EngineError(f"Engine failed: {str(e)}")
        
        return results
    
    def run_sequential_engines(self, engine_configs: List[Dict]) -> Dict[str, BaseEngineOutput]:
        """
        Run engines sequentially, allowing later engines to use earlier results
        """
        results = {}
        
        for config in engine_configs:
            engine_name = config['name']
            input_data = config['input']
            engine_config = config.get('config')
            
            # Allow input to reference previous results
            if hasattr(input_data, 'previous_results'):
                input_data.previous_results = results
            
            try:
                result = self.run_single_engine(engine_name, input_data, engine_config)
                results[engine_name] = result
                self.logger.info(f"Completed sequential engine: {engine_name}")
            except Exception as e:
                self.logger.error(f"Sequential engine {engine_name} failed: {str(e)}")
                results[engine_name] = EngineError(f"Engine failed: {str(e)}")
                # Continue with other engines even if one fails
        
        return results
    
    def create_comprehensive_reading(self, birth_data: Dict, 
                                   engines: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Create a comprehensive reading using multiple engines
        
        Args:
            birth_data: Birth information (date, time, location, name)
            engines: List of engine names to use (default: all available)
        """
        if engines is None:
            engines = ['numerology', 'biorhythm', 'human_design', 'vimshottari', 
                      'gene_keys', 'tarot', 'iching']
        
        # Prepare engine configurations
        engine_configs = []
        
        for engine_name in engines:
            if engine_name in ['numerology', 'biorhythm']:
                # These engines need basic birth data
                input_data = self._prepare_basic_input(birth_data, engine_name)
            elif engine_name in ['human_design', 'vimshottari']:
                # These need astronomical calculations
                input_data = self._prepare_astro_input(birth_data, engine_name)
            elif engine_name in ['gene_keys']:
                # Gene Keys uses Human Design foundation
                input_data = self._prepare_gene_keys_input(birth_data)
            elif engine_name in ['tarot', 'iching']:
                # Divination engines need intention/question
                input_data = self._prepare_divination_input(birth_data, engine_name)
            else:
                continue
            
            engine_configs.append({
                'name': engine_name,
                'input': input_data
            })
        
        # Run engines in parallel for independent calculations
        results = self.run_parallel_engines(engine_configs)
        
        # Add metadata
        reading = {
            'timestamp': datetime.now().isoformat(),
            'birth_data': birth_data,
            'engines_used': engines,
            'results': results,
            'synthesis': None  # Will be filled by ResultSynthesizer
        }
        
        return reading
    
    def _prepare_basic_input(self, birth_data: Dict, engine_name: str) -> BaseEngineInput:
        """Prepare input for basic engines (numerology, biorhythm)"""
        # This would be implemented based on each engine's input model
        # For now, return a placeholder
        return BaseEngineInput()
    
    def _prepare_astro_input(self, birth_data: Dict, engine_name: str) -> BaseEngineInput:
        """Prepare input for astronomical engines"""
        # This would be implemented based on each engine's input model
        return BaseEngineInput()
    
    def _prepare_gene_keys_input(self, birth_data: Dict) -> BaseEngineInput:
        """Prepare input for Gene Keys engine"""
        return BaseEngineInput()
    
    def _prepare_divination_input(self, birth_data: Dict, engine_name: str) -> BaseEngineInput:
        """Prepare input for divination engines"""
        return BaseEngineInput()
    
    def get_available_engines(self) -> List[str]:
        """Get list of available engines"""
        return list_engines()
    
    def clear_cache(self):
        """Clear workflow cache"""
        self.workflow_cache.clear()
        self.logger.info("Workflow cache cleared")
