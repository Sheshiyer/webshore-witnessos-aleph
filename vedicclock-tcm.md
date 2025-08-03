#!/usr/bin/env python3
"""
WitnessOS Integrated Consciousness Clock Engine
Combines Vedic Panchanga + TCM Body Clock + Personal Chart Analysis
"""

import datetime
import pytz
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import math

# Previous VedicClockEngine imports
from vedic_clock_engine import VedicClockEngine, PanchaAnga, Location, Element

class TCMOrgan(Enum):
    """12 TCM Organs with their active periods"""
    LUNG = {"time": "03:00-05:00", "element": "Metal", "emotion": "Grief", "season": "Autumn"}
    LARGE_INTESTINE = {"time": "05:00-07:00", "element": "Metal", "emotion": "Guilt", "season": "Autumn"}
    STOMACH = {"time": "07:00-09:00", "element": "Earth", "emotion": "Worry", "season": "Late Summer"}
    SPLEEN = {"time": "09:00-11:00", "element": "Earth", "emotion": "Pensiveness", "season": "Late Summer"}
    HEART = {"time": "11:00-13:00", "element": "Fire", "emotion": "Joy", "season": "Summer"}
    SMALL_INTESTINE = {"time": "13:00-15:00", "element": "Fire", "emotion": "Excitement", "season": "Summer"}
    BLADDER = {"time": "15:00-17:00", "element": "Water", "emotion": "Fear", "season": "Winter"}
    KIDNEY = {"time": "17:00-19:00", "element": "Water", "emotion": "Fright", "season": "Winter"}
    PERICARDIUM = {"time": "19:00-21:00", "element": "Fire", "emotion": "Over-excitement", "season": "Summer"}
    TRIPLE_HEATER = {"time": "21:00-23:00", "element": "Fire", "emotion": "Confusion", "season": "Summer"}
    GALLBLADDER = {"time": "23:00-01:00", "element": "Wood", "emotion": "Anger", "season": "Spring"}
    LIVER = {"time": "01:00-03:00", "element": "Wood", "emotion": "Frustration", "season": "Spring"}

@dataclass
class UserProfile:
    """User's personal astrological profile"""
    birth_datetime: datetime.datetime
    birth_location: Location
    lagna: int          # Ascendant sign (1-12)
    moon_sign: int      # Rashi (1-12)
    sun_sign: int       # Solar sign (1-12)
    birth_nakshatra: int # Birth star (1-27)
    birth_tithi: int    # Birth lunar day
    current_vimshottari: Dict  # Current dasha period
    
@dataclass
class TCMState:
    """Current TCM Body Clock state"""
    active_organ: TCMOrgan
    organ_energy_level: float  # 0-1, peak at middle of period
    tcm_element: str
    emotional_influence: str
    seasonal_alignment: float

@dataclass
class IntegratedState:
    """Complete integrated consciousness state"""
    timestamp: datetime.datetime
    panchanga: PanchaAnga
    tcm_state: TCMState
    elemental_synthesis: Dict
    personal_resonance: Dict
    optimization_recommendations: Dict
    consciousness_curriculum: Dict

