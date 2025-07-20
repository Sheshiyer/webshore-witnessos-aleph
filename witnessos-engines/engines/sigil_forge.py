"""
Sigil Forge Synthesizer Engine for WitnessOS

Converts intentions into symbolic representations through traditional and modern
sigil creation methods. Generates personalized sigils for manifestation work,
meditation, and consciousness programming.
"""

import os
import math
import hashlib
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from datetime import datetime
from typing import Dict, List, Any, Type, Optional, Tuple
from pathlib import Path

from shared.base.engine_interface import BaseEngine
from shared.base.data_models import BaseEngineInput, BaseEngineOutput
from shared.calculations.sigil_generation import SigilGenerator, SigilComposition, SigilElement
from .sigil_forge_models import (
    SigilForgeInput, SigilForgeOutput, SigilAnalysis, ActivationGuidance,
    GENERATION_METHODS, VISUAL_STYLES, COLOR_SCHEMES, 
    ELEMENTAL_CORRESPONDENCES, PLANETARY_INFLUENCES, CHARGING_METHODS
)


class SigilForgeSynthesizer(BaseEngine):
    """
    Sigil Forge Synthesizer Engine
    
    Converts intentions into symbolic sigils using traditional letter elimination,
    sacred geometry, and modern algorithmic approaches. Creates personalized
    symbols for manifestation and consciousness work.
    """
    
    def __init__(self, config=None):
        """Initialize the Sigil Forge Synthesizer."""
        super().__init__(config)
        self.generator = SigilGenerator()
        self.output_dir = Path("generated_sigils")
        self.output_dir.mkdir(exist_ok=True)
    
    @property
    def engine_name(self) -> str:
        return "sigil_forge_synthesizer"
    
    @property
    def description(self) -> str:
        return "Converts intentions into symbolic sigils for manifestation and consciousness programming"
    
    @property
    def input_model(self) -> Type[BaseEngineInput]:
        return SigilForgeInput
    
    @property
    def output_model(self) -> Type[BaseEngineOutput]:
        return BaseEngineOutput
    
    def _calculate(self, validated_input: SigilForgeInput) -> Dict[str, Any]:
        """
        Generate sigil based on input parameters.
        
        Args:
            validated_input: Validated input data
            
        Returns:
            Dictionary containing calculation results
        """
        # Generate sigil composition
        if validated_input.generation_method == "traditional":
            composition = self.generator.generate_traditional_sigil(validated_input.intention)
        elif validated_input.generation_method == "geometric":
            sacred_geo = validated_input.sacred_geometry or "auto"
            composition = self.generator.generate_geometric_sigil(validated_input.intention, sacred_geo)
        elif validated_input.generation_method == "hybrid":
            # Combine traditional and geometric
            trad_comp = self.generator.generate_traditional_sigil(validated_input.intention)
            geo_comp = self.generator.generate_geometric_sigil(validated_input.intention, "circle")
            composition = self._combine_compositions(trad_comp, geo_comp)
        elif validated_input.generation_method == "personal":
            composition = self._generate_personal_sigil(validated_input)
        else:
            composition = self.generator.generate_traditional_sigil(validated_input.intention)
        
        # Apply styling
        styled_composition = self._apply_styling(composition, validated_input)
        
        # Generate visual output
        image_path, svg_path = self._create_visual_output(styled_composition, validated_input)
        
        # Analyze sigil properties
        analysis = self._analyze_sigil(styled_composition, validated_input)
        
        # Generate activation guidance
        activation = self._generate_activation_guidance(styled_composition, validated_input)
        
        # Extract method details
        unique_letters = self.generator.eliminate_duplicate_letters(validated_input.intention)
        letter_numbers = self.generator.letters_to_numbers(unique_letters)
        
        # Generate correspondences
        elemental_corr = self._determine_elemental_correspondences(styled_composition, validated_input)
        planetary_corr = self._determine_planetary_influences(styled_composition, validated_input)
        
        return {
            'sigil_composition': styled_composition,
            'sigil_analysis': analysis,
            'method_used': validated_input.generation_method,
            'unique_letters': unique_letters,
            'letter_numbers': letter_numbers,
            'image_path': image_path,
            'svg_path': svg_path,
            'activation_guidance': activation,
            'elemental_correspondences': elemental_corr,
            'planetary_influences': planetary_corr,
            'intention': validated_input.intention
        }
    
    def _generate_personal_sigil(self, input_data: SigilForgeInput) -> SigilComposition:
        """Generate personalized sigil incorporating birth data and personal symbols."""
        # Start with traditional method
        base_composition = self.generator.generate_traditional_sigil(input_data.intention)
        
        # Modify based on birth date if provided
        if input_data.birth_date:
            birth_day = input_data.birth_date.day
            birth_month = input_data.birth_date.month
            
            # Add birth-influenced elements
            personal_elements = []
            
            # Add elements based on birth day
            if birth_day % 3 == 0:
                # Add triangle for birth days divisible by 3
                triangle_points = [(0.5, 0.2), (0.3, 0.7), (0.7, 0.7)]
                for i in range(len(triangle_points)):
                    next_i = (i + 1) % len(triangle_points)
                    element = SigilElement(
                        element_type="line",
                        start_point=triangle_points[i],
                        end_point=triangle_points[next_i],
                        control_points=[],
                        properties={"weight": 1, "style": "dashed", "opacity": 0.5}
                    )
                    personal_elements.append(element)
            
            # Add elements based on birth month
            month_angle = (birth_month / 12) * 2 * math.pi
            month_x = 0.5 + 0.3 * math.cos(month_angle)
            month_y = 0.5 + 0.3 * math.sin(month_angle)
            
            month_symbol = SigilElement(
                element_type="circle",
                start_point=(month_x, month_y),
                end_point=(month_x, month_y),
                control_points=[],
                properties={"radius": 0.03, "fill": True, "weight": 1}
            )
            personal_elements.append(month_symbol)
            
            # Combine with base composition
            all_elements = base_composition.elements + personal_elements
            
            return SigilComposition(
                elements=all_elements,
                center_point=base_composition.center_point,
                bounding_box=base_composition.bounding_box,
                symmetry_type="personal",
                intention_hash=base_composition.intention_hash
            )
        
        return base_composition
    
    def _combine_compositions(self, comp1: SigilComposition, comp2: SigilComposition) -> SigilComposition:
        """Combine two sigil compositions into a hybrid."""
        # Scale second composition to be smaller and overlay
        scaled_elements = []
        for element in comp2.elements:
            # Scale down and center
            scale = 0.6
            offset_x = 0.2
            offset_y = 0.2
            
            start_x = element.start_point[0] * scale + offset_x
            start_y = element.start_point[1] * scale + offset_y
            end_x = element.end_point[0] * scale + offset_x
            end_y = element.end_point[1] * scale + offset_y
            
            scaled_element = SigilElement(
                element_type=element.element_type,
                start_point=(start_x, start_y),
                end_point=(end_x, end_y),
                control_points=[(cp[0] * scale + offset_x, cp[1] * scale + offset_y) for cp in element.control_points],
                properties={**element.properties, "opacity": 0.7}
            )
            scaled_elements.append(scaled_element)
        
        # Combine elements
        combined_elements = comp1.elements + scaled_elements
        
        return SigilComposition(
            elements=combined_elements,
            center_point=comp1.center_point,
            bounding_box=comp1.bounding_box,
            symmetry_type="hybrid",
            intention_hash=comp1.intention_hash
        )
    
    def _apply_styling(self, composition: SigilComposition, input_data: SigilForgeInput) -> SigilComposition:
        """Apply visual styling to the sigil composition."""
        style_config = VISUAL_STYLES[input_data.style]
        styled_elements = []
        
        for element in composition.elements:
            styled_props = element.properties.copy()
            
            # Apply style-specific modifications
            if input_data.style == "minimal":
                styled_props["weight"] = min(styled_props.get("weight", 1), 1)
                styled_props["opacity"] = styled_props.get("opacity", 1.0)
            elif input_data.style == "ornate":
                styled_props["weight"] = max(styled_props.get("weight", 1), 2)
                # Add decorative elements would go here
            elif input_data.style == "organic":
                # Convert lines to curves for organic feel
                if element.element_type == "line" and not element.control_points:
                    # Add control point for curve
                    start_x, start_y = element.start_point
                    end_x, end_y = element.end_point
                    mid_x = (start_x + end_x) / 2
                    mid_y = (start_y + end_y) / 2
                    
                    # Random offset for organic curve
                    offset = 0.05
                    control_point = (mid_x + offset, mid_y + offset)
                    
                    styled_element = SigilElement(
                        element_type="curve",
                        start_point=element.start_point,
                        end_point=element.end_point,
                        control_points=[control_point],
                        properties=styled_props
                    )
                    styled_elements.append(styled_element)
                    continue
            
            styled_element = SigilElement(
                element_type=element.element_type,
                start_point=element.start_point,
                end_point=element.end_point,
                control_points=element.control_points,
                properties=styled_props
            )
            styled_elements.append(styled_element)
        
        return SigilComposition(
            elements=styled_elements,
            center_point=composition.center_point,
            bounding_box=composition.bounding_box,
            symmetry_type=composition.symmetry_type,
            intention_hash=composition.intention_hash
        )
    
    def _create_visual_output(self, composition: SigilComposition, input_data: SigilForgeInput) -> Tuple[str, str]:
        """Create visual representation of the sigil."""
        fig, ax = plt.subplots(1, 1, figsize=(8, 8))
        ax.set_aspect('equal')
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)
        
        # Get color scheme
        colors = COLOR_SCHEMES[input_data.color_scheme]
        ax.set_facecolor(colors['background'])
        
        # Draw sigil elements
        for element in composition.elements:
            self._draw_element(ax, element, colors)
        
        # Add border if requested
        if input_data.include_border:
            border = patches.Rectangle((0.05, 0.05), 0.9, 0.9, 
                                     fill=False, edgecolor=colors['primary'], linewidth=3)
            ax.add_patch(border)
        
        # Remove axes for clean look
        ax.set_xticks([])
        ax.set_yticks([])
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['bottom'].set_visible(False)
        ax.spines['left'].set_visible(False)
        
        # Save image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_filename = f"sigil_{timestamp}.png"
        image_path = self.output_dir / image_filename
        
        plt.savefig(image_path, dpi=300, bbox_inches='tight', 
                   facecolor=colors['background'], edgecolor='none')
        plt.close()
        
        # Create SVG (simplified version)
        svg_filename = f"sigil_{timestamp}.svg"
        svg_path = self.output_dir / svg_filename
        self._create_svg_output(composition, svg_path, colors)
        
        return str(image_path), str(svg_path)
    
    def _draw_element(self, ax, element: SigilElement, colors: Dict[str, str]):
        """Draw a single sigil element."""
        props = element.properties
        color = colors['primary']
        weight = props.get('weight', 1)
        opacity = props.get('opacity', 1.0)
        
        if element.element_type == "line":
            ax.plot([element.start_point[0], element.end_point[0]], 
                   [element.start_point[1], element.end_point[1]], 
                   color=color, linewidth=weight, alpha=opacity)
        
        elif element.element_type == "curve":
            if element.control_points:
                # Simple quadratic curve
                start = element.start_point
                end = element.end_point
                control = element.control_points[0]
                
                # Generate curve points
                t_values = [i/20 for i in range(21)]
                x_points = []
                y_points = []
                
                for t in t_values:
                    x = (1-t)**2 * start[0] + 2*(1-t)*t * control[0] + t**2 * end[0]
                    y = (1-t)**2 * start[1] + 2*(1-t)*t * control[1] + t**2 * end[1]
                    x_points.append(x)
                    y_points.append(y)
                
                ax.plot(x_points, y_points, color=color, linewidth=weight, alpha=opacity)
            else:
                # Fallback to line
                ax.plot([element.start_point[0], element.end_point[0]], 
                       [element.start_point[1], element.end_point[1]], 
                       color=color, linewidth=weight, alpha=opacity)
        
        elif element.element_type == "circle":
            radius = props.get('radius', 0.02)
            fill = props.get('fill', False)
            
            circle = patches.Circle(element.start_point, radius, 
                                  fill=fill, edgecolor=color, 
                                  facecolor=color if fill else 'none',
                                  linewidth=weight, alpha=opacity)
            ax.add_patch(circle)
    
    def _create_svg_output(self, composition: SigilComposition, svg_path: Path, colors: Dict[str, str]):
        """Create SVG version of the sigil."""
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="{colors['background']}"/>
  <g transform="scale(400,400)">
