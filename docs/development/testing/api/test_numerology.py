"""
Comprehensive tests for the Numerology Field Extractor engine

Tests the numerology calculations, interpretations, and engine functionality
to ensure accuracy and reliability.
"""

import pytest
from datetime import date
from typing import Dict, Any

from ENGINES.calculations.numerology import NumerologyCalculator, quick_life_path, quick_expression, quick_profile
from ENGINES.engines.numerology import NumerologyEngine
from ENGINES.engines.numerology_models import NumerologyInput, NumerologyOutput


class TestNumerologyCalculator:
    """Test the core numerology calculation module."""

    def test_pythagorean_system(self):
        """Test Pythagorean numerology calculations."""
        calc = NumerologyCalculator("pythagorean")

        # Test known calculations
        # J(1) + O(6) + H(8) + N(5) = 20 -> 2+0 = 2
        assert calc.calculate_from_text("JOHN") == 2
        # D(4) + O(6) + E(5) = 15 -> 1+5 = 6
        assert calc.calculate_from_text("DOE") == 6

    def test_chaldean_system(self):
        """Test Chaldean numerology calculations."""
        calc = NumerologyCalculator("chaldean")

        # Test that Chaldean gives different results than Pythagorean
        pythagorean_calc = NumerologyCalculator("pythagorean")

        # Most names should give different results between systems
        name = "ALEXANDER"
        chaldean_result = calc.calculate_from_text(name)
        pythagorean_result = pythagorean_calc.calculate_from_text(name)

        # They might occasionally be the same, but usually different
        # Just test that both systems work without error
        assert isinstance(chaldean_result, int)
        assert isinstance(pythagorean_result, int)
        assert 1 <= chaldean_result <= 33
        assert 1 <= pythagorean_result <= 33

    def test_life_path_calculation(self):
        """Test Life Path number calculation."""
        calc = NumerologyCalculator("pythagorean")

        # Test known birth date: May 15, 1990
        # 05/15/1990 -> 0+5+1+5+1+9+9+0 = 30 -> 3+0 = 3
        birth_date = date(1990, 5, 15)
        assert calc.calculate_life_path(birth_date) == 3

        # Test master number preservation
        # Need a date that adds up to 11, 22, or 33
        # Let's try: 11/29/1992 -> 1+1+2+9+1+9+9+2 = 34 -> 3+4 = 7
        birth_date2 = date(1992, 11, 29)
        result = calc.calculate_life_path(birth_date2)
        assert isinstance(result, int)

    def test_master_numbers(self):
        """Test master number preservation."""
        calc = NumerologyCalculator("pythagorean")

        # Test that master numbers are preserved when keep_master=True
        assert calc.calculate_from_text("ABCDEFGHIJK", keep_master=True) in range(1, 34)  # Should be valid

        # Test specific master number scenarios
        # We need text that adds up to exactly 11, 22, or 33
        # This is tricky to construct, so let's test the reduction function directly
        from ENGINES.base.utils import reduce_to_single_digit

        assert reduce_to_single_digit(11, keep_master=True) == 11
        assert reduce_to_single_digit(22, keep_master=True) == 22
        assert reduce_to_single_digit(33, keep_master=True) == 33
        assert reduce_to_single_digit(11, keep_master=False) == 2

    def test_complete_profile(self):
        """Test complete numerology profile calculation."""
        calc = NumerologyCalculator("pythagorean")

        profile = calc.calculate_complete_profile("John Doe", date(1990, 5, 15))

        # Check that all expected keys are present
        expected_keys = [
            "system", "core_numbers", "maturity", "personal_year",
            "bridge_numbers", "master_numbers", "karmic_debt",
            "name_analysis", "birth_date", "calculation_year"
        ]

        for key in expected_keys:
            assert key in profile

        # Check core numbers structure
        core = profile["core_numbers"]
        assert "life_path" in core
        assert "expression" in core
        assert "soul_urge" in core
        assert "personality" in core

        # Check that all core numbers are valid
        for number in core.values():
            assert isinstance(number, int)
            assert 1 <= number <= 33

    def test_personal_year_calculation(self):
        """Test personal year calculation."""
        calc = NumerologyCalculator("pythagorean")

        birth_date = date(1990, 5, 15)
        personal_year = calc.calculate_personal_year(birth_date, 2024)

        # Personal year should be between 1-9 (no master numbers)
        assert isinstance(personal_year, int)
        assert 1 <= personal_year <= 9

    def test_quick_functions(self):
        """Test convenience functions."""
        birth_date = date(1990, 5, 15)

        # Test quick functions don't crash
        life_path = quick_life_path(birth_date)
        expression = quick_expression("John Doe")
        profile = quick_profile("John Doe", birth_date)

        assert isinstance(life_path, int)
        assert isinstance(expression, int)
        assert isinstance(profile, dict)


class TestNumerologyModels:
    """Test the Pydantic data models."""

    def test_numerology_input_validation(self):
        """Test NumerologyInput validation."""
        # Valid input
        valid_input = NumerologyInput(
            full_name="John Doe",
            birth_date=date(1990, 5, 15),
            system="pythagorean"
        )
        assert valid_input.full_name == "John Doe"
        assert valid_input.system == "pythagorean"

        # Test name validation
        with pytest.raises(ValueError):
            NumerologyInput(
                full_name="",  # Empty name
                birth_date=date(1990, 5, 15)
            )

        with pytest.raises(ValueError):
            NumerologyInput(
                full_name="123",  # No letters
                birth_date=date(1990, 5, 15)
            )

        # Test system validation
        with pytest.raises(ValueError):
            NumerologyInput(
                full_name="John Doe",
                birth_date=date(1990, 5, 15),
                system="invalid_system"
            )

        # Test birth date validation
        with pytest.raises(ValueError):
            NumerologyInput(
                full_name="John Doe",
                birth_date=date(2030, 1, 1)  # Future date
            )

    def test_numerology_output_structure(self):
        """Test NumerologyOutput structure."""
        # Create a sample output
        output = NumerologyOutput(
            engine_name="numerology",
            calculation_time=0.1,
            formatted_output="Test output",
            life_path=7,
            expression=3,
            soul_urge=5,
            personality=8,
            maturity=1,
            personal_year=4,
            life_expression_bridge=4,
            soul_personality_bridge=3,
            numerology_system="pythagorean",
            calculation_year=2024
        )

        assert output.life_path == 7
        assert output.numerology_system == "pythagorean"
        assert output.engine_name == "numerology"


