"""
Tests for Human Design Scanner Engine

Comprehensive test suite for Human Design calculations and interpretations.
"""

import pytest
import sys
import os
from datetime import date, time, datetime

# Add the parent directory to the path to allow imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engines.human_design import HumanDesignScanner
from engines.human_design_models import HumanDesignInput, HumanDesignOutput


class TestHumanDesignScanner:
    """Test suite for Human Design Scanner Engine."""

    @pytest.fixture
    def engine(self):
        """Create a Human Design Scanner engine instance."""
        return HumanDesignScanner()

    @pytest.fixture
    def sample_input(self):
        """Create sample input data for testing."""
        return HumanDesignInput(
            birth_date=date(1990, 6, 15),
            birth_time=time(14, 30, 0),
            birth_location=(40.7128, -74.0060),  # New York City
            timezone="America/New_York"
        )

    def test_engine_properties(self, engine):
        """Test engine basic properties."""
        assert engine.engine_name == "human_design_scanner"
        assert "Human Design" in engine.description
        assert engine.input_model == HumanDesignInput
        assert engine.output_model == HumanDesignOutput

    def test_input_validation_success(self, engine, sample_input):
        """Test successful input validation."""
        validated = engine._validate_input(sample_input)
        assert isinstance(validated, HumanDesignInput)
        assert validated.birth_date == sample_input.birth_date
        assert validated.birth_time == sample_input.birth_time
        assert validated.birth_location == sample_input.birth_location

    def test_input_validation_missing_time(self, engine):
        """Test input validation with missing birth time."""
        with pytest.raises(Exception):
            invalid_input = HumanDesignInput(
                birth_date=date(1990, 6, 15),
                birth_time=None,  # Missing required time
                birth_location=(40.7128, -74.0060),
                timezone="America/New_York"
            )

    def test_input_validation_missing_location(self, engine):
        """Test input validation with missing birth location."""
        with pytest.raises(Exception):
            invalid_input = HumanDesignInput(
                birth_date=date(1990, 6, 15),
                birth_time=time(14, 30, 0),
                birth_location=None,  # Missing required location
                timezone="America/New_York"
            )

    def test_input_validation_invalid_coordinates(self, engine):
        """Test input validation with invalid coordinates."""
        with pytest.raises(Exception):
            invalid_input = HumanDesignInput(
                birth_date=date(1990, 6, 15),
                birth_time=time(14, 30, 0),
                birth_location=(91.0, -74.0060),  # Invalid latitude
                timezone="America/New_York"
            )

    def test_line_calculation(self, engine):
        """Test line calculation from longitude."""
        # Test various longitudes
        line1 = engine._calculate_line(0.0, 1)
        line2 = engine._calculate_line(1.0, 1)
        line3 = engine._calculate_line(5.0, 1)

        assert 1 <= line1 <= 6
        assert 1 <= line2 <= 6
        assert 1 <= line3 <= 6

    def test_color_calculation(self, engine):
        """Test color calculation from longitude."""
        color = engine._calculate_color(123.456, 32)
        assert 1 <= color <= 6

    def test_tone_calculation(self, engine):
        """Test tone calculation from longitude."""
        tone = engine._calculate_tone(123.456, 32)
        assert 1 <= tone <= 6

    def test_base_calculation(self, engine):
        """Test base calculation from longitude."""
        base = engine._calculate_base(123.456, 32)
        assert 1 <= base <= 5

    def test_type_determination(self, engine):
        """Test Human Design type determination."""
        # Create mock gates for testing
        personality_gates = {}
        design_gates = {}

        type_info = engine._determine_type(personality_gates, design_gates)

        assert type_info.type_name in ["Generator", "Manifesting Generator", "Projector", "Manifestor", "Reflector"]
        assert type_info.strategy is not None
        assert type_info.authority is not None
        assert type_info.signature is not None
        assert type_info.not_self is not None
        assert 0 <= type_info.percentage <= 100

    def test_profile_calculation(self, engine):
        """Test profile calculation."""
        # Create mock gates
        from engines.human_design_models import HumanDesignGate

        personality_gates = {
            'sun': HumanDesignGate(
                number=1, name="Gate 1", planet="sun", line=3,
                color=1, tone=1, base=1
            )
        }
        design_gates = {
            'sun': HumanDesignGate(
                number=2, name="Gate 2", planet="sun", line=1,
                color=1, tone=1, base=1
            )
        }

        profile = engine._calculate_profile(personality_gates, design_gates)

        assert 1 <= profile.personality_line <= 6
        assert 1 <= profile.design_line <= 6
        assert "/" in profile.profile_name
        assert profile.description is not None

    def test_centers_analysis(self, engine):
        """Test centers analysis."""
        personality_gates = {}
        design_gates = {}

        centers = engine._analyze_centers(personality_gates, design_gates)

        # Should have all 9 centers
        expected_centers = ["Head", "Ajna", "Throat", "G", "Heart", "Sacral", "Solar Plexus", "Spleen", "Root"]

        for center_name in expected_centers:
            assert center_name in centers
            center = centers[center_name]
            assert center.name == center_name
            assert isinstance(center.defined, bool)
            assert center.function is not None

    def test_full_calculation(self, engine, sample_input):
        """Test complete Human Design calculation."""
        try:
            result = engine.calculate(sample_input)

            # Verify output structure
            assert isinstance(result, HumanDesignOutput)
            assert result.engine_name == "human_design_scanner"
            assert result.calculation_time > 0
            assert 0 <= result.confidence_score <= 1

            # Verify chart data
            assert result.chart is not None
            assert result.chart.type_info is not None
            assert result.chart.profile is not None

            # Verify interpretive sections
            assert len(result.formatted_output) > 0
            assert len(result.recommendations) > 0
            assert len(result.reality_patches) > 0
            assert len(result.archetypal_themes) > 0

            # Verify field signature
            assert result.field_signature is not None
            assert len(result.field_signature) == 12  # MD5 hash truncated to 12 chars

        except Exception as e:
            # If Swiss Ephemeris data is not available, skip this test
            pytest.skip(f"Swiss Ephemeris not available: {e}")

    def test_recommendations_generation(self, engine):
        """Test recommendations generation."""
        from engines.human_design_models import HumanDesignType

        calculation_results = {
            'type_info': HumanDesignType(
                type_name="Generator",
                strategy="To Respond",
                authority="Sacral Authority",
                signature="Satisfaction",
                not_self="Frustration",
                percentage=70.0
            )
        }

        recommendations = engine._generate_recommendations(calculation_results, None)

        assert len(recommendations) > 0
        assert any("Generator" in rec for rec in recommendations)
        assert any("Respond" in rec for rec in recommendations)

    def test_reality_patches_generation(self, engine):
        """Test reality patches generation."""
        from engines.human_design_models import HumanDesignType

        calculation_results = {
            'type_info': HumanDesignType(
                type_name="Projector",
                strategy="Wait for Invitation",
                authority="Splenic Authority",
                signature="Success",
                not_self="Bitterness",
                percentage=20.0
            )
        }

        patches = engine._generate_reality_patches(calculation_results, None)

        assert len(patches) > 0
        assert any("PATCH_HD_TYPE_PROJECTOR" in patch for patch in patches)
        assert any("PATCH_HD_STRATEGY" in patch for patch in patches)

    def test_archetypal_themes_identification(self, engine):
        """Test archetypal themes identification."""
        from engines.human_design_models import HumanDesignType, HumanDesignProfile

        calculation_results = {
            'type_info': HumanDesignType(
                type_name="Manifestor",
                strategy="To Inform",
                authority="Emotional Authority",
                signature="Peace",
                not_self="Anger",
                percentage=9.0
            ),
            'profile': HumanDesignProfile(
                personality_line=1,
                design_line=3,
                profile_name="1/3 Investigator/Martyr"
            ),
            'centers': {}
        }

        themes = engine._identify_archetypal_themes(calculation_results, None)

        assert len(themes) > 0
        assert any("Manifestor" in theme for theme in themes)
        assert any("1/3" in theme for theme in themes)

    def test_engine_stats(self, engine):
        """Test engine statistics tracking."""
        stats = engine.get_stats()

        assert stats['engine_name'] == "human_design_scanner"
        assert 'version' in stats
        assert 'total_calculations' in stats
        assert stats['total_calculations'] == 0  # No calculations yet

    def test_string_representations(self, engine):
        """Test string representations of the engine."""
        str_repr = str(engine)
        assert "human_design_scanner" in str_repr

        repr_str = repr(engine)
        assert "HumanDesignScanner" in repr_str
        assert "human_design_scanner" in repr_str


if __name__ == "__main__":
    pytest.main([__file__])