'''
        
        # Add elements (simplified)
        for element in composition.elements:
            if element.element_type == "line":
                svg_content += f'''    <line x1="{element.start_point[0]}" y1="{element.start_point[1]}" 
                     x2="{element.end_point[0]}" y2="{element.end_point[1]}" 
                     stroke="{colors['primary']}" stroke-width="{element.properties.get('weight', 1)/400}"/>
'''
            elif element.element_type == "circle":
                radius = element.properties.get('radius', 0.02)
                fill = colors['primary'] if element.properties.get('fill', False) else 'none'
                svg_content += f'''    <circle cx="{element.start_point[0]}" cy="{element.start_point[1]}" 
                       r="{radius}" fill="{fill}" stroke="{colors['primary']}" 
                       stroke-width="{element.properties.get('weight', 1)/400}"/>
'''
        
        svg_content += '''  </g>
</svg>'''
        
        with open(svg_path, 'w') as f:
            f.write(svg_content)
    
    def _analyze_sigil(self, composition: SigilComposition, input_data: SigilForgeInput) -> SigilAnalysis:
        """Analyze the properties of the generated sigil."""
        elements = composition.elements
        
        # Calculate complexity score
        complexity = min(len(elements) / 20, 1.0)  # Normalize to 0-1
        
        # Calculate balance score (simplified)
        center_x, center_y = composition.center_point
        total_distance = 0
        for element in elements:
            dist = math.sqrt((element.start_point[0] - center_x)**2 + (element.start_point[1] - center_y)**2)
            total_distance += dist
        
        balance = max(0, 1 - (total_distance / len(elements)) * 2) if elements else 1.0
        
        # Calculate symmetry score
        symmetry = 0.8 if composition.symmetry_type in ["radial", "geometric"] else 0.5
        
        # Identify dominant shapes
        shape_counts = {}
        for element in elements:
            shape = element.element_type
            shape_counts[shape] = shape_counts.get(shape, 0) + 1
        
        dominant_shapes = sorted(shape_counts.keys(), key=lambda x: shape_counts[x], reverse=True)[:3]
        
        # Determine energy flow
        if composition.symmetry_type == "radial":
            energy_flow = "radiating outward from center"
        elif composition.symmetry_type == "spiral":
            energy_flow = "spiraling inward/outward"
        else:
            energy_flow = "flowing in organic patterns"
        
        return SigilAnalysis(
            complexity_score=complexity,
            balance_score=balance,
            symmetry_score=symmetry,
            element_count=len(elements),
            dominant_shapes=dominant_shapes,
            energy_flow=energy_flow
        )

    def _generate_activation_guidance(self, composition: SigilComposition, input_data: SigilForgeInput) -> ActivationGuidance:
        """Generate guidance for activating and using the sigil."""
        charging_method = input_data.charging_method or "visualization"
        method_info = CHARGING_METHODS[charging_method]

        charging_instructions = f"""
{method_info['description']}

Instructions: {method_info['instructions']}
Duration: {method_info['duration']}

Specific steps for your sigil:
1. Find a quiet space where you won't be disturbed
2. Hold or place the sigil before you
3. Enter a meditative state through deep breathing
4. Focus on your original intention: "{input_data.intention}"
5. Visualize energy flowing into the sigil, activating its power
6. When you feel the sigil is charged, thank it and put it away
"""

        meditation_technique = f"""
Sigil Meditation Technique:

1. Gaze softly at the center of your sigil
2. Allow your eyes to relax and take in the whole pattern
3. Breathe naturally and let thoughts pass without attachment
4. If your mind wanders, gently return focus to the sigil
5. Continue for 10-20 minutes or until you feel complete
6. End by stating your intention once more

The {composition.symmetry_type} pattern of your sigil supports {self._get_meditation_focus(composition.symmetry_type)} meditation.
"""

        placement_suggestions = [
            "Place on your altar or sacred space",
            "Keep in your wallet or purse for daily energy",
            "Put under your pillow for dream work",
            "Display where you'll see it regularly",
            "Carry as a meditation focus"
        ]

        if input_data.optimize_for_meditation:
            placement_suggestions.insert(0, "Use as a meditation focal point during daily practice")

        timing_recommendations = f"""
Best times to work with your sigil:

- During the new moon for new beginnings
- At sunrise for fresh energy and clarity
- During your personal power hours (when you feel most energetic)
- Before important events related to your intention
- Weekly on the same day to build momentum

For your intention "{input_data.intention}", consider working with the sigil when you naturally think about this goal.
"""

        destruction_guidance = f"""
Sigil Destruction and Release:

Traditional approach: Once your intention manifests, burn the sigil to release the energy and give thanks.

Alternative approaches:
- Keep the sigil as a reminder of your manifestation power
- Bury it in earth to ground the energy
- Dissolve it in water to flow the energy into the universe
- Simply put it away and forget about it (letting go method)

Trust your intuition about when and how to release your sigil. Some practitioners keep successful sigils as power objects.
"""

        return ActivationGuidance(
            charging_instructions=charging_instructions,
            meditation_technique=meditation_technique,
            placement_suggestions=placement_suggestions,
            timing_recommendations=timing_recommendations,
            destruction_guidance=destruction_guidance
        )

    def _get_meditation_focus(self, symmetry_type: str) -> str:
        """Get meditation focus based on symmetry type."""
        focus_map = {
            "radial": "centering and expansion",
            "spiral": "growth and transformation",
            "geometric": "structure and clarity",
            "organic": "flow and intuition",
            "personal": "self-discovery and alignment",
            "hybrid": "integration and balance"
        }
        return focus_map.get(symmetry_type, "focused concentration")

    def _determine_elemental_correspondences(self, composition: SigilComposition, input_data: SigilForgeInput) -> Dict[str, str]:
        """Determine elemental correspondences based on sigil characteristics."""
        correspondences = {}

        # Analyze dominant shapes and patterns
        elements = composition.elements
        line_count = sum(1 for e in elements if e.element_type == "line")
        curve_count = sum(1 for e in elements if e.element_type == "curve")
        circle_count = sum(1 for e in elements if e.element_type == "circle")

        # Determine primary element
        if composition.symmetry_type == "radial" or circle_count > line_count:
            primary_element = "fire"
        elif curve_count > line_count:
            primary_element = "water"
        elif line_count > curve_count + circle_count:
            primary_element = "air"
        else:
            primary_element = "earth"

        element_info = ELEMENTAL_CORRESPONDENCES[primary_element]

        correspondences["primary_element"] = primary_element
        correspondences["energy_type"] = element_info["energy"]
        correspondences["direction"] = element_info["direction"]
        correspondences["working_style"] = f"This sigil resonates with {primary_element} energy, bringing {element_info['energy']} qualities to your intention."

        return correspondences

    def _determine_planetary_influences(self, composition: SigilComposition, input_data: SigilForgeInput) -> Dict[str, str]:
        """Determine planetary influences based on intention and sigil characteristics."""
        influences = {}

        # Analyze intention for planetary keywords
        intention_lower = input_data.intention.lower()

        planetary_keywords = {
            "sun": ["success", "leadership", "confidence", "achievement", "power", "vitality"],
            "moon": ["intuition", "emotion", "dream", "psychic", "cycle", "feminine"],
            "mercury": ["communication", "learning", "travel", "quick", "message", "intellect"],
            "venus": ["love", "beauty", "relationship", "harmony", "art", "attraction"],
            "mars": ["courage", "action", "strength", "protection", "overcome", "energy"],
            "jupiter": ["abundance", "growth", "wisdom", "expansion", "prosperity", "luck"],
            "saturn": ["discipline", "structure", "patience", "limitation", "boundary", "time"]
        }

        # Find matching planetary influence
        primary_planet = "sun"  # Default
        max_matches = 0

        for planet, keywords in planetary_keywords.items():
            matches = sum(1 for keyword in keywords if keyword in intention_lower)
            if matches > max_matches:
                max_matches = matches
                primary_planet = planet

        planet_info = PLANETARY_INFLUENCES[primary_planet]

        influences["primary_planet"] = primary_planet
        influences["planetary_energy"] = planet_info["energy"]
        influences["best_for"] = planet_info["best_for"]
        influences["working_guidance"] = f"Your sigil is influenced by {primary_planet.title()} energy, making it especially powerful for {planet_info['best_for']}."

        return influences

    def _interpret(self, calculation_results: Dict[str, Any], input_data: SigilForgeInput) -> str:
        """Generate mystical interpretation of the sigil."""
        intention = calculation_results['intention']
        method = calculation_results['method_used']
        unique_letters = calculation_results['unique_letters']
        analysis = calculation_results['sigil_analysis']

        interpretation = f"""🔥 SIGIL FORGE MANIFESTATION - {method.upper().replace('_', ' ')} METHOD 🔥

═══ INTENTION CRYSTALLIZATION ═══

Original Intention: {intention}
Unique Letter Essence: {unique_letters}
Method: {GENERATION_METHODS[method]['name']}

Your intention has been distilled into its essential symbolic form through the ancient art of sigil creation.
This symbol now contains the concentrated power of your will, ready to work in the unconscious realms.

═══ SIGIL ANALYSIS ═══

Complexity: {analysis.complexity_score:.2f} (Balanced for effective manifestation)
Visual Balance: {analysis.balance_score:.2f} (Harmonious energy distribution)
Symmetry: {analysis.symmetry_score:.2f} (Sacred geometric resonance)
Element Count: {analysis.element_count} symbolic components
Energy Flow: {analysis.energy_flow}

═══ ELEMENTAL RESONANCE ═══

Primary Element: {calculation_results['elemental_correspondences']['primary_element'].title()}
Energy Type: {calculation_results['elemental_correspondences']['energy_type']}
Working Style: {calculation_results['elemental_correspondences']['working_style']}

═══ PLANETARY INFLUENCE ═══

Primary Planet: {calculation_results['planetary_influences']['primary_planet'].title()}
Planetary Energy: {calculation_results['planetary_influences']['planetary_energy']}
Best For: {calculation_results['planetary_influences']['best_for']}

═══ ACTIVATION PROTOCOL ═══

Your sigil is now ready for charging and activation. The symbol contains the mathematical
essence of your intention, compressed into a form that bypasses the conscious mind and
works directly with the unconscious forces of manifestation.

Remember: The power is not in the symbol itself, but in the focused intention and
energy you invest in it. Treat your sigil as a sacred tool for consciousness programming.

═══ MANIFESTATION GUIDANCE ═══

1. Charge your sigil with focused intention
2. Place it where you'll encounter it regularly
3. Allow your conscious mind to forget the specific intention
4. Trust the unconscious processes to work
5. Remain open to how your intention may manifest

The universe responds to clear intention backed by will. Your sigil is now a beacon
for your desired reality to crystallize around.
"""

        return interpretation

    def _generate_recommendations(self, calculation_results: Dict[str, Any], input_data: SigilForgeInput) -> List[str]:
        """Generate recommendations for using the sigil."""
        method = calculation_results['method_used']

        recommendations = [
            f"Charge your {method} sigil through focused meditation and visualization",
            "Place the sigil where you'll see it regularly but not obsess over it",
            "Allow your conscious mind to forget the specific intention after charging",
            "Trust the unconscious processes to work toward manifestation"
        ]

        # Add method-specific recommendations
        if method == "traditional":
            recommendations.extend([
                "Use the traditional 'fire and forget' approach - charge once and put away",
                "Consider burning the sigil once your intention manifests"
            ])
        elif method == "geometric":
            recommendations.extend([
                "Meditate on the sacred geometry to align with universal patterns",
                "Use the geometric structure for contemplation and insight"
            ])
        elif method == "personal":
            recommendations.extend([
                "Work with your sigil during times that correspond to your birth influences",
                "Keep this personal sigil private and sacred to you alone"
            ])

        # Add timing recommendations
        planetary_planet = calculation_results['planetary_influences']['primary_planet']
        recommendations.append(f"Work with your sigil during {planetary_planet} hours for enhanced power")

        return recommendations

    def _generate_reality_patches(self, calculation_results: Dict[str, Any], input_data: SigilForgeInput) -> List[str]:
        """Generate reality patches for sigil integration."""
        method = calculation_results['method_used']
        element = calculation_results['elemental_correspondences']['primary_element']

        patches = [
            "Install: Sigil consciousness interface",
            f"Patch: {method.replace('_', ' ').title()} manifestation protocol",
            "Upgrade: Unconscious programming module",
            f"Enable: {element.title()} elemental resonance field",
            "Activate: Intention crystallization matrix"
        ]

        # Add specific patches based on sigil characteristics
        analysis = calculation_results['sigil_analysis']
        if analysis.complexity_score > 0.7:
            patches.append("Install: Complex pattern processing enhancement")

        if analysis.symmetry_score > 0.8:
            patches.append("Sync: Sacred geometry alignment protocol")

        return patches

    def _identify_archetypal_themes(self, calculation_results: Dict[str, Any], input_data: SigilForgeInput) -> List[str]:
        """Identify archetypal themes in the sigil."""
        method = calculation_results['method_used']

        themes = [
            "The Sigil Crafter",
            "The Intention Weaver",
            "The Symbol Keeper",
            "The Manifestation Artist"
        ]

        # Add method-specific themes
        if method == "traditional":
            themes.extend([
                "The Ancient Practitioner",
                "The Letter Alchemist",
                "The Traditional Magician"
            ])
        elif method == "geometric":
            themes.extend([
                "The Sacred Geometer",
                "The Pattern Mystic",
                "The Cosmic Architect"
            ])
        elif method == "personal":
            themes.extend([
                "The Personal Power Holder",
                "The Individual Path Walker",
                "The Unique Expression"
            ])
        elif method == "hybrid":
            themes.extend([
                "The Integration Master",
                "The Synthesis Creator",
                "The Balanced Practitioner"
            ])

        # Add elemental themes
        element = calculation_results['elemental_correspondences']['primary_element']
        element_themes = {
            "fire": ["The Fire Wielder", "The Transformation Catalyst"],
            "water": ["The Flow Master", "The Emotional Alchemist"],
            "air": ["The Mind Weaver", "The Communication Bridge"],
            "earth": ["The Grounding Force", "The Practical Manifestor"]
        }

        themes.extend(element_themes.get(element, []))

        return themes
