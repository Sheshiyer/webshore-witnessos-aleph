"""
WitnessOS Human Design Integration Examples
Demonstrates how to use all Human Design data structures together
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional

class HumanDesignIntegrator:
    """
    Integrates all Human Design data structures for comprehensive readings
    """
    
    def __init__(self, data_path: str = "ENGINES/data/human_design"):
        self.data_path = data_path
        self.data = {}
        self.load_all_data()
    
    def load_all_data(self):
        """Load all Human Design JSON data files"""
        data_files = [
            'incarnation_crosses.json',
            'types.json', 
            'authorities.json',
            'profiles.json',
            'definitions.json',
            'planetary_activations.json',
            'channels.json',
            'gates.json',
            'variables.json',
            'circuitry.json',
            'lines.json'
        ]
        
        for file in data_files:
            file_path = os.path.join(self.data_path, file)
            try:
                with open(file_path, 'r') as f:
                    key = file.replace('.json', '')
                    self.data[key] = json.load(f)
                print(f"✅ Loaded {file}")
            except FileNotFoundError:
                print(f"❌ Could not find {file}")
            except json.JSONDecodeError:
                print(f"❌ Invalid JSON in {file}")
    
    def generate_complete_reading(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a complete Human Design reading from birth data
        
        Args:
            birth_data: Dictionary containing birth information
            
        Returns:
            Complete Human Design reading
        """
        
        # In a real implementation, this would calculate from birth data
        # For now, we'll use the example data structure
        
        reading = {
            "reading_info": {
                "name": f"Human Design Reading - {birth_data.get('name', 'Unknown')}",
                "birth_data": birth_data,
                "reading_type": "Complete Human Design Analysis",
                "generated_date": datetime.now().isoformat(),
                "data_sources": "WitnessOS Human Design Engine"
            }
        }
        
        # Add core design elements
        reading["core_design"] = self._get_core_design(birth_data)
        
        # Add incarnation cross
        reading["incarnation_cross"] = self._get_incarnation_cross(birth_data)
        
        # Add centers analysis
        reading["centers_analysis"] = self._get_centers_analysis(birth_data)
        
        # Add variables (advanced)
        reading["variables_analysis"] = self._get_variables_analysis(birth_data)
        
        # Add life guidance
        reading["life_guidance"] = self._get_life_guidance(birth_data)
        
        # Add relationship insights
        reading["relationship_insights"] = self._get_relationship_insights(birth_data)
        
        # Add career guidance
        reading["career_guidance"] = self._get_career_guidance(birth_data)
        
        return reading
    
    def _get_core_design(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract core design elements"""
        
        # In real implementation, calculate from birth data
        # For example, using Mage's data:
        type_key = birth_data.get('type', 'Generator')
        authority_key = birth_data.get('authority', 'Sacral_Authority')
        profile_key = birth_data.get('profile', '2_4')
        definition_key = birth_data.get('definition', 'Split_Definition')
        
        return {
            "type": self.data['types']['types'].get(type_key, {}),
            "authority": self.data['authorities']['authorities'].get(authority_key, {}),
            "profile": self.data['profiles']['profiles'].get(profile_key, {}),
            "definition": self.data['definitions']['definition_types'].get(definition_key, {})
        }
    
    def _get_incarnation_cross(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get incarnation cross information"""
        
        # In real implementation, calculate from planetary positions
        cross_key = birth_data.get('incarnation_cross', 'right_angle_cross_four_ways_2_1_23_43')
        
        cross_data = self.data['incarnation_crosses']['crosses'].get(cross_key, {})
        
        return cross_data
    
    def _get_centers_analysis(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze defined and undefined centers"""
        
        # In real implementation, calculate from channels and gates
        defined_centers = birth_data.get('defined_centers', ['Sacral', 'G'])
        undefined_centers = birth_data.get('undefined_centers', ['Solar Plexus', 'Throat', 'Ajna', 'Heart', 'Root', 'Spleen', 'Head'])
        
        return {
            "defined_centers": [
                {
                    "name": center,
                    "function": f"{center} function",
                    "description": f"Consistent {center.lower()} energy"
                } for center in defined_centers
            ],
            "undefined_centers": [
                {
                    "name": center,
                    "function": f"{center} function", 
                    "description": f"Samples {center.lower()} energy from others"
                } for center in undefined_centers
            ]
        }
    
    def _get_variables_analysis(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get variables analysis (advanced)"""
        
        # Variables require precise calculation
        return {
            "note": "Variables require precise birth time calculation",
            "digestion": {
                "type": "Example - Appetite",
                "description": "Eat only when you have clear appetite"
            },
            "environment": {
                "type": "Example - Market", 
                "description": "Thrive in busy, active environments"
            },
            "motivation": {
                "type": "Example - Hope",
                "description": "Motivated by positive possibilities"
            }
        }
    
    def _get_life_guidance(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized life guidance"""
        
        type_key = birth_data.get('type', 'Generator')
        authority_key = birth_data.get('authority', 'Sacral_Authority')
        profile_key = birth_data.get('profile', '2_4')
        
        type_data = self.data['types']['types'].get(type_key, {})
        authority_data = self.data['authorities']['authorities'].get(authority_key, {})
        profile_data = self.data['profiles']['profiles'].get(profile_key, {})
        
        return {
            "strategy_in_action": {
                "title": f"Living Your {type_data.get('name', '')} Strategy",
                "guidance": type_data.get('strategy_details', {})
            },
            "authority_practice": {
                "title": f"Developing {authority_data.get('name', '')}",
                "guidance": authority_data.get('decision_process', [])
            },
            "profile_guidance": {
                "title": f"Living Your {profile_data.get('name', '')} Profile",
                "guidance": profile_data.get('characteristics', [])
            }
        }
    
    def _get_relationship_insights(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate relationship insights"""
        
        definition_key = birth_data.get('definition', 'Split_Definition')
        definition_data = self.data['definitions']['definition_types'].get(definition_key, {})
        
        return {
            "electromagnetic_connections": {
                "description": definition_data.get('description', ''),
                "relationship_style": definition_data.get('relationships', {})
            }
        }
    
    def _get_career_guidance(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate career guidance"""
        
        type_key = birth_data.get('type', 'Generator')
        profile_key = birth_data.get('profile', '2_4')
        
        type_data = self.data['types']['types'].get(type_key, {})
        profile_data = self.data['profiles']['profiles'].get(profile_key, {})
        
        return {
            "optimal_work_environment": type_data.get('gifts', []),
            "work_approach": profile_data.get('characteristics', []),
            "leadership_style": type_data.get('strategy_details', {})
        }
    
    def get_compatibility_analysis(self, person1_data: Dict, person2_data: Dict) -> Dict[str, Any]:
        """
        Analyze compatibility between two Human Design charts
        """
        
        compatibility = {
            "analysis_info": {
                "person1": person1_data.get('name', 'Person 1'),
                "person2": person2_data.get('name', 'Person 2'),
                "analysis_type": "Human Design Compatibility"
            }
        }
        
        # Type compatibility
        type1 = person1_data.get('type', 'Generator')
        type2 = person2_data.get('type', 'Generator')
        
        compatibility["type_dynamics"] = {
            "person1_type": type1,
            "person2_type": type2,
            "interaction": f"{type1} with {type2} dynamics"
        }
        
        # Definition compatibility (electromagnetic)
        def1 = person1_data.get('definition', 'Split_Definition')
        def2 = person2_data.get('definition', 'Split_Definition')
        
        compatibility["electromagnetic_attraction"] = {
            "person1_definition": def1,
            "person2_definition": def2,
            "bridging_potential": "Analysis of how definitions complement each other"
        }
        
        # Profile compatibility
        profile1 = person1_data.get('profile', '2_4')
        profile2 = person2_data.get('profile', '2_4')
        
        compatibility["profile_harmony"] = {
            "person1_profile": profile1,
            "person2_profile": profile2,
            "relationship_theme": "How profiles interact in relationship"
        }
        
        return compatibility
    
    def get_discovery_insights(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate insights for WitnessOS discovery game mechanics
        """
        
        insights = {
            "discovery_layers": {
                "surface": "What's immediately visible",
                "hidden": "What needs to be discovered",
                "deep": "Advanced insights for later discovery"
            }
        }
        
        # Surface layer - basic type and strategy
        type_key = birth_data.get('type', 'Generator')
        type_data = self.data['types']['types'].get(type_key, {})
        
        insights["surface_discovery"] = {
            "type": type_data.get('name', ''),
            "strategy": type_data.get('strategy', ''),
            "signature": type_data.get('signature', '')
        }
        
        # Hidden layer - authority and profile
        authority_key = birth_data.get('authority', 'Sacral_Authority')
        profile_key = birth_data.get('profile', '2_4')
        
        insights["hidden_discovery"] = {
            "authority": self.data['authorities']['authorities'].get(authority_key, {}).get('name', ''),
            "profile": self.data['profiles']['profiles'].get(profile_key, {}).get('name', ''),
            "incarnation_cross": "Life purpose theme"
        }
        
        # Deep layer - variables and advanced mechanics
        insights["deep_discovery"] = {
            "variables": "Advanced differentiation system",
            "circuitry": "Energy circuit themes",
            "lines": "Detailed expression patterns"
        }
        
        return insights


# Example usage functions
def example_complete_reading():
    """Example of generating a complete reading"""
    
    integrator = HumanDesignIntegrator()
    
    # Mage's birth data
    mage_data = {
        "name": "Mage Narayan",
        "date": "13.08.1991",
        "time": "13:31",
        "location": "Bengaluru, India",
        "type": "Generator",
        "authority": "Sacral_Authority", 
        "profile": "2_4",
        "definition": "Split_Definition",
        "incarnation_cross": "right_angle_cross_four_ways_2_1_23_43"
    }
    
    reading = integrator.generate_complete_reading(mage_data)
    
    print("🎯 Complete Human Design Reading Generated")
    print(f"📊 Reading contains {len(reading)} main sections")
    
    return reading

def example_compatibility_analysis():
    """Example of compatibility analysis"""
    
    integrator = HumanDesignIntegrator()
    
    person1 = {
        "name": "Mage",
        "type": "Generator",
        "authority": "Sacral_Authority",
        "profile": "2_4",
        "definition": "Split_Definition"
    }
    
    person2 = {
        "name": "Partner",
        "type": "Projector", 
        "authority": "Splenic_Authority",
        "profile": "1_3",
        "definition": "Single_Definition"
    }
    
    compatibility = integrator.get_compatibility_analysis(person1, person2)
    
    print("💕 Compatibility Analysis Generated")
    print(f"🔗 Analyzing {person1['name']} ({person1['type']}) with {person2['name']} ({person2['type']})")
    
    return compatibility

def example_discovery_mechanics():
    """Example of discovery game mechanics"""
    
    integrator = HumanDesignIntegrator()
    
    user_data = {
        "name": "Discovery User",
        "type": "Generator",
        "authority": "Sacral_Authority",
        "profile": "2_4"
    }
    
    discovery = integrator.get_discovery_insights(user_data)
    
    print("🎮 Discovery Game Mechanics Generated")
    print(f"🔍 {len(discovery['discovery_layers'])} layers of discovery available")
    
    return discovery

if __name__ == "__main__":
    print("🚀 WitnessOS Human Design Integration Examples")
    print("=" * 50)
    
    # Run examples
    reading = example_complete_reading()
    compatibility = example_compatibility_analysis() 
    discovery = example_discovery_mechanics()
    
    print("\n✅ All integration examples completed successfully!")
