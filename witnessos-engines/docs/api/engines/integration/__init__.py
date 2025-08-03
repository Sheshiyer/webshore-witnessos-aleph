"""
WitnessOS Engine Integration Layer - Phase 7

Provides orchestration, synthesis, and workflow management for multiple engines.
Enables complex multi-engine readings and consciousness field analysis.
"""

from .orchestrator import EngineOrchestrator
from .synthesis import ResultSynthesizer
from .workflows import WorkflowManager
from .field_analyzer import FieldAnalyzer

__all__ = [
    "EngineOrchestrator",
    "ResultSynthesizer", 
    "WorkflowManager",
    "FieldAnalyzer"
]
