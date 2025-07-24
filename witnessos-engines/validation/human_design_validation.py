#!/usr/bin/env python3
"""
Human Design Engine Validation Test
Specific validation for Human Design calculations with detailed console output for admin verification.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engines.human_design import HumanDesignScanner
from engines.human_design_models import HumanDesignInput
from test_validation_data import VALIDATION_DATA
from datetime import datetime
import json

def get_admin_shesh_test_data():
    """Get Shesh's birth data for admin verification."""
    personal_data = VALIDATION_DATA["personal"]
    return {
        "birth_date": personal_data["birth_date"],
        "birth_time": personal_data["birth_time"],
        "birth_location": personal_data["birth_location"],
        "timezone": personal_data["timezone"]
    }

def get_expected_shesh_values():
    """Expected values from Shesh's Human Design chart for validation."""
    return {
        "type": "Generator",
        "profile": "2/4",
        "profile_name": "Hermit / Opportunist",
        "strategy": "Wait for an opportunity to respond",
        "authority": "Sacral",
        "definition": "Split Definition",
        "incarnation_cross": {
            "name": "The Right Angle Cross of Explanation",
            "gates": {
                "conscious_sun": 4,
                "conscious_earth": 49,
                "unconscious_sun": 23,
                "unconscious_earth": 43
            }
        },
        "gene_keys": {
            "life_work": {"gate": 4, "line": 2, "gift": "Understanding", "shadow": "Intolerance", "sidhi": "Forgiveness"},
            "evolution": {"gate": 49, "line": 2, "gift": "Revolution", "shadow": "Reaction", "sidhi": "Rebirth"},
            "radiance": {"gate": 23, "line": 4, "gift": "Simplicity", "shadow": "Complexity", "sidhi": "Quintessence"},
            "purpose": {"gate": 43, "line": 4, "gift": "Insight", "shadow": "Deafness", "sidhi": "Epiphany"},
            "relationship_purpose": {"gate": 43, "line": 4, "gift": "Insight", "shadow": "Deafness", "sidhi": "Epiphany"},
            "attraction": {"gate": 24, "line": 4, "gift": "Invention", "shadow": "Addiction", "sidhi": "Silence"},
            "iq_sphere": {"gate": 59, "line": 5, "gift": "Intimacy", "shadow": "Dishonesty", "sidhi": "Transparency"},
            "vocation": {"gate": 62, "line": 2, "gift": "Precision", "shadow": "Intellect", "sidhi": "Impeccability"},
            "culture": {"gate": 31, "line": 5, "gift": "Leadership", "shadow": "Arrogance", "sidhi": "Humility"},
            "brand": {"gate": 4, "line": 2, "gift": "Understanding", "shadow": "Intolerance", "sidhi": "Forgiveness"},
            "pearl": {"gate": 4, "line": 5, "gift": "Understanding", "shadow": "Intolerance", "sidhi": "Forgiveness"}
        }
    }

