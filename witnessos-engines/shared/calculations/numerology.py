"""
Numerology calculation module for WitnessOS Divination Engines

Provides core numerology calculations using both Pythagorean and Chaldean systems.
Handles life path, expression, soul urge, personality numbers, and personal year calculations.
"""

from datetime import date
from typing import Dict, List, Tuple, Optional
from ..base.utils import reduce_to_single_digit, extract_vowels, extract_consonants, extract_letters_only


# Numerology letter-to-number mappings

PYTHAGOREAN_SYSTEM = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
}

CHALDEAN_SYSTEM = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5, 'I': 1,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8, 'Q': 1, 'R': 2,
    'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5, 'Y': 1, 'Z': 7
}

# Master numbers that should not be reduced
MASTER_NUMBERS = [11, 22, 33, 44]

# Karmic debt numbers
KARMIC_DEBT_NUMBERS = [13, 14, 16, 19]


class NumerologyCalculator:
    """Core numerology calculation engine."""
    
    def __init__(self, system: str = "pythagorean"):
        """
        Initialize calculator with specified system.
        
        Args:
            system: Either "pythagorean" or "chaldean"
        """
        self.system = system.lower()
        if self.system == "pythagorean":
            self.letter_values = PYTHAGOREAN_SYSTEM
        elif self.system == "chaldean":
            self.letter_values = CHALDEAN_SYSTEM
        else:
            raise ValueError(f"Unknown numerology system: {system}")
    
    def calculate_from_text(self, text: str, keep_master: bool = True) -> int:
        """
        Calculate numerology value from text.
        
        Args:
            text: Text to calculate from
            keep_master: Whether to preserve master numbers
            
        Returns:
            Calculated numerology number
        """
        if not text:
            return 0
        
        # Extract only letters and convert to uppercase
        letters = extract_letters_only(text).upper()
        
        # Calculate total value
        total = sum(self.letter_values.get(letter, 0) for letter in letters)
        
        # Reduce to single digit (preserving master numbers if requested)
        return reduce_to_single_digit(total, keep_master=keep_master)
    
    def calculate_life_path(self, birth_date: date) -> int:
        """
        Calculate Life Path number from birth date.
        
        Args:
            birth_date: Date of birth
            
        Returns:
            Life Path number
        """
        # Convert date to string and sum all digits
        date_string = birth_date.strftime("%m%d%Y")
        total = sum(int(digit) for digit in date_string)
        
        return reduce_to_single_digit(total, keep_master=True)
    
    def calculate_expression(self, full_name: str) -> int:
        """
        Calculate Expression (Destiny) number from full birth name.
        
        Args:
            full_name: Complete birth name
            
        Returns:
            Expression number
        """
        return self.calculate_from_text(full_name, keep_master=True)
    
    def calculate_soul_urge(self, full_name: str) -> int:
        """
        Calculate Soul Urge (Heart's Desire) number from vowels in name.
        
        Args:
            full_name: Complete birth name
            
        Returns:
            Soul Urge number
        """
        vowels = extract_vowels(full_name)
        return self.calculate_from_text(vowels, keep_master=True)
    
    def calculate_personality(self, full_name: str) -> int:
        """
        Calculate Personality number from consonants in name.
        
        Args:
            full_name: Complete birth name
            
        Returns:
            Personality number
        """
        consonants = extract_consonants(full_name)
        return self.calculate_from_text(consonants, keep_master=True)
    
    def calculate_personal_year(self, birth_date: date, current_year: int) -> int:
        """
        Calculate Personal Year number.
        
        Args:
            birth_date: Date of birth
            current_year: Year to calculate for
            
        Returns:
            Personal Year number
        """
        # Use birth month and day with current year
        month_day = birth_date.strftime("%m%d")
        year_string = f"{month_day}{current_year}"
        
        total = sum(int(digit) for digit in year_string)
        return reduce_to_single_digit(total, keep_master=False)  # Personal year doesn't use master numbers
    
    def calculate_personal_month(self, birth_date: date, current_year: int, current_month: int) -> int:
        """
        Calculate Personal Month number.
        
        Args:
            birth_date: Date of birth
            current_year: Current year
            current_month: Current month
            
        Returns:
            Personal Month number
        """
        personal_year = self.calculate_personal_year(birth_date, current_year)
        return reduce_to_single_digit(personal_year + current_month, keep_master=False)
    
    def calculate_personal_day(self, birth_date: date, target_date: date) -> int:
        """
        Calculate Personal Day number.
        
        Args:
            birth_date: Date of birth
            target_date: Date to calculate for
            
        Returns:
            Personal Day number
        """
        personal_month = self.calculate_personal_month(birth_date, target_date.year, target_date.month)
        return reduce_to_single_digit(personal_month + target_date.day, keep_master=False)
    
    def calculate_maturity(self, life_path: int, expression: int) -> int:
        """
        Calculate Maturity number (Life Path + Expression).
        
        Args:
            life_path: Life Path number
            expression: Expression number
            
        Returns:
            Maturity number
        """
        return reduce_to_single_digit(life_path + expression, keep_master=True)
    
    def calculate_bridge_numbers(self, life_path: int, expression: int, soul_urge: int, personality: int) -> Dict[str, int]:
        """
        Calculate Bridge numbers (differences between core numbers).
        
        Args:
            life_path: Life Path number
            expression: Expression number
            soul_urge: Soul Urge number
            personality: Personality number
            
        Returns:
            Dictionary of bridge numbers
        """
        return {
            "life_expression_bridge": abs(life_path - expression),
            "soul_personality_bridge": abs(soul_urge - personality)
        }
    
    def identify_master_numbers(self, numbers: Dict[str, int]) -> List[int]:
        """
        Identify any master numbers in the calculation results.
        
        Args:
            numbers: Dictionary of calculated numbers
            
        Returns:
            List of master numbers found
        """
        found_masters = []
        for value in numbers.values():
            if isinstance(value, int) and value in MASTER_NUMBERS:
                if value not in found_masters:
                    found_masters.append(value)
        
        return sorted(found_masters)
    
    def identify_karmic_debt(self, full_name: str, birth_date: date) -> List[int]:
        """
        Identify karmic debt numbers in the profile.
        
        Args:
            full_name: Complete birth name
            birth_date: Date of birth
            
        Returns:
            List of karmic debt numbers found
        """
        karmic_debts = []
        
        # Check various calculations for karmic debt numbers
        calculations = [
            self.calculate_expression(full_name),
            self.calculate_life_path(birth_date),
            self.calculate_soul_urge(full_name),
            self.calculate_personality(full_name)
        ]
        
        for number in calculations:
            if number in KARMIC_DEBT_NUMBERS and number not in karmic_debts:
                karmic_debts.append(number)
        
        return sorted(karmic_debts)
    
    def calculate_complete_profile(self, full_name: str, birth_date: date, current_year: Optional[int] = None) -> Dict[str, any]:
        """
        Calculate complete numerology profile.
        
        Args:
            full_name: Complete birth name
            birth_date: Date of birth
            current_year: Year for personal year calculation (defaults to current year)
            
        Returns:
            Complete numerology profile
        """
        if current_year is None:
            current_year = date.today().year
        
        # Core numbers
        life_path = self.calculate_life_path(birth_date)
        expression = self.calculate_expression(full_name)
        soul_urge = self.calculate_soul_urge(full_name)
        personality = self.calculate_personality(full_name)
        
        # Additional numbers
        maturity = self.calculate_maturity(life_path, expression)
        personal_year = self.calculate_personal_year(birth_date, current_year)
        bridge_numbers = self.calculate_bridge_numbers(life_path, expression, soul_urge, personality)
        
        # Special numbers
        core_numbers = {
            "life_path": life_path,
            "expression": expression,
            "soul_urge": soul_urge,
            "personality": personality
        }
        
        master_numbers = self.identify_master_numbers(core_numbers)
        karmic_debt = self.identify_karmic_debt(full_name, birth_date)
        
        return {
            "system": self.system,
            "core_numbers": core_numbers,
            "maturity": maturity,
            "personal_year": personal_year,
            "bridge_numbers": bridge_numbers,
            "master_numbers": master_numbers,
            "karmic_debt": karmic_debt,
            "name_analysis": {
                "full_name": full_name,
                "letters_only": extract_letters_only(full_name),
                "vowels": extract_vowels(full_name),
                "consonants": extract_consonants(full_name),
                "total_letters": len(extract_letters_only(full_name))
            },
            "birth_date": birth_date.isoformat(),
            "calculation_year": current_year
        }


# Convenience functions for quick calculations

def quick_life_path(birth_date: date) -> int:
    """Quick Life Path calculation using Pythagorean system."""
    calc = NumerologyCalculator("pythagorean")
    return calc.calculate_life_path(birth_date)


def quick_expression(full_name: str, system: str = "pythagorean") -> int:
    """Quick Expression number calculation."""
    calc = NumerologyCalculator(system)
    return calc.calculate_expression(full_name)


def quick_profile(full_name: str, birth_date: date, system: str = "pythagorean") -> Dict[str, any]:
    """Quick complete profile calculation."""
    calc = NumerologyCalculator(system)
    return calc.calculate_complete_profile(full_name, birth_date)


# Export main classes and functions
__all__ = [
    "NumerologyCalculator",
    "PYTHAGOREAN_SYSTEM",
    "CHALDEAN_SYSTEM", 
    "MASTER_NUMBERS",
    "KARMIC_DEBT_NUMBERS",
    "quick_life_path",
    "quick_expression", 
    "quick_profile"
]
