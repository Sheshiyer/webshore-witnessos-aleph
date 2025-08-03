#!/usr/bin/env python3
"""
Demo script for WitnessOS Divination Engines Foundation

Shows that the base architecture is working correctly and ready for
engine implementations.
"""

from datetime import date, time
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ENGINES import list_engines, get_engine, AVAILABLE_ENGINES
from ENGINES.base import (
    BaseEngine,
    BaseEngineInput,
    BaseEngineOutput,
    BirthDataInput,
    PersonalDataInput,
    QuestionInput,
    parse_date_flexible,
    reduce_to_single_digit,
    extract_vowels,
    SeededRandom
)
from typing import Dict, Any


class DemoEngine(BaseEngine):
    """Demo engine to show the foundation working."""

    @property
    def engine_name(self) -> str:
        return "demo_engine"

    @property
    def description(self) -> str:
        return "A demonstration engine showing the WitnessOS foundation architecture"

    @property
    def input_model(self):
        return PersonalDataInput

    @property
    def output_model(self):
        return BaseEngineOutput

    def _calculate(self, validated_input: PersonalDataInput) -> Dict[str, Any]:
        """Demo calculation using numerology-style name analysis."""
        name = validated_input.full_name

        # Simple numerology-style calculation
        letters_only = ''.join(c for c in name if c.isalpha())
        vowels = extract_vowels(name)
        consonants = ''.join(c for c in name.upper() if c.isalpha() and c not in 'AEIOU')

        # Calculate simple values
        name_length = len(letters_only)
        vowel_count = len(vowels)
        consonant_count = len(consonants)

        # Reduce to single digit
        life_number = reduce_to_single_digit(name_length)

        return {
            "name": name,
            "letters_only": letters_only,
            "vowels": vowels,
            "consonants": consonants,
            "name_length": name_length,
            "vowel_count": vowel_count,
            "consonant_count": consonant_count,
            "life_number": life_number,
            "analysis_complete": True
        }

    def _interpret(self, calculation_results: Dict[str, Any], input_data: PersonalDataInput) -> str:
        """Generate mystical interpretation."""
        name = calculation_results["name"]
        life_number = calculation_results["life_number"]
        vowel_count = calculation_results["vowel_count"]

        interpretation = f"""
🌟 WITNESSΟΣ FIELD ANALYSIS FOR {name.upper()} 🌟

Your name carries the vibrational signature of {life_number}, indicating a soul-path
aligned with the archetypal frequency of this sacred number.

With {vowel_count} vowel resonances in your name, your inner voice speaks through
the {self._get_vowel_meaning(vowel_count)} pathway of expression.

The field signature suggests a consciousness pattern optimized for
{self._get_life_number_meaning(life_number)} experiences.

This is not prediction—this is pattern recognition for conscious navigation.
        """.strip()

        return interpretation

    def _get_vowel_meaning(self, count: int) -> str:
        """Get meaning for vowel count."""
        meanings = {
            1: "singular focus",
            2: "balanced duality",
            3: "creative trinity",
            4: "stable foundation",
            5: "dynamic change",
            6: "harmonious service",
            7: "mystical seeking",
            8: "material mastery",
            9: "universal compassion"
        }
        return meanings.get(count, "unique vibrational")

    def _get_life_number_meaning(self, number: int) -> str:
        """Get meaning for life number."""
        meanings = {
            1: "pioneering leadership",
            2: "cooperative partnership",
            3: "creative expression",
            4: "practical building",
            5: "adventurous freedom",
            6: "nurturing responsibility",
            7: "spiritual investigation",
            8: "ambitious achievement",
            9: "humanitarian service"
        }
        return meanings.get(number, "transcendent")

    def _generate_recommendations(self, calculation_results: Dict[str, Any], input_data: PersonalDataInput) -> list[str]:
        """Generate WitnessOS-style recommendations."""
        life_number = calculation_results["life_number"]

        recommendations = [
            f"Meditate on the number {life_number} during morning breathwork",
            "Practice conscious name-speaking as a reality anchor",
            "Notice how others respond to your vibrational signature",
            "Experiment with different name variations in different contexts"
        ]

        return recommendations

    def _generate_reality_patches(self, calculation_results: Dict[str, Any], input_data: PersonalDataInput) -> list[str]:
        """Generate reality patches."""
        return [
            "Install: Name-field coherence protocol",
            "Patch: Vibrational signature optimization",
            "Upgrade: Conscious identity expression module"
        ]

    def _identify_archetypal_themes(self, calculation_results: Dict[str, Any], input_data: PersonalDataInput) -> list[str]:
        """Identify archetypal themes."""
        life_number = calculation_results["life_number"]

        themes = {
            1: ["Pioneer", "Leader", "Initiator"],
            2: ["Diplomat", "Peacemaker", "Collaborator"],
            3: ["Artist", "Communicator", "Entertainer"],
            4: ["Builder", "Organizer", "Stabilizer"],
            5: ["Explorer", "Freedom-seeker", "Catalyst"],
            6: ["Nurturer", "Healer", "Caretaker"],
            7: ["Seeker", "Mystic", "Analyst"],
            8: ["Achiever", "Executive", "Manifestor"],
            9: ["Humanitarian", "Teacher", "Sage"]
        }

        return themes.get(life_number, ["Transcendent", "Unique", "Undefined"])


