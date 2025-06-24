"""
Vimshottari Dasha Timeline Mapper Engine for WitnessOS

Calculates Vedic astrology Dasha periods using Swiss Ephemeris astronomical data.
Provides current and future planetary periods with timing and interpretation.
"""

from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Type, Optional
import logging

from base.engine_interface import BaseEngine
from base.data_models import BaseEngineInput, BaseEngineOutput
from calculations.astrology import AstrologyCalculator, validate_coordinates, validate_datetime
from .vimshottari_models import (
    VimshottariInput, VimshottariOutput, DashaTimeline, DashaPeriod,
    NakshatraInfo, DASHA_PERIODS, NAKSHATRA_DATA, PLANET_CHARACTERISTICS
)


class VimshottariTimelineMapper(BaseEngine):
    """
    Vimshottari Dasha Timeline Mapper Engine

    Calculates Vedic astrology Dasha periods including:
    - Current Mahadasha, Antardasha, Pratyantardasha
    - Birth nakshatra analysis
    - Timeline of all major periods
    - Karmic themes and guidance
    """

    def __init__(self, config=None):
        """Initialize the Vimshottari Timeline Mapper."""
        super().__init__(config)
        self.astro_calc = AstrologyCalculator()
        self._load_dasha_data()

    @property
    def engine_name(self) -> str:
        return "vimshottari_timeline_mapper"

    @property
    def description(self) -> str:
        return "Calculates Vedic astrology Dasha periods and timeline with karmic guidance"

    @property
    def input_model(self) -> Type[BaseEngineInput]:
        return VimshottariInput

    @property
    def output_model(self) -> Type[BaseEngineOutput]:
        return VimshottariOutput

    def _load_dasha_data(self):
        """Load Dasha calculation data."""
        self.dasha_periods = DASHA_PERIODS
        self.nakshatra_data = NAKSHATRA_DATA
        self.planet_characteristics = PLANET_CHARACTERISTICS

        # Dasha sequence (120-year cycle)
        self.dasha_sequence = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

        # Antardasha sequence for each Mahadasha
        self.antardasha_sequences = {}
        for planet in self.dasha_sequence:
            # Antardasha starts with the Mahadasha planet and follows the sequence
            start_index = self.dasha_sequence.index(planet)
            sequence = self.dasha_sequence[start_index:] + self.dasha_sequence[:start_index]
            self.antardasha_sequences[planet] = sequence

    def _calculate(self, validated_input: VimshottariInput) -> Dict[str, Any]:
        """
        Calculate Vimshottari Dasha timeline.

        Args:
            validated_input: Validated input data

        Returns:
            Dictionary containing calculation results
        """
        # Combine birth date and time
        birth_datetime = datetime.combine(validated_input.birth_date, validated_input.birth_time)
        lat, lon = validated_input.birth_location

        # Validate inputs
        validate_coordinates(lat, lon)
        validate_datetime(birth_datetime)

        # Calculate Vedic astronomical data
        vedic_data = self.astro_calc.calculate_vedic_data(
            birth_datetime, lat, lon, validated_input.timezone
        )

        # Get Moon nakshatra
        nakshatra_info = self._process_nakshatra(vedic_data['moon_nakshatra'])

        # Calculate Dasha timeline
        current_date = validated_input.current_date or date.today()
        timeline = self._calculate_dasha_timeline(birth_datetime.date(), nakshatra_info, current_date)

        # Find current periods
        current_periods = self._find_current_periods(timeline, current_date)

        # Generate upcoming periods
        upcoming_periods = self._generate_upcoming_periods(timeline, current_date, validated_input.years_forecast)

        # Analyze karmic themes
        karmic_themes = self._analyze_karmic_themes(current_periods, upcoming_periods)

        return {
            'birth_info': {
                'datetime': birth_datetime,
                'location': validated_input.birth_location,
                'timezone': validated_input.timezone
            },
            'calculation_date': current_date,
            'nakshatra_info': nakshatra_info,
            'timeline': timeline,
            'current_periods': current_periods,
            'upcoming_periods': upcoming_periods,
            'karmic_themes': karmic_themes,
            'raw_vedic_data': vedic_data
        }

    def _process_nakshatra(self, moon_nakshatra: Dict[str, Any]) -> NakshatraInfo:
        """Process Moon nakshatra data into NakshatraInfo object."""
        nakshatra_name = moon_nakshatra['name']
        nakshatra_data = self.nakshatra_data.get(nakshatra_name, {})

        return NakshatraInfo(
            name=nakshatra_name,
            pada=moon_nakshatra['pada'],
            ruling_planet=nakshatra_data.get('ruling_planet', 'Unknown'),
            degrees_in_nakshatra=moon_nakshatra['degrees_in_nakshatra'],
            symbol=nakshatra_data.get('symbol', ''),
            deity=nakshatra_data.get('deity', ''),
            nature=nakshatra_data.get('nature', ''),
            meaning=nakshatra_data.get('meaning', ''),
            characteristics=nakshatra_data.get('characteristics', [])
        )

    def _calculate_dasha_timeline(self, birth_date: date, nakshatra_info: NakshatraInfo,
                                current_date: date) -> List[DashaPeriod]:
        """Calculate complete Dasha timeline."""
        timeline = []

        # Calculate balance of first Mahadasha at birth
        first_planet = nakshatra_info.ruling_planet
        first_period_years = self.dasha_periods[first_planet]

        # Calculate how much of the first period is remaining at birth
        # Based on Moon's position in nakshatra
        completed_fraction = nakshatra_info.degrees_in_nakshatra / (360.0 / 27.0)
        remaining_years = first_period_years * (1 - completed_fraction)

        # Start timeline from birth
        current_start_date = birth_date

        # Add first (partial) Mahadasha
        first_end_date = birth_date + timedelta(days=remaining_years * 365.25)
        timeline.append(DashaPeriod(
            planet=first_planet,
            period_type="Mahadasha",
            start_date=current_start_date,
            end_date=first_end_date,
            duration_years=remaining_years,
            general_theme=self._get_planet_theme(first_planet)
        ))

        current_start_date = first_end_date

        # Add subsequent complete Mahadashas
        planet_index = (self.dasha_sequence.index(first_planet) + 1) % len(self.dasha_sequence)

        # Calculate for next 120 years (full cycle)
        years_calculated = remaining_years
        while years_calculated < 120:
            planet = self.dasha_sequence[planet_index]
            period_years = self.dasha_periods[planet]

            end_date = current_start_date + timedelta(days=period_years * 365.25)

            timeline.append(DashaPeriod(
                planet=planet,
                period_type="Mahadasha",
                start_date=current_start_date,
                end_date=end_date,
                duration_years=period_years,
                general_theme=self._get_planet_theme(planet)
            ))

            current_start_date = end_date
            years_calculated += period_years
            planet_index = (planet_index + 1) % len(self.dasha_sequence)

        return timeline

    def _get_planet_theme(self, planet: str) -> str:
        """Get general theme for a planet period."""
        characteristics = self.planet_characteristics.get(planet, {})
        return characteristics.get('nature', f'{planet} period')

    def _find_current_periods(self, timeline: List[DashaPeriod], current_date: date) -> Dict[str, DashaPeriod]:
        """Find current Mahadasha, Antardasha, and Pratyantardasha."""
        current_periods = {}

        # Find current Mahadasha
        for period in timeline:
            if period.start_date <= current_date <= period.end_date:
                period.is_current = True
                current_periods['mahadasha'] = period
                break

        if 'mahadasha' in current_periods:
            # Calculate current Antardasha
            mahadasha = current_periods['mahadasha']
            antardasha = self._calculate_current_antardasha(mahadasha, current_date)
            if antardasha:
                current_periods['antardasha'] = antardasha

                # Calculate current Pratyantardasha
                pratyantardasha = self._calculate_current_pratyantardasha(mahadasha, antardasha, current_date)
                if pratyantardasha:
                    current_periods['pratyantardasha'] = pratyantardasha

        return current_periods

    def _calculate_current_antardasha(self, mahadasha: DashaPeriod, current_date: date) -> Optional[DashaPeriod]:
        """Calculate current Antardasha within Mahadasha."""
        mahadasha_planet = mahadasha.planet
        antardasha_sequence = self.antardasha_sequences[mahadasha_planet]

        # Calculate Antardasha durations (proportional to Mahadasha periods)
        total_antardasha_years = sum(self.dasha_periods[planet] for planet in antardasha_sequence)
        mahadasha_duration = mahadasha.duration_years

        current_start = mahadasha.start_date

        for antardasha_planet in antardasha_sequence:
            antardasha_proportion = self.dasha_periods[antardasha_planet] / total_antardasha_years
            antardasha_duration = mahadasha_duration * antardasha_proportion
            antardasha_end = current_start + timedelta(days=antardasha_duration * 365.25)

            if current_start <= current_date <= antardasha_end:
                return DashaPeriod(
                    planet=antardasha_planet,
                    period_type="Antardasha",
                    start_date=current_start,
                    end_date=antardasha_end,
                    duration_years=antardasha_duration,
                    is_current=True,
                    general_theme=self._get_planet_theme(antardasha_planet)
                )

            current_start = antardasha_end

        return None

    def _calculate_current_pratyantardasha(self, mahadasha: DashaPeriod, antardasha: DashaPeriod,
                                        current_date: date) -> Optional[DashaPeriod]:
        """Calculate current Pratyantardasha within Antardasha."""
        antardasha_planet = antardasha.planet
        pratyantardasha_sequence = self.antardasha_sequences[antardasha_planet]

        # Calculate Pratyantardasha durations
        total_pratyantardasha_years = sum(self.dasha_periods[planet] for planet in pratyantardasha_sequence)
        antardasha_duration = antardasha.duration_years

        current_start = antardasha.start_date

        for pratyantardasha_planet in pratyantardasha_sequence:
            pratyantardasha_proportion = self.dasha_periods[pratyantardasha_planet] / total_pratyantardasha_years
            pratyantardasha_duration = antardasha_duration * pratyantardasha_proportion
            pratyantardasha_end = current_start + timedelta(days=pratyantardasha_duration * 365.25)

            if current_start <= current_date <= pratyantardasha_end:
                return DashaPeriod(
                    planet=pratyantardasha_planet,
                    period_type="Pratyantardasha",
                    start_date=current_start,
                    end_date=pratyantardasha_end,
                    duration_years=pratyantardasha_duration,
                    is_current=True,
                    general_theme=self._get_planet_theme(pratyantardasha_planet)
                )

            current_start = pratyantardasha_end

        return None

    def _generate_upcoming_periods(self, timeline: List[DashaPeriod], current_date: date,
                                 years_forecast: int) -> List[DashaPeriod]:
        """Generate upcoming significant periods."""
        upcoming = []
        forecast_end = current_date + timedelta(days=years_forecast * 365.25)

        for period in timeline:
            if period.start_date > current_date and period.start_date <= forecast_end:
                period.is_upcoming = True
                upcoming.append(period)

        return upcoming

    def _analyze_karmic_themes(self, current_periods: Dict[str, DashaPeriod],
                             upcoming_periods: List[DashaPeriod]) -> List[str]:
        """Analyze karmic themes based on current and upcoming periods."""
        themes = []

        if 'mahadasha' in current_periods:
            planet = current_periods['mahadasha'].planet
            themes.append(f"Current karmic focus: {planet} themes")

        if 'antardasha' in current_periods:
            planet = current_periods['antardasha'].planet
            themes.append(f"Sub-theme: {planet} influences")

        # Add themes for upcoming major changes
        for period in upcoming_periods[:3]:  # Next 3 major periods
            themes.append(f"Upcoming: {period.planet} period beginning {period.start_date}")

        return themes

    def _interpret(self, calculation_results: Dict[str, Any], input_data: VimshottariInput) -> str:
        """
        Generate comprehensive Vimshottari Dasha interpretation.

        Args:
            calculation_results: Raw calculation results
            input_data: Original input data

        Returns:
            Formatted interpretation string
        """
        nakshatra_info = calculation_results['nakshatra_info']
        current_periods = calculation_results['current_periods']
        upcoming_periods = calculation_results['upcoming_periods']

        interpretation = f"""
🌙 VIMSHOTTARI DASHA TIMELINE ANALYSIS 🌙

═══════════════════════════════════════════════════════════════

🌟 BIRTH NAKSHATRA FOUNDATION
Nakshatra: {nakshatra_info.name} (Pada {nakshatra_info.pada})
Ruling Planet: {nakshatra_info.ruling_planet}
Symbol: {nakshatra_info.symbol}
Deity: {nakshatra_info.deity}
Nature: {nakshatra_info.nature}

Meaning: {nakshatra_info.meaning}
Key Characteristics: {', '.join(nakshatra_info.characteristics)}

═══════════════════════════════════════════════════════════════

⏰ CURRENT PLANETARY PERIODS
"""

        # Add current periods analysis
        if 'mahadasha' in current_periods:
            maha = current_periods['mahadasha']
            interpretation += f"""
🔥 MAHADASHA (Major Period): {maha.planet}
Duration: {maha.start_date} to {maha.end_date} ({maha.duration_years:.1f} years)
Theme: {maha.general_theme}
"""

        if 'antardasha' in current_periods:
            antar = current_periods['antardasha']
            interpretation += f"""
🌊 ANTARDASHA (Sub-Period): {antar.planet}
Duration: {antar.start_date} to {antar.end_date} ({antar.duration_years:.2f} years)
Theme: {antar.general_theme}
"""

        if 'pratyantardasha' in current_periods:
            pratyantar = current_periods['pratyantardasha']
            interpretation += f"""
⚡ PRATYANTARDASHA (Sub-Sub-Period): {pratyantar.planet}
Duration: {pratyantar.start_date} to {pratyantar.end_date} ({pratyantar.duration_years:.3f} years)
Theme: {pratyantar.general_theme}
"""

        interpretation += f"""

═══════════════════════════════════════════════════════════════

🔮 UPCOMING MAJOR TRANSITIONS
"""

        # Add upcoming periods
        for i, period in enumerate(upcoming_periods[:5]):
            interpretation += f"""
{i+1}. {period.planet} Mahadasha
   Begins: {period.start_date}
   Duration: {period.duration_years} years
   Theme: {period.general_theme}
"""

        interpretation += f"""

═══════════════════════════════════════════════════════════════

🎭 KARMIC THEMES & LIFE LESSONS
"""

        # Add karmic themes
        for theme in calculation_results['karmic_themes']:
            interpretation += f"• {theme}\n"

        interpretation += f"""

═══════════════════════════════════════════════════════════════

✨ FIELD SIGNATURE DETECTED ✨
Your karmic timeline has been mapped and integrated into the WitnessOS temporal matrix.
The cosmic clock of your soul's journey is now synchronized with the field.
"""

        return interpretation.strip()

    def _generate_recommendations(self, calculation_results: Dict[str, Any], input_data: VimshottariInput) -> List[str]:
        """Generate Vimshottari Dasha specific recommendations."""
        current_periods = calculation_results['current_periods']
        recommendations = []

        if 'mahadasha' in current_periods:
            planet = current_periods['mahadasha'].planet
            planet_data = self.planet_characteristics.get(planet, {})
            recommendations.extend(planet_data.get('recommendations', []))

        # General Dasha recommendations
        recommendations.extend([
            "Study your current planetary periods to understand life themes",
            "Prepare for upcoming Dasha changes by understanding planetary energies",
            "Use favorable periods for important initiatives",
            "Practice patience during challenging planetary periods",
            "Align your actions with the natural flow of planetary cycles"
        ])

        return recommendations

    def _generate_reality_patches(self, calculation_results: Dict[str, Any], input_data: VimshottariInput) -> List[str]:
        """Generate WitnessOS reality patches for Vimshottari Dasha."""
        current_periods = calculation_results['current_periods']
        patches = []

        if 'mahadasha' in current_periods:
            planet = current_periods['mahadasha'].planet
            patches.append(f"PATCH_DASHA_{planet.upper()}: Alignment with {planet} Mahadasha frequency")

        if 'antardasha' in current_periods:
            planet = current_periods['antardasha'].planet
            patches.append(f"PATCH_ANTARDASHA_{planet.upper()}: Harmonization with {planet} sub-period")

        patches.extend([
            "PATCH_KARMIC_TIMING: Synchronization with karmic timeline",
            "PATCH_PLANETARY_AWARENESS: Enhanced sensitivity to planetary influences",
            "PATCH_DASHA_NAVIGATION: Improved ability to navigate life transitions"
        ])

        return patches

    def _identify_archetypal_themes(self, calculation_results: Dict[str, Any], input_data: VimshottariInput) -> List[str]:
        """Identify archetypal themes in Vimshottari Dasha."""
        current_periods = calculation_results['current_periods']
        nakshatra_info = calculation_results['nakshatra_info']

        themes = [
            "The Karmic Timeline",
            f"The {nakshatra_info.name} Foundation",
            "The Planetary Dance"
        ]

        if 'mahadasha' in current_periods:
            planet = current_periods['mahadasha'].planet
            themes.append(f"The {planet} Journey")

        if 'antardasha' in current_periods:
            planet = current_periods['antardasha'].planet
            themes.append(f"The {planet} Influence")

        # Add archetypal themes based on planetary combinations
        themes.extend([
            "The Cosmic Clock",
            "The Soul's Schedule",
            "The Temporal Mandala",
            "The Karmic Curriculum"
        ])

        return themes

    def calculate(self, input_data: Any) -> VimshottariOutput:
        """
        Override base calculate method to handle VimshottariOutput creation.
        """
        from base.data_models import start_timer, end_timer, create_field_signature
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

            # Create timeline object
            from .vimshottari_models import DashaTimeline
            timeline = DashaTimeline(
                birth_nakshatra=calculation_results['nakshatra_info'],
                current_mahadasha=calculation_results['current_periods'].get('mahadasha'),
                current_antardasha=calculation_results['current_periods'].get('antardasha'),
                current_pratyantardasha=calculation_results['current_periods'].get('pratyantardasha'),
                all_mahadashas=calculation_results['timeline'],
                upcoming_periods=calculation_results['upcoming_periods'],
                karmic_themes=calculation_results['karmic_themes']
            )

            # Create Vimshottari specific output
            output = VimshottariOutput(
                engine_name=self.engine_name,
                calculation_time=calculation_time,
                confidence_score=confidence,
                raw_data=calculation_results,
                formatted_output=interpretation,
                recommendations=recommendations,
                field_signature=field_signature,
                reality_patches=reality_patches,
                archetypal_themes=archetypal_themes,
                timeline=timeline,
                birth_info=calculation_results['birth_info'],
                calculation_date=calculation_results['calculation_date']
            )

            # Update engine statistics
            self._last_calculation_time = calculation_time
            self._total_calculations += 1

            self.logger.info(f"Calculation completed in {calculation_time:.4f}s")

            return output

        except Exception as e:
            calculation_time = end_timer(start_time)
            self.logger.error(f"Calculation failed after {calculation_time:.4f}s: {str(e)}")
            from base.data_models import EngineError
            raise EngineError(f"Calculation failed for {self.engine_name}: {str(e)}")