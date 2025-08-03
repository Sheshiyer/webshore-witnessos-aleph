"""
Abstract base engine interface for WitnessOS Divination Engines

Defines the common interface that all engines must implement, ensuring
consistency across different divination systems while allowing for
specialized functionality.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type
import logging
from datetime import datetime

from .data_models import (
    BaseEngineInput, 
    BaseEngineOutput, 
    EngineError,
    start_timer,
    end_timer,
    create_field_signature
)


class BaseEngine(ABC):
    """
    Abstract base class for all WitnessOS divination engines.
    
    This class defines the common interface and shared functionality
    that all engines must implement.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the engine with optional configuration.
        
        Args:
            config: Optional configuration dictionary
        """
        self.config = config or {}
        self.logger = logging.getLogger(f"witnessOS.engines.{self.engine_name}")
        self._setup_logging()
        
        # Engine metadata
        self._version = "1.0.0"
        self._last_calculation_time = None
        self._total_calculations = 0
        
        # Initialize engine-specific setup
        self._initialize()
    
    @property
    @abstractmethod
    def engine_name(self) -> str:
        """Return the unique name of this engine."""
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        """Return a description of what this engine does."""
        pass
    
    @property
    @abstractmethod
    def input_model(self) -> Type[BaseEngineInput]:
        """Return the Pydantic model for this engine's input."""
        pass
    
    @property
    @abstractmethod
    def output_model(self) -> Type[BaseEngineOutput]:
        """Return the Pydantic model for this engine's output."""
        pass
    
    @abstractmethod
    def _calculate(self, validated_input: BaseEngineInput) -> Dict[str, Any]:
        """
        Perform the core calculation logic.
        
        This method should contain the engine-specific calculation logic.
        It receives validated input and should return raw calculation results.
        
        Args:
            validated_input: Validated input data
            
        Returns:
            Dictionary containing raw calculation results
        """
        pass
    
    @abstractmethod
    def _interpret(self, calculation_results: Dict[str, Any], input_data: BaseEngineInput) -> str:
        """
        Interpret calculation results into human-readable format.
        
        Args:
            calculation_results: Raw calculation results from _calculate()
            input_data: Original input data for context
            
        Returns:
            Human-readable interpretation string
        """
        pass
    
    def _initialize(self):
        """
        Engine-specific initialization logic.
        
        Override this method to perform any setup required by the specific engine,
        such as loading data files, initializing libraries, etc.
        """
        pass
    
    def _setup_logging(self):
        """Set up logging for this engine."""
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                f'%(asctime)s - {self.engine_name} - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
    
    def _validate_input(self, input_data: Any) -> BaseEngineInput:
        """
        Validate input data using the engine's input model.
        
        Args:
            input_data: Raw input data (dict, BaseEngineInput, or other)
            
        Returns:
            Validated input data
            
        Raises:
            EngineError: If validation fails
        """
        try:
            if isinstance(input_data, dict):
                return self.input_model(**input_data)
            elif isinstance(input_data, BaseEngineInput):
                return input_data
            else:
                # Try to convert to dict first
                if hasattr(input_data, '__dict__'):
                    return self.input_model(**input_data.__dict__)
                else:
                    raise EngineError(f"Cannot convert input type {type(input_data)} to {self.input_model}")
        except Exception as e:
            raise EngineError(f"Input validation failed for {self.engine_name}: {str(e)}")
    
    def _generate_recommendations(self, calculation_results: Dict[str, Any], input_data: BaseEngineInput) -> List[str]:
        """
        Generate actionable recommendations based on calculation results.
        
        Override this method to provide engine-specific recommendations.
        
        Args:
            calculation_results: Raw calculation results
            input_data: Original input data
            
        Returns:
            List of recommendation strings
        """
        return ["Reflect on the insights provided", "Consider how this applies to your current situation"]
    
    def _generate_reality_patches(self, calculation_results: Dict[str, Any], input_data: BaseEngineInput) -> List[str]:
        """
        Generate WitnessOS reality patches based on calculation results.
        
        Override this method to provide engine-specific reality patches.
        
        Args:
            calculation_results: Raw calculation results
            input_data: Original input data
            
        Returns:
            List of reality patch suggestions
        """
        return []
    
    def _identify_archetypal_themes(self, calculation_results: Dict[str, Any], input_data: BaseEngineInput) -> List[str]:
        """
        Identify archetypal themes in the calculation results.
        
        Override this method to provide engine-specific archetypal analysis.
        
        Args:
            calculation_results: Raw calculation results
            input_data: Original input data
            
        Returns:
            List of archetypal theme strings
        """
        return []
    
    def _calculate_confidence(self, calculation_results: Dict[str, Any], input_data: BaseEngineInput) -> float:
        """
        Calculate confidence score for the results.
        
        Override this method to provide engine-specific confidence calculation.
        
        Args:
            calculation_results: Raw calculation results
            input_data: Original input data
            
        Returns:
            Confidence score between 0.0 and 1.0
        """
        return 1.0  # Default to full confidence
    
    def calculate(self, input_data: Any) -> BaseEngineOutput:
        """
        Main calculation method that orchestrates the entire process.
        
        This method handles validation, timing, calculation, interpretation,
        and output formatting.
        
        Args:
            input_data: Input data (various formats accepted)
            
        Returns:
            Formatted engine output
            
        Raises:
            EngineError: If calculation fails
        """
        start_time = start_timer()
        
        try:
            # Validate input
            validated_input = self._validate_input(input_data)
            
            self.logger.info(f"Starting calculation for {self.engine_name}")
            
            # Perform calculation
            calculation_results = self._calculate(validated_input)
            
            # Generate interpretation
            interpretation = self._interpret(calculation_results, validated_input)
            
            # Generate additional insights
            recommendations = self._generate_recommendations(calculation_results, validated_input)
            reality_patches = self._generate_reality_patches(calculation_results, validated_input)
            archetypal_themes = self._identify_archetypal_themes(calculation_results, validated_input)
            
            # Calculate confidence
            confidence = self._calculate_confidence(calculation_results, validated_input)
            
            # Calculate timing
            calculation_time = end_timer(start_time)
            
            # Generate field signature
            field_signature = create_field_signature(
                self.engine_name,
                str(validated_input),
                datetime.now().isoformat()
            )
            
            # Create output
            output = self.output_model(
                engine_name=self.engine_name,
                calculation_time=calculation_time,
                confidence_score=confidence,
                raw_data=calculation_results,
                formatted_output=interpretation,
                recommendations=recommendations,
                field_signature=field_signature,
                reality_patches=reality_patches,
                archetypal_themes=archetypal_themes
            )
            
            # Update engine statistics
            self._last_calculation_time = calculation_time
            self._total_calculations += 1
            
            self.logger.info(f"Calculation completed in {calculation_time:.4f}s")
            
            return output
            
        except Exception as e:
            calculation_time = end_timer(start_time)
            self.logger.error(f"Calculation failed after {calculation_time:.4f}s: {str(e)}")
            raise EngineError(f"Calculation failed for {self.engine_name}: {str(e)}")
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get engine statistics.
        
        Returns:
            Dictionary containing engine statistics
        """
        return {
            "engine_name": self.engine_name,
            "version": self._version,
            "total_calculations": self._total_calculations,
            "last_calculation_time": self._last_calculation_time,
            "config": self.config
        }
    
    def __str__(self) -> str:
        """String representation of the engine."""
        return f"{self.engine_name} Engine (v{self._version})"
    
    def __repr__(self) -> str:
        """Detailed string representation of the engine."""
        return f"<{self.__class__.__name__}(name='{self.engine_name}', calculations={self._total_calculations})>"
