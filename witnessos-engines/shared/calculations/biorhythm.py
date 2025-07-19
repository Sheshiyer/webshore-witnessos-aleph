"""
Biorhythm calculation module for WitnessOS Divination Engines

Provides core biorhythm calculations using sine wave mathematics for physical,
emotional, and intellectual cycles. Includes critical day detection and trend analysis.
"""

import math
from datetime import date, timedelta
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass


# Standard biorhythm cycle lengths (in days)
PHYSICAL_CYCLE = 23      # Physical strength, coordination, well-being
EMOTIONAL_CYCLE = 28     # Emotions, creativity, sensitivity, mood
INTELLECTUAL_CYCLE = 33  # Mental alertness, analytical thinking, memory

# Additional cycles (some practitioners include these)
INTUITIVE_CYCLE = 38     # Intuition, unconscious insight
AESTHETIC_CYCLE = 43     # Aesthetic appreciation, creativity
SPIRITUAL_CYCLE = 53     # Spiritual awareness, inner harmony

# Critical day thresholds
CRITICAL_THRESHOLD = 5.0  # Percentage within which a cycle is considered "critical"


@dataclass
class BiorhythmCycle:
    """Represents a single biorhythm cycle."""
    name: str
    period: int
    percentage: float
    phase: str  # 'rising', 'falling', 'peak', 'valley', 'critical'
    days_to_peak: int
    days_to_valley: int
    next_critical: date


@dataclass
class BiorhythmSnapshot:
    """Complete biorhythm state at a specific moment."""
    target_date: date
    days_alive: int
    cycles: Dict[str, BiorhythmCycle]
    overall_energy: float
    critical_day: bool
    trend: str  # 'ascending', 'descending', 'mixed', 'stable'


