"""
Biorhythm Synchronizer Engine for WitnessOS

Provides comprehensive biorhythm analysis using sine wave mathematics for physical,
emotional, and intellectual cycles. Includes critical day detection, forecasting,
and energy optimization aligned with WitnessOS consciousness framework.
"""

from datetime import date, timedelta
from typing import Dict, List, Any, Optional
import logging

from shared.base.engine_interface import BaseEngine
from shared.calculations.biorhythm import BiorhythmCalculator
from .biorhythm_models import BiorhythmInput, BiorhythmOutput


class BiorhythmEngine(BaseEngine):
    """
    WitnessOS Biorhythm Synchronizer Engine

    Synchronizes consciousness with natural biological rhythms through mathematical
    analysis of physical, emotional, and intellectual cycles. Provides energy
    optimization guidance and critical day awareness for conscious navigation.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the Biorhythm engine."""
        super().__init__(config)

        # Initialize biorhythm calculators
        self.core_calc = BiorhythmCalculator(include_extended_cycles=False)
        self.extended_calc = BiorhythmCalculator(include_extended_cycles=True)

        # Load biorhythm interpretations
        self._load_interpretations()

    @property
    def engine_name(self) -> str:
        return "biorhythm"

    @property
    def description(self) -> str:
        return "Biological rhythm synchronization and energy field optimization through cyclical mathematics"

    @property
    def input_model(self):
        return BiorhythmInput

    @property
    def output_model(self):
        return BiorhythmOutput

    def _load_interpretations(self):
        """Load biorhythm cycle interpretations."""
        # Phase meanings
        self.phase_meanings = {
            'critical': "Zero-point transition - heightened sensitivity and potential instability",
            'rising': "Ascending energy - building strength and momentum",
            'peak': "Maximum potential - optimal performance and vitality",
            'falling': "Descending energy - natural decline and rest phase",
            'valley': "Minimum energy - recovery and regeneration period"
        }

        # Cycle-specific guidance
        self.cycle_guidance = {
            'physical': {
                'peak': "Optimal time for physical challenges, exercise, and demanding tasks",
                'rising': "Build physical activities gradually, good for starting fitness routines",
                'falling': "Reduce physical intensity, focus on recovery and maintenance",
                'valley': "Rest and recuperation essential, avoid strenuous activities",
                'critical': "Be extra careful with physical activities, higher accident risk"
            },
            'emotional': {
                'peak': "Heightened creativity and emotional expression, excellent for relationships",
                'rising': "Growing emotional awareness, good for creative projects",
                'falling': "Emotional sensitivity may increase, practice self-care",
                'valley': "Emotional low point, avoid major decisions, seek support",
                'critical': "Emotional volatility possible, practice mindfulness and patience"
            },
            'intellectual': {
                'peak': "Maximum mental clarity and analytical power, ideal for complex tasks",
                'rising': "Increasing mental acuity, good for learning and planning",
                'falling': "Mental fatigue may set in, focus on routine tasks",
                'valley': "Reduced concentration, avoid important decisions",
                'critical': "Mental confusion possible, double-check important work"
            }
        }

        # Energy level interpretations
        self.energy_interpretations = {
            (75, 100): "Exceptional vitality - peak performance window",
            (50, 75): "High energy - excellent for ambitious projects",
            (25, 50): "Moderate energy - balanced activity recommended",
            (0, 25): "Low energy - focus on maintenance and rest",
            (-25, 0): "Below baseline - conservation mode advised",
            (-50, -25): "Significantly low - prioritize recovery",
            (-75, -50): "Very low energy - minimal activity recommended",
            (-100, -75): "Critical low - complete rest and regeneration needed"
        }

    def _calculate(self, validated_input: BiorhythmInput) -> Dict[str, Any]:
        """Perform biorhythm calculations."""
        # Use target date or default to today
        target_date = validated_input.target_date or date.today()

        # Select calculator based on extended cycles preference
        calc = self.extended_calc if validated_input.include_extended_cycles else self.core_calc

        # Get biorhythm snapshot
        snapshot = calc.calculate_biorhythm_snapshot(validated_input.birth_date, target_date)

        # Generate forecast
        forecast = calc.generate_forecast(
            validated_input.birth_date,
            target_date,
            validated_input.forecast_days
        )

        # Find critical days
        critical_days = calc.find_critical_days(
            validated_input.birth_date,
            target_date,
            validated_input.forecast_days
        )

        # Analyze forecast for best/challenging days
        best_days, challenging_days = self._analyze_forecast(forecast)

        return {
            'snapshot': snapshot,
            'forecast': forecast,
            'critical_days': critical_days,
            'best_days': best_days,
            'challenging_days': challenging_days,
            'include_extended': validated_input.include_extended_cycles,
            'forecast_days': validated_input.forecast_days
        }

    def _analyze_forecast(self, forecast) -> tuple:
        """Analyze forecast to identify best and challenging days."""
        best_days = []
        challenging_days = []

        for snapshot in forecast:
            if snapshot.overall_energy > 50:
                best_days.append(snapshot.target_date)
            elif snapshot.overall_energy < -25 or snapshot.critical_day:
                challenging_days.append(snapshot.target_date)

        return best_days, challenging_days

    def _interpret(self, calculation_results: Dict[str, Any], input_data: BiorhythmInput) -> str:
        """Generate mystical biorhythm interpretation."""
        snapshot = calculation_results['snapshot']
        critical_days = calculation_results['critical_days']

        # Get cycle data
        physical = snapshot.cycles['physical']
        emotional = snapshot.cycles['emotional']
        intellectual = snapshot.cycles['intellectual']

        # Build interpretation
        interpretation = f"""
⚡ BIORHYTHM SYNCHRONIZATION - {snapshot.target_date.strftime('%B %d, %Y').upper()} ⚡

═══ ENERGY FIELD ANALYSIS ═══

Days in Current Incarnation: {snapshot.days_alive}
Overall Energy Resonance: {snapshot.overall_energy:.1f}%

Your biological field oscillates in sacred mathematical harmony with cosmic rhythms.
Today's energy signature reveals the following consciousness-body synchronization:

═══ CYCLE HARMONICS ═══

🔴 PHYSICAL FIELD ({physical.percentage:.1f}%): {self.phase_meanings[physical.phase]}
{self.cycle_guidance['physical'][physical.phase]}

🟡 EMOTIONAL FIELD ({emotional.percentage:.1f}%): {self.phase_meanings[emotional.phase]}
{self.cycle_guidance['emotional'][emotional.phase]}

🔵 INTELLECTUAL FIELD ({intellectual.percentage:.1f}%): {self.phase_meanings[intellectual.phase]}
{self.cycle_guidance['intellectual'][intellectual.phase]}

═══ FIELD SYNCHRONIZATION STATUS ═══

{self._get_synchronization_analysis(snapshot)}

═══ CRITICAL AWARENESS ═══

{self._get_critical_day_analysis(snapshot, critical_days)}

═══ ENERGY OPTIMIZATION PROTOCOL ═══

{self._get_optimization_guidance(snapshot, calculation_results)}

Remember: These rhythms are not limitations—they are navigation tools for conscious
embodiment and optimal energy management in your reality field.
        """.strip()

        return interpretation

    def _get_synchronization_analysis(self, snapshot) -> str:
        """Generate synchronization analysis."""
        if snapshot.trend == 'ascending':
            return "🔺 ASCENDING PHASE: All systems building energy - excellent time for new initiatives"
        elif snapshot.trend == 'descending':
            return "🔻 DESCENDING PHASE: Natural energy decline - focus on completion and rest"
        elif snapshot.trend == 'mixed':
            return "⚖️ MIXED PHASE: Cycles in different directions - balance active and passive approaches"
        else:
            return "⚪ STABLE PHASE: Equilibrium state - maintain current energy patterns"

    def _get_critical_day_analysis(self, snapshot, critical_days) -> str:
        """Generate critical day analysis."""
        if snapshot.critical_day:
            return "⚠️ CRITICAL DAY ACTIVE: Two or more cycles crossing zero-point. Heightened sensitivity and potential for breakthrough or breakdown. Practice extra mindfulness."
        elif critical_days:
            next_critical = min(critical_days)
            days_until = (next_critical - snapshot.target_date).days
            return f"🔮 Next Critical Day: {next_critical.strftime('%B %d')} ({days_until} days). Prepare for energy transition."
        else:
            return "✅ No critical days detected in forecast period. Stable energy transitions ahead."

    def _get_optimization_guidance(self, snapshot, results) -> str:
        """Generate energy optimization guidance."""
        guidance = []

        # Overall energy guidance
        energy_level = snapshot.overall_energy
        for (min_val, max_val), description in self.energy_interpretations.items():
            if min_val <= energy_level <= max_val:
                guidance.append(f"Energy Level: {description}")
                break

        # Specific cycle recommendations
        if snapshot.cycles['physical'].phase == 'peak':
            guidance.append("Physical Peak: Ideal for challenging workouts or physical projects")
        if snapshot.cycles['emotional'].phase == 'peak':
            guidance.append("Emotional Peak: Perfect for creative expression and relationship building")
        if snapshot.cycles['intellectual'].phase == 'peak':
            guidance.append("Intellectual Peak: Optimal for complex problem-solving and learning")

        # Best days ahead
        best_days = results['best_days']
        if best_days:
            next_best = min(best_days)
            if next_best != snapshot.target_date:
                days_until = (next_best - snapshot.target_date).days
                guidance.append(f"Next High Energy Day: {next_best.strftime('%B %d')} ({days_until} days)")

        return "\n".join(guidance) if guidance else "Maintain current energy management practices"

    def _generate_recommendations(self, calculation_results: Dict[str, Any], input_data: BiorhythmInput) -> List[str]:
        """Generate actionable biorhythm recommendations."""
        snapshot = calculation_results['snapshot']
        recommendations = []

        # Phase-specific recommendations
        for cycle_name in ['physical', 'emotional', 'intellectual']:
            cycle = snapshot.cycles[cycle_name]
            if cycle.phase == 'critical':
                recommendations.append(f"Practice extra mindfulness with {cycle_name} activities today")
            elif cycle.phase == 'peak':
                recommendations.append(f"Leverage your {cycle_name} peak for important tasks")
            elif cycle.phase == 'valley':
                recommendations.append(f"Allow {cycle_name} recovery and avoid overexertion")

        # Overall energy recommendations
        if snapshot.overall_energy > 50:
            recommendations.append("High energy day - tackle challenging projects")
        elif snapshot.overall_energy < -25:
            recommendations.append("Low energy period - prioritize rest and self-care")

        # Critical day recommendations
        if snapshot.critical_day:
            recommendations.append("Critical day active - practice patience and avoid major decisions")

        # Trend-based recommendations
        if snapshot.trend == 'ascending':
            recommendations.append("Energy building - good time to start new initiatives")
        elif snapshot.trend == 'descending':
            recommendations.append("Energy declining - focus on completing existing projects")

        # General recommendations
        recommendations.extend([
            "Track your energy patterns to optimize daily scheduling",
            "Use biorhythm awareness for better work-life balance",
            "Plan important activities during your peak energy phases"
        ])

        return recommendations

    def _generate_reality_patches(self, calculation_results: Dict[str, Any], input_data: BiorhythmInput) -> List[str]:
        """Generate WitnessOS reality patches."""
        snapshot = calculation_results['snapshot']
        patches = [
            "Install: Biorhythm synchronization protocol",
            "Patch: Energy field optimization matrix",
            "Upgrade: Cyclical awareness enhancement module"
        ]

        # Add specific patches based on current state
        if snapshot.critical_day:
            patches.append("Activate: Critical day navigation system")

        if snapshot.overall_energy > 75:
            patches.append("Optimize: Peak performance amplification")
        elif snapshot.overall_energy < -50:
            patches.append("Initialize: Deep recovery restoration sequence")

        if snapshot.trend == 'ascending':
            patches.append("Enable: Momentum building acceleration")
        elif snapshot.trend == 'descending':
            patches.append("Engage: Graceful energy transition protocol")

        return patches

    def _identify_archetypal_themes(self, calculation_results: Dict[str, Any], input_data: BiorhythmInput) -> List[str]:
        """Identify archetypal themes from biorhythm state."""
        snapshot = calculation_results['snapshot']
        themes = []

        # Energy level themes
        if snapshot.overall_energy > 50:
            themes.extend(["Vitality", "Dynamic Force", "Active Principle"])
        elif snapshot.overall_energy < -25:
            themes.extend(["Regeneration", "Receptive Principle", "Inner Wisdom"])
        else:
            themes.extend(["Balance", "Equilibrium", "Centered Being"])

        # Phase-specific themes
        peak_cycles = [name for name, cycle in snapshot.cycles.items()
                      if cycle.phase == 'peak' and name in ['physical', 'emotional', 'intellectual']]

        if 'physical' in peak_cycles:
            themes.append("Warrior")
        if 'emotional' in peak_cycles:
            themes.append("Artist")
        if 'intellectual' in peak_cycles:
            themes.append("Sage")

        # Critical day themes
        if snapshot.critical_day:
            themes.extend(["Transformer", "Threshold Guardian", "Catalyst"])

        # Trend themes
        if snapshot.trend == 'ascending':
            themes.append("Rising Phoenix")
        elif snapshot.trend == 'descending':
            themes.append("Wise Elder")

        return themes

    def _calculate_confidence(self, calculation_results: Dict[str, Any], input_data: BiorhythmInput) -> float:
        """Calculate confidence score for biorhythm results."""
        confidence = 1.0

        # Reduce confidence for very recent births (less than 30 days)
        snapshot = calculation_results['snapshot']
        if snapshot.days_alive < 30:
            confidence -= 0.1

        # Biorhythm calculations are mathematically precise
        return max(0.9, confidence)

    def calculate(self, input_data: Any) -> BiorhythmOutput:
        """
        Override the base calculate method to properly create BiorhythmOutput.
        """
        from shared.base.data_models import start_timer, end_timer, create_field_signature
        from datetime import datetime

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

            # Extract data from calculation results
            snapshot = calculation_results['snapshot']
            cycles = snapshot.cycles

            # Prepare cycle details
            cycle_details = {}
            for name, cycle in cycles.items():
                cycle_details[name] = {
                    'percentage': cycle.percentage,
                    'phase': cycle.phase,
                    'days_to_peak': cycle.days_to_peak,
                    'days_to_valley': cycle.days_to_valley,
                    'next_critical': cycle.next_critical.isoformat()
                }

            # Prepare forecast summary
            forecast_summary = {
                'total_days': len(calculation_results['forecast']),
                'critical_days_count': len(calculation_results['critical_days']),
                'best_days_count': len(calculation_results['best_days']),
                'challenging_days_count': len(calculation_results['challenging_days']),
                'average_energy': sum(s.overall_energy for s in calculation_results['forecast']) / len(calculation_results['forecast'])
            }

            # Create BiorhythmOutput with all required fields
            output = BiorhythmOutput(
                # Base fields
                engine_name=self.engine_name,
                calculation_time=calculation_time,
                confidence_score=confidence,
                raw_data=calculation_results,
                formatted_output=interpretation,
                recommendations=recommendations,
                field_signature=field_signature,
                reality_patches=reality_patches,
                archetypal_themes=archetypal_themes,

                # Biorhythm-specific fields
                birth_date=validated_input.birth_date,
                target_date=snapshot.target_date,
                days_alive=snapshot.days_alive,

                # Core cycles
                physical_percentage=cycles['physical'].percentage,
                emotional_percentage=cycles['emotional'].percentage,
                intellectual_percentage=cycles['intellectual'].percentage,

                # Extended cycles (if included)
                intuitive_percentage=cycles.get('intuitive', {}).percentage if 'intuitive' in cycles else None,
                aesthetic_percentage=cycles.get('aesthetic', {}).percentage if 'aesthetic' in cycles else None,
                spiritual_percentage=cycles.get('spiritual', {}).percentage if 'spiritual' in cycles else None,

                # Phases
                physical_phase=cycles['physical'].phase,
                emotional_phase=cycles['emotional'].phase,
                intellectual_phase=cycles['intellectual'].phase,

                # Overall metrics
                overall_energy=snapshot.overall_energy,
                critical_day=snapshot.critical_day,
                trend=snapshot.trend,

                # Detailed information
                cycle_details=cycle_details,
                critical_days_ahead=calculation_results['critical_days'],
                forecast_summary=forecast_summary,
                best_days_ahead=calculation_results['best_days'],
                challenging_days_ahead=calculation_results['challenging_days'],

                # Energy optimization
                energy_optimization=self._get_energy_optimization(snapshot),
                cycle_synchronization=self._get_cycle_synchronization(snapshot)
            )

            # Update engine statistics
            self._last_calculation_time = calculation_time
            self._total_calculations += 1

            self.logger.info(f"Calculation completed in {calculation_time:.4f}s")

            return output

        except Exception as e:
            calculation_time = end_timer(start_time)
            self.logger.error(f"Calculation failed after {calculation_time:.4f}s: {str(e)}")
            from shared.base.data_models import EngineError
            raise EngineError(f"Calculation failed for {self.engine_name}: {str(e)}")

    def _get_energy_optimization(self, snapshot) -> Dict[str, str]:
        """Get energy optimization recommendations."""
        optimization = {}

        for cycle_name in ['physical', 'emotional', 'intellectual']:
            cycle = snapshot.cycles[cycle_name]
            if cycle.phase == 'peak':
                optimization[cycle_name] = f"Maximize {cycle_name} activities - peak performance window"
            elif cycle.phase == 'valley':
                optimization[cycle_name] = f"Minimize {cycle_name} demands - recovery period"
            elif cycle.phase == 'critical':
                optimization[cycle_name] = f"Exercise caution with {cycle_name} activities - transition phase"
            else:
                optimization[cycle_name] = f"Moderate {cycle_name} activities - {cycle.phase} phase"

        return optimization

    def _get_cycle_synchronization(self, snapshot) -> Dict[str, Any]:
        """Get cycle synchronization insights."""
        sync_data = {
            'aligned_cycles': [],
            'conflicting_cycles': [],
            'synchronization_score': 0
        }

        cycles = ['physical', 'emotional', 'intellectual']
        positive_cycles = [name for name in cycles if snapshot.cycles[name].percentage > 0]
        negative_cycles = [name for name in cycles if snapshot.cycles[name].percentage < 0]

        # Check for alignment
        if len(positive_cycles) >= 2:
            sync_data['aligned_cycles'] = positive_cycles
        if len(negative_cycles) >= 2:
            sync_data['aligned_cycles'].extend(negative_cycles)

        # Check for conflicts
        if len(positive_cycles) == 1 and len(negative_cycles) == 2:
            sync_data['conflicting_cycles'] = [positive_cycles[0], negative_cycles]
        elif len(negative_cycles) == 1 and len(positive_cycles) == 2:
            sync_data['conflicting_cycles'] = [negative_cycles[0], positive_cycles]

        # Calculate synchronization score
        total_alignment = len(sync_data['aligned_cycles'])
        total_conflict = len(sync_data['conflicting_cycles'])
        sync_data['synchronization_score'] = max(0, (total_alignment - total_conflict) / 3)

        return sync_data


# Export the engine
__all__ = ["BiorhythmEngine"]
