"""
Sacred Geometry Mapper Engine for WitnessOS

Generates consciousness-resonant sacred geometric patterns based on intention,
birth data, and geometric preferences. Creates visual representations of
mathematical harmony and spiritual symbolism.
"""

import os
import math
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from datetime import datetime
from typing import Dict, List, Any, Type, Optional, Tuple
from pathlib import Path

from shared.base.engine_interface import BaseEngine
from shared.base.data_models import BaseEngineInput, BaseEngineOutput
from shared.calculations.sacred_geometry import SacredGeometryCalculator, Point, Circle, Polygon
from .sacred_geometry_models import (
    SacredGeometryInput, SacredGeometryOutput, GeometricPattern,
    SacredRatio, SymmetryGroup, MeditationPoint, EnergyFlow,
    COLOR_SCHEMES, SACRED_RATIOS, PLATONIC_SOLIDS
)


class SacredGeometryMapper(BaseEngine):
    """
    Sacred Geometry Mapper Engine
    
    Generates sacred geometric patterns for consciousness exploration,
    meditation, and manifestation work. Creates visual representations
    of mathematical harmony and spiritual symbolism.
    """
    
    def __init__(self, config=None):
        """Initialize the Sacred Geometry Mapper."""
        super().__init__(config)
        self.calculator = SacredGeometryCalculator()
        self.output_dir = Path("generated_geometry")
        self.output_dir.mkdir(exist_ok=True)
    
    @property
    def engine_name(self) -> str:
        return "sacred_geometry_mapper"
    
    @property
    def description(self) -> str:
        return "Generates consciousness-resonant sacred geometric patterns for meditation and manifestation"
    
    @property
    def input_model(self) -> Type[BaseEngineInput]:
        return SacredGeometryInput
    
    @property
    def output_model(self) -> Type[BaseEngineOutput]:
        return BaseEngineOutput
    
    def _calculate(self, validated_input: SacredGeometryInput) -> Dict[str, Any]:
        """
        Generate sacred geometry pattern based on input parameters.
        
        Args:
            validated_input: Validated input data
            
        Returns:
            Dictionary containing calculation results
        """
        # Determine pattern parameters
        if validated_input.pattern_type == "personal" and validated_input.birth_date:
            pattern_data = self._generate_personal_pattern(validated_input)
        else:
            pattern_data = self._generate_standard_pattern(validated_input)
        
        # Generate visual representation
        image_path, svg_path = self._create_visual_output(pattern_data, validated_input)
        
        # Analyze mathematical properties
        math_properties = self._analyze_mathematical_properties(pattern_data)
        
        # Calculate sacred ratios
        sacred_ratios = self._calculate_sacred_ratios(pattern_data)
        
        # Analyze symmetry
        symmetry = self._analyze_symmetry(pattern_data)
        
        # Identify meditation points
        meditation_points = self._identify_meditation_points(pattern_data)
        
        # Analyze energy flow
        energy_flow = self._analyze_energy_flow(pattern_data)
        
        # Generate chakra correspondences
        chakra_correspondences = self._generate_chakra_correspondences(pattern_data)
        
        return {
            'pattern_data': pattern_data,
            'image_path': image_path,
            'svg_path': svg_path,
            'mathematical_properties': math_properties,
            'sacred_ratios': sacred_ratios,
            'symmetry_analysis': symmetry,
            'meditation_points': meditation_points,
            'energy_flow': energy_flow,
            'chakra_correspondences': chakra_correspondences,
            'intention': validated_input.intention,
            'pattern_type': validated_input.pattern_type
        }
    
    def _generate_personal_pattern(self, input_data: SacredGeometryInput) -> Dict[str, Any]:
        """Generate personalized sacred geometry based on birth data."""
        birth_data = {'birth_date': input_data.birth_date}
        personal_geometry = self.calculator.calculate_personal_geometry(birth_data)
        
        # Override with user preferences if provided
        if input_data.petal_count:
            personal_geometry['mandala']['petals'] = input_data.petal_count
        if input_data.layer_count:
            personal_geometry['mandala']['layers'] = input_data.layer_count
        if input_data.spiral_turns:
            personal_geometry['golden_spiral'] = self.calculator.golden_spiral_points(input_data.spiral_turns)
        
        return {
            'type': 'personal',
            'geometry': personal_geometry,
            'center': Point(0, 0),
            'radius': 100,
            'birth_influenced': True
        }
    
    def _generate_standard_pattern(self, input_data: SacredGeometryInput) -> Dict[str, Any]:
        """Generate standard sacred geometry pattern."""
        center = Point(0, 0)
        radius = 100
        
        if input_data.pattern_type == "mandala":
            petals = input_data.petal_count or 8
            layers = input_data.layer_count or 3
            geometry = self.calculator.mandala_pattern(center, radius, petals, layers)
            
        elif input_data.pattern_type == "flower_of_life":
            layers = input_data.layer_count or 2
            geometry = self.calculator.flower_of_life_circles(center, radius/3, layers)
            
        elif input_data.pattern_type == "sri_yantra":
            geometry = self.calculator.sri_yantra_triangles(center, radius)
            
        elif input_data.pattern_type == "golden_spiral":
            turns = input_data.spiral_turns or 4
            geometry = self.calculator.golden_spiral_points(turns)
            
        elif input_data.pattern_type == "platonic_solid":
            solid_type = input_data.solid_type or "dodecahedron"
            geometry = self.calculator.platonic_solid_vertices(solid_type)
            
        elif input_data.pattern_type == "vesica_piscis":
            center2 = Point(radius * 0.8, 0)
            geometry = self.calculator.vesica_piscis(center, center2, radius)
            
        else:
            # Default to mandala
            geometry = self.calculator.mandala_pattern(center, radius, 8, 3)
        
        return {
            'type': input_data.pattern_type,
            'geometry': geometry,
            'center': center,
            'radius': radius,
            'birth_influenced': False
        }
    
    def _create_visual_output(self, pattern_data: Dict[str, Any], input_data: SacredGeometryInput) -> Tuple[str, str]:
        """Create visual representation of the sacred geometry."""
        fig, ax = plt.subplots(1, 1, figsize=(10, 10))
        ax.set_aspect('equal')
        ax.set_xlim(-150, 150)
        ax.set_ylim(-150, 150)
        
        # Get color scheme
        colors = COLOR_SCHEMES[input_data.color_scheme]
        ax.set_facecolor(colors['background'])
        
        # Draw the pattern based on type
        self._draw_pattern(ax, pattern_data, colors, input_data)
        
        # Remove axes for clean look
        ax.set_xticks([])
        ax.set_yticks([])
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['bottom'].set_visible(False)
        ax.spines['left'].set_visible(False)
        
        # Save image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        image_filename = f"sacred_geometry_{timestamp}.png"
        image_path = self.output_dir / image_filename
        
        plt.savefig(image_path, dpi=300, bbox_inches='tight', 
                   facecolor=colors['background'], edgecolor='none')
        plt.close()
        
        # Create SVG (simplified version)
        svg_filename = f"sacred_geometry_{timestamp}.svg"
        svg_path = self.output_dir / svg_filename
        self._create_svg_output(pattern_data, svg_path, colors)
        
        return str(image_path), str(svg_path)
    
    def _draw_pattern(self, ax, pattern_data: Dict[str, Any], colors: Dict[str, str], input_data: SacredGeometryInput):
        """Draw the sacred geometry pattern on the matplotlib axes."""
        geometry = pattern_data['geometry']
        pattern_type = pattern_data['type']
        
        if pattern_type == "personal" or pattern_type == "mandala":
            self._draw_mandala(ax, geometry, colors, input_data.include_construction_lines)
        elif pattern_type == "flower_of_life":
            self._draw_flower_of_life(ax, geometry, colors)
        elif pattern_type == "golden_spiral":
            self._draw_golden_spiral(ax, geometry, colors)
        elif pattern_type == "sri_yantra":
            self._draw_sri_yantra(ax, geometry, colors)
        elif pattern_type == "vesica_piscis":
            self._draw_vesica_piscis(ax, geometry, colors)
    
    def _draw_mandala(self, ax, mandala_data, colors: Dict[str, str], include_construction: bool):
        """Draw mandala pattern."""
        if isinstance(mandala_data, dict) and 'mandala' in mandala_data:
            mandala = mandala_data['mandala']
        else:
            mandala = mandala_data
        
        # Draw circles
        for circle in mandala.get('circles', []):
            circle_patch = patches.Circle((circle.center.x, circle.center.y), circle.radius,
                                        fill=False, edgecolor=colors['primary'], linewidth=1.5)
            ax.add_patch(circle_patch)
        
        # Draw radial lines
        if include_construction:
            for line in mandala.get('lines', []):
                start, end = line
                ax.plot([start.x, end.x], [start.y, end.y], 
                       color=colors['secondary'], linewidth=1, alpha=0.7)
        
        # Draw polygons
        for polygon in mandala.get('polygons', []):
            vertices = [(p.x, p.y) for p in polygon.vertices]
            poly_patch = patches.Polygon(vertices, fill=True, 
                                       facecolor=colors['accent'], alpha=0.3,
                                       edgecolor=colors['primary'], linewidth=0.5)
            ax.add_patch(poly_patch)
    
    def _draw_flower_of_life(self, ax, circles, colors: Dict[str, str]):
        """Draw Flower of Life pattern."""
        for circle in circles:
            circle_patch = patches.Circle((circle.center.x, circle.center.y), circle.radius,
                                        fill=False, edgecolor=colors['primary'], linewidth=2)
            ax.add_patch(circle_patch)
    
    def _draw_golden_spiral(self, ax, points, colors: Dict[str, str]):
        """Draw golden spiral."""
        x_coords = [p.x for p in points]
        y_coords = [p.y for p in points]
        ax.plot(x_coords, y_coords, color=colors['primary'], linewidth=3)
        
        # Add spiral center point
        ax.plot(0, 0, 'o', color=colors['accent'], markersize=8)
    
    def _draw_sri_yantra(self, ax, triangles, colors: Dict[str, str]):
        """Draw Sri Yantra triangles."""
        for i, triangle in enumerate(triangles):
            vertices = [(p.x, p.y) for p in triangle.vertices]
            color = colors['primary'] if i < 4 else colors['secondary']
            poly_patch = patches.Polygon(vertices, fill=False, 
                                       edgecolor=color, linewidth=2)
            ax.add_patch(poly_patch)
    
    def _draw_vesica_piscis(self, ax, vesica_data, colors: Dict[str, str]):
        """Draw Vesica Piscis."""
        for circle in vesica_data['circles']:
            circle_patch = patches.Circle((circle.center.x, circle.center.y), circle.radius,
                                        fill=False, edgecolor=colors['primary'], linewidth=2)
            ax.add_patch(circle_patch)
        
        # Highlight intersection points
        for point in vesica_data['intersection_points']:
            ax.plot(point.x, point.y, 'o', color=colors['accent'], markersize=6)
    
    def _create_svg_output(self, pattern_data: Dict[str, Any], svg_path: Path, colors: Dict[str, str]):
        """Create SVG version of the pattern (simplified)."""
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="{colors['background']}"/>
  <circle cx="150" cy="150" r="100" fill="none" stroke="{colors['primary']}" stroke-width="2"/>
  <text x="150" y="280" text-anchor="middle" font-family="Arial" font-size="12" fill="{colors['primary']}">
    Sacred Geometry - {pattern_data['type'].title()}
  </text>