class BiorhythmCalculator:
    """Core biorhythm calculation engine."""
    
    def __init__(self, include_extended_cycles: bool = False):
        """
        Initialize calculator with cycle definitions.
        
        Args:
            include_extended_cycles: Whether to include intuitive, aesthetic, spiritual cycles
        """
        self.core_cycles = {
            'physical': PHYSICAL_CYCLE,
            'emotional': EMOTIONAL_CYCLE,
            'intellectual': INTELLECTUAL_CYCLE
        }
        
        self.extended_cycles = {
            'intuitive': INTUITIVE_CYCLE,
            'aesthetic': AESTHETIC_CYCLE,
            'spiritual': SPIRITUAL_CYCLE
        }
        
        self.include_extended = include_extended_cycles
        
        # Combine cycles based on settings
        self.cycles = self.core_cycles.copy()
        if self.include_extended:
            self.cycles.update(self.extended_cycles)
    
    def calculate_cycle_value(self, days_alive: int, cycle_period: int) -> float:
        """
        Calculate the current value of a biorhythm cycle.
        
        Args:
            days_alive: Number of days since birth
            cycle_period: Length of the cycle in days
            
        Returns:
            Cycle value as percentage (-100 to +100)
        """
        # Calculate position in cycle using sine wave
        radians = (2 * math.pi * days_alive) / cycle_period
        sine_value = math.sin(radians)
        
        # Convert to percentage (-100 to +100)
        return sine_value * 100
    
    def determine_phase(self, percentage: float, days_alive: int, cycle_period: int) -> str:
        """
        Determine the current phase of a cycle.
        
        Args:
            percentage: Current cycle percentage
            days_alive: Days since birth
            cycle_period: Cycle period in days
            
        Returns:
            Phase description
        """
        # Check if critical (near zero crossing)
        if abs(percentage) <= CRITICAL_THRESHOLD:
            return 'critical'
        
        # Calculate derivative to determine if rising or falling
        # Look at value slightly in the future
        future_value = self.calculate_cycle_value(days_alive + 1, cycle_period)
        
        if future_value > percentage:
            if percentage > 75:
                return 'peak'
            else:
                return 'rising'
        else:
            if percentage < -75:
                return 'valley'
            else:
                return 'falling'
    
    def find_next_peak(self, days_alive: int, cycle_period: int) -> int:
        """
        Find days until next peak (maximum) of cycle.
        
        Args:
            days_alive: Current days alive
            cycle_period: Cycle period
            
        Returns:
            Days until next peak
        """
        # Peak occurs at 90 degrees (quarter cycle)
        current_position = (days_alive % cycle_period) / cycle_period
        peak_position = 0.25  # 90 degrees = quarter cycle
        
        if current_position <= peak_position:
            days_to_peak = int((peak_position - current_position) * cycle_period)
        else:
            # Next peak is in next cycle
            days_to_peak = int((1 - current_position + peak_position) * cycle_period)
        
        return days_to_peak
    
    def find_next_valley(self, days_alive: int, cycle_period: int) -> int:
        """
        Find days until next valley (minimum) of cycle.
        
        Args:
            days_alive: Current days alive
            cycle_period: Cycle period
            
        Returns:
            Days until next valley
        """
        # Valley occurs at 270 degrees (three-quarter cycle)
        current_position = (days_alive % cycle_period) / cycle_period
        valley_position = 0.75  # 270 degrees = three-quarter cycle
        
        if current_position <= valley_position:
            days_to_valley = int((valley_position - current_position) * cycle_period)
        else:
            # Next valley is in next cycle
            days_to_valley = int((1 - current_position + valley_position) * cycle_period)
        
        return days_to_valley
    
    def find_next_critical(self, birth_date: date, days_alive: int, cycle_period: int) -> date:
        """
        Find the next critical day (zero crossing) for a cycle.
        
        Args:
            birth_date: Date of birth
            days_alive: Current days alive
            cycle_period: Cycle period
            
        Returns:
            Date of next critical day
        """
        # Critical days occur at 0 and 180 degrees (start and half cycle)
        current_position = (days_alive % cycle_period) / cycle_period
        
        # Find next zero crossing
        if current_position < 0.5:
            # Next critical is at half cycle
            days_to_critical = int((0.5 - current_position) * cycle_period)
        else:
            # Next critical is at start of next cycle
            days_to_critical = int((1 - current_position) * cycle_period)
        
        return birth_date + timedelta(days=days_alive + days_to_critical)
    
    def calculate_biorhythm_snapshot(self, birth_date: date, target_date: date) -> BiorhythmSnapshot:
        """
        Calculate complete biorhythm state for a specific date.
        
        Args:
            birth_date: Date of birth
            target_date: Date to calculate for
            
        Returns:
            Complete biorhythm snapshot
        """
        days_alive = (target_date - birth_date).days
        
        cycles = {}
        total_energy = 0
        critical_count = 0
        
        for cycle_name, cycle_period in self.cycles.items():
            percentage = self.calculate_cycle_value(days_alive, cycle_period)
            phase = self.determine_phase(percentage, days_alive, cycle_period)
            days_to_peak = self.find_next_peak(days_alive, cycle_period)
            days_to_valley = self.find_next_valley(days_alive, cycle_period)
            next_critical = self.find_next_critical(birth_date, days_alive, cycle_period)
            
            cycles[cycle_name] = BiorhythmCycle(
                name=cycle_name,
                period=cycle_period,
                percentage=round(percentage, 2),
                phase=phase,
                days_to_peak=days_to_peak,
                days_to_valley=days_to_valley,
                next_critical=next_critical
            )
            
            # Count towards overall energy (core cycles only)
            if cycle_name in self.core_cycles:
                total_energy += percentage
                if phase == 'critical':
                    critical_count += 1
        
        # Calculate overall metrics
        overall_energy = round(total_energy / len(self.core_cycles), 2)
        critical_day = critical_count >= 2  # Two or more core cycles critical
        
        # Determine overall trend
        trend = self._determine_overall_trend(cycles)
        
        return BiorhythmSnapshot(
            target_date=target_date,
            days_alive=days_alive,
            cycles=cycles,
            overall_energy=overall_energy,
            critical_day=critical_day,
            trend=trend
        )
    
    def _determine_overall_trend(self, cycles: Dict[str, BiorhythmCycle]) -> str:
        """Determine overall biorhythm trend."""
        rising_count = 0
        falling_count = 0
        
        for cycle_name, cycle in cycles.items():
            if cycle_name in self.core_cycles:  # Only consider core cycles
                if cycle.phase in ['rising', 'peak']:
                    rising_count += 1
                elif cycle.phase in ['falling', 'valley']:
                    falling_count += 1
        
        if rising_count > falling_count:
            return 'ascending'
        elif falling_count > rising_count:
            return 'descending'
        elif rising_count == falling_count and rising_count > 0:
            return 'mixed'
        else:
            return 'stable'
    
    def find_critical_days(self, birth_date: date, start_date: date, days_ahead: int = 30) -> List[date]:
        """
        Find all critical days within a specified period.
        
        Args:
            birth_date: Date of birth
            start_date: Start date for search
            days_ahead: Number of days to look ahead
            
        Returns:
            List of critical dates
        """
        critical_dates = set()
        
        for i in range(days_ahead):
            check_date = start_date + timedelta(days=i)
            snapshot = self.calculate_biorhythm_snapshot(birth_date, check_date)
            
            # Check if any core cycle is critical
            for cycle_name, cycle in snapshot.cycles.items():
                if cycle_name in self.core_cycles and cycle.phase == 'critical':
                    critical_dates.add(check_date)
                    break
        
        return sorted(list(critical_dates))
    
    def calculate_compatibility(self, birth_date1: date, birth_date2: date, target_date: date) -> Dict[str, float]:
        """
        Calculate biorhythm compatibility between two people.
        
        Args:
            birth_date1: First person's birth date
            birth_date2: Second person's birth date
            target_date: Date to calculate compatibility for
            
        Returns:
            Compatibility scores for each cycle
        """
        snapshot1 = self.calculate_biorhythm_snapshot(birth_date1, target_date)
        snapshot2 = self.calculate_biorhythm_snapshot(birth_date2, target_date)
        
        compatibility = {}
        
        for cycle_name in self.core_cycles:
            cycle1 = snapshot1.cycles[cycle_name]
            cycle2 = snapshot2.cycles[cycle_name]
            
            # Calculate compatibility as inverse of difference
            difference = abs(cycle1.percentage - cycle2.percentage)
            compatibility_score = (200 - difference) / 200  # Normalize to 0-1
            
            compatibility[cycle_name] = round(compatibility_score, 3)
        
        # Overall compatibility
        compatibility['overall'] = round(
            sum(compatibility[cycle] for cycle in self.core_cycles) / len(self.core_cycles), 3
        )
        
        return compatibility
    
    def generate_forecast(self, birth_date: date, start_date: date, days_ahead: int = 30) -> List[BiorhythmSnapshot]:
        """
        Generate biorhythm forecast for multiple days.
        
        Args:
            birth_date: Date of birth
            start_date: Start date for forecast
            days_ahead: Number of days to forecast
            
        Returns:
            List of biorhythm snapshots
        """
        forecast = []
        
        for i in range(days_ahead):
            target_date = start_date + timedelta(days=i)
            snapshot = self.calculate_biorhythm_snapshot(birth_date, target_date)
            forecast.append(snapshot)
        
        return forecast


# Convenience functions for quick calculations

def quick_biorhythm(birth_date: date, target_date: Optional[date] = None) -> BiorhythmSnapshot:
    """Quick biorhythm calculation for today or specified date."""
    if target_date is None:
        target_date = date.today()
    
    calc = BiorhythmCalculator()
    return calc.calculate_biorhythm_snapshot(birth_date, target_date)


def quick_critical_days(birth_date: date, days_ahead: int = 30) -> List[date]:
    """Quick critical days calculation."""
    calc = BiorhythmCalculator()
    return calc.find_critical_days(birth_date, date.today(), days_ahead)


# Export main classes and functions
__all__ = [
    "BiorhythmCalculator",
    "BiorhythmCycle",
    "BiorhythmSnapshot",
    "PHYSICAL_CYCLE",
    "EMOTIONAL_CYCLE", 
    "INTELLECTUAL_CYCLE",
    "INTUITIVE_CYCLE",
    "AESTHETIC_CYCLE",
    "SPIRITUAL_CYCLE",
    "quick_biorhythm",
    "quick_critical_days"
]
