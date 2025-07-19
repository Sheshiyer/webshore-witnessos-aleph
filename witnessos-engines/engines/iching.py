"""
I-Ching Mutation Oracle Engine for WitnessOS

Provides I-Ching hexagram readings using traditional divination methods.
Supports coin toss, yarrow stalk, and random generation with changing lines.
"""

from datetime import datetime
from typing import Dict, List, Any, Type, Optional

from shared.base.engine_interface import BaseEngine
from shared.base.data_models import BaseEngineInput, BaseEngineOutput
from shared.base.utils import load_json_data
from shared.calculations.divination import DivinationCalculator
from .iching_models import (
    IChingInput, IChingOutput, Hexagram, HexagramLine, IChingReading, 
    IChingData, Trigram
)


class IChingMutationOracle(BaseEngine):
    """
    I-Ching Mutation Oracle Engine
    
    Performs I-Ching hexagram readings using traditional divination methods
    with support for changing lines and mutation hexagrams.
    """
    
    def __init__(self):
        super().__init__()
        self.iching_data: Optional[IChingData] = None
        self.divination_calc = DivinationCalculator()
        self._load_iching_data()
    
    @property
    def engine_name(self) -> str:
        return "I-Ching Mutation Oracle"
    
    @property
    def description(self) -> str:
        return "Performs I-Ching hexagram readings using traditional divination methods with changing lines and mutation analysis"
    
    @property
    def input_model(self) -> Type[BaseEngineInput]:
        return IChingInput
    
    @property
    def output_model(self) -> Type[BaseEngineOutput]:
        return IChingOutput
    
    def _load_iching_data(self) -> None:
        """Load I-Ching hexagram data from JSON files."""
        try:
            iching_json = load_json_data("iching", "hexagrams.json")
            self.iching_data = IChingData(**iching_json)
            self.logger.info("Loaded I-Ching hexagram data")
        except Exception as e:
            self.logger.error(f"Failed to load I-Ching data: {e}")
            raise
    
    def _get_hexagram_by_number(self, number: int) -> Hexagram:
        """Get hexagram by its number."""
        # Ensure number is within valid range
        if number < 1 or number > 64:
            number = ((number - 1) % 64) + 1

        # If hexagram doesn't exist in data, use a fallback
        if str(number) not in self.iching_data.hexagrams:
            # Use hexagram 1 (The Creative) as fallback
            number = 1

        hex_data = self.iching_data.hexagrams[str(number)]
        return Hexagram(**hex_data)
    
    def _lines_to_hexagram_number(self, lines: List[int]) -> int:
        """Convert line values to hexagram number using King Wen sequence."""
        # Convert lines to binary (odd = 1, even = 0)
        binary_lines = [1 if line % 2 == 1 else 0 for line in lines]
        
        # Create binary string (bottom line first, so reverse for standard binary)
        binary_string = ''.join(str(bit) for bit in reversed(binary_lines))
        
        # Convert to decimal and map to hexagram number
        decimal_value = int(binary_string, 2)
        
        # Simple mapping - in a full implementation, this would use the proper King Wen sequence
        return (decimal_value % 64) + 1
    
    def _create_hexagram_lines(self, line_values: List[int]) -> List[HexagramLine]:
        """Create HexagramLine objects from line values."""
        lines = []
        
        for i, value in enumerate(line_values):
            line_type = "yang" if value % 2 == 1 else "yin"
            changing = value in [6, 9]  # Old Yin or Old Yang
            
            line = HexagramLine(
                position=i + 1,  # 1-based indexing
                value=value,
                type=line_type,
                changing=changing
            )
            lines.append(line)
        
        return lines
    
    def _generate_hexagram_lines(self, method: str, question: str = "") -> List[int]:
        """Generate six lines for a hexagram using the specified method."""
        if question:
            # Use question-based seeding for reproducible results
            seed = self.divination_calc.create_question_seed(question)
            temp_calc = DivinationCalculator(seed)
            return temp_calc.generate_hexagram_lines(method)
        else:
            return self.divination_calc.generate_hexagram_lines(method)
    
    def _create_mutation_hexagram(self, original_lines: List[int]) -> List[int]:
        """Create mutation hexagram by changing the changing lines."""
        mutated = original_lines.copy()
        
        for i, line in enumerate(mutated):
            if line == 6:  # Old Yin becomes Young Yang
                mutated[i] = 7
            elif line == 9:  # Old Yang becomes Young Yin
                mutated[i] = 8
        
        return mutated
    
    def _interpret_changing_lines(self, hexagram: Hexagram, changing_positions: List[int]) -> List[str]:
        """Interpret the changing lines for the hexagram."""
        interpretations = []
        
        for position in changing_positions:
            if str(position) in hexagram.changing_lines:
                line_text = hexagram.changing_lines[str(position)]
                interpretations.append(f"Line {position}: {line_text}")
            else:
                interpretations.append(f"Line {position}: Transformation and change at this level")
        
        return interpretations
    
    def _generate_overall_interpretation(self, reading: IChingReading, question: str) -> str:
        """Generate overall interpretation of the reading."""
        interpretation = f"Primary Hexagram: {reading.primary_hexagram.name}\n\n"
        interpretation += f"Core Meaning: {reading.primary_hexagram.meaning}\n\n"
        interpretation += f"Judgment: {reading.primary_hexagram.judgment}\n\n"
        interpretation += f"Image: {reading.primary_hexagram.image}\n\n"
        interpretation += f"Divination: {reading.primary_hexagram.divination}\n\n"
        
        if reading.changing_lines:
            interpretation += f"Changing Lines (positions {', '.join(map(str, reading.changing_lines))}):\n"
            changing_interpretations = self._interpret_changing_lines(
                reading.primary_hexagram, 
                reading.changing_lines
            )
            for line_interp in changing_interpretations:
                interpretation += f"  {line_interp}\n"
            interpretation += "\n"
            
            if reading.mutation_hexagram:
                interpretation += f"Mutation Hexagram: {reading.mutation_hexagram.name}\n"
                interpretation += f"Future Tendency: {reading.mutation_hexagram.divination}\n\n"
        
        interpretation += f"Guidance for your question about '{question}': "
        interpretation += "The I-Ching suggests careful consideration of the present moment "
        interpretation += "while remaining open to the natural flow of change."
        
        return interpretation
    
    def _calculate(self, validated_input: IChingInput) -> Dict[str, Any]:
        """Process the I-Ching reading calculation."""
        
        # Generate hexagram lines
        line_values = self._generate_hexagram_lines(
            validated_input.method, 
            validated_input.question or ""
        )
        
        # Create primary hexagram
        primary_number = self._lines_to_hexagram_number(line_values)
        primary_hexagram = self._get_hexagram_by_number(primary_number)
        primary_lines = self._create_hexagram_lines(line_values)
        
        # Identify changing lines
        changing_lines = [i + 1 for i, line in enumerate(line_values) if line in [6, 9]]
        
        # Create mutation hexagram if there are changing lines
        mutation_hexagram = None
        mutation_lines = None
        
        if changing_lines:
            mutation_line_values = self._create_mutation_hexagram(line_values)
            mutation_number = self._lines_to_hexagram_number(mutation_line_values)
            mutation_hexagram = self._get_hexagram_by_number(mutation_number)
            mutation_lines = self._create_hexagram_lines(mutation_line_values)
        
        # Create reading object
        reading = IChingReading(
            primary_hexagram=primary_hexagram,
            primary_lines=primary_lines,
            mutation_hexagram=mutation_hexagram,
            mutation_lines=mutation_lines,
            changing_lines=changing_lines,
            method_used=validated_input.method
        )
        
        # Generate interpretation
        overall_interpretation = self._generate_overall_interpretation(
            reading, 
            validated_input.question or "General guidance"
        )
        
        # Create guidance and insights
        key_insights = [
            f"The {primary_hexagram.name} hexagram emphasizes {', '.join(primary_hexagram.keywords[:3])}",
            f"Method used: {validated_input.method} divination",
        ]
        
        if changing_lines:
            key_insights.append(f"Changing lines at positions {', '.join(map(str, changing_lines))} indicate transformation")
        
        if mutation_hexagram:
            key_insights.append(f"Evolution toward {mutation_hexagram.name} suggests future development")
        
        # Calculate archetypal resonance
        symbols = [primary_hexagram.name]
        if mutation_hexagram:
            symbols.append(mutation_hexagram.name)
        
        field_resonance = self.divination_calc.calculate_archetypal_resonance(
            symbols, 
            {"question": validated_input.question}
        )
        
        return {
            "reading": reading,
            "question_asked": validated_input.question or "General guidance",
            "reading_timestamp": datetime.now(),
            "method_used": validated_input.method,
            "overall_interpretation": overall_interpretation,
            "key_insights": key_insights,
            "guidance_summary": f"The I-Ching reveals {primary_hexagram.name}, guiding you to embrace {', '.join(primary_hexagram.keywords[:2])}.",
            "changing_line_count": len(changing_lines),
            "has_mutation": mutation_hexagram is not None,
            "trigram_elements": [
                self.iching_data.trigrams[primary_hexagram.trigrams[0]]["element"],
                self.iching_data.trigrams[primary_hexagram.trigrams[1]]["element"]
            ],
            "field_resonance": field_resonance,
            "field_signature": "iching_hexagram_guidance"
        }
    
    def _interpret(self, calculation_results: Dict[str, Any], input_data: IChingInput) -> str:
        """Interpret calculation results into human-readable format."""
        
        reading = calculation_results["reading"]
        
        interpretation = f"☯️ I-Ching Reading for: {calculation_results['question_asked']}\n\n"
        interpretation += f"🔮 Method: {calculation_results['method_used'].title()} divination ({input_data.method})\n"
        interpretation += f"🕐 Reading Time: {calculation_results['reading_timestamp'].strftime('%Y-%m-%d %H:%M')}\n\n"
        
        interpretation += f"📿 Primary Hexagram #{reading.primary_hexagram.number}: {reading.primary_hexagram.name}\n"
        interpretation += f"🈳 Chinese: {reading.primary_hexagram.chinese}\n"
        interpretation += f"🔺 Trigrams: {' over '.join(reading.primary_hexagram.trigrams)}\n"
        interpretation += f"🏷️ Keywords: {', '.join(reading.primary_hexagram.keywords)}\n\n"
        
        interpretation += f"⚖️ Judgment: {reading.primary_hexagram.judgment}\n\n"
        interpretation += f"🖼️ Image: {reading.primary_hexagram.image}\n\n"
        interpretation += f"🎯 Divination: {reading.primary_hexagram.divination}\n\n"
        
        if reading.changing_lines:
            interpretation += f"🔄 Changing Lines: {', '.join(map(str, reading.changing_lines))}\n"
            if reading.mutation_hexagram:
                interpretation += f"🦋 Mutation to: {reading.mutation_hexagram.name}\n"
                interpretation += f"🔮 Future Tendency: {reading.mutation_hexagram.divination}\n\n"
        
        interpretation += f"💫 Overall Guidance: {calculation_results['guidance_summary']}\n"
        interpretation += f"🌟 Elements in Play: {', '.join(calculation_results['trigram_elements'])}\n"
        
        return interpretation


# Export the engine class
__all__ = ["IChingMutationOracle"]
