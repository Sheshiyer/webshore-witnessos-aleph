"""
Sacred Geometry Calculations for WitnessOS

Mathematical foundations for generating sacred geometric patterns,
including golden ratio constructions, platonic solids, mandalas,
and other consciousness-resonant geometric forms.
"""

import math
import numpy as np
from typing import List, Tuple, Dict, Any, Optional
from dataclasses import dataclass


# Mathematical constants
PHI = (1 + math.sqrt(5)) / 2  # Golden ratio
PI = math.pi
TAU = 2 * PI


@dataclass
class Point:
    """2D point representation."""
    x: float
    y: float
    
    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)
    
    def __mul__(self, scalar):
        return Point(self.x * scalar, self.y * scalar)
    
    def distance_to(self, other):
        return math.sqrt((self.x - other.x)**2 + (self.y - other.y)**2)


@dataclass
class Circle:
    """Circle representation."""
    center: Point
    radius: float


@dataclass
class Polygon:
    """Polygon representation."""
    vertices: List[Point]


class SacredGeometryCalculator:
    """Calculator for sacred geometric patterns and constructions."""
    
    def __init__(self):
        """Initialize the sacred geometry calculator."""
        self.phi = PHI
        self.pi = PI
        self.tau = TAU
    
    def golden_ratio_rectangle(self, width: float = 1.0) -> Tuple[float, float]:
        """
        Calculate dimensions of a golden ratio rectangle.
        
        Args:
            width: Width of the rectangle
            
        Returns:
            Tuple of (width, height) in golden ratio
        """
        height = width / self.phi
        return (width, height)
    
    def golden_spiral_points(self, turns: int = 4, points_per_turn: int = 50) -> List[Point]:
        """
        Generate points for a golden spiral (Fibonacci spiral).
        
        Args:
            turns: Number of spiral turns
            points_per_turn: Points to generate per turn
            
        Returns:
            List of points forming the golden spiral
        """
        points = []
        total_points = turns * points_per_turn
        
        for i in range(total_points):
            # Angle increases linearly
            theta = (i / points_per_turn) * TAU
            
            # Radius grows exponentially with golden ratio
            radius = math.exp(theta / (2 * math.tan(math.pi / (2 * self.phi))))
            
            x = radius * math.cos(theta)
            y = radius * math.sin(theta)
            points.append(Point(x, y))
        
        return points
    
    def flower_of_life_circles(self, center: Point, radius: float, layers: int = 2) -> List[Circle]:
        """
        Generate circles for the Flower of Life pattern.
        
        Args:
            center: Center point of the pattern
            radius: Radius of each circle
            layers: Number of layers around the center
            
        Returns:
            List of circles forming the Flower of Life
        """
        circles = [Circle(center, radius)]  # Central circle
        
        for layer in range(1, layers + 1):
            # Each layer has 6 * layer circles
            circles_in_layer = 6 * layer
            layer_radius = radius * layer * math.sqrt(3)
            
            for i in range(circles_in_layer):
                angle = (i / circles_in_layer) * TAU
                x = center.x + layer_radius * math.cos(angle)
                y = center.y + layer_radius * math.sin(angle)
                circles.append(Circle(Point(x, y), radius))
        
        return circles
    
    def platonic_solid_vertices(self, solid_type: str, scale: float = 1.0) -> List[Tuple[float, float, float]]:
        """
        Generate vertices for platonic solids.
        
        Args:
            solid_type: Type of solid ('tetrahedron', 'cube', 'octahedron', 'dodecahedron', 'icosahedron')
            scale: Scale factor for the solid
            
        Returns:
            List of 3D vertices
        """
        if solid_type == 'tetrahedron':
            vertices = [
                (1, 1, 1),
                (1, -1, -1),
                (-1, 1, -1),
                (-1, -1, 1)
            ]
        elif solid_type == 'cube':
            vertices = [
                (1, 1, 1), (1, 1, -1), (1, -1, 1), (1, -1, -1),
                (-1, 1, 1), (-1, 1, -1), (-1, -1, 1), (-1, -1, -1)
            ]
        elif solid_type == 'octahedron':
            vertices = [
                (1, 0, 0), (-1, 0, 0),
                (0, 1, 0), (0, -1, 0),
                (0, 0, 1), (0, 0, -1)
            ]
        elif solid_type == 'dodecahedron':
            # Simplified dodecahedron vertices using golden ratio
            phi = self.phi
            vertices = [
                (1, 1, 1), (1, 1, -1), (1, -1, 1), (1, -1, -1),
                (-1, 1, 1), (-1, 1, -1), (-1, -1, 1), (-1, -1, -1),
                (0, 1/phi, phi), (0, 1/phi, -phi), (0, -1/phi, phi), (0, -1/phi, -phi),
                (1/phi, phi, 0), (1/phi, -phi, 0), (-1/phi, phi, 0), (-1/phi, -phi, 0),
                (phi, 0, 1/phi), (phi, 0, -1/phi), (-phi, 0, 1/phi), (-phi, 0, -1/phi)
            ]
        elif solid_type == 'icosahedron':
            # Icosahedron vertices using golden ratio
            phi = self.phi
            vertices = [
                (0, 1, phi), (0, 1, -phi), (0, -1, phi), (0, -1, -phi),
                (1, phi, 0), (1, -phi, 0), (-1, phi, 0), (-1, -phi, 0),
                (phi, 0, 1), (phi, 0, -1), (-phi, 0, 1), (-phi, 0, -1)
            ]
        else:
            raise ValueError(f"Unknown solid type: {solid_type}")
        
        # Scale vertices
        return [(x * scale, y * scale, z * scale) for x, y, z in vertices]
    
    def mandala_pattern(self, center: Point, radius: float, petals: int = 8, layers: int = 3) -> Dict[str, Any]:
        """
        Generate a mandala pattern with multiple layers.
        
        Args:
            center: Center point of the mandala
            radius: Outer radius of the mandala
            petals: Number of petals/divisions
            layers: Number of concentric layers
            
        Returns:
            Dictionary containing mandala geometry data
        """
        mandala = {
            'center': center,
            'radius': radius,
            'petals': petals,
            'layers': layers,
            'circles': [],
            'polygons': [],
            'lines': []
        }
        
        # Create concentric circles
        for layer in range(1, layers + 1):
            layer_radius = radius * (layer / layers)
            mandala['circles'].append(Circle(center, layer_radius))
        
        # Create radial divisions
        for i in range(petals):
            angle = (i / petals) * TAU
            end_x = center.x + radius * math.cos(angle)
            end_y = center.y + radius * math.sin(angle)
            mandala['lines'].append((center, Point(end_x, end_y)))
        
        # Create petal polygons
        for layer in range(1, layers + 1):
            layer_radius = radius * (layer / layers)
            for i in range(petals):
                angle1 = (i / petals) * TAU
                angle2 = ((i + 1) / petals) * TAU
                
                # Create petal shape
                vertices = [
                    center,
                    Point(center.x + layer_radius * math.cos(angle1),
                          center.y + layer_radius * math.sin(angle1)),
                    Point(center.x + layer_radius * math.cos(angle2),
                          center.y + layer_radius * math.sin(angle2))
                ]
                mandala['polygons'].append(Polygon(vertices))
        
        return mandala
    
    def vesica_piscis(self, center1: Point, center2: Point, radius: float) -> Dict[str, Any]:
        """
        Calculate the Vesica Piscis (intersection of two circles).
        
        Args:
            center1: Center of first circle
            center2: Center of second circle
            radius: Radius of both circles
            
        Returns:
            Dictionary containing intersection geometry
        """
        distance = center1.distance_to(center2)
        
        if distance > 2 * radius:
            # No intersection
            return {'intersection_points': [], 'area': 0}
        
        if distance == 0:
            # Circles are identical
            return {'intersection_points': [], 'area': math.pi * radius**2}
        
        # Calculate intersection points
        a = distance / 2
        h = math.sqrt(radius**2 - a**2)
        
        # Midpoint between centers
        mid_x = (center1.x + center2.x) / 2
        mid_y = (center1.y + center2.y) / 2
        
        # Perpendicular offset
        offset_x = h * (center2.y - center1.y) / distance
        offset_y = h * (center1.x - center2.x) / distance
        
        intersection1 = Point(mid_x + offset_x, mid_y + offset_y)
        intersection2 = Point(mid_x - offset_x, mid_y - offset_y)
        
        # Calculate area of intersection
        if distance < 2 * radius:
            # Area of circular segment
            theta = 2 * math.acos(distance / (2 * radius))
            area = 2 * radius**2 * (theta - math.sin(theta)) / 2
        else:
            area = 0
        
        return {
            'intersection_points': [intersection1, intersection2],
            'area': area,
            'circles': [Circle(center1, radius), Circle(center2, radius)]
        }
    
    def sri_yantra_triangles(self, center: Point, radius: float) -> List[Polygon]:
        """
        Generate the triangular structure of Sri Yantra.
        
        Args:
            center: Center point of the yantra
            radius: Outer radius
            
        Returns:
            List of triangular polygons
        """
        triangles = []
        
        # Upward pointing triangles (Shiva - masculine)
        for i in range(4):
            scale = 1 - (i * 0.2)
            triangle_radius = radius * scale
            
            vertices = []
            for j in range(3):
                angle = (j * TAU / 3) - (PI / 2)  # Start from top
                x = center.x + triangle_radius * math.cos(angle)
                y = center.y + triangle_radius * math.sin(angle)
                vertices.append(Point(x, y))
            
            triangles.append(Polygon(vertices))
        
        # Downward pointing triangles (Shakti - feminine)
        for i in range(5):
            scale = 0.9 - (i * 0.15)
            triangle_radius = radius * scale
            
            vertices = []
            for j in range(3):
                angle = (j * TAU / 3) + (PI / 2)  # Start from bottom
                x = center.x + triangle_radius * math.cos(angle)
                y = center.y + triangle_radius * math.sin(angle)
                vertices.append(Point(x, y))
            
            triangles.append(Polygon(vertices))
        
        return triangles

    def calculate_personal_geometry(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate personalized sacred geometry based on birth data.

        Args:
            birth_data: Dictionary containing birth information

        Returns:
            Dictionary with personalized geometric patterns
        """
        return calculate_personal_geometry_standalone(birth_data)


def calculate_personal_geometry_standalone(birth_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate personalized sacred geometry based on birth data.
    
    Args:
        birth_data: Dictionary containing birth information
        
    Returns:
        Dictionary with personalized geometric patterns
    """
    calc = SacredGeometryCalculator()
    
    # Use birth date to determine geometric preferences
    birth_date = birth_data.get('birth_date')
    if birth_date:
        # Convert date to numerical values for geometry selection
        day = birth_date.day
        month = birth_date.month
        year = birth_date.year
        
        # Calculate personal geometric parameters
        petal_count = (day % 12) + 4  # 4-15 petals
        layer_count = (month % 5) + 2  # 2-6 layers
        scale_factor = (year % 100) / 100 + 0.5  # 0.5-1.5 scale
        
        center = Point(0, 0)
        radius = 100 * scale_factor
        
        # Generate personal mandala
        mandala = calc.mandala_pattern(center, radius, petal_count, layer_count)
        
        # Generate personal golden spiral
        spiral_turns = (day % 6) + 2  # 2-7 turns
        spiral_points = calc.golden_spiral_points(spiral_turns)
        
        # Select personal platonic solid
        solids = ['tetrahedron', 'cube', 'octahedron', 'dodecahedron', 'icosahedron']
        personal_solid = solids[year % len(solids)]
        solid_vertices = calc.platonic_solid_vertices(personal_solid, scale_factor)
        
        return {
            'mandala': mandala,
            'golden_spiral': spiral_points,
            'platonic_solid': {
                'type': personal_solid,
                'vertices': solid_vertices
            },
            'parameters': {
                'petal_count': petal_count,
                'layer_count': layer_count,
                'scale_factor': scale_factor,
                'spiral_turns': spiral_turns
            }
        }
    
    # Default geometry if no birth data
    center = Point(0, 0)
    mandala = calc.mandala_pattern(center, 100, 8, 3)
    spiral = calc.golden_spiral_points(4)
    
    return {
        'mandala': mandala,
        'golden_spiral': spiral,
        'platonic_solid': {
            'type': 'dodecahedron',
            'vertices': calc.platonic_solid_vertices('dodecahedron')
        }
    }
