"""
Human Design Scanner Engine for WitnessOS

Calculates complete Human Design charts using Swiss Ephemeris astronomical data.
Provides personality and design activations, type determination, and comprehensive
chart interpretation.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Type
import logging

from shared.base.engine_interface import BaseEngine
from shared.base.data_models import BaseEngineInput, BaseEngineOutput
from shared.calculations.astrology import AstrologyCalculator, validate_coordinates, validate_datetime

# Initialize logger
logger = logging.getLogger(__name__)

# Try to import Swiss Ephemeris, fallback gracefully if not available
try:
    from swiss_ephemeris.ephemeris import SwissEphemerisService
    SWISS_EPHEMERIS_AVAILABLE = True
except ImportError as e:
    logger.warning(f"⚠️ Swiss Ephemeris not available: {e}")
    SwissEphemerisService = None
    SWISS_EPHEMERIS_AVAILABLE = False
from .human_design_models import (
    HumanDesignInput, HumanDesignOutput, HumanDesignChart, HumanDesignType,
    HumanDesignProfile, HumanDesignGate, HumanDesignCenter,
    HUMAN_DESIGN_TYPES, HUMAN_DESIGN_CENTERS, PROFILE_LINES
)


class HumanDesignScanner(BaseEngine):
    """
    Human Design Scanner Engine

    Calculates complete Human Design charts including:
    - Personality and Design activations
    - Type, Strategy, and Authority
    - Profile and Incarnation Cross
    - Centers and Channels
    - Detailed interpretations
    """

    def __init__(self, config=None):
        """Initialize the Human Design Scanner."""
        super().__init__(config)
        # Initialize calculators with graceful fallback
        self.astro_calc = AstrologyCalculator()

        # Use Swiss Ephemeris for precise astronomical calculations if available
        if SWISS_EPHEMERIS_AVAILABLE:
            try:
                self.swiss_calc = SwissEphemerisService()
                logger.info("✅ Swiss Ephemeris initialized successfully")
            except Exception as e:
                logger.warning(f"⚠️ Swiss Ephemeris initialization failed: {e}")
                self.swiss_calc = None
        else:
            self.swiss_calc = None
            logger.info("ℹ️ Using AstrologyCalculator (Swiss Ephemeris not available)")
        self._load_human_design_data()

    @property
    def engine_name(self) -> str:
        return "human_design_scanner"

    @property
    def description(self) -> str:
        return "Calculates complete Human Design charts with personality/design activations and type analysis"

    @property
    def input_model(self) -> Type[BaseEngineInput]:
        return HumanDesignInput

    @property
    def output_model(self) -> Type[BaseEngineOutput]:
        return HumanDesignOutput

    def _load_human_design_data(self):
        """Load Human Design reference data."""
        # Gate data (simplified - in production would load from JSON files)
        self.gate_data = {}
        for i in range(1, 65):
            self.gate_data[i] = {
                "name": f"Gate {i}",
                "keynote": f"Gate {i} keynote",
                "description": f"Description for gate {i}",
                "gift": f"Gift of gate {i}",
                "shadow": f"Shadow of gate {i}"
            }

        # Channel data (simplified)
        self.channel_data = {
            "1-8": "The Channel of Inspiration",
            "2-14": "The Channel of the Beat",
            "3-60": "The Channel of Mutation",
            # ... would include all 36 channels
        }

        # Incarnation Cross data (simplified)
        self.cross_data = {}

    def _calculate(self, validated_input: HumanDesignInput) -> Dict[str, Any]:
        """
        Calculate Human Design chart data.

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

        # Calculate Human Design astronomical data
        if self.swiss_calc is not None:
            try:
                # Use Swiss Ephemeris for precise calculations
                birth_date_str = birth_datetime.strftime("%Y-%m-%d")
                birth_time_str = birth_datetime.strftime("%H:%M")

                swiss_data = self.swiss_calc.calculate_positions(
                    birth_date_str, birth_time_str, [lat, lon]
                )

                # Convert Swiss Ephemeris format to expected format
                hd_data = self._convert_swiss_to_hd_format(swiss_data)
                logger.info("✅ Using Swiss Ephemeris for astronomical calculations")
            except Exception as e:
                logger.warning(f"⚠️ Swiss Ephemeris failed, falling back to AstrologyCalculator: {e}")
                hd_data = self.astro_calc.calculate_human_design_data(
                    birth_datetime, lat, lon, validated_input.timezone
                )
        else:
            # Use AstrologyCalculator as primary method
            logger.info("ℹ️ Using AstrologyCalculator for astronomical calculations")
            hd_data = self.astro_calc.calculate_human_design_data(
                birth_datetime, lat, lon, validated_input.timezone
            )

        # Calculate design datetime (88 days before birth) - needed for both formats
        design_datetime = birth_datetime - timedelta(days=88)

        # Process personality gates - handle both Swiss Ephemeris and AstrologyCalculator formats
        if 'personality' in hd_data:  # Swiss Ephemeris format
            personality_gates = self._process_swiss_gates(hd_data['personality'], "personality")
            design_gates = self._process_swiss_gates(hd_data['design'], "design")
        else:  # AstrologyCalculator format
            personality_gates = self._process_gates(
                hd_data['personality_gates'],
                hd_data['personality_positions'],
                "personality"
            )
            design_gates = self._process_gates(
                hd_data['design_gates'],
                hd_data['design_positions'],
                "design"
            )

        # Determine type, strategy, and authority
        type_info = self._determine_type(personality_gates, design_gates)

        # Calculate profile
        profile = self._calculate_profile(personality_gates, design_gates)

        # Analyze centers
        centers = self._analyze_centers(personality_gates, design_gates)

        # Find defined channels
        defined_channels = self._find_defined_channels(personality_gates, design_gates)

        # Determine definition type
        definition_type = self._determine_definition_type(centers, defined_channels)

        # Calculate incarnation cross
        incarnation_cross = self._calculate_incarnation_cross(
            personality_gates, design_gates, hd_data.get('solar_arc_details')
        )

        # Create complete chart
        chart = HumanDesignChart(
            type_info=type_info,
            profile=profile,
            personality_gates=personality_gates,
            design_gates=design_gates,
            centers=centers,
            defined_channels=defined_channels,
            definition_type=definition_type,
            incarnation_cross=incarnation_cross
        )

        return {
            'birth_info': {
                'datetime': birth_datetime,
                'location': validated_input.birth_location,
                'timezone': validated_input.timezone
            },
            'design_info': {
                'datetime': design_datetime,
                'calculation_method': '88 degrees solar arc (official Human Design method)',
                'solar_arc_details': hd_data.get('solar_arc_details', {})
            },
            'chart': chart,
            'personality_gates': personality_gates,
            'design_gates': design_gates,
            'type_info': type_info,
            'profile': profile,
            'centers': centers,
            'defined_channels': defined_channels,
            'definition_type': definition_type,
            'incarnation_cross': incarnation_cross,
            'raw_astronomical_data': hd_data
        }

    def _process_gates(self, gate_numbers: Dict[str, int],
                      positions: Dict[str, Dict], gate_type: str) -> Dict[str, HumanDesignGate]:
        """Process raw gate numbers into HumanDesignGate objects."""
        processed_gates = {}

        for planet, gate_num in gate_numbers.items():
            if gate_num in self.gate_data:
                # Calculate line, color, tone, base from position
                # Handle Earth specially (opposite of Sun)
                if planet == 'earth' and 'sun' in positions:
                    longitude = (positions['sun']['longitude'] + 180) % 360
                elif planet in positions:
                    longitude = positions[planet]['longitude']
                else:
                    continue  # Skip if no position data available

                line = self._calculate_line(longitude, gate_num)
                color = self._calculate_color(longitude, gate_num)
                tone = self._calculate_tone(longitude, gate_num)
                base = self._calculate_base(longitude, gate_num)

                gate_data = self.gate_data[gate_num]

                processed_gates[planet] = HumanDesignGate(
                    number=gate_num,
                    name=gate_data['name'],
                    planet=planet,
                    line=line,
                    color=color,
                    tone=tone,
                    base=base,
                    keynote=gate_data['keynote'],
                    description=gate_data['description'],
                    gift=gate_data['gift'],
                    shadow=gate_data['shadow']
                )

        return processed_gates

    def _convert_swiss_to_hd_format(self, swiss_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Swiss Ephemeris data format to Human Design engine expected format."""
        return {
            'personality': swiss_data.get('personality', {}),
            'design': swiss_data.get('design', {}),
            'success': swiss_data.get('success', True)
        }

    def _process_swiss_gates(self, swiss_data: Dict[str, Dict], gate_type: str) -> Dict[str, HumanDesignGate]:
        """Process Swiss Ephemeris gate data into HumanDesignGate objects."""
        processed_gates = {}

        for planet, planet_data in swiss_data.items():
            if 'human_design_gate' in planet_data:
                gate_info = planet_data['human_design_gate']
                gate_num = gate_info['gate']
                line_num = gate_info['line']

                if gate_num in self.gate_data:
                    # Use Swiss Ephemeris calculated values directly
                    longitude = planet_data['longitude']

                    # Calculate color, tone, base from longitude (simplified)
                    color = self._calculate_color(longitude, gate_num)
                    tone = self._calculate_tone(longitude, gate_num)
                    base = self._calculate_base(longitude, gate_num)

                    gate_data = self.gate_data[gate_num]

                    processed_gates[planet.lower()] = HumanDesignGate(
                        number=gate_num,
                        name=gate_data['name'],
                        planet=planet.lower(),
                        line=line_num,  # Use Swiss Ephemeris line calculation
                        color=color,
                        tone=tone,
                        base=base,
                        keynote=gate_data['keynote'],
                        description=gate_data['description'],
                        gift=gate_data['gift'],
                        shadow=gate_data['shadow']
                    )

        return processed_gates

    def _calculate_line(self, longitude: float, gate_num: int) -> int:
        """Calculate line number (1-6) from longitude - FIXED VERSION."""
        # Each gate covers 5.625 degrees, each line covers 0.9375 degrees
        gate_degrees = 360.0 / 64.0  # 5.625 degrees per gate
        line_degrees = gate_degrees / 6.0  # 0.9375 degrees per line

        # FIXED: Use modulo to get position within current gate (Swiss Ephemeris method)
        # This works correctly with the I-Ching wheel sequence
        position_in_gate = longitude % gate_degrees
        line_number = int(position_in_gate / line_degrees) + 1
        return min(6, max(1, line_number))  # Clamp to 1-6

    def _calculate_color(self, longitude: float, gate_num: int) -> int:
        """Calculate color (1-6) from longitude."""
        # Simplified calculation - would be more complex in full implementation
        return ((int(longitude * 100) % 6) + 1)

    def _calculate_tone(self, longitude: float, gate_num: int) -> int:
        """Calculate tone (1-6) from longitude."""
        # Simplified calculation
        return ((int(longitude * 1000) % 6) + 1)

    def _calculate_base(self, longitude: float, gate_num: int) -> int:
        """Calculate base (1-5) from longitude."""
        # Simplified calculation
        return ((int(longitude * 10000) % 5) + 1)

    def _determine_type(self, personality_gates: Dict, design_gates: Dict) -> HumanDesignType:
        """Determine Human Design type based on defined centers."""
        # Simplified type determination - would be more complex in full implementation

        # Check for Sacral definition (Generator/MG)
        sacral_defined = self._is_center_defined("Sacral", personality_gates, design_gates)

        # Check for Motor to Throat connection (Manifestor)
        motor_to_throat = self._has_motor_to_throat_connection(personality_gates, design_gates)

        # Check for no defined centers (Reflector)
        no_defined_centers = not any(
            self._is_center_defined(center, personality_gates, design_gates)
            for center in HUMAN_DESIGN_CENTERS.keys()
        )

        if no_defined_centers:
            type_name = "Reflector"
        elif motor_to_throat and not sacral_defined:
            type_name = "Manifestor"
        elif sacral_defined:
            # Simplified - would check for MG vs Generator
            type_name = "Generator"
        else:
            type_name = "Projector"

        type_data = HUMAN_DESIGN_TYPES[type_name]

        return HumanDesignType(
            type_name=type_name,
            strategy=type_data['strategy'],
            authority=type_data['authority'],
            signature=type_data['signature'],
            not_self=type_data['not_self'],
            percentage=type_data['percentage'],
            description=type_data['description'],
            life_purpose=type_data['life_purpose']
        )

    def _is_center_defined(self, center_name: str, personality_gates: Dict, design_gates: Dict) -> bool:
        """Check if a center is defined based on gates."""
        # Simplified - would map gates to centers properly
        center_gates = {
            "Sacral": [5, 14, 29, 59, 9, 3, 42, 27, 34],
            "Throat": [62, 23, 56, 35, 12, 45, 33, 8, 31, 7, 1, 13, 16, 20, 17, 11],
            # ... would include all center-gate mappings
        }

        if center_name not in center_gates:
            return False

        all_gates = {}
        all_gates.update({g.number: g for g in personality_gates.values()})
        all_gates.update({g.number: g for g in design_gates.values()})

        center_gate_numbers = center_gates[center_name]
        defined_gates_in_center = [g for g in center_gate_numbers if g in all_gates]

        # Simplified - center is defined if it has at least one gate
        return len(defined_gates_in_center) > 0

    def _has_motor_to_throat_connection(self, personality_gates: Dict, design_gates: Dict) -> bool:
        """Check for motor center to throat connection."""
        # Simplified implementation
        return False

    def _calculate_profile(self, personality_gates: Dict, design_gates: Dict) -> HumanDesignProfile:
        """Calculate profile from Sun gates."""
        # Get Sun gates
        personality_sun = personality_gates.get('sun')
        design_sun = design_gates.get('sun')

        if not personality_sun or not design_sun:
            # Default profile if Sun data missing
            personality_line = 1
            design_line = 3
        else:
            personality_line = personality_sun.line
            design_line = design_sun.line

        # Create profile name
        p_name = PROFILE_LINES[personality_line]['name']
        d_name = PROFILE_LINES[design_line]['name']
        profile_name = f"{personality_line}/{design_line} {p_name}/{d_name}"

        return HumanDesignProfile(
            personality_line=personality_line,
            design_line=design_line,
            profile_name=profile_name,
            description=f"Profile combining {p_name} and {d_name} themes",
            life_theme=f"Life theme of {profile_name}",
            role=f"Role as {profile_name}"
        )

    def _analyze_centers(self, personality_gates: Dict, design_gates: Dict) -> Dict[str, HumanDesignCenter]:
        """Analyze all nine centers."""
        centers = {}

        for center_name, center_info in HUMAN_DESIGN_CENTERS.items():
            defined = self._is_center_defined(center_name, personality_gates, design_gates)

            # Get gates in this center (simplified)
            gates_in_center = []

            centers[center_name] = HumanDesignCenter(
                name=center_name,
                defined=defined,
                gates=gates_in_center,
                function=center_info['function'],
                when_defined=center_info['when_defined'],
                when_undefined=center_info['when_undefined']
            )

        return centers

    def _find_defined_channels(self, personality_gates: Dict, design_gates: Dict) -> List[str]:
        """Find defined channels."""
        # Simplified - would check for gate pairs that form channels
        return []

    def _determine_definition_type(self, centers: Dict, channels: List[str]) -> str:
        """Determine definition type (Single, Split, Triple Split, Quadruple Split)."""
        defined_centers = [name for name, center in centers.items() if center.defined]

        if len(defined_centers) == 0:
            return "No Definition"
        elif len(defined_centers) <= 3:
            return "Single Definition"
        else:
            return "Split Definition"

    def _calculate_incarnation_cross(self, personality_gates: Dict, design_gates: Dict,
                                   solar_arc_details: Dict = None) -> Dict[str, Any]:
        """Calculate incarnation cross from Sun/Earth gates."""
        # Extract the four gates that form the incarnation cross
        conscious_sun = personality_gates.get('sun', {}).number if 'sun' in personality_gates else None
        conscious_earth = personality_gates.get('earth', {}).number if 'earth' in personality_gates else None
        unconscious_sun = design_gates.get('sun', {}).number if 'sun' in design_gates else None
        unconscious_earth = design_gates.get('earth', {}).number if 'earth' in design_gates else None

        # If we don't have all four gates, return default
        if not all([conscious_sun, conscious_earth, unconscious_sun, unconscious_earth]):
            return {
                "name": "Right Angle Cross of the Four Ways",
                "type": "Right_Angle",
                "gates": {
                    "conscious_sun": conscious_sun or 1,
                    "conscious_earth": conscious_earth or 2,
                    "unconscious_sun": unconscious_sun or 7,
                    "unconscious_earth": unconscious_earth or 13
                },
                "theme": "Creative Self-Expression and Direction",
                "description": "Default cross - actual calculation requires complete gate data"
            }

        # Load incarnation crosses data
        try:
            import json
            import os
            data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'human_design', 'incarnation_crosses.json')
            with open(data_path, 'r') as f:
                crosses_data = json.load(f)

            # Look for matching cross by gates
            for cross_key, cross_info in crosses_data['crosses'].items():
                gates = cross_info.get('gates', {})
                if (gates.get('conscious_sun') == conscious_sun and
                    gates.get('conscious_earth') == conscious_earth and
                    gates.get('unconscious_sun') == unconscious_sun and
                    gates.get('unconscious_earth') == unconscious_earth):
                    # Add calculation details to the cross info
                    cross_with_details = cross_info.copy()
                    if solar_arc_details:
                        cross_with_details['calculation_details'] = solar_arc_details
                    return cross_with_details

            # If no exact match found, return the gates with a generic description
            cross_info = {
                "name": f"Cross of {conscious_sun}/{conscious_earth} | {unconscious_sun}/{unconscious_earth}",
                "type": "Right_Angle",  # Default to Right Angle
                "gates": {
                    "conscious_sun": conscious_sun,
                    "conscious_earth": conscious_earth,
                    "unconscious_sun": unconscious_sun,
                    "unconscious_earth": unconscious_earth
                },
                "theme": "Individual Life Purpose",
                "description": f"Incarnation cross formed by gates {conscious_sun}/{conscious_earth} | {unconscious_sun}/{unconscious_earth}"
            }
            if solar_arc_details:
                cross_info['calculation_details'] = solar_arc_details
            return cross_info

        except Exception as e:
            # Fallback if data loading fails
            return {
                "name": "Right Angle Cross of the Four Ways",
                "type": "Right_Angle",
                "gates": {
                    "conscious_sun": conscious_sun or 1,
                    "conscious_earth": conscious_earth or 2,
                    "unconscious_sun": unconscious_sun or 7,
                    "unconscious_earth": unconscious_earth or 13
                },
                "theme": "Creative Self-Expression and Direction",
                "description": f"Error loading cross data: {str(e)}"
            }

    def _interpret(self, calculation_results: Dict[str, Any], input_data: HumanDesignInput) -> str:
        """
        Generate comprehensive Human Design interpretation.

        Args:
            calculation_results: Raw calculation results
            input_data: Original input data

        Returns:
            Formatted interpretation string
        """
        type_info = calculation_results['type_info']
        profile = calculation_results['profile']
        centers = calculation_results['centers']

        interpretation = f"""
🌟 HUMAN DESIGN CHART ANALYSIS 🌟

═══════════════════════════════════════════════════════════════

📊 YOUR ENERGETIC BLUEPRINT
Type: {type_info.type_name}
Strategy: {type_info.strategy}
Authority: {type_info.authority}
Profile: {profile.profile_name}

═══════════════════════════════════════════════════════════════

🎭 TYPE ANALYSIS - {type_info.type_name.upper()}

{type_info.description}

Your life purpose: {type_info.life_purpose}

Strategy: {type_info.strategy}
When you follow your strategy, you experience: {type_info.signature}
When you don't follow your strategy, you experience: {type_info.not_self}

═══════════════════════════════════════════════════════════════

🎪 PROFILE ANALYSIS - {profile.profile_name}

{profile.description}

Life Theme: {profile.life_theme}
Your Role: {profile.role}

═══════════════════════════════════════════════════════════════

⚡ CENTERS ANALYSIS

"""

        # Add centers analysis
        defined_centers = [name for name, center in centers.items() if center.defined]
        undefined_centers = [name for name, center in centers.items() if not center.defined]

        interpretation += f"DEFINED CENTERS ({len(defined_centers)}):\n"
        for center_name in defined_centers:
            center = centers[center_name]
            interpretation += f"• {center_name}: {center.when_defined}\n"

        interpretation += f"\nUNDEFINED CENTERS ({len(undefined_centers)}):\n"
        for center_name in undefined_centers:
            center = centers[center_name]
            interpretation += f"• {center_name}: {center.when_undefined}\n"

        interpretation += f"""

═══════════════════════════════════════════════════════════════

🔮 INCARNATION CROSS
{calculation_results['incarnation_cross']['name']}
Gates: {calculation_results['incarnation_cross']['gates']['conscious_sun']}/{calculation_results['incarnation_cross']['gates']['conscious_earth']} | {calculation_results['incarnation_cross']['gates']['unconscious_sun']}/{calculation_results['incarnation_cross']['gates']['unconscious_earth']}

{calculation_results['incarnation_cross']['description']}

Your life's purpose and the role you're here to play in this lifetime.

═══════════════════════════════════════════════════════════════

✨ FIELD SIGNATURE DETECTED ✨
Your unique energetic blueprint has been mapped and integrated into the WitnessOS field matrix.
"""

        return interpretation.strip()

    def _generate_recommendations(self, calculation_results: Dict[str, Any], input_data: HumanDesignInput) -> List[str]:
        """Generate Human Design specific recommendations."""
        type_info = calculation_results['type_info']

        recommendations = [
            f"Follow your {type_info.type_name} strategy: {type_info.strategy}",
            f"Trust your {type_info.authority} when making decisions",
            f"Notice when you feel {type_info.signature} - this indicates alignment",
            f"Be aware of {type_info.not_self} as a sign you're not following your design",
            "Experiment with your design for 7 years to fully embody it",
            "Study your undefined centers to understand where you're influenced by others",
            "Honor your profile lines in how you interact with the world"
        ]

        return recommendations

    def _generate_reality_patches(self, calculation_results: Dict[str, Any], input_data: HumanDesignInput) -> List[str]:
        """Generate WitnessOS reality patches for Human Design."""
        type_info = calculation_results['type_info']

        patches = [
            f"PATCH_HD_TYPE_{type_info.type_name.upper()}: Energetic alignment with {type_info.type_name} frequency",
            f"PATCH_HD_STRATEGY: Implementation of {type_info.strategy} decision-making protocol",
            f"PATCH_HD_AUTHORITY: Activation of {type_info.authority} guidance system",
            "PATCH_HD_DECONDITIONING: Release of not-self patterns and conditioning",
            "PATCH_HD_AWARENESS: Enhanced body awareness and energetic sensitivity"
        ]

        return patches

    def _identify_archetypal_themes(self, calculation_results: Dict[str, Any], input_data: HumanDesignInput) -> List[str]:
        """Identify archetypal themes in Human Design chart."""
        type_info = calculation_results['type_info']
        profile = calculation_results['profile']

        themes = [
            f"The {type_info.type_name} Archetype",
            f"The {profile.profile_name} Journey",
            "The Authentic Self",
            "The Deconditioning Process",
            "The Strategy and Authority Path"
        ]

        # Add themes based on defined centers
        centers = calculation_results['centers']
        defined_centers = [name for name, center in centers.items() if center.defined]

        if "Sacral" in defined_centers:
            themes.append("The Life Force Generator")
        if "Heart" in defined_centers:
            themes.append("The Willpower Warrior")
        if "Throat" in defined_centers:
            themes.append("The Manifestation Channel")
        if "Spleen" in defined_centers:
            themes.append("The Intuitive Guardian")

        return themes

    def calculate(self, input_data: Any) -> HumanDesignOutput:
        """
        Override base calculate method to handle HumanDesignOutput creation.
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

            # Create Human Design specific output
            output = HumanDesignOutput(
                engine_name=self.engine_name,
                calculation_time=calculation_time,
                confidence_score=confidence,
                raw_data=calculation_results,
                formatted_output=interpretation,
                recommendations=recommendations,
                field_signature=field_signature,
                reality_patches=reality_patches,
                archetypal_themes=archetypal_themes,
                chart=calculation_results['chart'],
                birth_info=calculation_results['birth_info'],
                design_info=calculation_results['design_info']
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
