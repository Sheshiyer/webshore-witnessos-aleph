"""
Tarot Sequence Decoder Engine for WitnessOS

Provides tarot card readings using traditional spreads and mystical interpretation.
Supports multiple deck types and spread layouts with archetypal analysis.
"""

from datetime import datetime
from typing import Dict, List, Any, Type, Optional

from base.engine_interface import BaseEngine
from base.data_models import BaseEngineInput, BaseEngineOutput
from base.utils import load_json_data
from calculations.divination import DivinationCalculator
from .tarot_models import (
    TarotInput, TarotOutput, TarotCard, DrawnCard, SpreadLayout, TarotDeck
)


class TarotSequenceDecoder(BaseEngine):
    """
    Tarot Sequence Decoder Engine
    
    Performs tarot card readings using traditional spreads and provides
    mystical interpretation with archetypal analysis.
    """
    
    def __init__(self):
        super().__init__()
        self.deck_data: Optional[TarotDeck] = None
        self.divination_calc = DivinationCalculator()
        self._load_deck_data()
    
    @property
    def engine_name(self) -> str:
        return "Tarot Sequence Decoder"

    @property
    def description(self) -> str:
        return "Performs tarot card readings using traditional spreads with mystical interpretation and archetypal analysis"

    @property
    def input_model(self) -> Type[BaseEngineInput]:
        return TarotInput

    @property
    def output_model(self) -> Type[BaseEngineOutput]:
        return TarotOutput
    
    def _load_deck_data(self) -> None:
        """Load tarot deck data from JSON files."""
        try:
            deck_json = load_json_data("tarot", "rider_waite.json")
            self.deck_data = TarotDeck(**deck_json)
            self.logger.info("Loaded Rider-Waite tarot deck data")
        except Exception as e:
            self.logger.error(f"Failed to load tarot deck data: {e}")
            raise
    
    def _create_full_deck(self) -> List[TarotCard]:
        """Create a complete deck of TarotCard objects."""
        cards = []
        
        # Add Major Arcana
        for number, card_data in self.deck_data.major_arcana.items():
            card = TarotCard(
                name=card_data["name"],
                arcana_type="major",
                number=number,
                keywords=card_data.get("keywords", []),
                upright_meaning=card_data["upright"],
                reversed_meaning=card_data["reversed"],
                element=card_data.get("element"),
                astrological=card_data.get("astrological")
            )
            cards.append(card)
        
        # Add Minor Arcana
        for suit_name, suit_data in self.deck_data.minor_arcana["suits"].items():
            for card_name, card_data in suit_data["cards"].items():
                card = TarotCard(
                    name=card_data["name"],
                    suit=suit_name,
                    number=card_name,
                    arcana_type="minor",
                    keywords=suit_data.get("keywords", []),
                    upright_meaning=card_data["upright"],
                    reversed_meaning=card_data["reversed"],
                    element=suit_data.get("element")
                )
                cards.append(card)
        
        return cards
    
    def _get_spread_layout(self, spread_type: str) -> SpreadLayout:
        """Get the layout for a specific spread type."""
        spread_data = self.deck_data.spreads[spread_type]
        
        return SpreadLayout(
            name=spread_data["name"],
            description=spread_data.get("description", ""),
            positions=spread_data["positions"],
            card_count=len(spread_data["positions"])
        )
    
    def _draw_cards(self, deck: List[TarotCard], count: int, question: str) -> List[TarotCard]:
        """Draw cards from the deck using divination calculator."""
        return self.divination_calc.draw_cards(deck, count, question)
    
    def _determine_reversal(self, include_reversed: bool) -> bool:
        """Determine if a card should be reversed."""
        if not include_reversed:
            return False

        # 30% chance of reversal for mystical balance
        return self.divination_calc.random.random_float() < 0.3
    
    def _interpret_card_in_position(self, card: TarotCard, position_meaning: str, 
                                  reversed: bool, question: str) -> str:
        """Interpret a card in its specific position context."""
        base_meaning = card.reversed_meaning if reversed else card.upright_meaning
        
        # Create contextual interpretation
        interpretation = f"In the position of '{position_meaning}', "
        
        if reversed:
            interpretation += f"the reversed {card.name} suggests: {base_meaning}. "
        else:
            interpretation += f"{card.name} indicates: {base_meaning}. "
        
        # Add mystical connection to the question
        if question and len(question.strip()) > 0:
            interpretation += f"This relates to your question about {question.lower()} "
            interpretation += "by highlighting the need for deeper reflection on this aspect."
        
        return interpretation
    
    def _analyze_elemental_balance(self, cards: List[DrawnCard]) -> Dict[str, int]:
        """Analyze the elemental balance in the reading."""
        elements = {"Fire": 0, "Water": 0, "Air": 0, "Earth": 0}
        
        for drawn_card in cards:
            element = drawn_card.card.element
            if element and element in elements:
                elements[element] += 1
        
        return elements
    
    def _identify_archetypal_patterns(self, cards: List[DrawnCard]) -> List[str]:
        """Identify archetypal patterns in the card selection."""
        patterns = []
        
        # Count major vs minor arcana
        major_count = sum(1 for c in cards if c.card.arcana_type == "major")
        minor_count = len(cards) - major_count
        
        if major_count > minor_count:
            patterns.append("Strong spiritual/archetypal influence - major life themes at play")
        elif minor_count > major_count:
            patterns.append("Practical/everyday focus - attention to daily life matters")
        
        # Check for court cards
        court_cards = [c for c in cards if c.card.number in ["page", "knight", "queen", "king"]]
        if len(court_cards) >= 2:
            patterns.append("Multiple court cards suggest people or personality aspects are significant")
        
        # Check for aces
        aces = [c for c in cards if c.card.number == "ace"]
        if len(aces) >= 2:
            patterns.append("Multiple aces indicate new beginnings and fresh energy")
        
        return patterns
    
    def _generate_overall_theme(self, cards: List[DrawnCard], question: str) -> str:
        """Generate an overall theme for the reading."""
        # Analyze the cards for common themes
        themes = []
        
        # Check for transformation cards
        transformation_cards = ["Death", "The Tower", "The Wheel of Fortune"]
        if any(card.card.name in transformation_cards for card in cards):
            themes.append("transformation and change")
        
        # Check for relationship cards
        relationship_cards = ["The Lovers", "Two of Cups", "Three of Cups"]
        if any(card.card.name in relationship_cards for card in cards):
            themes.append("relationships and connections")
        
        # Check for spiritual cards
        spiritual_cards = ["The High Priestess", "The Hermit", "The Star"]
        if any(card.card.name in spiritual_cards for card in cards):
            themes.append("spiritual growth and intuition")
        
        if themes:
            theme = f"This reading centers around {', '.join(themes)}. "
        else:
            theme = "This reading reveals a complex interplay of energies. "
        
        theme += f"The cards suggest that your question about {question} "
        theme += "is calling for both practical action and spiritual awareness."
        
        return theme

    def _calculate(self, validated_input: TarotInput) -> Dict[str, Any]:
        """Process the tarot reading calculation."""
        
        # Create full deck
        full_deck = self._create_full_deck()
        
        # Get spread layout
        spread_layout = self._get_spread_layout(validated_input.spread_type)
        
        # Draw cards
        drawn_cards_raw = self._draw_cards(
            full_deck, 
            spread_layout.card_count, 
            validated_input.question or ""
        )
        
        # Create drawn cards with positions and interpretations
        drawn_cards = []
        for i, card in enumerate(drawn_cards_raw):
            position_info = spread_layout.positions[i]
            reversed = self._determine_reversal(validated_input.include_reversed)

            interpretation = self._interpret_card_in_position(
                card,
                position_info["meaning"],
                reversed,
                validated_input.question or ""
            )

            drawn_card = DrawnCard(
                card=card,
                position=position_info["position"],
                position_meaning=position_info["meaning"],
                reversed=reversed,
                interpretation=interpretation
            )
            drawn_cards.append(drawn_card)
        
        # Analyze the reading
        elemental_balance = self._analyze_elemental_balance(drawn_cards)
        archetypal_patterns = self._identify_archetypal_patterns(drawn_cards)
        overall_theme = self._generate_overall_theme(drawn_cards, validated_input.question or "")
        
        # Generate guidance and insights
        key_insights = [
            f"The {card.card.name} in position {card.position} emphasizes {card.position_meaning.lower()}"
            for card in drawn_cards[:3]  # Top 3 insights
        ]
        
        guidance_summary = f"The cards guide you to focus on {overall_theme.lower()} "
        guidance_summary += "Trust your intuition and take aligned action."
        
        # Create field resonance using divination calculator
        card_names = [card.card.name for card in drawn_cards]
        field_resonance = self.divination_calc.calculate_archetypal_resonance(
            card_names,
            {"question": validated_input.question}
        )

        return {
            "spread_layout": spread_layout,
            "drawn_cards": drawn_cards,
            "question_asked": validated_input.question or "General guidance",
            "reading_timestamp": datetime.now(),
            "deck_used": validated_input.deck_type,
            "overall_theme": overall_theme,
            "key_insights": key_insights,
            "guidance_summary": guidance_summary,
            "elemental_balance": elemental_balance,
            "archetypal_patterns": archetypal_patterns,
            "energy_forecast": "The energy suggests a time of reflection and conscious choice-making.",
            "timing_indicators": ["Present moment awareness", "Seasonal transitions"],
            "action_steps": [
                "Meditate on the card imagery",
                "Journal about the insights received",
                "Take one small aligned action today"
            ],
            "meditation_focus": "Focus on the central card's imagery and let insights arise naturally.",
            "synchronicity_notes": "Notice how these themes appear in your daily life over the next week.",
            "field_resonance": field_resonance,
            "field_signature": "tarot_archetypal_guidance"
        }

    def _interpret(self, calculation_results: Dict[str, Any], input_data: TarotInput) -> str:
        """Interpret calculation results into human-readable format."""

        drawn_cards = calculation_results["drawn_cards"]
        overall_theme = calculation_results["overall_theme"]
        guidance_summary = calculation_results["guidance_summary"]

        interpretation = f"🎴 Tarot Reading for: {calculation_results['question_asked']}\n\n"
        interpretation += f"📋 Spread: {calculation_results['spread_layout'].name} ({input_data.spread_type})\n"
        interpretation += f"🕐 Reading Time: {calculation_results['reading_timestamp'].strftime('%Y-%m-%d %H:%M')}\n\n"

        interpretation += "🃏 Cards Drawn:\n"
        for card in drawn_cards:
            status = "Reversed" if card.reversed else "Upright"
            interpretation += f"   Position {card.position}: {card.card.name} ({status})\n"
            interpretation += f"   📍 {card.position_meaning}\n"
            interpretation += f"   💭 {card.interpretation}\n\n"

        interpretation += f"🌟 Overall Theme: {overall_theme}\n\n"
        interpretation += f"🎯 Guidance: {guidance_summary}\n\n"

        if calculation_results["key_insights"]:
            interpretation += "🔑 Key Insights:\n"
            for insight in calculation_results["key_insights"]:
                interpretation += f"   • {insight}\n"
            interpretation += "\n"

        interpretation += f"🧘 Meditation Focus: {calculation_results['meditation_focus']}\n"
        interpretation += f"✨ Synchronicity Notes: {calculation_results['synchronicity_notes']}\n"

        return interpretation


# Export the engine class
__all__ = ["TarotSequenceDecoder"]
