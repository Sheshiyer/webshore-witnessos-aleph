"""
WitnessOS Engines - Validation Test Data

This file contains the real Human Design data for Cumbipuram Nateshan Sheshnarayan
to be used as default test data for validating all engine calculations.

Since this is real data, the user can verify the accuracy of calculations
against their known chart information.
"""

from datetime import date, time
from typing import Dict, Any

# Real Human Design Data for Validation
VALIDATION_DATA = {
    "personal": {
        "full_name": "Cumbipuram Nateshan Sheshnarayan",
        "preferred_name": "Sheshnarayan",
        "birth_date": date(1991, 8, 13),
        "birth_time": time(13, 31, 0),  # 13:31 local time
        "birth_location": (12.9716, 77.5946),  # Bengaluru, Karnataka, India
        "timezone": "Asia/Kolkata"
    },
    
    "known_human_design": {
        "type": "Generator",
        "profile": "2/4 Hermit/Opportunist", 
        "strategy": "Wait for an opportunity to respond",
        "authority": "Sacral",
        "definition": "Split Definition",
        "not_self": "Frustration",
        "incarnation_cross": "The Right Angle Cross of Explanation (4/49 | 23/43)",
        "variables": "PRL DRL",
        "design_date": "13.05.1991 08:28",  # 88 days before birth
        "utc_birth": "13.08.1991 08:01",
        "utc_design": "13.05.1991 08:28"
    },
    
    "test_questions": [
        "What is my path to authentic self-expression?",
        "How can I align with my true nature?",
        "What are my gifts and challenges?",
        "How do I make decisions in alignment?",
        "What is my life purpose and direction?"
    ]
}


def get_validation_personal_data():
    """Get personal data for validation testing."""
    return VALIDATION_DATA["personal"]


def get_validation_birth_data():
    """Get birth data for validation testing."""
    personal = VALIDATION_DATA["personal"]
    return {
        "birth_date": personal["birth_date"],
        "birth_time": personal["birth_time"],
        "birth_location": personal["birth_location"],
        "timezone": personal["timezone"]
    }


def get_validation_human_design_data():
    """Get known Human Design data for validation."""
    return VALIDATION_DATA["known_human_design"]


def get_validation_questions():
    """Get test questions for divination engines."""
    return VALIDATION_DATA["test_questions"]


def get_numerology_test_data():
    """Get data specifically for numerology testing."""
    personal = VALIDATION_DATA["personal"]
    return {
        "full_name": personal["full_name"],
        "birth_date": personal["birth_date"],
        "system": "pythagorean",
        "current_year": 2025
    }


def get_biorhythm_test_data():
    """Get data specifically for biorhythm testing."""
    personal = VALIDATION_DATA["personal"]
    return {
        "birth_date": personal["birth_date"],
        "target_date": date.today(),
        "include_extended_cycles": True,
        "forecast_days": 7
    }


def get_human_design_test_data():
    """Get data specifically for Human Design testing."""
    personal = VALIDATION_DATA["personal"]
    return {
        "birth_date": personal["birth_date"],
        "birth_time": personal["birth_time"],
        "birth_location": personal["birth_location"],
        "timezone": personal["timezone"],
        "include_design_calculation": True,
        "detailed_gates": True
    }


def get_vimshottari_test_data():
    """Get data specifically for Vimshottari Dasha testing."""
    personal = VALIDATION_DATA["personal"]
    return {
        "birth_date": personal["birth_date"],
        "birth_time": personal["birth_time"],
        "birth_location": personal["birth_location"],
        "timezone": personal["timezone"],
        "current_date": date.today(),
        "years_forecast": 10
    }


def get_gene_keys_test_data():
    """Get data specifically for Gene Keys testing."""
    personal = VALIDATION_DATA["personal"]
    return {
        "birth_date": personal["birth_date"],
        "focus_sequence": "activation",
        "include_programming_partner": True
    }


