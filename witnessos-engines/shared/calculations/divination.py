"""
Divination calculation module for WitnessOS Divination Engines

Provides shared logic for randomization, symbolic mapping, and archetypal pattern
recognition used across multiple divination engines.
"""

import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
from shared.base.utils import SeededRandom


class DivinationCalculator:
    """
    Shared calculation logic for divination engines.
    
    Provides seeded randomization, symbolic mapping, and pattern recognition
    methods that maintain consistency while allowing for mystical interpretation.
    """
    
    def __init__(self, seed: Optional[int] = None):
        """
        Initialize the divination calculator.
        
        Args:
            seed: Optional seed for reproducible results
        """
        self.random = SeededRandom(seed)
    
    def create_question_seed(self, question: str, timestamp: Optional[datetime] = None) -> int:
        """
        Create a deterministic seed from a question and timestamp.
        
        This allows for reproducible results when the same question is asked
        at the same time, while still providing mystical randomness.
        
        Args:
            question: The divination question
            timestamp: Optional timestamp (defaults to current time)
            
        Returns:
            Integer seed for randomization
        """
        if timestamp is None:
            timestamp = datetime.now()
        
        # Combine question and timestamp for unique seed
        seed_string = f"{question.strip().lower()}_{timestamp.isoformat()}"
        
        # Create hash and convert to integer
        hash_object = hashlib.md5(seed_string.encode())
        return int(hash_object.hexdigest()[:8], 16)
    
    def shuffle_deck(self, deck: List[Any], question: str = "") -> List[Any]:
        """
        Shuffle a deck of cards/symbols using question-based seeding.
        
        Args:
            deck: List of items to shuffle
            question: Question to seed the shuffle
            
        Returns:
            Shuffled deck
        """
        if question:
            seed = self.create_question_seed(question)
            temp_random = SeededRandom(seed)
            return temp_random.shuffle(deck)
        else:
            return self.random.shuffle(deck)
    
    def draw_cards(self, deck: List[Any], count: int, question: str = "") -> List[Any]:
        """
        Draw cards from a shuffled deck.
        
        Args:
            deck: Deck to draw from
            count: Number of cards to draw
            question: Question to seed the draw
            
        Returns:
            List of drawn cards
        """
        shuffled_deck = self.shuffle_deck(deck, question)
        return shuffled_deck[:count]
    
    def coin_toss(self, count: int = 1) -> List[bool]:
        """
        Simulate coin tosses for I-Ching and other binary divination.
        
        Args:
            count: Number of coin tosses
            
        Returns:
            List of boolean results (True = heads, False = tails)
        """
        return [self.random.choice([True, False]) for _ in range(count)]
    
    def yarrow_stalk_method(self) -> int:
        """
        Simulate the traditional yarrow stalk method for I-Ching.
        
        Returns:
            Line value (6, 7, 8, or 9)
        """
        # Simplified yarrow stalk simulation
        # Traditional method has specific probabilities
        probabilities = {
            6: 1,   # Old Yin (changing)
            7: 3,   # Young Yang
            8: 3,   # Young Yin  
            9: 1    # Old Yang (changing)
        }
        
        # Create weighted list
        weighted_options = []
        for value, weight in probabilities.items():
            weighted_options.extend([value] * weight)
        
        return self.random.choice(weighted_options)
    
    def generate_hexagram_lines(self, method: str = "coins") -> List[int]:
        """
        Generate six lines for an I-Ching hexagram.
        
        Args:
            method: Method to use ("coins", "yarrow", "random")
            
        Returns:
            List of six line values
        """
        lines = []
        
        for _ in range(6):
            if method == "coins":
                # Three coin tosses per line
                tosses = self.coin_toss(3)
                heads_count = sum(tosses)
                
                # Convert to line values
                if heads_count == 0:
                    lines.append(6)  # Old Yin (changing)
                elif heads_count == 1:
                    lines.append(8)  # Young Yin
                elif heads_count == 2:
                    lines.append(7)  # Young Yang
                else:  # heads_count == 3
                    lines.append(9)  # Old Yang (changing)
                    
            elif method == "yarrow":
                lines.append(self.yarrow_stalk_method())
                
            else:  # random
                lines.append(self.random.choice([6, 7, 8, 9]))
        
        return lines
    
    def lines_to_hexagram_number(self, lines: List[int]) -> int:
        """
        Convert six line values to hexagram number (1-64).
        
        Args:
            lines: List of six line values (bottom to top)
            
        Returns:
            Hexagram number (1-64)
        """
        # Convert lines to binary (odd = 1, even = 0)
        binary_lines = [1 if line % 2 == 1 else 0 for line in lines]
        
        # Convert binary to decimal (bottom line is least significant)
        binary_string = ''.join(str(bit) for bit in reversed(binary_lines))
        decimal_value = int(binary_string, 2)
        
        # Map to hexagram numbers (1-64)
        # This is a simplified mapping - actual I-Ching uses King Wen sequence
        return (decimal_value % 64) + 1
    
    def get_changing_lines(self, lines: List[int]) -> List[int]:
        """
        Identify changing lines in a hexagram.
        
        Args:
            lines: List of six line values
            
        Returns:
            List of positions (1-6) that are changing lines
        """
        changing = []
        for i, line in enumerate(lines):
            if line in [6, 9]:  # Old Yin or Old Yang
                changing.append(i + 1)  # 1-based indexing
        
        return changing
    
    def create_mutation_hexagram(self, original_lines: List[int]) -> List[int]:
        """
        Create the mutation hexagram by changing the changing lines.
        
        Args:
            original_lines: Original hexagram lines
            
        Returns:
            Mutated hexagram lines
        """
        mutated = original_lines.copy()
        
        for i, line in enumerate(mutated):
            if line == 6:  # Old Yin becomes Young Yang
                mutated[i] = 7
            elif line == 9:  # Old Yang becomes Young Yin
                mutated[i] = 8
        
        return mutated
    
    def calculate_archetypal_resonance(self, 
                                     symbols: List[str], 
                                     personal_data: Dict[str, Any]) -> Dict[str, float]:
        """
        Calculate archetypal resonance between symbols and personal data.
        
        This creates a mystical connection between the divination result
        and the querent's personal field signature.
        
        Args:
            symbols: List of symbolic elements (cards, hexagrams, etc.)
            personal_data: Personal data for resonance calculation
            
        Returns:
            Dictionary of archetype names to resonance scores (0.0-1.0)
        """
        # This is a simplified archetypal resonance calculation
        # In a full implementation, this would use more sophisticated
        # symbolic correspondence systems
        
        resonances = {}
        
        # Basic archetypal categories
        archetypes = [
            "Warrior", "Magician", "Lover", "Sage", "Innocent", "Explorer",
            "Hero", "Outlaw", "Creator", "Caregiver", "Ruler", "Jester"
        ]
        
        for archetype in archetypes:
            # Calculate resonance based on symbol count and personal factors
            symbol_influence = len([s for s in symbols if archetype.lower() in str(s).lower()]) / len(symbols)

            # Add personal data influence
            personal_influence = 0.5
            if personal_data and "question" in personal_data:
                question = str(personal_data["question"]).lower()
                if archetype.lower() in question:
                    personal_influence = 0.8

            # Add some mystical randomness
            mystical_factor = self.random.uniform(0.1, 0.9)

            # Combine factors
            resonance = (symbol_influence * 0.4) + (personal_influence * 0.3) + (mystical_factor * 0.3)
            resonances[archetype] = min(1.0, resonance)
        
        return resonances


# Export the calculator class
__all__ = ["DivinationCalculator"]
