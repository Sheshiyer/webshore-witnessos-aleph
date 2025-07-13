"""
Comprehensive tests for the Biorhythm Synchronizer engine

Tests the biorhythm calculations, sine wave mathematics, and engine functionality
to ensure accuracy and reliability.
"""

import pytest
import math
from datetime import date, timedelta
from typing import Dict, Any

from ENGINES.calculations.biorhythm import (
    BiorhythmCalculator,
    BiorhythmCycle,
    BiorhythmSnapshot,
    PHYSICAL_CYCLE,
    EMOTIONAL_CYCLE,
    INTELLECTUAL_CYCLE,
    quick_biorhythm,
    quick_critical_days
)
from ENGINES.engines.biorhythm import BiorhythmEngine
from ENGINES.engines.biorhythm_models import BiorhythmInput, BiorhythmOutput


class TestBiorhythmCalculator:
    """Test the core biorhythm calculation module."""

    def test_cycle_value_calculation(self):
        """Test basic sine wave calculation."""
        calc = BiorhythmCalculator()

        # Test known values
        # At day 0, all cycles should be at 0
        assert calc.calculate_cycle_value(0, PHYSICAL_CYCLE) == 0.0

        # At quarter cycle, should be at peak (close to 100%)
        quarter_physical = PHYSICAL_CYCLE / 4  # Use exact division
        physical_quarter = calc.calculate_cycle_value(quarter_physical, PHYSICAL_CYCLE)
        assert abs(physical_quarter - 100.0) < 5.0  # Allow for some error due to discrete days

        # At half cycle, should be back to 0
        half_physical = PHYSICAL_CYCLE / 2
        physical_half = calc.calculate_cycle_value(half_physical, PHYSICAL_CYCLE)
        assert abs(physical_half) < 5.0  # Should be close to 0

        # At three-quarter cycle, should be at valley (close to -100%)
        three_quarter_physical = (PHYSICAL_CYCLE * 3) / 4
        physical_three_quarter = calc.calculate_cycle_value(three_quarter_physical, PHYSICAL_CYCLE)
        assert abs(physical_three_quarter + 100.0) < 5.0  # Should be close to -100

    def test_phase_determination(self):
        """Test cycle phase determination."""
        calc = BiorhythmCalculator()

        # Test critical phase (near zero)
        assert calc.determine_phase(2.0, 100, PHYSICAL_CYCLE) == 'critical'
        assert calc.determine_phase(-3.0, 100, PHYSICAL_CYCLE) == 'critical'

        # Test high values (should be peak or falling)
        high_phase = calc.determine_phase(95.0, 100, PHYSICAL_CYCLE)
        assert high_phase in ['peak', 'falling']

        # Test low values (should be valley or rising)
        low_phase = calc.determine_phase(-95.0, 100, PHYSICAL_CYCLE)
        assert low_phase in ['valley', 'rising']

        # Test rising/falling phases
        # This is harder to test precisely due to derivative calculation
        # Just ensure we get valid phase names
        phase = calc.determine_phase(50.0, 100, PHYSICAL_CYCLE)
        assert phase in ['rising', 'falling', 'peak', 'valley', 'critical']

    def test_biorhythm_snapshot(self):
        """Test complete biorhythm snapshot calculation."""
        calc = BiorhythmCalculator()

        birth_date = date(1990, 5, 15)
        target_date = date(2024, 1, 15)

        snapshot = calc.calculate_biorhythm_snapshot(birth_date, target_date)

        # Check snapshot structure
        assert isinstance(snapshot, BiorhythmSnapshot)
        assert snapshot.target_date == target_date
        assert snapshot.days_alive > 0

        # Check that all core cycles are present
        assert 'physical' in snapshot.cycles
        assert 'emotional' in snapshot.cycles
        assert 'intellectual' in snapshot.cycles

        # Check cycle data
        for cycle_name, cycle in snapshot.cycles.items():
            assert isinstance(cycle, BiorhythmCycle)
            assert -100 <= cycle.percentage <= 100
            assert cycle.phase in ['rising', 'falling', 'peak', 'valley', 'critical']
            assert cycle.days_to_peak >= 0
            assert cycle.days_to_valley >= 0

        # Check overall metrics
        assert -100 <= snapshot.overall_energy <= 100
        assert isinstance(snapshot.critical_day, bool)
        assert snapshot.trend in ['ascending', 'descending', 'mixed', 'stable']

    def test_extended_cycles(self):
        """Test extended cycles inclusion."""
        calc_extended = BiorhythmCalculator(include_extended_cycles=True)
        calc_core = BiorhythmCalculator(include_extended_cycles=False)

        birth_date = date(1990, 5, 15)
        target_date = date(2024, 1, 15)

        snapshot_extended = calc_extended.calculate_biorhythm_snapshot(birth_date, target_date)
        snapshot_core = calc_core.calculate_biorhythm_snapshot(birth_date, target_date)

        # Extended should have more cycles
        assert len(snapshot_extended.cycles) > len(snapshot_core.cycles)

        # Extended should include intuitive, aesthetic, spiritual
        assert 'intuitive' in snapshot_extended.cycles
        assert 'aesthetic' in snapshot_extended.cycles
        assert 'spiritual' in snapshot_extended.cycles

        # Core should only have physical, emotional, intellectual
        assert len(snapshot_core.cycles) == 3
        assert set(snapshot_core.cycles.keys()) == {'physical', 'emotional', 'intellectual'}

    def test_critical_days_detection(self):
        """Test critical days detection."""
        calc = BiorhythmCalculator()

        birth_date = date(1990, 5, 15)
        start_date = date(2024, 1, 1)

        critical_days = calc.find_critical_days(birth_date, start_date, days_ahead=30)

        # Should return a list of dates
        assert isinstance(critical_days, list)
        assert all(isinstance(d, date) for d in critical_days)

        # Dates should be in order
        assert critical_days == sorted(critical_days)

        # Should be within the specified range
        for critical_date in critical_days:
            assert start_date <= critical_date <= start_date + timedelta(days=30)

    def test_compatibility_calculation(self):
        """Test biorhythm compatibility between two people."""
        calc = BiorhythmCalculator()

        birth_date1 = date(1990, 5, 15)
        birth_date2 = date(1992, 8, 20)
        target_date = date(2024, 1, 15)

        compatibility = calc.calculate_compatibility(birth_date1, birth_date2, target_date)

        # Check structure
        assert 'physical' in compatibility
        assert 'emotional' in compatibility
        assert 'intellectual' in compatibility
        assert 'overall' in compatibility

        # Check values are in valid range
        for score in compatibility.values():
            assert 0 <= score <= 1

    def test_forecast_generation(self):
        """Test biorhythm forecast generation."""
        calc = BiorhythmCalculator()

        birth_date = date(1990, 5, 15)
        start_date = date(2024, 1, 1)
        days_ahead = 7

        forecast = calc.generate_forecast(birth_date, start_date, days_ahead)

        # Should return correct number of snapshots
        assert len(forecast) == days_ahead

        # Each should be a valid snapshot
        for i, snapshot in enumerate(forecast):
            assert isinstance(snapshot, BiorhythmSnapshot)
            expected_date = start_date + timedelta(days=i)
            assert snapshot.target_date == expected_date

    def test_quick_functions(self):
        """Test convenience functions."""
        birth_date = date(1990, 5, 15)

        # Test quick biorhythm
        snapshot = quick_biorhythm(birth_date)
        assert isinstance(snapshot, BiorhythmSnapshot)
        assert snapshot.target_date == date.today()

        # Test quick critical days
        critical_days = quick_critical_days(birth_date, days_ahead=14)
        assert isinstance(critical_days, list)
        assert all(isinstance(d, date) for d in critical_days)


