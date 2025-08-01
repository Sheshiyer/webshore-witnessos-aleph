"""
VedicClock-TCM Integration Engine for WitnessOS

Multi-dimensional consciousness optimization system combining:
- Vimshottari Dasha (macro life curriculum)
- Vedic Panchanga (daily cosmic energies) 
- TCM Organ Clock (bodily energy cycles)
- Personal chart integration for personalized guidance

This engine provides moment-by-moment consciousness optimization
within the context of larger life curriculum patterns.
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Type, Optional, Tuple
from pathlib import Path

from shared.base.engine_interface import BaseEngine
from shared.base.data_models import BaseEngineInput, BaseEngineOutput
from shared.base.utils import load_json_data
from .vedicclock_tcm_models import (
    VedicClockTCMInput, VedicClockTCMOutput, VedicClockTCMData,
    VimshottariContext, PanchangaState, TCMOrganState,
    ElementalSynthesis, ConsciousnessOptimization, OptimizationWindow
)


class VedicClockTCMEngine(BaseEngine):
    """
    VedicClock-TCM Integration Engine
    
    Provides multi-dimensional consciousness optimization by synthesizing:
    1. Personal Vimshottari Dasha context (life curriculum)
    2. Current Vedic Panchanga state (cosmic energies)
    3. TCM Organ Clock cycles (bodily rhythms)
    4. Elemental correspondences and harmonies
    
    Returns personalized consciousness guidance for optimal spiritual development.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__(config)
        self.engine_data: Optional[VedicClockTCMData] = None
        self._load_engine_data()
    
    @property
    def engine_name(self) -> str:
        return "VedicClock-TCM Integration"
    
    @property
    def description(self) -> str:
        return "Multi-dimensional consciousness optimization combining Vedic time cycles with TCM organ rhythms for personalized spiritual guidance"
    
    @property
    def input_model(self) -> Type[BaseEngineInput]:
        return VedicClockTCMInput
    
    @property
    def output_model(self) -> Type[BaseEngineOutput]:
        return VedicClockTCMOutput
    
    def _load_engine_data(self):
        """Load VedicClock-TCM engine data files."""
        try:
            data_dir = Path(__file__).parent / "data"

            # Initialize with empty data first
            self.engine_data = VedicClockTCMData()

            # Try to load data files, but don't fail if they're missing
            try:
                dasha_data = self._load_json_file(data_dir / "vimshottari_periods.json")
                panchanga_data = self._load_json_file(data_dir / "panchanga_qualities.json")
                tcm_data = self._load_json_file(data_dir / "tcm_organ_clock.json")
                correspondences = self._load_json_file(data_dir / "vedic_tcm_correspondences.json")
                practices = self._load_json_file(data_dir / "consciousness_practices.json")

                self.engine_data = VedicClockTCMData(
                    dasha_periods=dasha_data.get("periods", {}),
                    planetary_qualities=dasha_data.get("planetary_qualities", {}),
                    tithi_qualities=panchanga_data.get("tithi", {}),
                    nakshatra_qualities=panchanga_data.get("nakshatra", {}),
                    yoga_qualities=panchanga_data.get("yoga", {}),
                    organ_clock_schedule=tcm_data.get("schedule", {}),
                    element_cycles=tcm_data.get("elements", {}),
                    vedic_tcm_correspondences=correspondences,
                    consciousness_practices=practices
                )
                print(f"✅ VedicClock-TCM data loaded successfully")

            except Exception as data_error:
                print(f"⚠️ Warning: Could not load VedicClock-TCM data files: {data_error}")
                print("🔄 Using minimal data for basic functionality")

        except Exception as e:
            print(f"❌ Error initializing VedicClock-TCM engine: {e}")
            # Initialize with minimal data for basic functionality
            self.engine_data = VedicClockTCMData()
    
    def _load_json_file(self, file_path: Path) -> Dict[str, Any]:
        """Load a JSON data file."""
        try:
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load {file_path}: {e}")
        return {}
    
    def _calculate(self, validated_input: VedicClockTCMInput) -> Dict[str, Any]:
        """
        Perform the core VedicClock-TCM calculation logic.

        Args:
            validated_input: Validated input data

        Returns:
            Dictionary containing raw calculation results
        """
        # Parse target date/time (default to now)
        target_datetime = self._parse_target_datetime(validated_input)

        # 1. Calculate personal Vimshottari Dasha context
        vimshottari_context = self._calculate_vimshottari_context(
            validated_input, target_datetime
        )

        # 2. Determine current Panchanga state
        panchanga_state = self._calculate_panchanga_state(target_datetime)

        # 3. Calculate TCM Organ Clock state
        tcm_organ_state = self._calculate_tcm_organ_state(target_datetime)

        # 4. Synthesize elemental energies
        elemental_synthesis = self._synthesize_elements(
            panchanga_state, tcm_organ_state
        )

        # 5. Calculate personal resonance
        personal_resonance = self._calculate_personal_resonance(
            validated_input, vimshottari_context, panchanga_state, tcm_organ_state
        )

        # 6. Generate consciousness optimization guidance
        consciousness_optimization = self._generate_consciousness_optimization(
            validated_input, vimshottari_context, panchanga_state,
            tcm_organ_state, elemental_synthesis, personal_resonance
        )

        # 7. Generate future optimization windows (if requested)
        upcoming_windows = None
        if validated_input.include_predictions:
            upcoming_windows = self._generate_optimization_windows(
                validated_input, target_datetime
            )

        # 8. Create daily curriculum and homework
        daily_curriculum, homework_practices, progress_indicators = (
            self._create_consciousness_curriculum(
                vimshottari_context, consciousness_optimization, validated_input
            )
        )

        return {
            'vimshottari_context': vimshottari_context,
            'panchanga_state': panchanga_state,
            'tcm_organ_state': tcm_organ_state,
            'elemental_synthesis': elemental_synthesis,
            'consciousness_optimization': consciousness_optimization,
            'personal_resonance_score': personal_resonance,
            'optimal_energy_window': personal_resonance > 0.7,
            'upcoming_windows': upcoming_windows,
            'daily_curriculum': daily_curriculum,
            'homework_practices': homework_practices,
            'progress_indicators': progress_indicators
        }

    def _interpret(self, calculation_results: Dict[str, Any], input_data: VedicClockTCMInput) -> str:
        """
        Interpret VedicClock-TCM calculation results into human-readable format.

        Args:
            calculation_results: Raw calculation results
            input_data: Original input data

        Returns:
            Human-readable interpretation string
        """
        vimshottari = calculation_results['vimshottari_context']
        panchanga = calculation_results['panchanga_state']
        tcm = calculation_results['tcm_organ_state']
        elemental = calculation_results['elemental_synthesis']
        optimization = calculation_results['consciousness_optimization']
        resonance = calculation_results['personal_resonance_score']

        return self._format_output(
            vimshottari, panchanga, tcm, elemental, optimization, resonance
        )

    async def calculate(self, input_data: VedicClockTCMInput) -> VedicClockTCMOutput:
        """
        Main calculation method for VedicClock-TCM integration.

        Performs multi-dimensional analysis combining:
        1. Personal Vimshottari Dasha calculation
        2. Current Panchanga state analysis
        3. TCM Organ Clock state determination
        4. Elemental synthesis and harmony assessment
        5. Personalized consciousness optimization recommendations
        """
        try:
            start_time = datetime.now()

            # Use the abstract _calculate method
            calculation_results = self._calculate(input_data)

            # Calculate processing time
            calculation_time = (datetime.now() - start_time).total_seconds()

            # Generate formatted output using _interpret method
            formatted_output = self._interpret(calculation_results, input_data)

            return VedicClockTCMOutput(
                engine_name=self.engine_name,
                calculation_time=calculation_time,
                confidence_score=0.92,  # High confidence for established systems
                field_signature=self._generate_field_signature(input_data),
                formatted_output=formatted_output,

                # Core Analysis
                vimshottari_context=calculation_results['vimshottari_context'],
                panchanga_state=calculation_results['panchanga_state'],
                tcm_organ_state=calculation_results['tcm_organ_state'],

                # Synthesis
                elemental_synthesis=calculation_results['elemental_synthesis'],
                consciousness_optimization=calculation_results['consciousness_optimization'],

                # Personal Resonance
                personal_resonance_score=calculation_results['personal_resonance_score'],
                optimal_energy_window=calculation_results['optimal_energy_window'],

                # Predictions
                upcoming_windows=calculation_results['upcoming_windows'],

                # Integration Guidance
                daily_curriculum=calculation_results['daily_curriculum'],
                homework_practices=calculation_results['homework_practices'],
                progress_indicators=calculation_results['progress_indicators']
            )

        except Exception as e:
            raise Exception(f"VedicClock-TCM calculation failed: {str(e)}")
    
    def _parse_target_datetime(self, input_data: VedicClockTCMInput) -> datetime:
        """Parse target date and time from input."""
        try:
            if input_data.target_date:
                date_part = datetime.strptime(input_data.target_date, "%Y-%m-%d").date()
            else:
                date_part = datetime.now().date()

            if input_data.target_time:
                time_part = datetime.strptime(input_data.target_time, "%H:%M").time()
            else:
                time_part = datetime.now().time()

            return datetime.combine(date_part, time_part)
        except Exception:
            return datetime.now()
    
    def _calculate_vimshottari_context(
        self, input_data: VedicClockTCMInput, target_datetime: datetime
    ) -> VimshottariContext:
        """Calculate current Vimshottari Dasha context."""
        # Simplified calculation - in production, use proper Vedic calculations
        birth_datetime = datetime.combine(input_data.birth_date, input_data.birth_time)
        age_years = (target_datetime - birth_datetime).days / 365.25
        
        # Basic dasha progression (simplified)
        dasha_sequence = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
        dasha_periods = [7, 20, 6, 10, 7, 18, 16, 19, 17]  # Years
        
        total_years = 0
        current_dasha = "Jupiter"  # Default
        remaining_years = 8.5
        
        for i, (planet, period) in enumerate(zip(dasha_sequence, dasha_periods)):
            if age_years <= total_years + period:
                current_dasha = planet
                remaining_years = total_years + period - age_years
                break
            total_years += period
        
        return VimshottariContext(
            mahadasha_lord=current_dasha,
            mahadasha_remaining_years=remaining_years,
            antardasha_lord="Mercury",  # Simplified
            antardasha_remaining_months=3.2,
            pratyantardasha_lord="Venus",
            life_lesson_theme=self._get_dasha_theme(current_dasha),
            karmic_focus=self._get_karmic_focus(current_dasha)
        )
    
    def _get_dasha_theme(self, planet: str) -> str:
        """Get life lesson theme for dasha period."""
        themes = {
            "Jupiter": "Expansion through wisdom and spiritual growth",
            "Saturn": "Discipline, structure, and karmic lessons",
            "Mercury": "Communication, learning, and intellectual development",
            "Venus": "Love, creativity, and material harmony",
            "Mars": "Action, courage, and energy mastery",
            "Moon": "Emotional intelligence and intuitive development",
            "Sun": "Leadership, self-expression, and soul purpose",
            "Rahu": "Innovation, breaking patterns, and material success",
            "Ketu": "Spiritual detachment and inner wisdom"
        }
        return themes.get(planet, "Personal growth and development")
    
    def _get_karmic_focus(self, planet: str) -> str:
        """Get karmic focus for dasha period."""
        focuses = {
            "Jupiter": "Teaching, mentoring, and sharing wisdom",
            "Saturn": "Building lasting foundations and accepting responsibility",
            "Mercury": "Clear communication and intellectual honesty",
            "Venus": "Harmonious relationships and creative expression",
            "Mars": "Righteous action and energy management",
            "Moon": "Emotional healing and nurturing others",
            "Sun": "Authentic self-expression and leadership",
            "Rahu": "Breaking limiting patterns and embracing change",
            "Ketu": "Releasing attachments and spiritual surrender"
        }
        return focuses.get(planet, "Personal evolution and growth")
    
    def _calculate_panchanga_state(self, target_datetime: datetime) -> PanchangaState:
        """Calculate current Vedic Panchanga state."""
        # Simplified calculation - in production, use proper astronomical calculations
        day_of_year = target_datetime.timetuple().tm_yday

        # Basic tithi calculation (simplified)
        tithi_names = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
                      "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
                      "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"]
        current_tithi = tithi_names[day_of_year % 15]

        # Basic nakshatra calculation
        nakshatra_names = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
                          "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha"]
        current_nakshatra = nakshatra_names[day_of_year % 10]

        # Determine dominant element based on time and nakshatra
        elements = ["Fire", "Earth", "Air", "Water", "Ether"]
        dominant_element = elements[target_datetime.hour % 5]

        return PanchangaState(
            tithi=current_tithi,
            vara=target_datetime.strftime("%A"),
            nakshatra=current_nakshatra,
            yoga="Vishkumbha",  # Simplified
            karana="Bava",      # Simplified
            dominant_element=dominant_element,
            energy_quality=self._determine_energy_quality(target_datetime),
            auspiciousness_score=self._calculate_auspiciousness(target_datetime)
        )

    def _calculate_tcm_organ_state(self, target_datetime: datetime) -> TCMOrganState:
        """Calculate current TCM Organ Clock state."""
        hour = target_datetime.hour

        # TCM Organ Clock (24-hour cycle)
        organ_schedule = {
            1: ("Liver", "Wood"), 3: ("Liver", "Wood"),
            5: ("Lung", "Metal"), 7: ("Large Intestine", "Metal"),
            9: ("Stomach", "Earth"), 11: ("Spleen", "Earth"),
            13: ("Heart", "Fire"), 15: ("Small Intestine", "Fire"),
            17: ("Bladder", "Water"), 19: ("Kidney", "Water"),
            21: ("Pericardium", "Fire"), 23: ("Triple Heater", "Fire")
        }

        # Find current organ
        current_hour_key = ((hour - 1) // 2) * 2 + 1
        if current_hour_key not in organ_schedule:
            current_hour_key = 1

        primary_organ, element = organ_schedule[current_hour_key]

        # Determine energy direction
        hour_in_cycle = hour % 2
        if hour_in_cycle == 0:
            energy_direction = "peak"
        else:
            energy_direction = "ascending"

        return TCMOrganState(
            primary_organ=primary_organ,
            secondary_organ=self._get_secondary_organ(primary_organ),
            element=element,
            energy_direction=energy_direction,
            optimal_activities=self._get_optimal_activities(primary_organ, energy_direction),
            avoid_activities=self._get_avoid_activities(primary_organ)
        )

    def _synthesize_elements(self, panchanga: PanchangaState, tcm: TCMOrganState) -> ElementalSynthesis:
        """Synthesize Vedic and TCM elemental energies."""
        # Element correspondence mapping
        vedic_tcm_harmony = {
            ("Fire", "Fire"): 1.0,
            ("Fire", "Wood"): 0.8,
            ("Earth", "Earth"): 1.0,
            ("Earth", "Metal"): 0.7,
            ("Air", "Metal"): 0.9,
            ("Water", "Water"): 1.0,
            ("Water", "Wood"): 0.8,
            ("Ether", "Fire"): 0.9
        }

        harmony_key = (panchanga.dominant_element, tcm.element)
        harmony_level = vedic_tcm_harmony.get(harmony_key, 0.6)

        synthesis_qualities = {
            1.0: "Perfect Harmony",
            0.9: "Excellent Synergy",
            0.8: "Good Resonance",
            0.7: "Moderate Alignment",
            0.6: "Neutral Balance"
        }

        synthesis_quality = synthesis_qualities.get(harmony_level, "Requires Balancing")

        return ElementalSynthesis(
            vedic_element=panchanga.dominant_element,
            tcm_element=tcm.element,
            harmony_level=harmony_level,
            synthesis_quality=synthesis_quality,
            recommended_practices=self._get_harmonizing_practices(panchanga.dominant_element, tcm.element)
        )

    def _calculate_personal_resonance(
        self, input_data: VedicClockTCMInput, vimshottari: VimshottariContext,
        panchanga: PanchangaState, tcm: TCMOrganState
    ) -> float:
        """Calculate how well current energies align with personal chart."""
        resonance_factors = []

        # Dasha alignment (simplified)
        if vimshottari.mahadasha_lord in ["Jupiter", "Venus", "Mercury"]:
            resonance_factors.append(0.8)
        else:
            resonance_factors.append(0.6)

        # Time-based resonance
        current_hour = datetime.now().hour
        if 6 <= current_hour <= 18:  # Daytime
            resonance_factors.append(0.7)
        else:
            resonance_factors.append(0.5)

        # Elemental resonance
        if panchanga.dominant_element == tcm.element:
            resonance_factors.append(0.9)
        else:
            resonance_factors.append(0.6)

        return sum(resonance_factors) / len(resonance_factors)

    def _generate_field_signature(self, input_data: VedicClockTCMInput) -> str:
        """Generate unique field signature for this calculation."""
        components = [
            input_data.birth_date.strftime("%Y-%m-%d"),
            input_data.birth_time.strftime("%H:%M"),
            f"{input_data.birth_location[0]:.2f},{input_data.birth_location[1]:.2f}",
            input_data.target_date or "now",
            input_data.analysis_depth
        ]
        return f"vedicclock_tcm_{'_'.join(components)}"

    # Helper methods for calculations
    def _determine_energy_quality(self, dt: datetime) -> str:
        """Determine overall energy quality for the time."""
        hour = dt.hour
        if 6 <= hour <= 10:
            return "Rising Energy"
        elif 10 <= hour <= 14:
            return "Peak Energy"
        elif 14 <= hour <= 18:
            return "Stable Energy"
        elif 18 <= hour <= 22:
            return "Descending Energy"
        else:
            return "Rest Energy"

    def _calculate_auspiciousness(self, dt: datetime) -> float:
        """Calculate auspiciousness score for the time."""
        # Simplified calculation based on time and day
        base_score = 0.5

        # Time-based adjustments
        hour = dt.hour
        if 6 <= hour <= 18:  # Daytime
            base_score += 0.2

        # Day-based adjustments
        if dt.weekday() in [0, 2, 4]:  # Monday, Wednesday, Friday
            base_score += 0.1

        return min(base_score, 1.0)

    def _get_secondary_organ(self, primary_organ: str) -> str:
        """Get secondary organ for TCM state."""
        secondary_map = {
            "Liver": "Gallbladder",
            "Heart": "Small Intestine",
            "Spleen": "Stomach",
            "Lung": "Large Intestine",
            "Kidney": "Bladder"
        }
        return secondary_map.get(primary_organ, "Supporting Organ")

    def _get_optimal_activities(self, organ: str, energy_direction: str) -> List[str]:
        """Get optimal activities for current organ and energy state."""
        activities_map = {
            "Liver": ["Creative work", "Planning", "Detoxification", "Gentle exercise"],
            "Heart": ["Social connection", "Joyful activities", "Meditation", "Heart-opening practices"],
            "Spleen": ["Nourishing meals", "Grounding practices", "Organizing", "Earth connection"],
            "Lung": ["Breathing exercises", "Fresh air activities", "Letting go practices", "Inspiration work"],
            "Kidney": ["Rest", "Reflection", "Water activities", "Willpower building"]
        }
        return activities_map.get(organ, ["Mindful awareness", "Present moment practices"])

    def _get_avoid_activities(self, organ: str) -> List[str]:
        """Get activities to avoid during organ's peak time."""
        avoid_map = {
            "Liver": ["Heavy meals", "Alcohol", "Anger", "Overwork"],
            "Heart": ["Stress", "Overstimulation", "Conflict", "Heavy exercise"],
            "Spleen": ["Cold foods", "Worry", "Overthinking", "Irregular eating"],
            "Lung": ["Pollution", "Grief", "Shallow breathing", "Isolation"],
            "Kidney": ["Overexertion", "Fear", "Excessive salt", "Dehydration"]
        }
        return avoid_map.get(organ, ["Excessive stress", "Mindless activities"])

    def _get_harmonizing_practices(self, vedic_element: str, tcm_element: str) -> List[str]:
        """Get practices to harmonize Vedic and TCM elements."""
        practices = {
            ("Fire", "Fire"): ["Fire meditation", "Sun gazing", "Candle work", "Heart coherence"],
            ("Fire", "Wood"): ["Creative expression", "Growth visualization", "Tree meditation"],
            ("Earth", "Earth"): ["Grounding practices", "Earth connection", "Stability meditation"],
            ("Air", "Metal"): ["Breathing practices", "Sound healing", "Mental clarity work"],
            ("Water", "Water"): ["Flow meditation", "Emotional release", "Water ceremonies"]
        }
        key = (vedic_element, tcm_element)
        return practices.get(key, ["Elemental balancing", "Mindful integration", "Energy harmonization"])

    def _generate_consciousness_optimization(
        self, input_data: VedicClockTCMInput, vimshottari: VimshottariContext,
        panchanga: PanchangaState, tcm: TCMOrganState,
        elemental_synthesis: ElementalSynthesis, personal_resonance: float
    ) -> ConsciousnessOptimization:
        """Generate personalized consciousness optimization recommendations."""

        # Primary focus based on dasha and current energies
        primary_focus = f"{vimshottari.life_lesson_theme} through {tcm.element} element mastery"

        # Secondary focuses
        secondary_focuses = [
            f"Harmonizing {panchanga.dominant_element}-{tcm.element} energies",
            f"Optimizing {tcm.primary_organ} function",
            "Integrating cosmic and bodily rhythms"
        ]

        # Optimal practices
        optimal_practices = elemental_synthesis.recommended_practices + tcm.optimal_activities[:2]

        # Timing guidance
        timing_guidance = f"Best practiced during {tcm.energy_direction} phase of {tcm.primary_organ} time"

        # Energy management
        energy_management = f"Work with {panchanga.energy_quality.lower()} while supporting {tcm.element} element"

        # Integration method
        integration_method = "Combine daily practices with moment-by-moment awareness of energy shifts"

        return ConsciousnessOptimization(
            primary_focus=primary_focus,
            secondary_focuses=secondary_focuses,
            optimal_practices=optimal_practices,
            timing_guidance=timing_guidance,
            energy_management=energy_management,
            integration_method=integration_method
        )

    def _generate_optimization_windows(
        self, input_data: VedicClockTCMInput, target_datetime: datetime
    ) -> List[OptimizationWindow]:
        """Generate future optimization windows."""
        windows = []

        for hours_ahead in range(2, input_data.prediction_hours, 4):
            future_time = target_datetime + timedelta(hours=hours_ahead)

            # Calculate future states
            future_tcm = self._calculate_tcm_organ_state(future_time)
            future_panchanga = self._calculate_panchanga_state(future_time)

            # Determine window quality
            potency_score = self._calculate_window_potency(future_tcm, future_panchanga)

            if potency_score > 0.6:  # Only include good windows
                windows.append(OptimizationWindow(
                    start_time=future_time.isoformat(),
                    end_time=(future_time + timedelta(hours=2)).isoformat(),
                    opportunity_type=f"{future_tcm.element} Element Optimization",
                    energy_quality=f"{future_tcm.energy_direction} {future_tcm.primary_organ}",
                    recommended_activities=future_tcm.optimal_activities[:3],
                    potency_score=potency_score
                ))

        return sorted(windows, key=lambda w: w.potency_score, reverse=True)[:5]

    def _calculate_window_potency(self, tcm: TCMOrganState, panchanga: PanchangaState) -> float:
        """Calculate potency score for an optimization window."""
        base_score = 0.5

        # TCM energy direction bonus
        if tcm.energy_direction == "peak":
            base_score += 0.3
        elif tcm.energy_direction == "ascending":
            base_score += 0.2

        # Elemental harmony bonus
        if panchanga.dominant_element == tcm.element:
            base_score += 0.2

        # Auspiciousness bonus
        base_score += panchanga.auspiciousness_score * 0.2

        return min(base_score, 1.0)

    def _create_consciousness_curriculum(
        self, vimshottari: VimshottariContext, optimization: ConsciousnessOptimization,
        input_data: VedicClockTCMInput
    ) -> Tuple[str, List[str], List[str]]:
        """Create daily consciousness curriculum and homework."""

        # Daily curriculum
        curriculum = f"Today's Consciousness Curriculum: {optimization.primary_focus}. " \
                    f"Context: {vimshottari.mahadasha_lord} Dasha - {vimshottari.life_lesson_theme}. " \
                    f"Integration Method: {optimization.integration_method}"

        # Homework practices
        homework = optimization.optimal_practices[:3] + [
            "Morning energy assessment",
            "Hourly consciousness check-ins",
            "Evening integration reflection"
        ]

        # Progress indicators
        progress_indicators = [
            "Increased awareness of energy shifts throughout the day",
            "Better alignment between activities and optimal timing",
            "Enhanced integration of spiritual practices with daily life",
            f"Deeper understanding of {vimshottari.mahadasha_lord} dasha lessons",
            "Improved harmony between mind, body, and cosmic rhythms"
        ]

        return curriculum, homework, progress_indicators

    def _format_output(
        self, vimshottari: VimshottariContext, panchanga: PanchangaState,
        tcm: TCMOrganState, elemental_synthesis: ElementalSynthesis,
        optimization: ConsciousnessOptimization, personal_resonance: float
    ) -> str:
        """Format the complete analysis output."""

        output = f"""
🕐 VEDICCLOCK-TCM CONSCIOUSNESS OPTIMIZATION REPORT

═══════════════════════════════════════════════════════════════

📅 VIMSHOTTARI DASHA CONTEXT (Life Curriculum)
• Mahadasha: {vimshottari.mahadasha_lord} ({vimshottari.mahadasha_remaining_years:.1f} years remaining)
• Antardasha: {vimshottari.antardasha_lord} ({vimshottari.antardasha_remaining_months:.1f} months remaining)
• Life Lesson: {vimshottari.life_lesson_theme}
• Karmic Focus: {vimshottari.karmic_focus}

🌙 VEDIC PANCHANGA STATE (Cosmic Energies)
• Tithi: {panchanga.tithi} | Nakshatra: {panchanga.nakshatra}
• Dominant Element: {panchanga.dominant_element}
• Energy Quality: {panchanga.energy_quality}
• Auspiciousness: {panchanga.auspiciousness_score:.1%}

🫀 TCM ORGAN CLOCK STATE (Bodily Rhythms)
• Primary Organ: {tcm.primary_organ} ({tcm.element} Element)
• Energy Phase: {tcm.energy_direction.title()}
• Optimal Activities: {', '.join(tcm.optimal_activities[:3])}
• Avoid: {', '.join(tcm.avoid_activities[:2])}

⚡ ELEMENTAL SYNTHESIS
• Vedic-TCM Harmony: {elemental_synthesis.harmony_level:.1%} ({elemental_synthesis.synthesis_quality})
• Recommended Practices: {', '.join(elemental_synthesis.recommended_practices[:3])}

🎯 CONSCIOUSNESS OPTIMIZATION
• Primary Focus: {optimization.primary_focus}
• Optimal Practices: {', '.join(optimization.optimal_practices[:3])}
• Timing Guidance: {optimization.timing_guidance}
• Energy Management: {optimization.energy_management}

📊 PERSONAL RESONANCE: {personal_resonance:.1%}
{'🟢 OPTIMAL ENERGY WINDOW' if personal_resonance > 0.7 else '🟡 MODERATE ALIGNMENT' if personal_resonance > 0.5 else '🔴 REQUIRES BALANCING'}

═══════════════════════════════════════════════════════════════
        """.strip()

        return output