class IntegratedConsciousnessEngine:
    """
    Master engine combining Vedic, TCM, and personal chart analysis
    """
    
    # TCM Organ Schedule (24-hour format)
    TCM_SCHEDULE = [
        ("LUNG", 3, 5), ("LARGE_INTESTINE", 5, 7), ("STOMACH", 7, 9),
        ("SPLEEN", 9, 11), ("HEART", 11, 13), ("SMALL_INTESTINE", 13, 15),
        ("BLADDER", 15, 17), ("KIDNEY", 17, 19), ("PERICARDIUM", 19, 21),
        ("TRIPLE_HEATER", 21, 23), ("GALLBLADDER", 23, 1), ("LIVER", 1, 3)
    ]
    
    # Element Correspondences between systems
    ELEMENT_MAPPING = {
        # TCM -> Vedic Element Correspondences
        "Metal": Element.AIR,      # Both relate to breath, communication
        "Water": Element.WATER,    # Direct correspondence
        "Wood": Element.AIR,       # Growth, movement, expansion
        "Fire": Element.FIRE,      # Direct correspondence  
        "Earth": Element.EARTH     # Direct correspondence
    }
    
    # Rashi (Signs) characteristics for personal resonance
    RASHI_ELEMENTS = {
        1: "Fire", 2: "Earth", 3: "Air", 4: "Water",      # Aries-Cancer
        5: "Fire", 6: "Earth", 7: "Air", 8: "Water",      # Leo-Scorpio  
        9: "Fire", 10: "Earth", 11: "Air", 12: "Water"    # Sagittarius-Pisces
    }

    def __init__(self, location: Location, ephemeris_path: str = "./ephemeris"):
        """Initialize the integrated engine"""
        self.vedic_engine = VedicClockEngine(location, ephemeris_path)
        self.location = location
        print("🌍 Integrated Consciousness Engine initialized")
        print("🕉️ Vedic Panchanga + 🏥 TCM Body Clock + 👤 Personal Chart Analysis")
    
    def get_integrated_state(self, user_profile: UserProfile, 
                           dt: Optional[datetime.datetime] = None) -> IntegratedState:
        """
        Main API call - get complete integrated consciousness state
        This is called on-demand, not continuously
        """
        if dt is None:
            dt = datetime.datetime.now(pytz.timezone(self.location.timezone))
        
        print(f"🔄 Calculating integrated state for {dt.strftime('%Y-%m-%d %H:%M')}")
        
        # Get Vedic Panchanga
        panchanga = self.vedic_engine.get_pancha_anga(dt)
        
        # Get TCM State
        tcm_state = self._calculate_tcm_state(dt)
        
        # Calculate Elemental Synthesis
        elemental_synthesis = self._synthesize_elements(panchanga, tcm_state)
        
        # Calculate Personal Resonance
        personal_resonance = self._calculate_personal_resonance(
            user_profile, panchanga, tcm_state, dt
        )
        
        # Generate Optimization Recommendations
        optimization_recommendations = self._generate_optimization_recommendations(
            panchanga, tcm_state, personal_resonance, elemental_synthesis
        )
        
        # Create Consciousness Curriculum
        consciousness_curriculum = self._create_consciousness_curriculum(
            user_profile, panchanga, tcm_state, personal_resonance
        )
        
        return IntegratedState(
            timestamp=dt,
            panchanga=panchanga,
            tcm_state=tcm_state,
            elemental_synthesis=elemental_synthesis,
            personal_resonance=personal_resonance,
            optimization_recommendations=optimization_recommendations,
            consciousness_curriculum=consciousness_curriculum
        )
    
    def _calculate_tcm_state(self, dt: datetime.datetime) -> TCMState:
        """Calculate current TCM organ activity and energy level"""
        current_hour = dt.hour
        
        # Find active organ
        active_organ_name = None
        for organ_name, start_hour, end_hour in self.TCM_SCHEDULE:
            if start_hour > end_hour:  # Crosses midnight (like GALLBLADDER 23-1)
                if current_hour >= start_hour or current_hour < end_hour:
                    active_organ_name = organ_name
                    break
            else:
                if start_hour <= current_hour < end_hour:
                    active_organ_name = organ_name
                    break
        
        if not active_organ_name:
            active_organ_name = "LUNG"  # Default fallback
        
        # Get organ details
        active_organ = TCMOrgan[active_organ_name]
        organ_info = active_organ.value
        
        # Calculate energy level (peak at middle of 2-hour period)
        organ_start, organ_end = None, None
        for name, start, end in self.TCM_SCHEDULE:
            if name == active_organ_name:
                organ_start, organ_end = start, end
                break
        
        # Calculate position within organ period (0-1)
        if organ_start is not None:
            if organ_start > organ_end:  # Crosses midnight
                if current_hour >= organ_start:
                    period_position = (current_hour - organ_start) / 2
                else:
                    period_position = (current_hour + 24 - organ_start) / 2
            else:
                period_position = (current_hour - organ_start) / 2
            
            # Energy peaks at middle (0.5), lowest at edges
            energy_level = 1 - abs(period_position - 0.5) * 2
        else:
            energy_level = 0.5
        
        return TCMState(
            active_organ=active_organ,
            organ_energy_level=max(0.1, energy_level),  # Minimum 10%
            tcm_element=organ_info["element"],
            emotional_influence=organ_info["emotion"],
            seasonal_alignment=self._calculate_seasonal_alignment(organ_info["season"], dt)
        )
    
    def _calculate_seasonal_alignment(self, organ_season: str, dt: datetime.datetime) -> float:
        """Calculate how aligned the organ is with current season"""
        # Simple seasonal calculation based on month
        month = dt.month
        
        season_months = {
            "Spring": [3, 4, 5],
            "Summer": [6, 7, 8], 
            "Late Summer": [8, 9],  # Traditional TCM late summer
            "Autumn": [9, 10, 11],
            "Winter": [12, 1, 2]
        }
        
        if month in season_months.get(organ_season, []):
            return 1.0  # Perfect alignment
        else:
            # Calculate partial alignment based on proximity
            return max(0.3, 1 - abs(month - season_months.get(organ_season, [month])[0]) / 6)
    
    def _synthesize_elements(self, panchanga: PanchaAnga, tcm_state: TCMState) -> Dict:
        """Synthesize Vedic 5-element and TCM 5-element systems"""
        vedic_elements = panchanga.elemental_balance['elements']
        
        # Map TCM element to Vedic element
        tcm_vedic_element = self.ELEMENT_MAPPING.get(tcm_state.tcm_element, Element.ETHER)
        
        # Create synthesis
        synthesis = {
            'vedic_dominant': panchanga.elemental_balance['dominant_element'],
            'tcm_active_element': tcm_state.tcm_element,
            'tcm_vedic_mapping': tcm_vedic_element.value,
            'alignment_score': vedic_elements.get(tcm_vedic_element.value, 0),
            'synthesis_type': self._determine_synthesis_type(
                panchanga.elemental_balance['dominant_element'], 
                tcm_vedic_element.value
            ),
            'combined_strength': self._calculate_combined_strength(
                vedic_elements, tcm_vedic_element.value, tcm_state.organ_energy_level
            )
        }
        
        return synthesis
    
    def _determine_synthesis_type(self, vedic_dominant: str, tcm_mapped: str) -> str:
        """Determine the type of synthesis between Vedic and TCM elements"""
        if vedic_dominant == tcm_mapped:
            return "Harmonious Amplification"  # Both systems support same element
        elif self._are_complementary(vedic_dominant, tcm_mapped):
            return "Complementary Balance"     # Elements support each other
        else:
            return "Dynamic Tension"          # Different elements create growth opportunity
    
    def _are_complementary(self, element1: str, element2: str) -> bool:
        """Check if two elements are complementary"""
        complementary_pairs = [
            ("fire", "air"),     # Fire needs air
            ("earth", "water"),  # Earth contains water
            ("water", "fire"),   # Water balances fire
            ("air", "ether"),    # Air connects to space
            ("earth", "ether")   # Earth grounds ether
        ]
        
        pair = tuple(sorted([element1, element2]))
        return pair in [tuple(sorted(p)) for p in complementary_pairs]
    
    def _calculate_combined_strength(self, vedic_elements: Dict, tcm_element: str, 
                                   tcm_energy: float) -> float:
        """Calculate combined elemental strength"""
        vedic_strength = vedic_elements.get(tcm_element, 0)
        
        # Weighted combination: 60% Vedic (cosmic), 40% TCM (bodily)
        return (vedic_strength * 0.6) + (tcm_energy * 0.4)
    
    def _calculate_personal_resonance(self, user_profile: UserProfile, 
                                    panchanga: PanchaAnga, tcm_state: TCMState,
                                    dt: datetime.datetime) -> Dict:
        """Calculate how current state resonates with user's personal chart"""
        
        # Birth chart resonances
        birth_lagna_element = self.RASHI_ELEMENTS[user_profile.lagna]
        birth_moon_element = self.RASHI_ELEMENTS[user_profile.moon_sign]
        
        # Current vs Birth comparisons
        current_tithi = panchanga.tithi['number']
        tithi_harmony = 1 - abs(current_tithi - user_profile.birth_tithi) / 30
        
        current_nakshatra = panchanga.nakshatra['number']
        nakshatra_harmony = 1 - abs(current_nakshatra - user_profile.birth_nakshatra) / 27
        
        # Lagna (Ascendant) resonance with current elements
        lagna_vedic_resonance = panchanga.elemental_balance['elements'].get(
            birth_lagna_element.lower(), 0
        )
        
        # Vimshottari Dasha influence (if provided)
        dasha_influence = self._calculate_dasha_influence(
            user_profile.current_vimshottari, panchanga, dt
        )
        
        return {
            'birth_lagna_element': birth_lagna_element,
            'birth_moon_element': birth_moon_element,
            'tithi_harmony': tithi_harmony,
            'nakshatra_harmony': nakshatra_harmony,
            'lagna_vedic_resonance': lagna_vedic_resonance,
            'overall_personal_resonance': (tithi_harmony + nakshatra_harmony + lagna_vedic_resonance) / 3,
            'dasha_influence': dasha_influence,
            'personal_optimization_score': self._calculate_personal_optimization_score(
                tithi_harmony, nakshatra_harmony, lagna_vedic_resonance, dasha_influence
            )
        }
    
    def _calculate_dasha_influence(self, current_dasha: Dict, panchanga: PanchaAnga, 
                                 dt: datetime.datetime) -> Dict:
        """Calculate how current Vimshottari Dasha influences the moment"""
        if not current_dasha:
            return {'influence_level': 0.5, 'notes': 'No dasha data provided'}
        
        # This would be more complex in reality, involving:
        # - Mahadasha lord's influence on current panchanga
        # - Antardasha interactions
        # - Pratyantar dasha fine-tuning
        
        mahadasha_lord = current_dasha.get('mahadasha_lord', 'Unknown')
        
        # Simplified planetary influence on elements
        planetary_elements = {
            'Sun': 'fire', 'Moon': 'water', 'Mars': 'fire',
            'Mercury': 'air', 'Jupiter': 'ether', 'Venus': 'water',
            'Saturn': 'earth', 'Rahu': 'air', 'Ketu': 'ether'
        }
        
        dasha_element = planetary_elements.get(mahadasha_lord, 'ether')
        current_dominant = panchanga.elemental_balance['dominant_element']
        
        influence_strength = 0.8 if dasha_element == current_dominant else 0.4
        
        return {
            'mahadasha_lord': mahadasha_lord,
            'dasha_element': dasha_element, 
            'current_alignment': dasha_element == current_dominant,
            'influence_level': influence_strength,
            'notes': f"{mahadasha_lord} dasha {'amplifies' if influence_strength > 0.5 else 'moderates'} current {current_dominant} dominance"
        }
    
    def _calculate_personal_optimization_score(self, tithi_harmony: float, 
                                             nakshatra_harmony: float,
                                             lagna_resonance: float, 
                                             dasha_influence: Dict) -> float:
        """Calculate overall personal optimization score (0-1)"""
        base_score = (tithi_harmony + nakshatra_harmony + lagna_resonance) / 3
        dasha_modifier = dasha_influence.get('influence_level', 0.5)
        
        # Weighted combination
        return (base_score * 0.7) + (dasha_modifier * 0.3)
    
    def _generate_optimization_recommendations(self, panchanga: PanchaAnga, 
                                             tcm_state: TCMState,
                                             personal_resonance: Dict,
                                             elemental_synthesis: Dict) -> Dict:
        """Generate personalized optimization recommendations"""
        
        # Base recommendations from elemental synthesis
        base_rec = panchanga.elemental_balance.get('recommendations', {})
        
        # TCM-specific recommendations
        tcm_rec = self._get_tcm_recommendations(tcm_state)
        
        # Personal modifications
        personal_mod = self._get_personal_modifications(personal_resonance)
        
        # Synthesis-based enhancements
        synthesis_enhancement = self._get_synthesis_enhancements(elemental_synthesis)
        
        return {
            'primary_focus': synthesis_enhancement.get('primary_focus', 'Balance'),
            'breath_pattern': self._synthesize_breath_patterns(base_rec, tcm_rec),
            'optimal_activities': self._synthesize_activities(base_rec, tcm_rec, personal_mod),
            'avoid_activities': base_rec.get('avoid', []) + tcm_rec.get('avoid', []),
            'body_focus': tcm_rec.get('body_focus', 'General wellness'),
            'emotional_awareness': tcm_state.emotional_influence,
            'timing_window': self._calculate_optimal_timing_window(panchanga, tcm_state),
            'personal_amplifiers': personal_mod.get('amplifiers', []),
            'consciousness_practice': synthesis_enhancement.get('consciousness_practice', 'Mindful awareness')
        }
    
    def _get_tcm_recommendations(self, tcm_state: TCMState) -> Dict:
        """Get TCM-specific recommendations based on active organ"""
        organ_name = tcm_state.active_organ.name
        
        # TCM organ-specific recommendations
        organ_recommendations = {
            'LUNG': {
                'body_focus': 'Breathing exercises, chest opening',
                'activities': ['deep_breathing', 'meditation', 'gentle_movement'],
                'avoid': ['heavy_exercise', 'cold_exposure'],
                'breath_pattern': 'lung_cleansing_breath'
            },
            'HEART': {
                'body_focus': 'Cardiovascular health, joy cultivation',
                'activities': ['social_connection', 'laughter', 'moderate_cardio'],
                'avoid': ['stress', 'over_excitement', 'heavy_meals'],
                'breath_pattern': 'heart_coherence_breathing'
            },
            'LIVER': {
                'body_focus': 'Detoxification, emotional processing',
                'activities': ['planning', 'creative_expression', 'gentle_stretching'],
                'avoid': ['anger', 'alcohol', 'late_night_eating'],  
                'breath_pattern': 'detox_breathing'
            },
            'KIDNEY': {
                'body_focus': 'Hydration, bone health, willpower',
                'activities': ['hydration', 'bone_strengthening', 'meditation'],
                'avoid': ['excessive_salt', 'fear_based_thoughts'],
                'breath_pattern': 'kidney_strengthening_breath'
            }
            # Add other organs as needed
        }
        
        return organ_recommendations.get(organ_name, {
            'body_focus': f'{organ_name.title()} optimization',
            'activities': ['gentle_movement'],
            'avoid': ['excess_stress'],
            'breath_pattern': 'balanced_breathing'
        })
    
    def _create_consciousness_curriculum(self, user_profile: UserProfile,
                                       panchanga: PanchaAnga, tcm_state: TCMState,
                                       personal_resonance: Dict) -> Dict:
        """Create the 'daily curriculum' for consciousness development"""
        
        # Current "lesson" based on synthesis
        primary_lesson = self._determine_primary_lesson(panchanga, tcm_state, personal_resonance)
        
        # Supporting practices
        supporting_practices = self._get_supporting_practices(panchanga, tcm_state)
        
        # Integration opportunities
        integration_opportunities = self._get_integration_opportunities(personal_resonance)
        
        return {
            'primary_lesson': primary_lesson,
            'lesson_duration': self._calculate_lesson_duration(panchanga, tcm_state),
            'supporting_practices': supporting_practices,
            'integration_opportunities': integration_opportunities,
            'homework_practices': self._get_homework_practices(panchanga, tcm_state),
            'next_major_transition': self._predict_next_transition(panchanga, tcm_state),
            'vimshottari_context': self._get_vimshottari_context(user_profile.current_vimshottari),
            'consciousness_level': self._assess_consciousness_level(personal_resonance)
        }
    
    def _determine_primary_lesson(self, panchanga: PanchaAnga, tcm_state: TCMState,
                                personal_resonance: Dict) -> str:
        """Determine the primary consciousness lesson for this moment"""
        dominant_element = panchanga.elemental_balance['dominant_element']
        tcm_element = tcm_state.tcm_element
        personal_score = personal_resonance['personal_optimization_score']
        
        if personal_score > 0.8:
            return f"Advanced {dominant_element.title()} Mastery - Integration with {tcm_element}"
        elif personal_score > 0.6:
            return f"Intermediate {dominant_element.title()} Development - {tcm_element} Support"
        else:
            return f"Foundation {dominant_element.title()} Building - {tcm_element} Awareness"
    
    def format_integrated_display(self, integrated_state: IntegratedState) -> str:
        """Format complete integrated state for display"""
        state = integrated_state
        output = []
        
        output.append("🌍 INTEGRATED CONSCIOUSNESS ENGINE")
        output.append("=" * 60)
        output.append(f"⏰ {state.timestamp.strftime('%Y-%m-%d %H:%M:%S %Z')}")
        output.append("")
        
        # Vedic Panchanga Summary
        output.append("🕉️ VEDIC PANCHANGA:")
        output.append(f"   Tithi: {state.panchanga.tithi['name']} ({state.panchanga.tithi['completion_percent']:.1f}%)")
        output.append(f"   Vara: {state.panchanga.vara['name']} ({state.panchanga.vara['lord']})")
        output.append(f"   Nakshatra: {state.panchanga.nakshatra['name']} - Pada {state.panchanga.nakshatra['pada']}")
        output.append(f"   Yoga: {state.panchanga.yoga['name']} ({state.panchanga.yoga.get('auspiciousness', 'N/A')})")
        output.append(f"   Karana: {state.panchanga.karana['name']} ({state.panchanga.karana['type']})")
        output.append("")
        
        # TCM Body Clock
        output.append("🏥 TCM BODY CLOCK:")
        output.append(f"   Active Organ: {state.tcm_state.active_organ.name.title()}")
        output.append(f"   Energy Level: {state.tcm_state.organ_energy_level*100:.1f}%")
        output.append(f"   TCM Element: {state.tcm_state.tcm_element}")
        output.append(f"   Emotional Influence: {state.tcm_state.emotional_influence}")
        output.append(f"   Seasonal Alignment: {state.tcm_state.seasonal_alignment*100:.1f}%")
        output.append("")
        
        # Elemental Synthesis
        output.append("⚡ ELEMENTAL SYNTHESIS:")
        es = state.elemental_synthesis
        output.append(f"   Vedic Dominant: {es['vedic_dominant'].title()}")
        output.append(f"   TCM Active: {es['tcm_active_element']} → {es['tcm_vedic_mapping'].title()}")
        output.append(f"   Synthesis: {es['synthesis_type']}")
        output.append(f"   Combined Strength: {es['combined_strength']*100:.1f}%")
        output.append("")
        
        # Personal Resonance
        output.append("👤 PERSONAL RESONANCE:")
        pr = state.personal_resonance
        output.append(f"   Birth Elements: Lagna={pr['birth_lagna_element']}, Moon={pr['birth_moon_element']}")
        output.append(f"   Tithi Harmony: {pr['tithi_harmony']*100:.1f}%")
        output.append(f"   Nakshatra Harmony: {pr['nakshatra_harmony']*100:.1f}%")
        output.append(f"   Personal Optimization: {pr['personal_optimization_score']*100:.1f}%")
        if 'dasha_influence' in pr:
            di = pr['dasha_influence']
            output.append(f"   Dasha: {di.get('mahadasha_lord', 'N/A')} ({di.get('influence_level', 0)*100:.1f}%)")
        output.append("")
        
        # Consciousness Curriculum
        output.append("📚 CONSCIOUSNESS CURRICULUM:")
        cc = state.consciousness_curriculum
        output.append(f"   Primary Lesson: {cc['primary_lesson']}")
        output.append(f"   Duration: {cc.get('lesson_duration', 'Ongoing')}")
        output.append(f"   Consciousness Level: {cc.get('consciousness_level', 'Developing')}")
        output.append("")
        
        # Optimization Recommendations
        output.append("🎯 OPTIMIZATION RECOMMENDATIONS:")
        opt = state.optimization_recommendations
        output.append(f"   Primary Focus: {opt['primary_focus']}")
        output.append(f"   Breath Pattern: {opt['breath_pattern']}")
        output.append(f"   Body Focus: {opt['body_focus']}")
        output.append(f"   Emotional Awareness: {opt['emotional_awareness']}")
        if 'optimal_activities' in opt:
            output.append(f"   Activities: {', '.join(opt['optimal_activities'][:3])}")
        output.append("")
        
        return "\n".join(output)