class TestBiorhythmModels:
    """Test the Pydantic data models."""

    def test_biorhythm_input_validation(self):
        """Test BiorhythmInput validation."""
        # Valid input
        valid_input = BiorhythmInput(
            birth_date=date(1990, 5, 15),
            target_date=date(2024, 1, 15),
            include_extended_cycles=True,
            forecast_days=14
        )
        assert valid_input.birth_date == date(1990, 5, 15)
        assert valid_input.include_extended_cycles is True
        assert valid_input.forecast_days == 14

        # Test birth date validation
        with pytest.raises(ValueError):
            BiorhythmInput(
                birth_date=date(2030, 1, 1)  # Future date
            )

        with pytest.raises(ValueError):
            BiorhythmInput(
                birth_date=date(1850, 1, 1)  # Too old
            )

        # Test forecast days validation
        with pytest.raises(ValueError):
            BiorhythmInput(
                birth_date=date(1990, 5, 15),
                forecast_days=100  # Too many days
            )

        with pytest.raises(ValueError):
            BiorhythmInput(
                birth_date=date(1990, 5, 15),
                forecast_days=0  # Too few days
            )

    def test_biorhythm_output_structure(self):
        """Test BiorhythmOutput structure."""
        # Create a sample output
        output = BiorhythmOutput(
            engine_name="biorhythm",
            calculation_time=0.1,
            formatted_output="Test output",
            birth_date=date(1990, 5, 15),
            target_date=date(2024, 1, 15),
            days_alive=12345,
            physical_percentage=75.5,
            emotional_percentage=-25.3,
            intellectual_percentage=50.0,
            physical_phase="peak",
            emotional_phase="valley",
            intellectual_phase="rising",
            overall_energy=33.4,
            critical_day=False,
            trend="mixed"
        )

        assert output.physical_percentage == 75.5
        assert output.emotional_phase == "valley"
        assert output.trend == "mixed"
        assert output.engine_name == "biorhythm"


