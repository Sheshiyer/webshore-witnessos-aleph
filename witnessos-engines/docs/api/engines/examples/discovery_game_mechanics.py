"""
WitnessOS Discovery Game Mechanics
Creates a discovery-based experience where users feel they found the system themselves
"""

import json
import random
from typing import Dict, List, Any, Optional
from datetime import datetime

class WitnessOSDiscoveryEngine:
    """
    Discovery game mechanics for WitnessOS consciousness engines
    Implements progressive revelation and easter egg discovery
    """
    
    def __init__(self):
        self.discovery_layers = {
            "surface": 0,      # Immediately visible
            "shallow": 1,      # Easy to find with minimal exploration
            "hidden": 2,       # Requires intentional searching
            "deep": 3,         # Advanced users only
            "secret": 4        # Easter eggs and hidden features
        }
        
        self.user_progress = {}
        self.discovery_triggers = {}
        
    def initialize_user_journey(self, user_id: str, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Initialize a user's discovery journey with minimal context
        """
        
        # Start with almost no information - just a hint
        initial_state = {
            "user_id": user_id,
            "discovery_level": 0,
            "unlocked_layers": ["surface"],
            "discovered_items": [],
            "hints_given": 0,
            "easter_eggs_found": 0,
            "journey_start": datetime.now().isoformat(),
            "current_mystery": self._generate_initial_mystery(birth_data)
        }
        
        self.user_progress[user_id] = initial_state
        return initial_state
    
    def _generate_initial_mystery(self, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an intriguing initial mystery based on birth data
        """
        
        # Create mysterious hints without revealing the system
        mysteries = [
            {
                "type": "energy_pattern",
                "hint": "There's something unique about your energy signature...",
                "discovery_path": "energy_exploration",
                "unlock_condition": "explore_energy_patterns"
            },
            {
                "type": "cosmic_timing",
                "hint": "The moment you arrived carried specific cosmic information...",
                "discovery_path": "timing_investigation", 
                "unlock_condition": "investigate_birth_moment"
            },
            {
                "type": "hidden_blueprint",
                "hint": "You carry an invisible blueprint that affects how you operate...",
                "discovery_path": "blueprint_discovery",
                "unlock_condition": "discover_personal_blueprint"
            }
        ]
        
        return random.choice(mysteries)
    
    def process_user_action(self, user_id: str, action: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process user actions and potentially unlock new discovery layers
        """
        
        if user_id not in self.user_progress:
            return {"error": "User not initialized"}
        
        user_state = self.user_progress[user_id]
        discovery_result = {
            "action_processed": action,
            "discoveries": [],
            "new_hints": [],
            "level_up": False,
            "easter_eggs": []
        }
        
        # Check for discovery triggers
        discoveries = self._check_discovery_triggers(user_id, action, context)
        
        if discoveries:
            discovery_result["discoveries"] = discoveries
            user_state["discovered_items"].extend(discoveries)
            
            # Check if user should level up
            if self._should_level_up(user_state):
                discovery_result["level_up"] = True
                user_state["discovery_level"] += 1
                discovery_result["new_hints"] = self._generate_level_hints(user_state["discovery_level"])
        
        # Check for easter eggs
        easter_eggs = self._check_easter_eggs(user_id, action, context)
        if easter_eggs:
            discovery_result["easter_eggs"] = easter_eggs
            user_state["easter_eggs_found"] += len(easter_eggs)
        
        return discovery_result
    
    def _check_discovery_triggers(self, user_id: str, action: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Check if user actions trigger discoveries
        """
        
        discoveries = []
        user_state = self.user_progress[user_id]
        
        # Define discovery triggers for different actions
        triggers = {
            "explore_energy_patterns": {
                "discovery": "human_design_type",
                "layer": "shallow",
                "content": {
                    "type": "system_discovery",
                    "name": "Energy Type Discovery",
                    "description": "You've discovered you have a specific energy type...",
                    "next_hint": "There are different ways this energy operates..."
                }
            },
            "investigate_birth_moment": {
                "discovery": "planetary_positions",
                "layer": "shallow", 
                "content": {
                    "type": "cosmic_discovery",
                    "name": "Cosmic Snapshot",
                    "description": "Your birth moment captured a unique cosmic configuration...",
                    "next_hint": "These positions create specific patterns..."
                }
            },
            "discover_personal_blueprint": {
                "discovery": "human_design_chart",
                "layer": "hidden",
                "content": {
                    "type": "blueprint_discovery",
                    "name": "Personal Operating System",
                    "description": "You've uncovered your personal operating system blueprint...",
                    "next_hint": "This blueprint has multiple layers of information..."
                }
            },
            "deep_pattern_analysis": {
                "discovery": "variables_system",
                "layer": "deep",
                "content": {
                    "type": "advanced_discovery",
                    "name": "Advanced Differentiation",
                    "description": "You've found an advanced layer of personal differentiation...",
                    "next_hint": "This system goes deeper than most people realize..."
                }
            }
        }
        
        if action in triggers:
            trigger = triggers[action]
            layer = trigger["layer"]
            
            # Check if user has access to this layer
            if self._has_layer_access(user_state, layer):
                discoveries.append(trigger["content"])
        
        return discoveries
    
    def _check_easter_eggs(self, user_id: str, action: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Check for hidden easter eggs and system hacks
        """
        
        easter_eggs = []
        
        # Define easter egg triggers
        easter_egg_triggers = {
            "konami_sequence": {
                "trigger": "sequence_input",
                "sequence": ["up", "up", "down", "down", "left", "right", "left", "right", "b", "a"],
                "reward": {
                    "type": "system_hack",
                    "name": "Developer Mode",
                    "description": "You've unlocked developer insights into the consciousness engines...",
                    "unlock": "raw_data_access"
                }
            },
            "fibonacci_exploration": {
                "trigger": "pattern_recognition",
                "pattern": "fibonacci",
                "reward": {
                    "type": "sacred_geometry",
                    "name": "Sacred Pattern Recognition",
                    "description": "You've discovered the sacred geometry underlying the system...",
                    "unlock": "geometric_insights"
                }
            },
            "midnight_access": {
                "trigger": "time_based",
                "condition": "midnight_hour",
                "reward": {
                    "type": "temporal_insight",
                    "name": "Temporal Consciousness",
                    "description": "Accessing the system at the threshold reveals hidden dimensions...",
                    "unlock": "time_consciousness"
                }
            }
        }
        
        # Check for easter egg conditions
        for egg_name, egg_config in easter_egg_triggers.items():
            if self._check_easter_egg_condition(action, context, egg_config):
                easter_eggs.append(egg_config["reward"])
        
        return easter_eggs
    
    def _check_easter_egg_condition(self, action: str, context: Dict[str, Any], egg_config: Dict[str, Any]) -> bool:
        """
        Check if specific easter egg conditions are met
        """
        
        trigger_type = egg_config["trigger"]
        
        if trigger_type == "sequence_input":
            # Check if user input matches sequence
            user_sequence = context.get("input_sequence", [])
            return user_sequence == egg_config["sequence"]
        
        elif trigger_type == "pattern_recognition":
            # Check if user discovered specific patterns
            discovered_pattern = context.get("pattern", "")
            return discovered_pattern == egg_config["pattern"]
        
        elif trigger_type == "time_based":
            # Check time-based conditions
            current_hour = datetime.now().hour
            return current_hour == 0  # Midnight
        
        return False
    
    def _has_layer_access(self, user_state: Dict[str, Any], layer: str) -> bool:
        """
        Check if user has access to specific discovery layer
        """
        
        layer_hierarchy = ["surface", "shallow", "hidden", "deep", "secret"]
        user_level = user_state["discovery_level"]
        layer_index = layer_hierarchy.index(layer)
        
        return user_level >= layer_index
    
    def _should_level_up(self, user_state: Dict[str, Any]) -> bool:
        """
        Determine if user should advance to next discovery level
        """
        
        discoveries_count = len(user_state["discovered_items"])
        current_level = user_state["discovery_level"]
        
        # Level up thresholds
        thresholds = {
            0: 2,   # Surface to shallow
            1: 5,   # Shallow to hidden  
            2: 10,  # Hidden to deep
            3: 15,  # Deep to secret
            4: 20   # Secret mastery
        }
        
        threshold = thresholds.get(current_level, 999)
        return discoveries_count >= threshold
    
    def _generate_level_hints(self, level: int) -> List[str]:
        """
        Generate hints for new discovery level
        """
        
        level_hints = {
            1: [
                "You're beginning to see patterns in the system...",
                "There are deeper layers waiting to be discovered...",
                "Your exploration is revealing hidden connections..."
            ],
            2: [
                "The system has more sophisticated mechanics...",
                "You're uncovering advanced features...",
                "There are secret pathways in this consciousness map..."
            ],
            3: [
                "You've reached the advanced practitioner level...",
                "The deepest mysteries are becoming accessible...",
                "You're approaching mastery of the system..."
            ],
            4: [
                "You've unlocked the secret level...",
                "Hidden easter eggs and system hacks await...",
                "You're now exploring the consciousness engine's core..."
            ]
        }
        
        return level_hints.get(level, ["You've transcended the known levels..."])
    
    def generate_personalized_discovery_path(self, user_id: str, birth_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a personalized discovery path based on user's Human Design
        """
        
        # Use Human Design data to create personalized discovery experience
        user_type = birth_data.get("type", "Generator")
        authority = birth_data.get("authority", "Sacral_Authority")
        profile = birth_data.get("profile", "2_4")
        
        discovery_path = {
            "user_type": user_type,
            "discovery_style": self._get_discovery_style(user_type, authority, profile),
            "recommended_sequence": self._get_discovery_sequence(user_type),
            "personalized_hints": self._get_personalized_hints(user_type, authority, profile),
            "optimal_timing": self._get_optimal_discovery_timing(authority)
        }
        
        return discovery_path
    
    def _get_discovery_style(self, user_type: str, authority: str, profile: str) -> Dict[str, Any]:
        """
        Determine optimal discovery style based on Human Design
        """
        
        styles = {
            "Generator": {
                "approach": "Respond to discovery opportunities",
                "pace": "Steady exploration with gut responses",
                "method": "Follow satisfaction and energy"
            },
            "Projector": {
                "approach": "Wait for invitations to explore",
                "pace": "Focused, efficient discovery sessions",
                "method": "Study and understand before exploring"
            },
            "Manifestor": {
                "approach": "Initiate discovery independently",
                "pace": "Burst exploration with rest periods",
                "method": "Inform others of discoveries"
            },
            "Reflector": {
                "approach": "Sample different discovery approaches",
                "pace": "Lunar cycle timing for major discoveries",
                "method": "Reflect community's discovery patterns"
            }
        }
        
        return styles.get(user_type, styles["Generator"])
    
    def _get_discovery_sequence(self, user_type: str) -> List[str]:
        """
        Get recommended discovery sequence based on type
        """
        
        sequences = {
            "Generator": [
                "energy_exploration",
                "response_patterns",
                "satisfaction_indicators",
                "work_alignment",
                "advanced_mechanics"
            ],
            "Projector": [
                "recognition_patterns",
                "guidance_systems",
                "efficiency_optimization",
                "invitation_mechanics",
                "mastery_development"
            ],
            "Manifestor": [
                "initiation_patterns",
                "impact_mechanics",
                "informing_systems",
                "independence_optimization",
                "manifestation_mastery"
            ],
            "Reflector": [
                "sampling_mechanics",
                "lunar_timing",
                "community_reflection",
                "wisdom_development",
                "mirror_mastery"
            ]
        }
        
        return sequences.get(user_type, sequences["Generator"])
    
    def _get_personalized_hints(self, user_type: str, authority: str, profile: str) -> List[str]:
        """
        Generate personalized hints based on Human Design
        """
        
        hints = [
            f"Your {user_type} energy has a specific discovery pattern...",
            f"Your {authority.replace('_', ' ')} will guide your exploration...",
            f"Your {profile.replace('_', '/')} profile affects how you uncover information...",
            "There are layers of information that match your unique design...",
            "The system responds differently to your specific energy signature..."
        ]
        
        return hints
    
    def _get_optimal_discovery_timing(self, authority: str) -> Dict[str, Any]:
        """
        Get optimal timing for discoveries based on authority
        """
        
        timing = {
            "Sacral_Authority": {
                "best_time": "When you feel energetic and responsive",
                "avoid": "When tired or forcing exploration",
                "rhythm": "Follow your natural energy cycles"
            },
            "Emotional_Authority": {
                "best_time": "When emotionally clear and neutral",
                "avoid": "During emotional highs or lows",
                "rhythm": "Wait for emotional clarity before major discoveries"
            },
            "Splenic_Authority": {
                "best_time": "In the moment when intuition strikes",
                "avoid": "Overthinking or delaying intuitive hits",
                "rhythm": "Trust spontaneous discovery impulses"
            }
        }
        
        return timing.get(authority, timing["Sacral_Authority"])


# Example usage functions
def example_discovery_journey():
    """Example of a complete discovery journey"""
    
    engine = WitnessOSDiscoveryEngine()
    
    # Initialize user with minimal context
    user_data = {
        "name": "Discovery User",
        "type": "Generator",
        "authority": "Sacral_Authority",
        "profile": "2_4"
    }
    
    journey = engine.initialize_user_journey("user123", user_data)
    print("🎮 Discovery Journey Initialized")
    print(f"🔍 Initial Mystery: {journey['current_mystery']['hint']}")
    
    # Simulate user actions and discoveries
    actions = [
        ("explore_energy_patterns", {"exploration_depth": "surface"}),
        ("investigate_birth_moment", {"curiosity_level": "high"}),
        ("discover_personal_blueprint", {"analysis_depth": "deep"}),
        ("deep_pattern_analysis", {"pattern_recognition": "advanced"})
    ]
    
    for action, context in actions:
        result = engine.process_user_action("user123", action, context)
        print(f"\n🎯 Action: {action}")
        if result["discoveries"]:
            print(f"✨ Discoveries: {len(result['discoveries'])}")
        if result["level_up"]:
            print("🆙 Level Up!")
        if result["easter_eggs"]:
            print(f"🥚 Easter Eggs Found: {len(result['easter_eggs'])}")
    
    return journey

def example_personalized_path():
    """Example of personalized discovery path"""
    
    engine = WitnessOSDiscoveryEngine()
    
    user_data = {
        "type": "Projector",
        "authority": "Splenic_Authority", 
        "profile": "1_3"
    }
    
    path = engine.generate_personalized_discovery_path("user456", user_data)
    
    print("🎯 Personalized Discovery Path Generated")
    print(f"🔍 Discovery Style: {path['discovery_style']['approach']}")
    print(f"⏰ Optimal Timing: {path['optimal_timing']['best_time']}")
    
    return path

if __name__ == "__main__":
    print("🚀 WitnessOS Discovery Game Mechanics")
    print("=" * 50)
    
    # Run examples
    journey = example_discovery_journey()
    path = example_personalized_path()
    
    print("\n✅ Discovery game mechanics examples completed!")
