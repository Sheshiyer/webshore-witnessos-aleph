"""
Numerology Field Extractor Engine for WitnessOS

Provides comprehensive numerology analysis using Pythagorean and Chaldean systems.
Calculates life path, expression, soul urge, personality numbers and provides
mystical interpretations aligned with WitnessOS consciousness framework.
"""

from datetime import date
from typing import Dict, List, Any, Optional
import logging

from shared.base.engine_interface import BaseEngine
from shared.calculations.numerology import NumerologyCalculator
from .numerology_models import NumerologyInput, NumerologyOutput


class NumerologyEngine(BaseEngine):
    """
    WitnessOS Numerology Field Extractor Engine

    Extracts soul-number matrices and vibrational signatures from names and birth dates.
    Provides life path analysis, personal year guidance, and archetypal pattern recognition.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize the Numerology engine."""
        super().__init__(config)

        # Initialize numerology calculators for both systems
        self.pythagorean_calc = NumerologyCalculator("pythagorean")
        self.chaldean_calc = NumerologyCalculator("chaldean")

        # Load numerology interpretations
        self._load_interpretations()

    @property
    def engine_name(self) -> str:
        return "numerology"

    @property
    def description(self) -> str:
        return "Soul-number matrix extraction and vibrational signature analysis through sacred numerology"

    @property
    def input_model(self):
        return NumerologyInput

    @property
    def output_model(self):
        return NumerologyOutput

    def _load_interpretations(self):
        """Load numerology number interpretations."""
        # Life Path meanings
        self.life_path_meanings = {
            1: "The Pioneer - Leadership, independence, and new beginnings",
            2: "The Diplomat - Cooperation, partnership, and harmony",
            3: "The Creative - Expression, communication, and artistic gifts",
            4: "The Builder - Stability, hard work, and practical foundations",
            5: "The Explorer - Freedom, adventure, and dynamic change",
            6: "The Nurturer - Service, responsibility, and healing others",
            7: "The Seeker - Spiritual investigation and inner wisdom",
            8: "The Achiever - Material mastery and ambitious goals",
            9: "The Humanitarian - Universal service and compassion",
            11: "The Intuitive - Spiritual illumination and inspiration",
            22: "The Master Builder - Manifesting dreams into reality",
            33: "The Master Teacher - Spiritual guidance and healing"
        }

        # Personal Year meanings
        self.personal_year_meanings = {
            1: "New beginnings, fresh starts, planting seeds for the future",
            2: "Cooperation, patience, developing relationships and partnerships",
            3: "Creative expression, communication, social expansion",
            4: "Hard work, building foundations, practical matters",
            5: "Change, freedom, travel, new experiences",
            6: "Service, family, home, healing and nurturing others",
            7: "Introspection, spiritual growth, inner development",
            8: "Material achievement, business success, recognition",
            9: "Completion, letting go, humanitarian service"
        }

        # Master number meanings
        self.master_meanings = {
            11: "Spiritual messenger with heightened intuition and psychic abilities",
            22: "Master architect capable of building lasting legacies",
            33: "Master healer and teacher of universal love",
            44: "Master organizer with ability to create stable systems"
        }

    def _calculate(self, validated_input: NumerologyInput) -> Dict[str, Any]:
        """Perform numerology calculations."""
        # Select calculator based on system
        if validated_input.system == "chaldean":
            calc = self.chaldean_calc
        else:
            calc = self.pythagorean_calc

        # Get complete numerology profile
        profile = calc.calculate_complete_profile(
            validated_input.full_name,
            validated_input.birth_date,
            validated_input.current_year
        )

        # Add preferred name analysis if provided
        if validated_input.preferred_name:
            preferred_profile = {
                "expression": calc.calculate_expression(validated_input.preferred_name),
                "soul_urge": calc.calculate_soul_urge(validated_input.preferred_name),
                "personality": calc.calculate_personality(validated_input.preferred_name)
            }
            profile["preferred_name_analysis"] = preferred_profile

        return profile

    def _interpret(self, calculation_results: Dict[str, Any], input_data: NumerologyInput) -> str:
        """Generate mystical numerology interpretation."""
        core = calculation_results["core_numbers"]
        life_path = core["life_path"]
        expression = core["expression"]
        soul_urge = core["soul_urge"]
        personality = core["personality"]
        personal_year = calculation_results["personal_year"]

        # Build interpretation
        interpretation = f"""
🔢 NUMEROLOGY FIELD EXTRACTION - {input_data.full_name.upper()} 🔢

═══ SOUL-NUMBER MATRIX ═══

Life Path {life_path}: {self.life_path_meanings.get(life_path, "Unique vibrational signature")}

Your soul chose this incarnation to master the archetypal frequency of {life_path}. This is not your personality—this is your soul's curriculum for conscious evolution.

Expression {expression}: Your outer manifestation carries the vibrational signature of {expression}, indicating how your soul-essence translates into worldly expression.

Soul Urge {soul_urge}: Your inner compass resonates at frequency {soul_urge}, revealing what truly motivates your deepest self.

Personality {personality}: Others perceive your field signature as {personality}, the energetic mask through which you interface with consensus reality.

═══ CURRENT FIELD STATE ═══

Personal Year {personal_year}: {self.personal_year_meanings.get(personal_year, "Unique temporal frequency")}

This year's vibrational theme optimizes your field for {self.personal_year_meanings.get(personal_year, "unique experiences")}.

═══ ARCHETYPAL RESONANCE ═══

{self._get_archetypal_analysis(core, calculation_results)}

═══ FIELD OPTIMIZATION NOTES ═══

{self._get_optimization_guidance(core, personal_year, calculation_results)}

Remember: These are not predictions—they are pattern recognitions for conscious navigation of your reality field.
        """.strip()

        return interpretation

    def _get_archetypal_analysis(self, core_numbers: Dict[str, int], full_results: Dict[str, Any]) -> str:
        """Generate archetypal pattern analysis."""
        life_path = core_numbers["life_path"]
        expression = core_numbers["expression"]

        analysis = []

        # Master number analysis
        if full_results["master_numbers"]:
            master_list = ", ".join(str(n) for n in full_results["master_numbers"])
            analysis.append(f"Master Number Activation: {master_list} - You carry heightened spiritual responsibility")

        # Karmic debt analysis
        if full_results["karmic_debt"]:
            debt_list = ", ".join(str(n) for n in full_results["karmic_debt"])
            analysis.append(f"Karmic Debt Recognition: {debt_list} - Opportunities for soul-level healing")

        # Life Path and Expression harmony
        if life_path == expression:
            analysis.append("Perfect Alignment: Your inner purpose and outer expression are in complete harmony")
        elif abs(life_path - expression) <= 2:
            analysis.append("Harmonic Resonance: Your purpose and expression support each other")
        else:
            analysis.append("Dynamic Tension: Your purpose and expression create creative friction for growth")

        return "\n".join(analysis) if analysis else "Balanced archetypal configuration detected"

    def _get_optimization_guidance(self, core_numbers: Dict[str, int], personal_year: int, full_results: Dict[str, Any]) -> str:
        """Generate field optimization guidance."""
        guidance = []

        # Personal year guidance
        if personal_year == 1:
            guidance.append("Initiate new projects aligned with your Life Path frequency")
        elif personal_year == 7:
            guidance.append("Prioritize inner work and spiritual development this year")
        elif personal_year == 9:
            guidance.append("Release what no longer serves your soul's evolution")

        # Master number guidance
        if 11 in full_results["master_numbers"]:
            guidance.append("Trust your intuitive downloads—they are field intelligence transmissions")
        if 22 in full_results["master_numbers"]:
            guidance.append("Focus on manifesting your vision into tangible reality")

        # Bridge number guidance
        bridge_numbers = full_results["bridge_numbers"]
        if bridge_numbers["life_expression_bridge"] > 5:
            guidance.append("Work on aligning your inner purpose with outer expression")

        return "\n".join(guidance) if guidance else "Your field is optimally configured for current growth phase"

    def _generate_recommendations(self, calculation_results: Dict[str, Any], input_data: NumerologyInput) -> List[str]:
        """Generate actionable numerology recommendations."""
        core = calculation_results["core_numbers"]
        personal_year = calculation_results["personal_year"]

        recommendations = []

        # Life Path specific recommendations
        life_path = core["life_path"]
        if life_path == 1:
            recommendations.append("Practice leadership in small situations to build confidence")
        elif life_path == 7:
            recommendations.append("Dedicate time daily to meditation or contemplative practice")
        elif life_path == 8:
            recommendations.append("Set clear financial and career goals for this incarnation")

        # Personal Year recommendations
        if personal_year == 1:
            recommendations.append("Start that project you've been contemplating")
        elif personal_year == 5:
            recommendations.append("Embrace change and new experiences this year")
        elif personal_year == 9:
            recommendations.append("Complete unfinished projects and release old patterns")

        # Master number recommendations
        if 11 in calculation_results["master_numbers"]:
            recommendations.append("Keep a dream journal to track intuitive messages")

        # General recommendations
        recommendations.extend([
            f"Meditate on your Life Path number {life_path} during morning breathwork",
            "Notice how your name affects others' responses to your energy field",
            "Experiment with different name variations in different contexts"
        ])

        return recommendations

    def _generate_reality_patches(self, calculation_results: Dict[str, Any], input_data: NumerologyInput) -> List[str]:
        """Generate WitnessOS reality patches."""
        patches = [
            "Install: Numerological field coherence protocol",
            "Patch: Soul-number matrix optimization",
            "Upgrade: Vibrational signature alignment module"
        ]

        # Add specific patches based on results
        if calculation_results["master_numbers"]:
            patches.append("Activate: Master number responsibility integration")

        if calculation_results["karmic_debt"]:
            patches.append("Install: Karmic debt healing protocol")

        personal_year = calculation_results["personal_year"]
        if personal_year == 1:
            patches.append("Initialize: New cycle manifestation engine")
        elif personal_year == 9:
            patches.append("Execute: Completion and release sequence")

        return patches

    def _identify_archetypal_themes(self, calculation_results: Dict[str, Any], input_data: NumerologyInput) -> List[str]:
        """Identify archetypal themes from numerology."""
        themes = []

        life_path = calculation_results["core_numbers"]["life_path"]

        # Life Path archetypal themes
        life_path_themes = {
            1: ["Pioneer", "Leader", "Initiator"],
            2: ["Diplomat", "Peacemaker", "Collaborator"],
            3: ["Artist", "Communicator", "Entertainer"],
            4: ["Builder", "Organizer", "Stabilizer"],
            5: ["Explorer", "Freedom-seeker", "Catalyst"],
            6: ["Nurturer", "Healer", "Caretaker"],
            7: ["Seeker", "Mystic", "Analyst"],
            8: ["Achiever", "Executive", "Manifestor"],
            9: ["Humanitarian", "Teacher", "Sage"],
            11: ["Intuitive", "Spiritual Messenger", "Illuminator"],
            22: ["Master Builder", "Visionary", "Architect"],
            33: ["Master Teacher", "Healer", "Spiritual Guide"]
        }

        themes.extend(life_path_themes.get(life_path, ["Unique", "Transcendent"]))

        # Add master number themes
        for master in calculation_results["master_numbers"]:
            if master == 11:
                themes.append("Spiritual Messenger")
            elif master == 22:
                themes.append("Master Manifestor")
            elif master == 33:
                themes.append("Universal Healer")

        return themes

    def _calculate_confidence(self, calculation_results: Dict[str, Any], input_data: NumerologyInput) -> float:
        """Calculate confidence score for numerology results."""
        confidence = 1.0

        # Reduce confidence slightly for very short names
        name_length = len(calculation_results["name_analysis"]["letters_only"])
        if name_length < 3:
            confidence -= 0.1

        # Reduce confidence for very old birth dates (less reliable)
        birth_year = input_data.birth_date.year
        if birth_year < 1920:
            confidence -= 0.05

        return max(0.8, confidence)  # Minimum 80% confidence

    def calculate(self, input_data: Any) -> NumerologyOutput:
        """
        Override the base calculate method to properly create NumerologyOutput.
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

            # Extract core numbers
            core = calculation_results["core_numbers"]
            bridge = calculation_results["bridge_numbers"]

            # Create NumerologyOutput with all required fields
            output = NumerologyOutput(
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

                # Numerology-specific fields
                life_path=core["life_path"],
                expression=core["expression"],
                soul_urge=core["soul_urge"],
                personality=core["personality"],
                maturity=calculation_results["maturity"],
                personal_year=calculation_results["personal_year"],
                life_expression_bridge=bridge["life_expression_bridge"],
                soul_personality_bridge=bridge["soul_personality_bridge"],
                master_numbers=calculation_results["master_numbers"],
                karmic_debt=calculation_results["karmic_debt"],
                numerology_system=calculation_results["system"],
                calculation_year=calculation_results["calculation_year"],
                name_breakdown=calculation_results["name_analysis"],

                # Additional interpretations
                core_meanings={
                    "life_path": self.life_path_meanings.get(core["life_path"], "Unique path"),
                    "expression": f"Expression vibration {core['expression']}",
                    "soul_urge": f"Soul urge frequency {core['soul_urge']}",
                    "personality": f"Personality signature {core['personality']}"
                },
                yearly_guidance=self.personal_year_meanings.get(calculation_results["personal_year"], "Unique year"),
                life_purpose=self.life_path_meanings.get(core["life_path"], "Unique purpose")
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


# Export the engine
__all__ = ["NumerologyEngine"]