# Stub implementations for missing methods (would be fully implemented)
    def _synthesize_breath_patterns(self, base_rec: Dict, tcm_rec: Dict) -> str:
        return tcm_rec.get('breath_pattern', base_rec.get('breath_pattern', 'balanced_breathing'))
    
    def _synthesize_activities(self, base_rec: Dict, tcm_rec: Dict, personal_mod: Dict) -> List[str]:
        activities = base_rec.get('activities', []) + tcm_rec.get('activities', [])
        return list(set(activities))[:5]  # Top 5 unique activities
    
    def _get_personal_modifications(self, personal_resonance: Dict) -> Dict:
        return {'amplifiers': ['personal_practice']}
    
    def _get_synthesis_enhancements(self, elemental_synthesis: Dict) -> Dict:
        return {
            'primary_focus': elemental_synthesis['synthesis_type'],
            'consciousness_practice': 'Elemental integration'
        }
    
    def _calculate_optimal_timing_window(self, panchanga: PanchaAnga, tcm_state: TCMState) -> str:
        energy_level = tcm_state.organ_energy_level
        if energy_level > 0.8:
            return "Peak window - Optimal for action"
        elif energy_level > 0.5: 
            return "Good window - Suitable for most activities"
        else:
            return "Low energy - Rest and reflection recommended"
    
    def _get_supporting_practices(self, panchanga: PanchaAnga, tcm_state: TCMState) -> List[str]:
        return ['breathwork', 'meditation', 'movement']
    
    def _get_integration_opportunities(self, personal_resonance: Dict) -> List[str]:
        return ['personal_reflection', 'journaling']
    
    def _get_homework_practices(self, panchanga: PanchaAnga, tcm_state: TCMState) -> List[str]:
        return ['evening_reflection', 'morning_intention']
    
    def _predict_next_transition(self, panchanga: PanchaAnga, tcm_state: TCMState) -> str:
        return "Next organ transition in 1-2 hours"
    
    def _get_vimshottari_context(self, current_dasha: Dict) -> str:
        if not current_dasha:
            return "Dasha information not available"
        return f"Current {current_dasha.get('mahadasha_lord', 'Unknown')} Mahadasha context"
    
    def _assess_consciousness_level(self, personal_resonance: Dict) -> str:
        score = personal_resonance['personal_optimization_score']
        if score > 0.8:
            return "Advanced Integration"
        elif score > 0.6:
            return "Developing Mastery" 
        else:
            return "Foundation Building"
    
    def _calculate_lesson_duration(self, panchanga: PanchaAnga, tcm_state: TCMState) -> str:
        return "2-hour TCM cycle"

# Example usage
if __name__ == "__main__":
    # Setup
    location = Location(37.7749, -122.4194, "America/Los_Angeles", "San Francisco")
    
    # Example user profile
    user_profile = UserProfile(
        birth_datetime=datetime.datetime(1990, 5, 15, 14, 30),
        birth_location=location,
        lagna=5,  # Leo ascendant
        moon_sign=3,  # Gemini moon
        sun_sign=2,   # Taurus sun
        birth_nakshatra=12,  # Uttara Phalguni
        birth_tithi=8,       # Ashtami
        current_vimshottari={'mahadasha_lord': 'Jupiter', 'antardasha_lord': 'Saturn'}
    )
    
    # Initialize engine
    engine = IntegratedConsciousnessEngine(location)
    
    try:
        # Get integrated state (this is the main API call)
        integrated_state = engine.get_integrated_state(user_profile)
        
        # Display results
        print(engine.format_integrated_display(integrated_state))
        
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure all dependencies are installed!")