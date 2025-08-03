"""
Sigil Generation Calculations for WitnessOS

Mathematical and symbolic foundations for creating sigils from intentions,
including traditional letter elimination methods, geometric symbol synthesis,
and modern algorithmic approaches.
"""

import math
import random
import hashlib
from typing import List, Dict, Any, Tuple, Set
from dataclasses import dataclass
from collections import Counter


@dataclass
class SigilElement:
    """Represents a single element in a sigil."""
    element_type: str  # 'line', 'curve', 'circle', 'symbol'
    start_point: Tuple[float, float]
    end_point: Tuple[float, float]
    control_points: List[Tuple[float, float]]  # For curves
    properties: Dict[str, Any]  # Style, weight, etc.


@dataclass
class SigilComposition:
    """Represents a complete sigil composition."""
    elements: List[SigilElement]
    center_point: Tuple[float, float]
    bounding_box: Tuple[float, float, float, float]  # x1, y1, x2, y2
    symmetry_type: str
    intention_hash: str


class SigilGenerator:
    """Generator for creating sigils from intentions using various methods."""
    
    def __init__(self):
        """Initialize the sigil generator."""
        self.alphabet_positions = {chr(i): i - ord('A') + 1 for i in range(ord('A'), ord('Z') + 1)}
        self.sacred_angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]
        self.golden_ratio = (1 + math.sqrt(5)) / 2
        
        # Traditional sigil alphabet mappings
        self.letter_shapes = self._initialize_letter_shapes()
        
    def _initialize_letter_shapes(self) -> Dict[str, List[Tuple[float, float]]]:
        """Initialize basic geometric shapes for letters."""
        # Simplified geometric representations of letters for sigil creation
        return {
            'A': [(0, 0), (0.5, 1), (1, 0), (0.25, 0.5), (0.75, 0.5)],
            'B': [(0, 0), (0, 1), (0.7, 1), (0.7, 0.5), (0, 0.5), (0.8, 0.5), (0.8, 0), (0, 0)],
            'C': [(1, 0.2), (0.8, 0), (0.2, 0), (0, 0.2), (0, 0.8), (0.2, 1), (0.8, 1), (1, 0.8)],
            'D': [(0, 0), (0, 1), (0.7, 1), (1, 0.7), (1, 0.3), (0.7, 0), (0, 0)],
            'E': [(1, 0), (0, 0), (0, 0.5), (0.6, 0.5), (0, 0.5), (0, 1), (1, 1)],
            'F': [(0, 0), (0, 1), (1, 1), (0, 1), (0, 0.5), (0.6, 0.5)],
            'G': [(1, 0.8), (0.8, 1), (0.2, 1), (0, 0.8), (0, 0.2), (0.2, 0), (0.8, 0), (1, 0.2), (1, 0.5), (0.6, 0.5)],
            'H': [(0, 0), (0, 1), (0, 0.5), (1, 0.5), (1, 0), (1, 1)],
            'I': [(0.2, 0), (0.8, 0), (0.5, 0), (0.5, 1), (0.2, 1), (0.8, 1)],
            'J': [(0, 1), (1, 1), (1, 0.3), (0.8, 0), (0.3, 0), (0, 0.2)],
            'K': [(0, 0), (0, 1), (0, 0.5), (1, 1), (0, 0.5), (1, 0)],
            'L': [(0, 1), (0, 0), (1, 0)],
            'M': [(0, 0), (0, 1), (0.5, 0.5), (1, 1), (1, 0)],
            'N': [(0, 0), (0, 1), (1, 0), (1, 1)],
            'O': [(0.2, 0), (0.8, 0), (1, 0.2), (1, 0.8), (0.8, 1), (0.2, 1), (0, 0.8), (0, 0.2), (0.2, 0)],
            'P': [(0, 0), (0, 1), (0.8, 1), (1, 0.8), (1, 0.7), (0.8, 0.5), (0, 0.5)],
            'Q': [(0.2, 0), (0.8, 0), (1, 0.2), (1, 0.8), (0.8, 1), (0.2, 1), (0, 0.8), (0, 0.2), (0.2, 0), (0.7, 0.3), (1, 0)],
            'R': [(0, 0), (0, 1), (0.8, 1), (1, 0.8), (1, 0.7), (0.8, 0.5), (0, 0.5), (0.5, 0.5), (1, 0)],
            'S': [(1, 0.8), (0.8, 1), (0.2, 1), (0, 0.8), (0, 0.6), (0.2, 0.5), (0.8, 0.5), (1, 0.4), (1, 0.2), (0.8, 0), (0.2, 0), (0, 0.2)],
            'T': [(0, 1), (1, 1), (0.5, 1), (0.5, 0)],
            'U': [(0, 1), (0, 0.2), (0.2, 0), (0.8, 0), (1, 0.2), (1, 1)],
            'V': [(0, 1), (0.5, 0), (1, 1)],
            'W': [(0, 1), (0.25, 0), (0.5, 0.5), (0.75, 0), (1, 1)],
            'X': [(0, 0), (1, 1), (0.5, 0.5), (0, 1), (1, 0)],
            'Y': [(0, 1), (0.5, 0.5), (1, 1), (0.5, 0.5), (0.5, 0)],
            'Z': [(0, 1), (1, 1), (0, 0), (1, 0)]
        }
    
    def eliminate_duplicate_letters(self, intention: str) -> str:
        """
        Traditional sigil method: eliminate duplicate letters.
        
        Args:
            intention: The intention statement
            
        Returns:
            String with duplicate letters removed
        """
        # Convert to uppercase and remove spaces/punctuation
        cleaned = ''.join(c.upper() for c in intention if c.isalpha())
        
        # Remove duplicate letters, keeping first occurrence
        seen = set()
        result = []
        for char in cleaned:
            if char not in seen:
                seen.add(char)
                result.append(char)
        
        return ''.join(result)
    
    def letters_to_numbers(self, letters: str) -> List[int]:
        """
        Convert letters to their alphabetical position numbers.
        
        Args:
            letters: String of letters
            
        Returns:
            List of position numbers
        """
        return [self.alphabet_positions.get(letter, 0) for letter in letters.upper()]
    
    def numbers_to_geometry(self, numbers: List[int], method: str = "radial") -> List[Tuple[float, float]]:
        """
        Convert numbers to geometric coordinates.
        
        Args:
            numbers: List of numbers to convert
            method: Conversion method ('radial', 'spiral', 'grid')
            
        Returns:
            List of coordinate points
        """
        points = []
        
        if method == "radial":
            # Place points around a circle based on numbers
            for i, num in enumerate(numbers):
                angle = (num * 360 / 26) * (math.pi / 180)  # 26 letters in alphabet
                radius = 0.3 + (i * 0.1)  # Varying radius
                x = 0.5 + radius * math.cos(angle)
                y = 0.5 + radius * math.sin(angle)
                points.append((x, y))
                
        elif method == "spiral":
            # Arrange points in a spiral pattern
            for i, num in enumerate(numbers):
                angle = i * self.golden_ratio * 2 * math.pi
                radius = 0.1 + (i * 0.05)
                x = 0.5 + radius * math.cos(angle)
                y = 0.5 + radius * math.sin(angle)
                points.append((x, y))
                
        elif method == "grid":
            # Arrange in a grid pattern based on numbers
            grid_size = math.ceil(math.sqrt(len(numbers)))
            for i, num in enumerate(numbers):
                row = i // grid_size
                col = i % grid_size
                x = (col + 0.5) / grid_size
                y = (row + 0.5) / grid_size
                points.append((x, y))
        
        return points
    
    def connect_points(self, points: List[Tuple[float, float]], connection_method: str = "sequential") -> List[SigilElement]:
        """
        Connect points to form sigil elements.
        
        Args:
            points: List of coordinate points
            connection_method: How to connect points ('sequential', 'star', 'web')
            
        Returns:
            List of sigil elements
        """
        elements = []
        
        if connection_method == "sequential":
            # Connect points in sequence
            for i in range(len(points) - 1):
                element = SigilElement(
                    element_type="line",
                    start_point=points[i],
                    end_point=points[i + 1],
                    control_points=[],
                    properties={"weight": 2, "style": "solid"}
                )
                elements.append(element)
                
        elif connection_method == "star":
            # Connect each point to the center
            center = (0.5, 0.5)
            for point in points:
                element = SigilElement(
                    element_type="line",
                    start_point=center,
                    end_point=point,
                    control_points=[],
                    properties={"weight": 1.5, "style": "solid"}
                )
                elements.append(element)
                
        elif connection_method == "web":
            # Connect each point to every other point
            for i, point1 in enumerate(points):
                for j, point2 in enumerate(points[i + 1:], i + 1):
                    element = SigilElement(
                        element_type="line",
                        start_point=point1,
                        end_point=point2,
                        control_points=[],
                        properties={"weight": 0.5, "style": "solid", "opacity": 0.3}
                    )
                    elements.append(element)
        
        return elements
    
    def add_decorative_elements(self, base_elements: List[SigilElement], intention: str) -> List[SigilElement]:
        """
        Add decorative elements based on intention characteristics.
        
        Args:
            base_elements: Base sigil elements
            intention: Original intention for context
            
        Returns:
            Enhanced list of sigil elements
        """
        elements = base_elements.copy()
        
        # Generate intention hash for consistent decoration
        intention_hash = hashlib.md5(intention.encode()).hexdigest()
        random.seed(int(intention_hash[:8], 16))
        
        # Add circles at key points
        if len(base_elements) > 0:
            # Add circle at center
            center_circle = SigilElement(
                element_type="circle",
                start_point=(0.5, 0.5),
                end_point=(0.5, 0.5),
                control_points=[],
                properties={"radius": 0.05, "fill": False, "weight": 1}
            )
            elements.append(center_circle)
            
            # Add small circles at some endpoints
            for i, element in enumerate(base_elements[::2]):  # Every other element
                if element.element_type == "line":
                    circle = SigilElement(
                        element_type="circle",
                        start_point=element.end_point,
                        end_point=element.end_point,
                        control_points=[],
                        properties={"radius": 0.02, "fill": True, "weight": 1}
                    )
                    elements.append(circle)
        
        # Add sacred geometry elements based on intention length
        if len(intention) % 3 == 0:
            # Add triangle
            triangle_points = [
                (0.5, 0.8),
                (0.3, 0.2),
                (0.7, 0.2)
            ]
            for i in range(len(triangle_points)):
                next_i = (i + 1) % len(triangle_points)
                triangle_line = SigilElement(
                    element_type="line",
                    start_point=triangle_points[i],
                    end_point=triangle_points[next_i],
                    control_points=[],
                    properties={"weight": 0.5, "style": "dashed", "opacity": 0.5}
                )
                elements.append(triangle_line)
        
        return elements
    
    def optimize_aesthetics(self, elements: List[SigilElement]) -> List[SigilElement]:
        """
        Optimize sigil for aesthetic appeal and balance.
        
        Args:
            elements: List of sigil elements
            
        Returns:
            Optimized list of sigil elements
        """
        optimized = []
        
        for element in elements:
            # Smooth sharp angles
            if element.element_type == "line":
                # Add slight curves to straight lines for organic feel
                start_x, start_y = element.start_point
                end_x, end_y = element.end_point
                
                # Calculate control point for slight curve
                mid_x = (start_x + end_x) / 2
                mid_y = (start_y + end_y) / 2
                
                # Offset perpendicular to line
                dx = end_x - start_x
                dy = end_y - start_y
                length = math.sqrt(dx*dx + dy*dy)
                
                if length > 0:
                    # Perpendicular offset (small curve)
                    offset = 0.02
                    perp_x = -dy / length * offset
                    perp_y = dx / length * offset
                    
                    control_point = (mid_x + perp_x, mid_y + perp_y)
                    
                    curved_element = SigilElement(
                        element_type="curve",
                        start_point=element.start_point,
                        end_point=element.end_point,
                        control_points=[control_point],
                        properties=element.properties
                    )
                    optimized.append(curved_element)
                else:
                    optimized.append(element)
            else:
                optimized.append(element)
        
        return optimized
    
    def generate_traditional_sigil(self, intention: str) -> SigilComposition:
        """
        Generate a sigil using traditional letter elimination method.
        
        Args:
            intention: The intention statement
            
        Returns:
            Complete sigil composition
        """
        # Step 1: Eliminate duplicate letters
        unique_letters = self.eliminate_duplicate_letters(intention)
        
        # Step 2: Convert to numbers
        numbers = self.letters_to_numbers(unique_letters)
        
        # Step 3: Convert to geometry
        points = self.numbers_to_geometry(numbers, "radial")
        
        # Step 4: Connect points
        base_elements = self.connect_points(points, "sequential")
        
        # Step 5: Add decorative elements
        decorated_elements = self.add_decorative_elements(base_elements, intention)
        
        # Step 6: Optimize aesthetics
        final_elements = self.optimize_aesthetics(decorated_elements)
        
        # Calculate bounding box
        all_x = []
        all_y = []
        for element in final_elements:
            all_x.extend([element.start_point[0], element.end_point[0]])
            all_y.extend([element.start_point[1], element.end_point[1]])
            for cp in element.control_points:
                all_x.extend([cp[0]])
                all_y.extend([cp[1]])
        
        bounding_box = (min(all_x), min(all_y), max(all_x), max(all_y))
        
        # Generate intention hash
        intention_hash = hashlib.md5(intention.encode()).hexdigest()[:8]
        
        return SigilComposition(
            elements=final_elements,
            center_point=(0.5, 0.5),
            bounding_box=bounding_box,
            symmetry_type="radial",
            intention_hash=intention_hash
        )
    
    def generate_geometric_sigil(self, intention: str, sacred_geometry: str = "auto") -> SigilComposition:
        """
        Generate a sigil using sacred geometry principles.
        
        Args:
            intention: The intention statement
            sacred_geometry: Type of sacred geometry to use
            
        Returns:
            Complete sigil composition
        """
        # Use intention characteristics to select geometry
        if sacred_geometry == "auto":
            intention_sum = sum(ord(c) for c in intention.lower())
            geometry_types = ["triangle", "square", "pentagon", "hexagon", "circle"]
            sacred_geometry = geometry_types[intention_sum % len(geometry_types)]
        
        elements = []
        
        if sacred_geometry == "triangle":
            # Create triangular sigil base
            triangle_points = [
                (0.5, 0.1),   # Top
                (0.1, 0.9),   # Bottom left
                (0.9, 0.9)    # Bottom right
            ]
            
            # Connect triangle
            for i in range(len(triangle_points)):
                next_i = (i + 1) % len(triangle_points)
                element = SigilElement(
                    element_type="line",
                    start_point=triangle_points[i],
                    end_point=triangle_points[next_i],
                    control_points=[],
                    properties={"weight": 2, "style": "solid"}
                )
                elements.append(element)
            
            # Add intention-based internal elements
            unique_letters = self.eliminate_duplicate_letters(intention)
            numbers = self.letters_to_numbers(unique_letters)
            
            # Place symbols at triangle vertices and center
            symbol_points = triangle_points + [(0.5, 0.6)]  # Add center
            for i, point in enumerate(symbol_points[:len(numbers)]):
                circle = SigilElement(
                    element_type="circle",
                    start_point=point,
                    end_point=point,
                    control_points=[],
                    properties={"radius": 0.03, "fill": True, "weight": 1}
                )
                elements.append(circle)
        
        elif sacred_geometry == "circle":
            # Create circular sigil base
            center = (0.5, 0.5)
            radius = 0.4
            
            # Outer circle
            outer_circle = SigilElement(
                element_type="circle",
                start_point=center,
                end_point=center,
                control_points=[],
                properties={"radius": radius, "fill": False, "weight": 2}
            )
            elements.append(outer_circle)
            
            # Place letters around circle
            unique_letters = self.eliminate_duplicate_letters(intention)
            numbers = self.letters_to_numbers(unique_letters)
            
            for i, num in enumerate(numbers):
                angle = (i / len(numbers)) * 2 * math.pi
                x = center[0] + radius * 0.8 * math.cos(angle)
                y = center[1] + radius * 0.8 * math.sin(angle)
                
                # Connect to center
                line = SigilElement(
                    element_type="line",
                    start_point=center,
                    end_point=(x, y),
                    control_points=[],
                    properties={"weight": 1, "style": "solid"}
                )
                elements.append(line)
                
                # Add symbol at end
                symbol = SigilElement(
                    element_type="circle",
                    start_point=(x, y),
                    end_point=(x, y),
                    control_points=[],
                    properties={"radius": 0.02, "fill": True, "weight": 1}
                )
                elements.append(symbol)
        
        # Calculate bounding box
        all_x = [0.1, 0.9]  # Default bounds
        all_y = [0.1, 0.9]
        
        intention_hash = hashlib.md5(intention.encode()).hexdigest()[:8]
        
        return SigilComposition(
            elements=elements,
            center_point=(0.5, 0.5),
            bounding_box=(min(all_x), min(all_y), max(all_x), max(all_y)),
            symmetry_type=sacred_geometry,
            intention_hash=intention_hash
        )