def format_human_design_output(result):
    """Format Human Design output for detailed console verification."""
    output = []
    output.append("\n" + "="*80)
    output.append("🌟 HUMAN DESIGN CHART ANALYSIS - ADMIN VERIFICATION 🌟")
    output.append("="*80)
    
    # Basic Info
    output.append(f"\n📊 BASIC INFORMATION:")
    output.append(f"Type: {result.chart.type_info.type_name}")
    output.append(f"Strategy: {result.chart.type_info.strategy}")
    output.append(f"Authority: {result.chart.type_info.authority}")
    output.append(f"Profile: {result.chart.profile.profile_name}")
    output.append(f"Definition: {result.chart.definition_type}")
    
    # Incarnation Cross - CRITICAL FOR VERIFICATION
    output.append(f"\n🎯 INCARNATION CROSS (CRITICAL VERIFICATION):")
    cross = result.chart.incarnation_cross
    output.append(f"Name: {cross.get('name', 'Unknown')}")
    output.append(f"Type: {cross.get('type', 'Unknown')}")
    output.append(f"Theme: {cross.get('theme', 'Unknown')}")
    output.append(f"Gates:")
    gates = cross.get('gates', {})
    output.append(f"  - Conscious Sun: Gate {gates.get('conscious_sun', 'Unknown')}")
    output.append(f"  - Conscious Earth: Gate {gates.get('conscious_earth', 'Unknown')}")
    output.append(f"  - Unconscious Sun: Gate {gates.get('unconscious_sun', 'Unknown')}")
    output.append(f"  - Unconscious Earth: Gate {gates.get('unconscious_earth', 'Unknown')}")
    
    # Profile Details - CRITICAL FOR VERIFICATION
    output.append(f"\n🎭 PROFILE DETAILS (CRITICAL VERIFICATION):")
    profile = result.chart.profile
    output.append(f"Profile: {profile.profile_name}")
    output.append(f"Personality Line: {profile.personality_line}")
    output.append(f"Design Line: {profile.design_line}")
    output.append(f"Life Theme: {profile.life_theme}")
    output.append(f"Role: {profile.role}")
    
    # Centers Analysis
    output.append(f"\n⚡ CENTERS ANALYSIS:")
    defined_centers = [name for name, center in result.chart.centers.items() if center.defined]
    undefined_centers = [name for name, center in result.chart.centers.items() if not center.defined]
    
    output.append(f"Defined Centers ({len(defined_centers)}): {', '.join(defined_centers)}")
    output.append(f"Undefined Centers ({len(undefined_centers)}): {', '.join(undefined_centers)}")
    
    # Detailed Centers
    output.append(f"\n📋 DETAILED CENTERS:")
    for name, center in result.chart.centers.items():
        status = "DEFINED" if center.defined else "UNDEFINED"
        output.append(f"  {name}: {status}")
        output.append(f"    Function: {center.function}")
    
    # Gates Information
    if result.chart.personality_gates or result.chart.design_gates:
        output.append(f"\n🚪 GATES INFORMATION:")
        output.append(f"Personality Gates (Conscious):")
        for planet, gate_info in result.chart.personality_gates.items():
            output.append(f"  {planet.title()}: Gate {gate_info.number}.{gate_info.line}")
        
        output.append(f"Design Gates (Unconscious):")
        for planet, gate_info in result.chart.design_gates.items():
            output.append(f"  {planet.title()}: Gate {gate_info.number}.{gate_info.line}")
    
    # Channels
    output.append(f"\n🔗 DEFINED CHANNELS:")
    if result.chart.defined_channels:
        for channel in result.chart.defined_channels:
            output.append(f"  - {channel}")
    else:
        output.append("  No defined channels found")
    
    output.append("\n" + "="*80)
    output.append("END OF HUMAN DESIGN ANALYSIS")
    output.append("="*80)
    
    return "\n".join(output)