def get_tarot_test_data():
    """Get data for Tarot testing."""
    return {
        "question": VALIDATION_DATA["test_questions"][0],
        "spread_type": "three_card",
        "include_reversed": True
    }


def get_iching_test_data():
    """Get data for I-Ching testing."""
    return {
        "question": VALIDATION_DATA["test_questions"][1],
        "method": "coins",
        "include_changing_lines": True
    }


def get_enneagram_test_data():
    """Get data for Enneagram testing."""
    return {
        "identification_method": "self_select",
        "selected_type": 4,  # Can be adjusted based on actual type
        "include_wings": True,
        "include_instincts": True,
        "include_arrows": True,
        "focus_area": "growth"
    }


def validate_human_design_results(result):
    """
    Validate Human Design calculation results against known data.
    
    Args:
        result: The Human Design calculation result
        
    Returns:
        Dict with validation status and details
    """
    known = VALIDATION_DATA["known_human_design"]
    validation = {
        "passed": [],
        "failed": [],
        "warnings": []
    }
    
    # Check type
    if hasattr(result, 'chart') and hasattr(result.chart, 'type_info'):
        if result.chart.type_info.type_name == known["type"]:
            validation["passed"].append(f"Type: {known['type']} ✓")
        else:
            validation["failed"].append(f"Type mismatch: got {result.chart.type_info.type_name}, expected {known['type']}")
    
    # Check profile
    if hasattr(result, 'chart') and hasattr(result.chart, 'profile'):
        profile_name = f"{result.chart.profile.personality_line}/{result.chart.profile.design_line}"
        if profile_name in known["profile"]:
            validation["passed"].append(f"Profile: {known['profile']} ✓")
        else:
            validation["failed"].append(f"Profile mismatch: got {profile_name}, expected {known['profile']}")
    
    # Check authority
    if hasattr(result, 'chart') and hasattr(result.chart, 'type_info'):
        if result.chart.type_info.authority == known["authority"]:
            validation["passed"].append(f"Authority: {known['authority']} ✓")
        else:
            validation["failed"].append(f"Authority mismatch: got {result.chart.type_info.authority}, expected {known['authority']}")
    
    return validation


def print_validation_summary(validation_results):
    """Print a summary of validation results."""
    print("\n🔍 VALIDATION SUMMARY")
    print("=" * 40)
    
    if validation_results["passed"]:
        print("✅ PASSED:")
        for item in validation_results["passed"]:
            print(f"   {item}")
    
    if validation_results["failed"]:
        print("\n❌ FAILED:")
        for item in validation_results["failed"]:
            print(f"   {item}")
    
    if validation_results["warnings"]:
        print("\n⚠️ WARNINGS:")
        for item in validation_results["warnings"]:
            print(f"   {item}")
    
    total_tests = len(validation_results["passed"]) + len(validation_results["failed"])
    passed_tests = len(validation_results["passed"])
    
    if total_tests > 0:
        success_rate = (passed_tests / total_tests) * 100
        print(f"\n📊 Success Rate: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
    
    return len(validation_results["failed"]) == 0


if __name__ == "__main__":
    print("🌟 WitnessOS Engines - Validation Test Data")
    print("=" * 50)
    print("Real Human Design data for calculation validation")
    print("=" * 50)
    
    personal = get_validation_personal_data()
    print(f"\n👤 Name: {personal['full_name']}")
    print(f"📅 Birth: {personal['birth_date']} at {personal['birth_time']}")
    print(f"📍 Location: {personal['birth_location']} ({personal['timezone']})")
    
    known_hd = get_validation_human_design_data()
    print(f"\n🎯 Known Human Design:")
    print(f"   Type: {known_hd['type']}")
    print(f"   Profile: {known_hd['profile']}")
    print(f"   Authority: {known_hd['authority']}")
    print(f"   Strategy: {known_hd['strategy']}")
    
    print(f"\n🔮 Test Questions:")
    for i, question in enumerate(get_validation_questions(), 1):
        print(f"   {i}. {question}")
    
    print(f"\n✅ Validation data ready for engine testing!")
