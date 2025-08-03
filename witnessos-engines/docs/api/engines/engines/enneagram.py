"""
Enneagram Resonator Engine for WitnessOS

Provides comprehensive Enneagram personality analysis with type identification,
wing analysis, integration/disintegration arrows, and growth guidance.
"""

from datetime import datetime
from typing import Dict, List, Any, Type, Optional

from base.engine_interface import BaseEngine
from base.data_models import BaseEngineInput, BaseEngineOutput
from base.utils import load_json_data
from calculations.divination import DivinationCalculator
from .enneagram_models import (
    EnneagramInput, EnneagramOutput, EnneagramType, EnneagramWing, EnneagramArrow,
    InstinctualVariant, EnneagramCenter, EnneagramProfile, EnneagramData
)


class EnneagramResonator(BaseEngine):
    """
    Enneagram Resonator Engine
    
    Provides comprehensive Enneagram personality analysis including type identification,
    wing influences, integration/disintegration patterns, and growth guidance.
    """
    
    def __init__(self):
        super().__init__()
        self.enneagram_data: Optional[EnneagramData] = None
        self.divination_calc = DivinationCalculator()
        self._load_enneagram_data()
    
    @property
    def engine_name(self) -> str:
        return "Enneagram Resonator"
    
    @property
    def description(self) -> str:
        return "Provides comprehensive Enneagram personality analysis with type identification, wings, arrows, and growth guidance"
    
    @property
    def input_model(self) -> Type[BaseEngineInput]:
        return EnneagramInput
    
    @property
    def output_model(self) -> Type[BaseEngineOutput]:
        return EnneagramOutput
    
    def _load_enneagram_data(self) -> None:
        """Load Enneagram data from JSON files."""
        try:
            enneagram_json = load_json_data("enneagram", "types.json")
            self.enneagram_data = EnneagramData(**enneagram_json)
            self.logger.info("Loaded Enneagram personality data")
        except Exception as e:
            self.logger.error(f"Failed to load Enneagram data: {e}")
            raise
    
    def _get_type_by_number(self, number: int) -> EnneagramType:
        """Get Enneagram type by its number."""
        if number < 1 or number > 9:
            raise ValueError(f"Type number must be between 1 and 9, got {number}")
        
        type_data = self.enneagram_data.types[str(number)]
        
        # Convert nested dictionaries to proper models
        wings = {}
        for wing_num, wing_data in type_data.get("wings", {}).items():
            wings[wing_num] = EnneagramWing(**wing_data)
        
        arrows = {}
        for arrow_type, arrow_data in type_data.get("arrows", {}).items():
            arrows[arrow_type] = EnneagramArrow(**arrow_data)
        
        instinctual_variants = {}
        for variant_name, variant_data in type_data.get("instinctual_variants", {}).items():
            instinctual_variants[variant_name] = InstinctualVariant(**variant_data)
        
        # Create the type with converted models
        type_dict = type_data.copy()
        type_dict["wings"] = wings
        type_dict["arrows"] = arrows
        type_dict["instinctual_variants"] = instinctual_variants
        
        return EnneagramType(**type_dict)
    
    def _get_center_by_name(self, center_name: str) -> EnneagramCenter:
        """Get center by name."""
        center_data = self.enneagram_data.centers[center_name.lower()]
        return EnneagramCenter(**center_data)
    
    def _identify_type_from_assessment(self, responses: Dict[str, str]) -> tuple[int, float]:
        """
        Identify type from assessment responses.
        
        Returns:
            Tuple of (type_number, confidence_score)
        """
        # Simple scoring algorithm - count responses for each type
        type_scores = {i: 0 for i in range(1, 10)}
        
        for question_id, response in responses.items():
            # Extract type number from response (assuming response format like "1", "2", etc.)
            try:
                type_num = int(response)
                if 1 <= type_num <= 9:
                    type_scores[type_num] += 1
            except (ValueError, KeyError):
                continue
        
        # Find the type with highest score
        if not any(type_scores.values()):
            # Default to type 9 if no valid responses
            return 9, 0.1
        
        max_score = max(type_scores.values())
        primary_type = max(type_scores, key=type_scores.get)
        
        # Calculate confidence based on score distribution
        total_responses = sum(type_scores.values())
        confidence = max_score / total_responses if total_responses > 0 else 0.1
        
        return primary_type, confidence
    
    def _identify_type_from_description(self, description: str) -> tuple[int, float]:
        """
        Identify type from behavioral description using keyword matching.
        
        Returns:
            Tuple of (type_number, confidence_score)
        """
        description_lower = description.lower()
        type_scores = {}
        
        # Score each type based on keyword matches
        for type_num in range(1, 10):
            enneagram_type = self._get_type_by_number(type_num)
            score = 0
            
            # Check keywords
            for keyword in enneagram_type.keywords:
                if keyword.lower() in description_lower:
                    score += 2
            
            # Check core motivation, fear, desire
            if any(word in description_lower for word in enneagram_type.core_motivation.lower().split()):
                score += 3
            if any(word in description_lower for word in enneagram_type.core_fear.lower().split()):
                score += 3
            if any(word in description_lower for word in enneagram_type.core_desire.lower().split()):
                score += 3
            
            type_scores[type_num] = score
        
        if not any(type_scores.values()):
            # Default to type 9 if no matches
            return 9, 0.1
        
        max_score = max(type_scores.values())
        primary_type = max(type_scores, key=type_scores.get)
        
        # Calculate confidence
        total_score = sum(type_scores.values())
        confidence = max_score / total_score if total_score > 0 else 0.1
        confidence = min(confidence, 0.8)  # Cap at 0.8 for description-based identification
        
        return primary_type, confidence
    
    def _determine_wing(self, primary_type: int) -> Optional[EnneagramWing]:
        """Determine the dominant wing for a type."""
        enneagram_type = self._get_type_by_number(primary_type)
        
        # For simplicity, randomly choose one of the available wings
        # In a full implementation, this would be based on additional assessment
        if enneagram_type.wings:
            wing_keys = list(enneagram_type.wings.keys())
            chosen_wing_key = self.divination_calc.random.choice(wing_keys)
            return enneagram_type.wings[chosen_wing_key]
        
        return None
    
    def _determine_instinctual_variant(self, primary_type: int) -> Optional[InstinctualVariant]:
        """Determine the primary instinctual variant."""
        enneagram_type = self._get_type_by_number(primary_type)
        
        # For simplicity, randomly choose one of the available variants
        # In a full implementation, this would be based on additional assessment
        if enneagram_type.instinctual_variants:
            variant_keys = list(enneagram_type.instinctual_variants.keys())
            chosen_variant_key = self.divination_calc.random.choice(variant_keys)
            return enneagram_type.instinctual_variants[chosen_variant_key]
        
        return None
    
    def _generate_growth_guidance(self, profile: EnneagramProfile, focus_area: Optional[str]) -> List[str]:
        """Generate personalized growth guidance."""
        guidance = []
        primary_type = profile.primary_type
        
        # Core growth recommendations
        guidance.extend(primary_type.growth_recommendations[:3])  # Top 3 recommendations
        
        # Wing-specific guidance
        if profile.wing:
            guidance.append(f"Integrate your {profile.wing.name} wing by embracing {', '.join(profile.wing.traits[:2])}")
        
        # Arrow-specific guidance
        if profile.integration_direction:
            guidance.append(f"Move toward integration by developing {', '.join(profile.integration_direction.traits[:2])}")
        
        # Focus area specific guidance
        if focus_area == "relationships":
            guidance.append(f"In relationships, be aware of your {primary_type.core_fear.lower()} and practice {primary_type.virtue.lower()}")
        elif focus_area == "career":
            guidance.append(f"In your career, leverage your {primary_type.core_motivation.lower()} while avoiding {primary_type.vice.lower()}")
        elif focus_area == "spirituality":
            guidance.append(f"For spiritual growth, contemplate the {primary_type.holy_idea} and embody {primary_type.virtue}")
        
        return guidance
    
    def _calculate(self, validated_input: EnneagramInput) -> Dict[str, Any]:
        """Process the Enneagram analysis calculation."""
        
        # Identify primary type
        if validated_input.identification_method == "assessment":
            primary_type_num, confidence = self._identify_type_from_assessment(
                validated_input.assessment_responses
            )
        elif validated_input.identification_method == "self_select":
            primary_type_num = validated_input.selected_type
            confidence = 0.9  # High confidence for self-selection
        else:  # intuitive
            primary_type_num, confidence = self._identify_type_from_description(
                validated_input.behavioral_description
            )
        
        # Get the primary type
        primary_type = self._get_type_by_number(primary_type_num)
        
        # Get center information
        center = self._get_center_by_name(primary_type.center)
        
        # Determine wing if requested
        wing = None
        if validated_input.include_wings:
            wing = self._determine_wing(primary_type_num)
        
        # Determine instinctual variant if requested
        instinctual_variant = None
        if validated_input.include_instincts:
            instinctual_variant = self._determine_instinctual_variant(primary_type_num)
        
        # Get arrows if requested
        integration_direction = None
        disintegration_direction = None
        if validated_input.include_arrows:
            integration_direction = primary_type.arrows.get("integration")
            disintegration_direction = primary_type.arrows.get("disintegration")
        
        # Create profile
        profile = EnneagramProfile(
            primary_type=primary_type,
            wing=wing,
            instinctual_variant=instinctual_variant,
            integration_direction=integration_direction,
            disintegration_direction=disintegration_direction,
            center=center,
            assessment_confidence=confidence
        )
        
        # Generate growth guidance
        growth_guidance = self._generate_growth_guidance(profile, validated_input.focus_area)
        
        # Create key insights
        key_insights = [
            f"Your core type is {primary_type.number} - {primary_type.name}",
            f"Your core motivation: {primary_type.core_motivation}",
            f"Your core fear: {primary_type.core_fear}",
            f"You operate from the {center.name} center of intelligence"
        ]
        
        if wing:
            key_insights.append(f"Your {wing.name} wing adds {', '.join(wing.traits[:2])} qualities")
        
        if instinctual_variant:
            key_insights.append(f"Your {instinctual_variant.name} instinct focuses on {instinctual_variant.description.lower()}")
        
        # Calculate archetypal resonance
        type_names = [primary_type.name]
        if wing:
            type_names.append(wing.name)
        
        field_resonance = self.divination_calc.calculate_archetypal_resonance(
            type_names,
            {"type": primary_type_num, "center": primary_type.center}
        )
        
        return {
            "profile": profile,
            "identification_method": validated_input.identification_method,
            "analysis_timestamp": datetime.now(),
            "key_insights": key_insights,
            "growth_guidance": growth_guidance,
            "guidance_summary": f"As a Type {primary_type.number} {primary_type.name}, focus on transforming {primary_type.vice} into {primary_type.virtue}.",
            "center_analysis": f"Operating from the {center.name}, you focus on {center.focus.lower()}",
            "integration_path": f"Growth comes through moving toward Type {integration_direction.direction} qualities" if integration_direction else "Focus on your core type development",
            "field_resonance": field_resonance,
            "field_signature": f"enneagram_type_{primary_type_num}_{primary_type.center.lower()}"
        }
    
    def _interpret(self, calculation_results: Dict[str, Any], input_data: EnneagramInput) -> str:
        """Interpret calculation results into human-readable format."""
        
        profile = calculation_results["profile"]
        primary_type = profile.primary_type
        
        interpretation = f"🎭 Enneagram Resonator Analysis\n\n"
        interpretation += f"🔍 Method: {calculation_results['identification_method'].title()}\n"
        interpretation += f"🕐 Analysis Time: {calculation_results['analysis_timestamp'].strftime('%Y-%m-%d %H:%M')}\n\n"
        
        # Primary type information
        interpretation += f"🌟 Core Type: {primary_type.number} - {primary_type.name}\n"
        interpretation += f"🏛️ Center: {profile.center.name} (Focus: {profile.center.focus})\n"
        interpretation += f"💫 Core Motivation: {primary_type.core_motivation}\n"
        interpretation += f"😰 Core Fear: {primary_type.core_fear}\n"
        interpretation += f"❤️ Core Desire: {primary_type.core_desire}\n\n"
        
        # Traditional elements
        interpretation += f"⚡ Vice: {primary_type.vice} | Virtue: {primary_type.virtue}\n"
        interpretation += f"🔥 Passion: {primary_type.passion} | Holy Idea: {primary_type.holy_idea}\n\n"
        
        # Wing analysis
        if profile.wing:
            interpretation += f"🪶 Wing: {profile.wing.name}\n"
            interpretation += f"   Adds: {', '.join(profile.wing.traits)}\n\n"
        
        # Instinctual variant
        if profile.instinctual_variant:
            interpretation += f"🧬 Instinctual Variant: {profile.instinctual_variant.name}\n"
            interpretation += f"   Focus: {profile.instinctual_variant.description}\n\n"
        
        # Arrows
        if profile.integration_direction:
            interpretation += f"⬆️ Integration (Growth): Move toward Type {profile.integration_direction.direction}\n"
            interpretation += f"   Develop: {', '.join(profile.integration_direction.traits)}\n"
        
        if profile.disintegration_direction:
            interpretation += f"⬇️ Disintegration (Stress): Watch for Type {profile.disintegration_direction.direction} patterns\n"
            interpretation += f"   Avoid: {', '.join(profile.disintegration_direction.traits)}\n\n"
        
        interpretation += f"🎯 Core Guidance: {calculation_results['guidance_summary']}\n\n"
        
        interpretation += "🌱 Growth Steps:\n"
        for i, guidance in enumerate(calculation_results['growth_guidance'][:5], 1):
            interpretation += f"   {i}. {guidance}\n"
        
        return interpretation


# Export the engine class
__all__ = ["EnneagramResonator"]