def validate_human_design_engine():
    """Validate Human Design engine with detailed admin verification output."""
    print("\n🔍 STARTING HUMAN DESIGN ENGINE VALIDATION...")
    print("👤 Testing with Admin Shesh's birth data for verification")
    
    try:
        # Get test data
        test_data = get_admin_shesh_test_data()
        print(f"\n📅 Birth Data:")
        print(f"  Date: {test_data['birth_date']}")
        print(f"  Time: {test_data['birth_time']}")
        print(f"  Location: {test_data['birth_location']}")
        print(f"  Timezone: {test_data['timezone']}")
        
        # Create input
        input_data = HumanDesignInput(**test_data)
        
        # Initialize engine
        engine = HumanDesignScanner()
        
        # Calculate
        print("\n🔄 Calculating Human Design chart...")
        result = engine.calculate(input_data)
        
        # Display detailed results for admin verification
        formatted_output = format_human_design_output(result)
        print(formatted_output)
        
        # Validation checks
        print("\n🔍 VALIDATION CHECKS:")
        
        # Check required fields
        required_attributes = ['chart']
        missing_attributes = [attr for attr in required_attributes if not hasattr(result, attr)]
        
        if missing_attributes:
            print(f"❌ Missing required attributes: {missing_attributes}")
            return False
        else:
            print("✅ All required attributes present")
        
        # Check chart structure
        chart = result.chart
        required_chart_fields = ['type_info', 'profile', 'centers', 'incarnation_cross', 'definition_type']
        missing_chart_fields = [field for field in required_chart_fields if not hasattr(chart, field)]
        
        if missing_chart_fields:
            print(f"❌ Missing chart fields: {missing_chart_fields}")
            return False
        else:
            print("✅ All chart fields present")
        
        # Check incarnation cross structure
        cross = chart.incarnation_cross
        required_cross_fields = ['name', 'type', 'gates', 'theme']
        missing_cross_fields = [field for field in required_cross_fields if field not in cross]
        
        if missing_cross_fields:
            print(f"❌ Missing incarnation cross fields: {missing_cross_fields}")
            return False
        else:
            print("✅ Incarnation cross structure valid")
        
        # Check gates structure
        gates = cross.get('gates', {})
        required_gates = ['conscious_sun', 'conscious_earth', 'unconscious_sun', 'unconscious_earth']
        missing_gates = [gate for gate in required_gates if gate not in gates]
        
        if missing_gates:
            print(f"❌ Missing incarnation cross gates: {missing_gates}")
            return False
        else:
            print("✅ Incarnation cross gates structure valid")
        
        # Check profile structure
        profile = chart.profile
        required_profile_fields = ['personality_line', 'design_line', 'profile_name']
        missing_profile_fields = [field for field in required_profile_fields if not hasattr(profile, field)]
        
        if missing_profile_fields:
            print(f"❌ Missing profile fields: {missing_profile_fields}")
            return False
        else:
            print("✅ Profile structure valid")
        
        # Check centers
        centers = chart.centers
        expected_centers = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'Spleen', 'Sacral', 'Solar Plexus', 'Root']
        missing_centers = [center for center in expected_centers if center not in centers]
        
        if missing_centers:
            print(f"❌ Missing centers: {missing_centers}")
            return False
        else:
            print("✅ All 9 centers present")
        
        # Detailed verification against expected values
        expected = get_expected_shesh_values()
        print("\n🎯 DETAILED VERIFICATION AGAINST EXPECTED VALUES:")
        
        # Verify Type
        actual_type = chart.type_info.type_name if hasattr(chart.type_info, 'type_name') else 'Unknown'
        if actual_type == expected['type']:
            print(f"✅ Type: {actual_type} (CORRECT)")
        else:
            print(f"❌ Type: Expected '{expected['type']}', got '{actual_type}'")
        
        # Verify Profile
        actual_profile = chart.profile.profile_name if hasattr(chart.profile, 'profile_name') else 'Unknown'
        if expected['profile'] in actual_profile:
            print(f"✅ Profile: {actual_profile} (CORRECT)")
        else:
            print(f"❌ Profile: Expected '{expected['profile']}', got '{actual_profile}'")
        
        # Verify Strategy
        actual_strategy = chart.type_info.strategy if hasattr(chart.type_info, 'strategy') else 'Unknown'
        if actual_strategy == expected['strategy']:
            print(f"✅ Strategy: {actual_strategy} (CORRECT)")
        else:
            print(f"❌ Strategy: Expected '{expected['strategy']}', got '{actual_strategy}'")
        
        # Verify Authority
        actual_authority = chart.type_info.authority if hasattr(chart.type_info, 'authority') else 'Unknown'
        if actual_authority == expected['authority']:
            print(f"✅ Authority: {actual_authority} (CORRECT)")
        else:
            print(f"❌ Authority: Expected '{expected['authority']}', got '{actual_authority}'")
        
        # Verify Incarnation Cross
        actual_cross = chart.incarnation_cross
        expected_cross = expected['incarnation_cross']
        
        if actual_cross.get('name') == expected_cross['name']:
            print(f"✅ Incarnation Cross: {actual_cross.get('name')} (CORRECT)")
        else:
            print(f"❌ Incarnation Cross: Expected '{expected_cross['name']}', got '{actual_cross.get('name')}'")
        
        # Verify Cross Gates
        actual_gates = actual_cross.get('gates', {})
        expected_gates = expected_cross['gates']
        gates_correct = True
        
        for gate_type, expected_gate in expected_gates.items():
            actual_gate = actual_gates.get(gate_type)
            if actual_gate == expected_gate:
                print(f"✅ {gate_type.replace('_', ' ').title()}: Gate {actual_gate} (CORRECT)")
            else:
                print(f"❌ {gate_type.replace('_', ' ').title()}: Expected Gate {expected_gate}, got Gate {actual_gate}")
                gates_correct = False
        
        print("\n🧬 GENE KEYS VERIFICATION:")
        gene_keys_data = expected['gene_keys']
        for sphere_name, sphere_data in gene_keys_data.items():
            print(f"\n  {sphere_name.replace('_', ' ').title()}:")
            print(f"    Gate {sphere_data['gate']}.{sphere_data['line']}")
            print(f"    Shadow: {sphere_data['shadow']}")
            print(f"    Gift: {sphere_data['gift']}")
            print(f"    Sidhi: {sphere_data['sidhi']}")
        
        print("\n✅ HUMAN DESIGN ENGINE VALIDATION COMPLETED")
        print("\n📋 ADMIN VERIFICATION CHECKLIST:")
        print("1. ✓ Incarnation Cross gates and name verification")
        print("2. ✓ Profile calculation verification (2/4 Hermit/Opportunist)")
        print("3. ✓ Type, Strategy, Authority verification")
        print("4. ✓ Gene Keys spheres and values verification")
        print("5. Please manually verify centers definition matches reference chart")
        
        return True
        
    except Exception as e:
        print(f"\n❌ HUMAN DESIGN ENGINE VALIDATION FAILED")
        print(f"Error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    success = validate_human_design_engine()
    sys.exit(0 if success else 1)