class TestNumerologyEngine:
    """Test the complete Numerology engine."""

    def test_engine_creation(self):
        """Test engine initialization."""
        engine = NumerologyEngine()

        assert engine.engine_name == "numerology"
        assert "numerology" in engine.description.lower()
        assert engine.input_model == NumerologyInput
        assert engine.output_model == NumerologyOutput

    def test_engine_calculation(self):
        """Test complete engine calculation workflow."""
        engine = NumerologyEngine()

        # Test with valid input
        input_data = {
            "full_name": "John Doe",
            "birth_date": date(1990, 5, 15),
            "system": "pythagorean"
        }

        result = engine.calculate(input_data)

        # Check result structure
        assert isinstance(result, NumerologyOutput)
        assert result.engine_name == "numerology"
        assert result.calculation_time > 0
        assert result.life_path > 0
        assert result.expression > 0
        assert result.soul_urge > 0
        assert result.personality > 0

        # Check that interpretation was generated
        assert len(result.formatted_output) > 100  # Should be substantial
        assert "NUMEROLOGY FIELD EXTRACTION" in result.formatted_output
        assert "JOHN DOE" in result.formatted_output

        # Check recommendations
        assert len(result.recommendations) > 0
        assert all(isinstance(rec, str) for rec in result.recommendations)

        # Check reality patches
        assert len(result.reality_patches) > 0
        assert any("numerological" in patch.lower() for patch in result.reality_patches)

        # Check archetypal themes
        assert len(result.archetypal_themes) > 0

    def test_engine_with_preferred_name(self):
        """Test engine with preferred name analysis."""
        engine = NumerologyEngine()

        input_data = {
            "full_name": "Jonathan Michael Smith",
            "preferred_name": "Jon Smith",
            "birth_date": date(1985, 3, 20),
            "system": "pythagorean"
        }

        result = engine.calculate(input_data)

        # Should have additional analysis for preferred name
        assert "preferred_name_analysis" in result.raw_data
        preferred = result.raw_data["preferred_name_analysis"]
        assert "expression" in preferred
        assert "soul_urge" in preferred
        assert "personality" in preferred

    def test_chaldean_system(self):
        """Test engine with Chaldean system."""
        engine = NumerologyEngine()

        input_data = {
            "full_name": "John Doe",
            "birth_date": date(1990, 5, 15),
            "system": "chaldean"
        }

        result = engine.calculate(input_data)

        assert result.numerology_system == "chaldean"
        assert result.raw_data["system"] == "chaldean"

    def test_master_number_handling(self):
        """Test handling of master numbers."""
        engine = NumerologyEngine()

        # We need a name that produces master numbers
        # This is hard to predict, so let's test the interpretation logic

        # Create mock calculation results with master numbers
        mock_results = {
            "system": "pythagorean",
            "core_numbers": {"life_path": 11, "expression": 22, "soul_urge": 5, "personality": 8},
            "maturity": 6,
            "personal_year": 3,
            "bridge_numbers": {"life_expression_bridge": 11, "soul_personality_bridge": 3},
            "master_numbers": [11, 22],
            "karmic_debt": [],
            "name_analysis": {"full_name": "Test Name", "letters_only": "TestName", "vowels": "EAE", "consonants": "TSTNM", "total_letters": 8},
            "birth_date": "1990-05-15",
            "calculation_year": 2024
        }

        input_data = NumerologyInput(full_name="Test Name", birth_date=date(1990, 5, 15))

        # Test interpretation with master numbers
        interpretation = engine._interpret(mock_results, input_data)

        assert "Master Number Activation" in interpretation
        assert "11, 22" in interpretation

    def test_confidence_calculation(self):
        """Test confidence score calculation."""
        engine = NumerologyEngine()

        # Test with normal input
        normal_input = NumerologyInput(full_name="John Doe", birth_date=date(1990, 5, 15))
        normal_results = {"name_analysis": {"letters_only": "JohnDoe"}}
        confidence = engine._calculate_confidence(normal_results, normal_input)

        assert 0.8 <= confidence <= 1.0

        # Test with very short name (should reduce confidence)
        short_input = NumerologyInput(full_name="Jo", birth_date=date(1990, 5, 15))
        short_results = {"name_analysis": {"letters_only": "Jo"}}
        short_confidence = engine._calculate_confidence(short_results, short_input)

        assert short_confidence < confidence

    def test_archetypal_themes(self):
        """Test archetypal theme identification."""
        engine = NumerologyEngine()

        mock_results = {
            "core_numbers": {"life_path": 7},
            "master_numbers": [11]
        }

        input_data = NumerologyInput(full_name="Test", birth_date=date(1990, 5, 15))
        themes = engine._identify_archetypal_themes(mock_results, input_data)

        # Should include Life Path 7 themes
        assert "Seeker" in themes or "Mystic" in themes or "Analyst" in themes

        # Should include master number theme
        assert "Spiritual Messenger" in themes


if __name__ == "__main__":
    # Run tests if executed directly
    pytest.main([__file__, "-v"])