class TestBiorhythmEngine:
    """Test the complete Biorhythm engine."""

    def test_engine_creation(self):
        """Test engine initialization."""
        engine = BiorhythmEngine()

        assert engine.engine_name == "biorhythm"
        assert "biological" in engine.description.lower() or "rhythm" in engine.description.lower()
        assert engine.input_model == BiorhythmInput
        assert engine.output_model == BiorhythmOutput

    def test_engine_calculation(self):
        """Test complete engine calculation workflow."""
        engine = BiorhythmEngine()

        # Test with valid input
        input_data = {
            "birth_date": date(1990, 5, 15),
            "target_date": date(2024, 1, 15),
            "include_extended_cycles": False,
            "forecast_days": 7
        }

        result = engine.calculate(input_data)

        # Check result structure
        assert isinstance(result, BiorhythmOutput)
        assert result.engine_name == "biorhythm"
        assert result.calculation_time > 0
        assert result.birth_date == date(1990, 5, 15)
        assert result.target_date == date(2024, 1, 15)

        # Check cycle percentages are valid
        assert -100 <= result.physical_percentage <= 100
        assert -100 <= result.emotional_percentage <= 100
        assert -100 <= result.intellectual_percentage <= 100
        assert -100 <= result.overall_energy <= 100

        # Check phases are valid
        valid_phases = ['rising', 'falling', 'peak', 'valley', 'critical']
        assert result.physical_phase in valid_phases
        assert result.emotional_phase in valid_phases
        assert result.intellectual_phase in valid_phases

        # Check that interpretation was generated
        assert len(result.formatted_output) > 100  # Should be substantial
        assert "BIORHYTHM SYNCHRONIZATION" in result.formatted_output

        # Check recommendations
        assert len(result.recommendations) > 0
        assert all(isinstance(rec, str) for rec in result.recommendations)

        # Check reality patches
        assert len(result.reality_patches) > 0
        assert any("biorhythm" in patch.lower() for patch in result.reality_patches)

        # Check archetypal themes
        assert len(result.archetypal_themes) > 0

        # Check forecast data
        assert isinstance(result.critical_days_ahead, list)
        assert isinstance(result.best_days_ahead, list)
        assert isinstance(result.challenging_days_ahead, list)

        # Check cycle details
        assert 'physical' in result.cycle_details
        assert 'emotional' in result.cycle_details
        assert 'intellectual' in result.cycle_details

    def test_engine_with_extended_cycles(self):
        """Test engine with extended cycles."""
        engine = BiorhythmEngine()

        input_data = {
            "birth_date": date(1990, 5, 15),
            "include_extended_cycles": True,
            "forecast_days": 5
        }

        result = engine.calculate(input_data)

        # Should have extended cycle data
        assert result.intuitive_percentage is not None
        assert result.aesthetic_percentage is not None
        assert result.spiritual_percentage is not None

        # Extended cycles should be in cycle details
        assert 'intuitive' in result.cycle_details
        assert 'aesthetic' in result.cycle_details
        assert 'spiritual' in result.cycle_details

    def test_critical_day_detection(self):
        """Test critical day detection in engine."""
        engine = BiorhythmEngine()

        # We can't easily predict when critical days occur, so we'll test the structure
        input_data = {
            "birth_date": date(1990, 5, 15),
            "forecast_days": 30
        }

        result = engine.calculate(input_data)

        # Should have critical day information
        assert isinstance(result.critical_day, bool)
        assert isinstance(result.critical_days_ahead, list)

        # If critical day is True, should be mentioned in interpretation
        if result.critical_day:
            assert "CRITICAL DAY ACTIVE" in result.formatted_output

    def test_energy_optimization(self):
        """Test energy optimization features."""
        engine = BiorhythmEngine()

        input_data = {
            "birth_date": date(1990, 5, 15),
            "forecast_days": 7
        }

        result = engine.calculate(input_data)

        # Should have energy optimization data
        assert isinstance(result.energy_optimization, dict)
        assert 'physical' in result.energy_optimization
        assert 'emotional' in result.energy_optimization
        assert 'intellectual' in result.energy_optimization

        # Should have cycle synchronization data
        assert isinstance(result.cycle_synchronization, dict)
        assert 'synchronization_score' in result.cycle_synchronization
        assert 0 <= result.cycle_synchronization['synchronization_score'] <= 1

    def test_confidence_calculation(self):
        """Test confidence score calculation."""
        engine = BiorhythmEngine()

        # Test with normal input
        normal_input = BiorhythmInput(birth_date=date(1990, 5, 15))
        normal_results = {'snapshot': type('obj', (object,), {'days_alive': 12000})()}
        confidence = engine._calculate_confidence(normal_results, normal_input)

        assert 0.9 <= confidence <= 1.0

        # Test with very recent birth (should reduce confidence)
        recent_input = BiorhythmInput(birth_date=date.today() - timedelta(days=10))
        recent_results = {'snapshot': type('obj', (object,), {'days_alive': 10})()}
        recent_confidence = engine._calculate_confidence(recent_results, recent_input)

        assert recent_confidence < confidence

    def test_archetypal_themes(self):
        """Test archetypal theme identification."""
        engine = BiorhythmEngine()

        # Create mock snapshot with high energy
        mock_cycles = {
            'physical': type('obj', (object,), {'phase': 'peak', 'percentage': 80})(),
            'emotional': type('obj', (object,), {'phase': 'rising', 'percentage': 60})(),
            'intellectual': type('obj', (object,), {'phase': 'valley', 'percentage': -40})()
        }

        mock_snapshot = type('obj', (object,), {
            'overall_energy': 60,
            'critical_day': False,
            'trend': 'ascending',
            'cycles': mock_cycles
        })()

        mock_results = {'snapshot': mock_snapshot}
        input_data = BiorhythmInput(birth_date=date(1990, 5, 15))

        themes = engine._identify_archetypal_themes(mock_results, input_data)

        # Should include energy-based themes
        assert any(theme in ['Vitality', 'Dynamic Force', 'Active Principle'] for theme in themes)

        # Should include cycle-specific themes
        assert 'Warrior' in themes  # Physical peak

        # Should include trend themes
        assert 'Rising Phoenix' in themes  # Ascending trend


if __name__ == "__main__":
    # Run tests if executed directly
    pytest.main([__file__, "-v"])