</svg>'''
        
        with open(svg_path, 'w') as f:
            f.write(svg_content)
    
    def _analyze_mathematical_properties(self, pattern_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze mathematical properties of the pattern."""
        return {
            'pattern_type': pattern_data['type'],
            'center_coordinates': (pattern_data['center'].x, pattern_data['center'].y),
            'radius': pattern_data['radius'],
            'golden_ratio_present': True,  # Most sacred geometry incorporates golden ratio
            'symmetry_order': self._calculate_symmetry_order(pattern_data),
            'fractal_dimension': self._estimate_fractal_dimension(pattern_data)
        }
    
    def _calculate_sacred_ratios(self, pattern_data: Dict[str, Any]) -> Dict[str, float]:
        """Calculate sacred ratios present in the pattern."""
        ratios = {}
        
        # Golden ratio is fundamental to most sacred geometry
        ratios['golden_ratio'] = SACRED_RATIOS['golden_ratio']
        ratios['pi'] = SACRED_RATIOS['pi']
        
        # Add pattern-specific ratios
        if pattern_data['type'] in ['mandala', 'personal']:
            ratios['sqrt_2'] = SACRED_RATIOS['sqrt_2']
            ratios['sqrt_3'] = SACRED_RATIOS['sqrt_3']
        
        return ratios
    
    def _analyze_symmetry(self, pattern_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze symmetry properties of the pattern."""
        pattern_type = pattern_data['type']
        
        if pattern_type in ['mandala', 'personal']:
            geometry = pattern_data['geometry']
            if isinstance(geometry, dict) and 'mandala' in geometry:
                petals = geometry['mandala'].get('petals', 8)
            else:
                petals = geometry.get('petals', 8)
            
            return {
                'type': 'rotational',
                'order': petals,
                'reflection_axes': petals,
                'point_group': f'D{petals}'
            }
        
        elif pattern_type == 'flower_of_life':
            return {
                'type': 'hexagonal',
                'order': 6,
                'reflection_axes': 6,
                'point_group': 'D6'
            }
        
        else:
            return {
                'type': 'radial',
                'order': 1,
                'reflection_axes': 0,
                'point_group': 'C1'
            }
    
    def _identify_meditation_points(self, pattern_data: Dict[str, Any]) -> List[Tuple[float, float]]:
        """Identify key points for meditation focus."""
        points = []
        
        # Center is always a primary meditation point
        center = pattern_data['center']
        points.append((center.x, center.y))
        
        # Add pattern-specific meditation points
        if pattern_data['type'] in ['mandala', 'personal']:
            radius = pattern_data['radius']
            # Add points at golden ratio distances
            golden_radius = radius / SACRED_RATIOS['golden_ratio']
            for i in range(8):
                angle = i * math.pi / 4
                x = center.x + golden_radius * math.cos(angle)
                y = center.y + golden_radius * math.sin(angle)
                points.append((x, y))
        
        return points
    
    def _analyze_energy_flow(self, pattern_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze energy flow patterns in the geometry."""
        pattern_type = pattern_data['type']
        
        if pattern_type == 'golden_spiral':
            return {
                'flow_type': 'spiral',
                'direction': 'inward_expanding',
                'intensity': 'exponential_growth',
                'description': 'Energy flows in golden spiral, creating expansion and growth'
            }
        
        elif pattern_type in ['mandala', 'personal']:
            return {
                'flow_type': 'radial',
                'direction': 'bidirectional',
                'intensity': 'balanced',
                'description': 'Energy flows from center outward and inward, creating balance'
            }
        
        else:
            return {
                'flow_type': 'circular',
                'direction': 'clockwise',
                'intensity': 'steady',
                'description': 'Energy flows in circular patterns, creating harmony'
            }
    
    def _generate_chakra_correspondences(self, pattern_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate chakra system correspondences."""
        pattern_type = pattern_data['type']
        
        base_correspondences = {
            'root': 'Grounding and foundation',
            'sacral': 'Creative expression',
            'solar_plexus': 'Personal power',
            'heart': 'Love and connection',
            'throat': 'Communication',
            'third_eye': 'Intuition and insight',
            'crown': 'Spiritual connection'
        }
        
        if pattern_type == 'sri_yantra':
            base_correspondences['heart'] = 'Divine union and sacred geometry'
            base_correspondences['crown'] = 'Cosmic consciousness'
        
        elif pattern_type == 'flower_of_life':
            base_correspondences['third_eye'] = 'Sacred pattern recognition'
            base_correspondences['crown'] = 'Universal connection'
        
        return base_correspondences
    
    def _calculate_symmetry_order(self, pattern_data: Dict[str, Any]) -> int:
        """Calculate the order of rotational symmetry."""
        pattern_type = pattern_data['type']
        
        if pattern_type in ['mandala', 'personal']:
            geometry = pattern_data['geometry']
            if isinstance(geometry, dict) and 'mandala' in geometry:
                return geometry['mandala'].get('petals', 8)
            else:
                return geometry.get('petals', 8)
        
        elif pattern_type == 'flower_of_life':
            return 6
        
        else:
            return 1
    
    def _estimate_fractal_dimension(self, pattern_data: Dict[str, Any]) -> float:
        """Estimate the fractal dimension of the pattern."""
        pattern_type = pattern_data['type']
        
        # Simplified fractal dimension estimates
        if pattern_type == 'golden_spiral':
            return 1.618  # Approximates golden ratio
        elif pattern_type in ['mandala', 'personal']:
            return 1.5    # Between 1D and 2D
        else:
            return 1.0    # Mostly 1-dimensional structures

    def _interpret(self, calculation_results: Dict[str, Any], input_data: SacredGeometryInput) -> str:
        """Generate mystical interpretation of the sacred geometry."""
        pattern_type = calculation_results['pattern_type']
        intention = calculation_results['intention']

        interpretation = f"""🔺 SACRED GEOMETRY MANIFESTATION - {pattern_type.upper().replace('_', ' ')} 🔺

═══ GEOMETRIC CONSCIOUSNESS FIELD ═══

Intention: {intention}
Pattern Type: {pattern_type.title().replace('_', ' ')}
Mathematical Harmony: Golden Ratio and Sacred Proportions

Your consciousness has resonated with the archetypal pattern of {pattern_type.replace('_', ' ')}.
This geometric form serves as a bridge between mathematical perfection and spiritual awareness.

═══ SACRED MATHEMATICAL PROPERTIES ═══

The pattern embodies fundamental cosmic ratios:
"""

        # Add sacred ratios information
        for ratio_name, ratio_value in calculation_results['sacred_ratios'].items():
            ratio_display = ratio_name.replace('_', ' ').title()
            interpretation += f"• {ratio_display}: {ratio_value:.6f}\n"

        interpretation += f"""
═══ SYMMETRY AND HARMONY ═══

Symmetry Order: {calculation_results['symmetry_analysis']['order']}
Pattern Group: {calculation_results['symmetry_analysis'].get('point_group', 'Radial')}

This symmetry creates resonance with natural patterns and cosmic order.

═══ CONSCIOUSNESS ACTIVATION POINTS ═══

Meditation Focus Points: {len(calculation_results['meditation_points'])} key locations
Energy Flow: {calculation_results['energy_flow']['flow_type'].title()} pattern
Direction: {calculation_results['energy_flow']['direction'].replace('_', ' ').title()}

═══ MANIFESTATION GUIDANCE ═══

Use this sacred geometry for:
• Meditation and contemplation
• Manifestation work aligned with your intention
• Consciousness expansion through pattern recognition
• Energy harmonization and balance

Remember: Sacred geometry is not decoration—it is consciousness technology
for aligning with the mathematical harmony underlying reality.
"""

        return interpretation

    def _generate_recommendations(self, calculation_results: Dict[str, Any], input_data: SacredGeometryInput) -> List[str]:
        """Generate recommendations for using the sacred geometry."""
        pattern_type = calculation_results['pattern_type']

        recommendations = [
            f"Meditate daily with your {pattern_type.replace('_', ' ')} pattern for 10-20 minutes",
            "Focus on the center point first, then expand awareness to the whole pattern",
            "Use the pattern as a visual anchor during manifestation work",
            "Place the image where you'll see it regularly to maintain geometric resonance"
        ]

        # Add pattern-specific recommendations
        if pattern_type == 'mandala':
            recommendations.extend([
                "Trace the pattern with your finger to activate kinesthetic learning",
                "Color or draw your own version to deepen the connection"
            ])

        elif pattern_type == 'golden_spiral':
            recommendations.extend([
                "Follow the spiral path with your eyes during meditation",
                "Use the spiral for growth and expansion visualizations"
            ])

        elif pattern_type == 'flower_of_life':
            recommendations.extend([
                "Contemplate the interconnectedness shown by overlapping circles",
                "Use for unity consciousness and oneness meditations"
            ])

        elif pattern_type == 'sri_yantra':
            recommendations.extend([
                "Practice traditional Sri Yantra meditation techniques",
                "Focus on the central point (bindu) for transcendence work"
            ])

        return recommendations

    def _generate_reality_patches(self, calculation_results: Dict[str, Any], input_data: SacredGeometryInput) -> List[str]:
        """Generate reality patches for sacred geometry integration."""
        pattern_type = calculation_results['pattern_type']

        patches = [
            "Install: Sacred geometry consciousness interface",
            f"Patch: {pattern_type.replace('_', ' ').title()} pattern recognition protocol",
            "Upgrade: Mathematical harmony perception module",
            "Enable: Golden ratio field resonance",
            "Activate: Geometric meditation enhancement system"
        ]

        # Add pattern-specific patches
        if calculation_results.get('birth_influenced'):
            patches.append("Sync: Personal birth geometry alignment matrix")

        if calculation_results['symmetry_analysis']['order'] > 1:
            patches.append(f"Install: {calculation_results['symmetry_analysis']['order']}-fold symmetry awareness")

        return patches

    def _identify_archetypal_themes(self, calculation_results: Dict[str, Any], input_data: SacredGeometryInput) -> List[str]:
        """Identify archetypal themes in the sacred geometry."""
        pattern_type = calculation_results['pattern_type']

        themes = [
            "The Sacred Mathematician",
            "The Geometric Mystic",
            "The Pattern Weaver",
            "The Harmony Seeker"
        ]

        # Add pattern-specific themes
        if pattern_type == 'mandala':
            themes.extend([
                "The Mandala Keeper",
                "The Circle Walker",
                "The Center Finder"
            ])

        elif pattern_type == 'golden_spiral':
            themes.extend([
                "The Spiral Dancer",
                "The Growth Catalyst",
                "The Fibonacci Follower"
            ])

        elif pattern_type == 'flower_of_life':
            themes.extend([
                "The Unity Consciousness",
                "The Sacred Gardener",
                "The Life Pattern Holder"
            ])

        elif pattern_type == 'sri_yantra':
            themes.extend([
                "The Divine Geometer",
                "The Yantra Keeper",
                "The Sacred Union"
            ])

        elif pattern_type == 'platonic_solid':
            solid_type = input_data.solid_type or 'dodecahedron'
            element = PLATONIC_SOLIDS[solid_type]['element']
            themes.extend([
                f"The {element} Embodiment",
                f"The {solid_type.title()} Guardian",
                "The Elemental Geometer"
            ])

        return themes