def main():
    """Demo the foundation architecture."""
    print("🌟 WitnessOS Divination Engines Foundation Demo 🌟\n")

    # Show current engine registry
    print(f"Available engines: {AVAILABLE_ENGINES}")
    print(f"Total registered engines: {len(AVAILABLE_ENGINES)}\n")

    # Create and test demo engine
    print("Creating demo engine...")
    demo_engine = DemoEngine()
    print(f"Engine: {demo_engine}")
    print(f"Description: {demo_engine.description}\n")

    # Test with sample data
    print("Testing with sample personal data...")

    # Test data models - Using real data for validation
    personal_data = PersonalDataInput(
        full_name="Cumbipuram Nateshan Sheshnarayan",  # Real test data for validation
        preferred_name="Sheshnarayan"
    )

    birth_data = BirthDataInput(
        birth_date=date(1991, 8, 13),
        birth_time=time(13, 31),
        birth_location=(12.9716, 77.5946),  # Bengaluru, Karnataka, India
        timezone="Asia/Kolkata"
    )

    question = QuestionInput(
        question="What is my life purpose?",
        intention="Understanding my path",
        urgency="normal"
    )

    print(f"Personal Data: {personal_data.full_name}")
    print(f"Birth Data: {birth_data.birth_date} at {birth_data.birth_time}")
    print(f"Question: {question.question}\n")

    # Run calculation
    print("Running demo calculation...")
    result = demo_engine.calculate(personal_data)

    print(f"Calculation completed in {result.calculation_time:.4f} seconds")
    print(f"Confidence score: {result.confidence_score}")
    print(f"Field signature: {result.field_signature}\n")

    print("=== INTERPRETATION ===")
    print(result.formatted_output)

    print("\n=== RECOMMENDATIONS ===")
    for i, rec in enumerate(result.recommendations, 1):
        print(f"{i}. {rec}")

    print("\n=== REALITY PATCHES ===")
    for patch in result.reality_patches:
        print(f"• {patch}")

    print("\n=== ARCHETYPAL THEMES ===")
    for theme in result.archetypal_themes:
        print(f"• {theme}")

    print("\n=== RAW DATA ===")
    for key, value in result.raw_data.items():
        print(f"{key}: {value}")

    # Test utilities
    print("\n=== UTILITY FUNCTIONS DEMO ===")

    # Date parsing - Using real birth date for validation
    test_dates = ["1991-08-13", "08/13/1991", "August 13, 1991"]
    print("Date parsing:")
    for date_str in test_dates:
        parsed = parse_date_flexible(date_str)
        print(f"  '{date_str}' -> {parsed}")

    # Numerology reduction
    print("\nNumerology reduction:")
    test_numbers = [123, 456, 11, 22, 33]
    for num in test_numbers:
        reduced = reduce_to_single_digit(num, keep_master=True)
        print(f"  {num} -> {reduced}")

    # Seeded random
    print("\nSeeded random (reproducible):")
    rng = SeededRandom(seed=42)
    choices = ["Option A", "Option B", "Option C", "Option D"]
    for i in range(3):
        choice = rng.choice(choices)
        print(f"  Random choice {i+1}: {choice}")

    print("\n🎯 Foundation architecture is working perfectly!")
    print("Ready to implement individual engines in Phase 2.")


if __name__ == "__main__":
    main()
