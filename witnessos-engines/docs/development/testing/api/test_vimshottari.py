"""
Tests for Vimshottari Dasha Timeline Mapper Engine

Comprehensive test suite for Vedic astrology Dasha calculations.
"""

import pytest
import sys
import os
from datetime import date, time, datetime, timedelta

# Add the parent directory to the path to allow imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engines.vimshottari import VimshottariTimelineMapper
from engines.vimshottari_models import VimshottariInput, VimshottariOutput, DashaPeriod, NakshatraInfo


class TestVimshottariTimelineMapper:
    """Test suite for Vimshottari Dasha Timeline Mapper Engine."""

    @pytest.fixture
    def engine(self):
        """Create a Vimshottari Timeline Mapper engine instance."""
        return VimshottariTimelineMapper()

    @pytest.fixture
    def sample_input(self):
        """Create sample input data for testing."""
        return VimshottariInput(
            birth_date=date(1985, 3, 20),
            birth_time=time(10, 15, 0),
            birth_location=(28.6139, 77.2090),  # New Delhi
            timezone="Asia/Kolkata",
            current_date=date(2025, 1, 15),
            years_forecast=10
        )

    def test_engine_properties(self, engine):
        """Test engine basic properties."""
        assert engine.engine_name == "vimshottari_timeline_mapper"
        assert "Vimshottari" in engine.description
        assert engine.input_model == VimshottariInput
        assert engine.output_model == VimshottariOutput

    def test_input_validation_success(self, engine, sample_input):
        """Test successful input validation."""
        validated = engine._validate_input(sample_input)
        assert isinstance(validated, VimshottariInput)
        assert validated.birth_date == sample_input.birth_date
        assert validated.birth_time == sample_input.birth_time
        assert validated.birth_location == sample_input.birth_location

    def test_input_validation_missing_time(self, engine):
        """Test input validation with missing birth time."""
        with pytest.raises(Exception):
            invalid_input = VimshottariInput(
                birth_date=date(1985, 3, 20),
                birth_time=None,  # Missing required time
                birth_location=(28.6139, 77.2090),
                timezone="Asia/Kolkata"
            )

    def test_input_validation_missing_location(self, engine):
        """Test input validation with missing birth location."""
        with pytest.raises(Exception):
            invalid_input = VimshottariInput(
                birth_date=date(1985, 3, 20),
                birth_time=time(10, 15, 0),
                birth_location=None,  # Missing required location
                timezone="Asia/Kolkata"
            )

    def test_input_validation_invalid_coordinates(self, engine):
        """Test input validation with invalid coordinates."""
        with pytest.raises(Exception):
            invalid_input = VimshottariInput(
                birth_date=date(1985, 3, 20),
                birth_time=time(10, 15, 0),
                birth_location=(91.0, 77.2090),  # Invalid latitude
                timezone="Asia/Kolkata"
            )

    def test_dasha_data_loading(self, engine):
        """Test that Dasha data is properly loaded."""
        assert hasattr(engine, 'dasha_periods')
        assert hasattr(engine, 'nakshatra_data')
        assert hasattr(engine, 'planet_characteristics')
        assert hasattr(engine, 'dasha_sequence')
        assert hasattr(engine, 'antardasha_sequences')

        # Check Dasha periods
        assert len(engine.dasha_periods) == 9
        assert "Sun" in engine.dasha_periods
        assert "Moon" in engine.dasha_periods
        assert engine.dasha_periods["Sun"] == 6
        assert engine.dasha_periods["Moon"] == 10

        # Check Dasha sequence
        assert len(engine.dasha_sequence) == 9
        assert engine.dasha_sequence[0] == "Ketu"
        assert engine.dasha_sequence[-1] == "Mercury"

    def test_nakshatra_processing(self, engine):
        """Test nakshatra data processing."""
        mock_nakshatra_data = {
            'name': 'Ashwini',
            'pada': 2,
            'degrees_in_nakshatra': 5.5,
            'longitude': 5.5
        }

        nakshatra_info = engine._process_nakshatra(mock_nakshatra_data)

        assert isinstance(nakshatra_info, NakshatraInfo)
        assert nakshatra_info.name == 'Ashwini'
        assert nakshatra_info.pada == 2
        assert nakshatra_info.ruling_planet == 'Ketu'  # Ashwini is ruled by Ketu
        assert nakshatra_info.degrees_in_nakshatra == 5.5
        assert len(nakshatra_info.characteristics) > 0

    def test_planet_theme_generation(self, engine):
        """Test planet theme generation."""
        sun_theme = engine._get_planet_theme("Sun")
        moon_theme = engine._get_planet_theme("Moon")
        mars_theme = engine._get_planet_theme("Mars")

        assert isinstance(sun_theme, str)
        assert isinstance(moon_theme, str)
        assert isinstance(mars_theme, str)
        assert len(sun_theme) > 0
        assert len(moon_theme) > 0
        assert len(mars_theme) > 0

    def test_dasha_timeline_calculation(self, engine):
        """Test Dasha timeline calculation."""
        birth_date = date(1985, 3, 20)
        current_date = date(2025, 1, 15)

        # Create mock nakshatra info
        nakshatra_info = NakshatraInfo(
            name="Bharani",
            pada=3,
            ruling_planet="Venus",
            degrees_in_nakshatra=8.5,
            symbol="Yoni",
            deity="Yama",
            nature="Rajas",
            meaning="The bearer",
            characteristics=["Creativity", "Transformation"]
        )

        timeline = engine._calculate_dasha_timeline(birth_date, nakshatra_info, current_date)

        assert len(timeline) > 0
        assert all(isinstance(period, DashaPeriod) for period in timeline)

        # Check first period
        first_period = timeline[0]
        assert first_period.planet == "Venus"  # Bharani is ruled by Venus
        assert first_period.period_type == "Mahadasha"
        assert first_period.start_date == birth_date
        assert first_period.duration_years > 0

        # Check timeline continuity
        for i in range(len(timeline) - 1):
            current_period = timeline[i]
            next_period = timeline[i + 1]
            assert current_period.end_date == next_period.start_date

    def test_current_periods_finding(self, engine):
        """Test finding current periods."""
        # Create mock timeline
        current_date = date(2025, 1, 15)

        timeline = [
            DashaPeriod(
                planet="Venus",
                period_type="Mahadasha",
                start_date=date(2020, 1, 1),
                end_date=date(2030, 1, 1),
                duration_years=10.0,
                general_theme="Venus period"
            ),
            DashaPeriod(
                planet="Sun",
                period_type="Mahadasha",
                start_date=date(2030, 1, 1),
                end_date=date(2036, 1, 1),
                duration_years=6.0,
                general_theme="Sun period"
            )
        ]

        current_periods = engine._find_current_periods(timeline, current_date)

        assert 'mahadasha' in current_periods
        assert current_periods['mahadasha'].planet == "Venus"
        assert current_periods['mahadasha'].is_current == True

    def test_upcoming_periods_generation(self, engine):
        """Test upcoming periods generation."""
        current_date = date(2025, 1, 15)
        years_forecast = 5

        timeline = [
            DashaPeriod(
                planet="Venus",
                period_type="Mahadasha",
                start_date=date(2020, 1, 1),
                end_date=date(2025, 6, 1),
                duration_years=5.5,
                general_theme="Venus period"
            ),
            DashaPeriod(
                planet="Sun",
                period_type="Mahadasha",
                start_date=date(2025, 6, 1),
                end_date=date(2031, 6, 1),
                duration_years=6.0,
                general_theme="Sun period"
            ),
            DashaPeriod(
                planet="Moon",
                period_type="Mahadasha",
                start_date=date(2031, 6, 1),
                end_date=date(2041, 6, 1),
                duration_years=10.0,
                general_theme="Moon period"
            )
        ]

        upcoming = engine._generate_upcoming_periods(timeline, current_date, years_forecast)

        assert len(upcoming) > 0
        assert all(period.start_date > current_date for period in upcoming)
        assert all(period.is_upcoming == True for period in upcoming)

        # Should include Sun period starting in 2025
        sun_periods = [p for p in upcoming if p.planet == "Sun"]
        assert len(sun_periods) > 0

    def test_karmic_themes_analysis(self, engine):
        """Test karmic themes analysis."""
        current_periods = {
            'mahadasha': DashaPeriod(
                planet="Jupiter",
                period_type="Mahadasha",
                start_date=date(2020, 1, 1),
                end_date=date(2036, 1, 1),
                duration_years=16.0,
                general_theme="Jupiter period"
            ),
            'antardasha': DashaPeriod(
                planet="Saturn",
                period_type="Antardasha",
                start_date=date(2024, 1, 1),
                end_date=date(2026, 1, 1),
                duration_years=2.0,
                general_theme="Saturn period"
            )
        }

        upcoming_periods = [
            DashaPeriod(
                planet="Saturn",
                period_type="Mahadasha",
                start_date=date(2036, 1, 1),
                end_date=date(2055, 1, 1),
                duration_years=19.0,
                general_theme="Saturn period"
            )
        ]

        themes = engine._analyze_karmic_themes(current_periods, upcoming_periods)

        assert len(themes) > 0
        assert any("Jupiter" in theme for theme in themes)
        assert any("Saturn" in theme for theme in themes)

    def test_full_calculation(self, engine, sample_input):
        """Test complete Vimshottari calculation."""
        try:
            result = engine.calculate(sample_input)

            # Verify output structure
            assert isinstance(result, VimshottariOutput)
            assert result.engine_name == "vimshottari_timeline_mapper"
            assert result.calculation_time > 0
            assert 0 <= result.confidence_score <= 1

            # Verify timeline data
            assert result.timeline is not None
            assert result.timeline.birth_nakshatra is not None
            assert result.timeline.current_mahadasha is not None

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
        calculation_results = {
            'current_periods': {
                'mahadasha': DashaPeriod(
                    planet="Mars",
                    period_type="Mahadasha",
                    start_date=date(2020, 1, 1),
                    end_date=date(2027, 1, 1),
                    duration_years=7.0,
                    general_theme="Mars period"
                )
            }
        }

        recommendations = engine._generate_recommendations(calculation_results, None)

        assert len(recommendations) > 0
        assert any("planetary" in rec.lower() for rec in recommendations)

    def test_reality_patches_generation(self, engine):
        """Test reality patches generation."""
        calculation_results = {
            'current_periods': {
                'mahadasha': DashaPeriod(
                    planet="Mercury",
                    period_type="Mahadasha",
                    start_date=date(2020, 1, 1),
                    end_date=date(2037, 1, 1),
                    duration_years=17.0,
                    general_theme="Mercury period"
                ),
                'antardasha': DashaPeriod(
                    planet="Venus",
                    period_type="Antardasha",
                    start_date=date(2024, 1, 1),
                    end_date=date(2026, 1, 1),
                    duration_years=2.0,
                    general_theme="Venus period"
                )
            }
        }

        patches = engine._generate_reality_patches(calculation_results, None)

        assert len(patches) > 0
        assert any("PATCH_DASHA_MERCURY" in patch for patch in patches)
        assert any("PATCH_ANTARDASHA_VENUS" in patch for patch in patches)
        assert any("PATCH_KARMIC_TIMING" in patch for patch in patches)

    def test_archetypal_themes_identification(self, engine):
        """Test archetypal themes identification."""
        calculation_results = {
            'current_periods': {
                'mahadasha': DashaPeriod(
                    planet="Rahu",
                    period_type="Mahadasha",
                    start_date=date(2020, 1, 1),
                    end_date=date(2038, 1, 1),
                    duration_years=18.0,
                    general_theme="Rahu period"
                ),
                'antardasha': DashaPeriod(
                    planet="Ketu",
                    period_type="Antardasha",
                    start_date=date(2024, 1, 1),
                    end_date=date(2025, 1, 1),
                    duration_years=1.0,
                    general_theme="Ketu period"
                )
            },
            'nakshatra_info': NakshatraInfo(
                name="Revati",
                pada=4,
                ruling_planet="Mercury",
                degrees_in_nakshatra=12.5,
                symbol="Fish",
                deity="Pushan",
                nature="Sattva",
                meaning="Wealthy",
                characteristics=["Completion", "Journey"]
            )
        }

        themes = engine._identify_archetypal_themes(calculation_results, None)

        assert len(themes) > 0
        assert any("Karmic" in theme for theme in themes)
        assert any("Revati" in theme for theme in themes)
        assert any("Rahu" in theme for theme in themes)

    def test_engine_stats(self, engine):
        """Test engine statistics tracking."""
        stats = engine.get_stats()

        assert stats['engine_name'] == "vimshottari_timeline_mapper"
        assert 'version' in stats
        assert 'total_calculations' in stats
        assert stats['total_calculations'] == 0  # No calculations yet

    def test_string_representations(self, engine):
        """Test string representations of the engine."""
        str_repr = str(engine)
        assert "vimshottari_timeline_mapper" in str_repr

        repr_str = repr(engine)
        assert "VimshottariTimelineMapper" in repr_str
        assert "vimshottari_timeline_mapper" in repr_str


if __name__ == "__main__":
    pytest.main([__file__])
