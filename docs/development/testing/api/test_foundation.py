"""
Foundation tests for WitnessOS Divination Engines

Tests the base classes, data models, and utilities to ensure the foundation
is solid before building individual engines.
"""

import pytest
from datetime import date, time, datetime
from typing import Dict, Any

from ENGINES.base import (
    BaseEngine,
    BaseEngineInput,
    BaseEngineOutput,
    BirthDataInput,
    PersonalDataInput,
    QuestionInput,
    EngineError,
    ValidationError,
    parse_date_flexible,
    parse_time_flexible,
    reduce_to_single_digit,
    validate_coordinates,
    validate_name,
    extract_letters_only,
    extract_vowels,
    extract_consonants,
    SeededRandom
)


class TestEngine(BaseEngine):
    """Test engine implementation for testing the base class."""

    @property
    def engine_name(self) -> str:
        return "test_engine"

    @property
    def description(self) -> str:
        return "A test engine for validating the base architecture"

    @property
    def input_model(self):
        return BaseEngineInput

    @property
    def output_model(self):
        return BaseEngineOutput

    def _calculate(self, validated_input: BaseEngineInput) -> Dict[str, Any]:
        return {
            "test_value": 42,
            "input_received": str(validated_input)
        }

    def _interpret(self, calculation_results: Dict[str, Any], input_data: BaseEngineInput) -> str:
        return f"Test calculation completed with value: {calculation_results['test_value']}"


class TestBaseEngine:
    """Test the BaseEngine abstract class and its implementation."""

    def test_engine_creation(self):
        """Test that we can create a test engine."""
        engine = TestEngine()
        assert engine.engine_name == "test_engine"
        assert "test engine" in engine.description.lower()

    def test_engine_calculation(self):
        """Test the full calculation workflow."""
        engine = TestEngine()

        input_data = {"user_id": "test_user"}
        result = engine.calculate(input_data)

        assert isinstance(result, BaseEngineOutput)
        assert result.engine_name == "test_engine"
        assert result.calculation_time > 0
        assert "42" in result.formatted_output
        assert result.raw_data["test_value"] == 42

    def test_engine_stats(self):
        """Test engine statistics tracking."""
        engine = TestEngine()

        # Initial stats
        stats = engine.get_stats()
        assert stats["total_calculations"] == 0

        # After calculation
        engine.calculate({})
        stats = engine.get_stats()
        assert stats["total_calculations"] == 1
        assert stats["last_calculation_time"] is not None


class TestDataModels:
    """Test the Pydantic data models."""

    def test_base_engine_input(self):
        """Test BaseEngineInput validation."""
        # Valid input
        input_data = BaseEngineInput(user_id="test_user")
        assert input_data.user_id == "test_user"
        assert input_data.timestamp is not None

        # Input with extra fields should fail
        with pytest.raises(Exception):  # Pydantic validation error
            BaseEngineInput(user_id="test", invalid_field="should_fail")

    def test_birth_data_input(self):
        """Test BirthDataInput validation."""
        # Valid birth data
        birth_data = BirthDataInput(
            birth_date=date(1990, 5, 15),
            birth_time=time(14, 30),
            birth_location=(40.7128, -74.0060),  # NYC
            timezone="America/New_York"
        )
        assert birth_data.birth_date.year == 1990
        assert birth_data.birth_location[0] == 40.7128

        # Invalid coordinates
        with pytest.raises(ValueError):
            BirthDataInput(
                birth_date=date(1990, 5, 15),
                birth_location=(91.0, 0.0)  # Invalid latitude
            )

    def test_personal_data_input(self):
        """Test PersonalDataInput validation."""
        # Valid name
        personal_data = PersonalDataInput(full_name="John Doe")
        assert personal_data.full_name == "John Doe"

        # Empty name should fail
        with pytest.raises(ValueError):
            PersonalDataInput(full_name="")

    def test_question_input(self):
        """Test QuestionInput validation."""
        # Valid question
        question = QuestionInput(
            question="What should I focus on?",
            urgency="high"
        )
        assert question.urgency == "high"

        # Invalid urgency
        with pytest.raises(ValueError):
            QuestionInput(urgency="invalid_level")


class TestUtilities:
    """Test utility functions."""

    def test_date_parsing(self):
        """Test flexible date parsing."""
        # Various date formats
        assert parse_date_flexible("2023-05-15") == date(2023, 5, 15)
        assert parse_date_flexible("05/15/2023") == date(2023, 5, 15)
        assert parse_date_flexible("15/05/2023") == date(2023, 5, 15)
        assert parse_date_flexible(date(2023, 5, 15)) == date(2023, 5, 15)

        # Invalid date should fail
        with pytest.raises(ValueError):
            parse_date_flexible("invalid_date")

    def test_time_parsing(self):
        """Test flexible time parsing."""
        # Various time formats
        assert parse_time_flexible("14:30:00") == time(14, 30, 0)
        assert parse_time_flexible("2:30 PM") == time(14, 30, 0)
        assert parse_time_flexible("14:30") == time(14, 30, 0)
        assert parse_time_flexible(None) is None
        assert parse_time_flexible("invalid_time") is None

    def test_numerology_reduction(self):
        """Test numerology number reduction."""
        assert reduce_to_single_digit(123) == 6  # 1+2+3 = 6
        assert reduce_to_single_digit(456) == 6  # 4+5+6 = 15 -> 1+5 = 6
        assert reduce_to_single_digit(11, keep_master=True) == 11  # Master number
        assert reduce_to_single_digit(11, keep_master=False) == 2  # 1+1 = 2

    def test_coordinate_validation(self):
        """Test coordinate validation."""
        # Valid coordinates
        assert validate_coordinates(40.7128, -74.0060) is True

        # Invalid coordinates
        with pytest.raises(ValueError):
            validate_coordinates(91.0, 0.0)  # Invalid latitude

        with pytest.raises(ValueError):
            validate_coordinates(0.0, 181.0)  # Invalid longitude

    def test_name_validation(self):
        """Test name validation."""
        assert validate_name("John Doe") == "John Doe"
        assert validate_name("  John Doe  ") == "John Doe"  # Trimmed

        with pytest.raises(ValueError):
            validate_name("")

        with pytest.raises(ValueError):
            validate_name("   ")

    def test_text_extraction(self):
        """Test text extraction utilities."""
        text = "Hello World 123!"

        assert extract_letters_only(text) == "HelloWorld"
        assert extract_vowels(text) == "EOO"  # H-e-ll-o W-o-rld (e, o, o)
        assert extract_consonants(text) == "HLLWRLD"

    def test_seeded_random(self):
        """Test seeded random number generation."""
        # Same seed should produce same results
        rng1 = SeededRandom(seed=42)
        rng2 = SeededRandom(seed=42)

        choices = [1, 2, 3, 4, 5]
        assert rng1.choice(choices) == rng2.choice(choices)

        # Different seeds should produce different results (usually)
        rng3 = SeededRandom(seed=123)
        # Note: This might occasionally fail due to randomness, but very unlikely
        results_42 = [rng1.randint(1, 100) for _ in range(10)]
        results_123 = [rng3.randint(1, 100) for _ in range(10)]
        assert results_42 != results_123  # Very likely to be different


if __name__ == "__main__":
    # Run tests if executed directly
    pytest.main([__file__, "-v"])
