/**
 * Sigil Forge Synthesizer Engine for WitnessOS
 * 
 * Converts intentions into symbolic representations through traditional and modern
 * sigil creation methods. Generates personalized sigils for manifestation work,
 * meditation, and consciousness programming.
 */

import { BaseEngine } from './core/base-engine';
import type { BaseEngineInput, BaseEngineOutput } from './core/types';

// Sigil Forge Input Interface
export interface SigilForgeInput extends BaseEngineInput {
  intention: string; // 3-500 characters
  generation_method?: 'traditional' | 'geometric' | 'hybrid' | 'personal';
  letter_elimination?: boolean;
  connection_style?: 'sequential' | 'star' | 'web' | 'organic';
  sacred_geometry?: 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'circle' | 'auto';
  birth_date?: string; // ISO date string for personal customization
  personal_symbols?: string[];
  style?: 'minimal' | 'ornate' | 'organic' | 'geometric' | 'mystical';
  size?: number; // 256-2048 pixels
  color_scheme?: 'black_white' | 'golden' | 'silver' | 'red' | 'blue' | 'purple';
  include_border?: boolean;
  add_activation_symbols?: boolean;
  optimize_for_meditation?: boolean;
  charging_method?: 'visualization' | 'elemental' | 'planetary' | 'personal';
}

// Sigil Element Interface
export interface SigilElement {
  element_type: string; // 'line', 'curve', 'circle', 'symbol'
  start_point: [number, number]; // Normalized coordinates 0-1
  end_point: [number, number];
  control_points: [number, number][];
  properties: Record<string, any>; // Visual properties
}

// Sigil Composition Interface
export interface SigilComposition {
  elements: SigilElement[];
  center_point: [number, number];
  bounding_box: [number, number, number, number]; // x1, y1, x2, y2
  symmetry_type: string;
  intention_hash: string;
}

// Sigil Analysis Interface
export interface SigilAnalysis {
  complexity_score: number; // 0-1
  balance_score: number; // 0-1
  symmetry_score: number; // 0-1
  element_count: number;
  dominant_shapes: string[];
  energy_flow: string;
}

// Activation Guidance Interface
export interface ActivationGuidance {
  charging_instructions: string;
  meditation_technique: string;
  placement_suggestions: string[];
  timing_recommendations: string;
  destruction_guidance: string;
}

// Sigil Forge Output Interface
export interface SigilForgeOutput extends BaseEngineOutput {
  sigil_composition: SigilComposition;
  sigil_analysis: SigilAnalysis;
  method_used: string;
  unique_letters: string;
  letter_numbers: number[];
  activation_guidance: ActivationGuidance;
  symbolic_meaning: string;
  elemental_correspondences: Record<string, string>;
  planetary_influences: Record<string, string>;
  sigil_description: string;
}

export class SigilForgeEngine extends BaseEngine<SigilForgeInput, SigilForgeOutput> {
  public readonly name = 'sigil_forge';
  public readonly description = 'Converts intentions into symbolic sigils for manifestation and consciousness programming';

  // Sigil generation methods
  private readonly GENERATION_METHODS = {
    traditional: {
      name: "Traditional Letter Elimination",
      description: "Classic method using letter elimination and geometric connection",
      best_for: "General intentions and manifestation work"
    },
    geometric: {
      name: "Sacred Geometry Base", 
      description: "Uses sacred geometric forms as the foundation",
      best_for: "Spiritual work and consciousness expansion"
    },
    hybrid: {
      name: "Hybrid Approach",
      description: "Combines traditional and geometric methods",
      best_for: "Complex intentions requiring multiple approaches"
    },
    personal: {
      name: "Personalized Sigil",
      description: "Incorporates personal birth data and symbols",
      best_for: "Individual spiritual practice and personal development"
    }
  };

  // Color schemes
  private readonly COLOR_SCHEMES = {
    black_white: { primary: "#000000", secondary: "#FFFFFF", accent: "#666666", background: "#FFFFFF" },
    golden: { primary: "#FFD700", secondary: "#FFA500", accent: "#FF8C00", background: "#000000" },
    silver: { primary: "#C0C0C0", secondary: "#A9A9A9", accent: "#808080", background: "#000000" },
    red: { primary: "#DC143C", secondary: "#B22222", accent: "#8B0000", background: "#000000" },
    blue: { primary: "#0066FF", secondary: "#0033CC", accent: "#001199", background: "#000000" },
    purple: { primary: "#8A2BE2", secondary: "#6A1B9A", accent: "#4A148C", background: "#000000" }
  };

  // Elemental correspondences
  private readonly ELEMENTAL_CORRESPONDENCES = {
    fire: { shapes: ['triangle', 'angular'], energy: 'active', direction: 'upward' },
    water: { shapes: ['curve', 'wave'], energy: 'receptive', direction: 'downward' },
    air: { shapes: ['line', 'zigzag'], energy: 'active', direction: 'horizontal' },
    earth: { shapes: ['square', 'stable'], energy: 'receptive', direction: 'grounded' }
  };

  // Planetary influences
  private readonly PLANETARY_INFLUENCES = {
    sun: { symbol: '☉', energy: 'creative', timing: 'sunday', color: 'gold' },
    moon: { symbol: '☽', energy: 'intuitive', timing: 'monday', color: 'silver' },
    mars: { symbol: '♂', energy: 'assertive', timing: 'tuesday', color: 'red' },
    mercury: { symbol: '☿', energy: 'communicative', timing: 'wednesday', color: 'orange' },
    jupiter: { symbol: '♃', energy: 'expansive', timing: 'thursday', color: 'blue' },
    venus: { symbol: '♀', energy: 'harmonious', timing: 'friday', color: 'green' },
    saturn: { symbol: '♄', energy: 'structuring', timing: 'saturday', color: 'black' }
  };

  protected async _calculate(input: SigilForgeInput): Promise<Record<string, any>> {
    // Validate inputs
    this.validateInputs(input);

    // Set defaults
    const method = input.generation_method || 'traditional';
    const style = input.style || 'minimal';
    const colorScheme = input.color_scheme || 'black_white';

    // Generate sigil composition based on method
    let composition: SigilComposition;
    
    switch (method) {
      case 'traditional':
        composition = this.generateTraditionalSigil(input.intention);
        break;
      case 'geometric':
        composition = this.generateGeometricSigil(input.intention, input.sacred_geometry);
        break;
      case 'hybrid':
        composition = this.generateHybridSigil(input.intention);
        break;
      case 'personal':
        composition = this.generatePersonalSigil(input);
        break;
      default:
        composition = this.generateTraditionalSigil(input.intention);
    }

    // Apply styling
    const styledComposition = this.applyStyles(composition, style);

    // Analyze sigil properties
    const analysis = this.analyzeSigil(styledComposition);

    // Generate activation guidance
    const activationGuidance = this.generateActivationGuidance(styledComposition, input);

    // Extract unique letters and numbers
    const uniqueLetters = this.eliminateDuplicateLetters(input.intention);
    const letterNumbers = this.lettersToNumbers(uniqueLetters);

    // Determine correspondences
    const elementalCorr = this.determineElementalCorrespondences(styledComposition);
    const planetaryInf = this.determinePlanetaryInfluences(styledComposition, input);

    return {
      sigil_composition: styledComposition,
      sigil_analysis: analysis,
      method_used: method,
      unique_letters: uniqueLetters,
      letter_numbers: letterNumbers,
      activation_guidance: activationGuidance,
      elemental_correspondences: elementalCorr,
      planetary_influences: planetaryInf,
      intention: input.intention,
      style,
      color_scheme: colorScheme
    };
  }

  private validateInputs(input: SigilForgeInput): void {
    if (!input.intention || input.intention.length < 3) {
      throw new Error('Intention must be at least 3 characters long');
    }
    if (input.intention.length > 500) {
      throw new Error('Intention must be 500 characters or less');
    }
    if (input.size && (input.size < 256 || input.size > 2048)) {
      throw new Error('Size must be between 256 and 2048 pixels');
    }
  }

  private generateTraditionalSigil(intention: string): SigilComposition {
    // Traditional method: eliminate duplicate letters, convert to numbers, create geometric pattern
    const uniqueLetters = this.eliminateDuplicateLetters(intention);
    const letterNumbers = this.lettersToNumbers(uniqueLetters);
    
    // Create points based on letter numbers
    const points = this.createPointsFromNumbers(letterNumbers);
    
    // Connect points to create sigil elements
    const elements = this.connectPointsSequentially(points);
    
    // Calculate center and bounding box
    const centerPoint = this.calculateCenter(points);
    const boundingBox = this.calculateBoundingBox(points);
    
    // Create intention hash
    const intentionHash = this.createHash(intention);

    return {
      elements,
      center_point: centerPoint,
      bounding_box: boundingBox,
      symmetry_type: 'traditional',
      intention_hash: intentionHash
    };
  }

  private generateGeometricSigil(intention: string, geometry?: string): SigilComposition {
    const baseGeometry = geometry || 'circle';
    const intentionHash = this.createHash(intention);
    
    // Create base geometric form
    const baseElements = this.createGeometricBase(baseGeometry);
    
    // Add intention-influenced modifications
    const modifiedElements = this.addIntentionModifications(baseElements, intention);
    
    return {
      elements: modifiedElements,
      center_point: [0.5, 0.5],
      bounding_box: [0.1, 0.1, 0.9, 0.9],
      symmetry_type: 'geometric',
      intention_hash: intentionHash
    };
  }

  private generateHybridSigil(intention: string): SigilComposition {
    // Combine traditional and geometric approaches
    const traditional = this.generateTraditionalSigil(intention);
    const geometric = this.generateGeometricSigil(intention, 'circle');
    
    // Scale geometric elements and overlay
    const scaledGeometric = this.scaleElements(geometric.elements, 0.6, [0.2, 0.2]);
    
    // Combine elements
    const combinedElements = [...traditional.elements, ...scaledGeometric];
    
    return {
      elements: combinedElements,
      center_point: traditional.center_point,
      bounding_box: traditional.bounding_box,
      symmetry_type: 'hybrid',
      intention_hash: traditional.intention_hash
    };
  }

  private generatePersonalSigil(input: SigilForgeInput): SigilComposition {
    // Start with traditional base
    const baseComposition = this.generateTraditionalSigil(input.intention);
    
    // Add personal elements based on birth date
    const personalElements = this.addPersonalElements(input);
    
    // Combine elements
    const allElements = [...baseComposition.elements, ...personalElements];
    
    return {
      ...baseComposition,
      elements: allElements,
      symmetry_type: 'personal'
    };
  }

  private eliminateDuplicateLetters(intention: string): string {
    // Remove spaces, convert to uppercase, eliminate duplicates
    const cleaned = intention.replace(/[^A-Za-z]/g, '').toUpperCase();
    return [...new Set(cleaned)].join('');
  }

  private lettersToNumbers(letters: string): number[] {
    // Convert letters to numbers (A=1, B=2, etc.)
    return letters.split('').map(letter => letter.charCodeAt(0) - 64);
  }

  private createPointsFromNumbers(numbers: number[]): [number, number][] {
    const points: [number, number][] = [];
    
    for (let i = 0; i < numbers.length; i++) {
      const num = numbers[i];
      // Create point based on number value and position
      const angle = (i / numbers.length) * 2 * Math.PI;
      const radius = 0.3 + (num % 10) * 0.02; // Vary radius based on number
      
      const x = 0.5 + radius * Math.cos(angle);
      const y = 0.5 + radius * Math.sin(angle);
      
      points.push([x, y]);
    }
    
    return points;
  }

  private connectPointsSequentially(points: [number, number][]): SigilElement[] {
    const elements: SigilElement[] = [];
    
    for (let i = 0; i < points.length; i++) {
      const start = points[i];
      const end = points[(i + 1) % points.length];
      
      elements.push({
        element_type: 'line',
        start_point: start,
        end_point: end,
        control_points: [],
        properties: { weight: 2, style: 'solid', opacity: 1.0 }
      });
    }
    
    return elements;
  }

  private createGeometricBase(geometry: string): SigilElement[] {
    const elements: SigilElement[] = [];
    
    switch (geometry) {
      case 'circle':
        elements.push({
          element_type: 'circle',
          start_point: [0.5, 0.5],
          end_point: [0.5, 0.5],
          control_points: [],
          properties: { radius: 0.3, weight: 2, fill: false }
        });
        break;
        
      case 'triangle':
        const trianglePoints: [number, number][] = [
          [0.5, 0.2], [0.2, 0.8], [0.8, 0.8]
        ];
        for (let i = 0; i < trianglePoints.length; i++) {
          const start = trianglePoints[i];
          const end = trianglePoints[(i + 1) % trianglePoints.length];
          elements.push({
            element_type: 'line',
            start_point: start,
            end_point: end,
            control_points: [],
            properties: { weight: 2, style: 'solid' }
          });
        }
        break;
        
      case 'square':
        const squarePoints: [number, number][] = [
          [0.3, 0.3], [0.7, 0.3], [0.7, 0.7], [0.3, 0.7]
        ];
        for (let i = 0; i < squarePoints.length; i++) {
          const start = squarePoints[i];
          const end = squarePoints[(i + 1) % squarePoints.length];
          elements.push({
            element_type: 'line',
            start_point: start,
            end_point: end,
            control_points: [],
            properties: { weight: 2, style: 'solid' }
          });
        }
        break;
        
      default:
        // Default to circle
        elements.push({
          element_type: 'circle',
          start_point: [0.5, 0.5],
          end_point: [0.5, 0.5],
          control_points: [],
          properties: { radius: 0.3, weight: 2, fill: false }
        });
    }
    
    return elements;
  }

  private addIntentionModifications(elements: SigilElement[], intention: string): SigilElement[] {
    const modifiedElements = [...elements];
    const hash = this.createSimpleHash(intention);
    
    // Add modification based on intention hash
    if (hash % 3 === 0) {
      // Add center dot
      modifiedElements.push({
        element_type: 'circle',
        start_point: [0.5, 0.5],
        end_point: [0.5, 0.5],
        control_points: [],
        properties: { radius: 0.05, weight: 1, fill: true }
      });
    }
    
    if (hash % 4 === 0) {
      // Add crossing lines
      modifiedElements.push({
        element_type: 'line',
        start_point: [0.3, 0.3],
        end_point: [0.7, 0.7],
        control_points: [],
        properties: { weight: 1, style: 'dashed' }
      });
    }
    
    return modifiedElements;
  }

  private addPersonalElements(input: SigilForgeInput): SigilElement[] {
    const personalElements: SigilElement[] = [];
    
    if (input.birth_date) {
      const birthDate = new Date(input.birth_date);
      const day = birthDate.getDate();
      const month = birthDate.getMonth() + 1;
      
      // Add element based on birth day
      if (day % 3 === 0) {
        const trianglePoints: [number, number][] = [
          [0.5, 0.2], [0.3, 0.7], [0.7, 0.7]
        ];
        for (let i = 0; i < trianglePoints.length; i++) {
          const start = trianglePoints[i];
          const end = trianglePoints[(i + 1) % trianglePoints.length];
          personalElements.push({
            element_type: 'line',
            start_point: start,
            end_point: end,
            control_points: [],
            properties: { weight: 1, style: 'dashed', opacity: 0.5 }
          });
        }
      }
      
      // Add element based on birth month
      const monthAngle = (month / 12) * 2 * Math.PI;
      const monthX = 0.5 + 0.3 * Math.cos(monthAngle);
      const monthY = 0.5 + 0.3 * Math.sin(monthAngle);
      
      personalElements.push({
        element_type: 'circle',
        start_point: [monthX, monthY],
        end_point: [monthX, monthY],
        control_points: [],
        properties: { radius: 0.03, fill: true, weight: 1 }
      });
    }
    
    return personalElements;
  }

  private scaleElements(elements: SigilElement[], scale: number, offset: [number, number]): SigilElement[] {
    return elements.map(element => ({
      ...element,
      start_point: [
        element.start_point[0] * scale + offset[0],
        element.start_point[1] * scale + offset[1]
      ],
      end_point: [
        element.end_point[0] * scale + offset[0],
        element.end_point[1] * scale + offset[1]
      ],
      control_points: element.control_points.map(cp => [
        cp[0] * scale + offset[0],
        cp[1] * scale + offset[1]
      ]),
      properties: { ...element.properties, opacity: 0.7 }
    }));
  }

  private applyStyles(composition: SigilComposition, style: string): SigilComposition {
    const styledElements = composition.elements.map(element => {
      const styledProps = { ...element.properties };
      
      switch (style) {
        case 'minimal':
          styledProps.weight = Math.min(styledProps.weight || 1, 1);
          break;
        case 'ornate':
          styledProps.weight = Math.max(styledProps.weight || 1, 3);
          break;
        case 'organic':
          // Convert lines to curves for organic feel
          if (element.element_type === 'line' && element.control_points.length === 0) {
            const midX = (element.start_point[0] + element.end_point[0]) / 2;
            const midY = (element.start_point[1] + element.end_point[1]) / 2;
            return {
              ...element,
              element_type: 'curve',
              control_points: [[midX + 0.05, midY + 0.05]]
            };
          }
          break;
      }
      
      return { ...element, properties: styledProps };
    });

    return { ...composition, elements: styledElements };
  }

  private analyzeSigil(composition: SigilComposition): SigilAnalysis {
    const elementCount = composition.elements.length;
    
    // Calculate complexity based on element count and types
    const complexityScore = Math.min(elementCount / 20, 1);
    
    // Simple balance calculation
    const balanceScore = this.calculateBalance(composition);
    
    // Symmetry analysis
    const symmetryScore = this.calculateSymmetry(composition);
    
    // Identify dominant shapes
    const dominantShapes = this.identifyDominantShapes(composition);
    
    // Determine energy flow
    const energyFlow = this.determineEnergyFlow(composition);

    return {
      complexity_score: complexityScore,
      balance_score: balanceScore,
      symmetry_score: symmetryScore,
      element_count: elementCount,
      dominant_shapes: dominantShapes,
      energy_flow: energyFlow
    };
  }

  private calculateBalance(composition: SigilComposition): number {
    // Simple balance calculation based on element distribution
    const centerX = composition.center_point[0];
    const centerY = composition.center_point[1];
    
    let leftWeight = 0, rightWeight = 0;
    let topWeight = 0, bottomWeight = 0;
    
    composition.elements.forEach(element => {
      if (element.start_point[0] < centerX) leftWeight++;
      else rightWeight++;
      
      if (element.start_point[1] < centerY) topWeight++;
      else bottomWeight++;
    });
    
    const horizontalBalance = 1 - Math.abs(leftWeight - rightWeight) / composition.elements.length;
    const verticalBalance = 1 - Math.abs(topWeight - bottomWeight) / composition.elements.length;
    
    return (horizontalBalance + verticalBalance) / 2;
  }

  private calculateSymmetry(composition: SigilComposition): number {
    // Basic symmetry assessment
    if (composition.symmetry_type === 'geometric') return 0.9;
    if (composition.symmetry_type === 'traditional') return 0.6;
    if (composition.symmetry_type === 'hybrid') return 0.4;
    return 0.3;
  }

  private identifyDominantShapes(composition: SigilComposition): string[] {
    const shapeCount: Record<string, number> = {};
    
    composition.elements.forEach(element => {
      shapeCount[element.element_type] = (shapeCount[element.element_type] || 0) + 1;
    });
    
    return Object.entries(shapeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([shape]) => shape);
  }

  private determineEnergyFlow(composition: SigilComposition): string {
    const flows = ['ascending', 'descending', 'circular', 'radiating', 'converging'];
    const hash = this.createSimpleHash(composition.intention_hash);
    return flows[hash % flows.length];
  }

  private generateActivationGuidance(composition: SigilComposition, input: SigilForgeInput): ActivationGuidance {
    const chargingMethod = input.charging_method || 'visualization';
    
    return {
      charging_instructions: this.getChargingInstructions(chargingMethod),
      meditation_technique: this.getMeditationTechnique(composition.symmetry_type),
      placement_suggestions: this.getPlacementSuggestions(input.intention),
      timing_recommendations: this.getTimingRecommendations(chargingMethod),
      destruction_guidance: "When your intention has manifested, thank the sigil and safely destroy it by burning or burying to release the energy."
    };
  }

  private getChargingInstructions(method: string): string {
    const instructions = {
      visualization: "Hold the sigil while visualizing your intention already fulfilled. See it glowing with energy.",
      elemental: "Charge using the four elements: pass through incense smoke (air), candle flame (fire), sprinkle with water, touch to earth/salt.",
      planetary: "Charge during the planetary hour corresponding to your intention's nature.",
      personal: "Use your own energy through breathwork, focusing your intent into the sigil through sustained meditation."
    };
    
    return instructions[method as keyof typeof instructions] || instructions.visualization;
  }

  private getMeditationTechnique(symmetryType: string): string {
    const techniques = {
      traditional: "Gaze at the sigil until it becomes a blur, then close your eyes and hold the afterimage while stating your intention.",
      geometric: "Trace the geometric forms with your eyes, allowing the pattern to guide you into deeper meditation states.",
      hybrid: "Alternate between focusing on the traditional elements and the geometric base, integrating both energies.",
      personal: "Connect with the personal elements first, then expand your awareness to encompass the entire sigil."
    };
    
    return techniques[symmetryType] || techniques.traditional;
  }

  private getPlacementSuggestions(intention: string): string[] {
    const suggestions = [
      "Place under your pillow for dream work and subconscious programming",
      "Carry in your wallet or pocket for constant energy connection",
      "Place on your altar or sacred space for spiritual charging",
      "Position where you'll see it daily as a visual reminder"
    ];
    
    // Add specific suggestions based on intention keywords
    if (intention.toLowerCase().includes('love')) {
      suggestions.push("Place in your bedroom or relationship area");
    }
    if (intention.toLowerCase().includes('money') || intention.toLowerCase().includes('prosperity')) {
      suggestions.push("Place in your workspace or wealth corner");
    }
    if (intention.toLowerCase().includes('health')) {
      suggestions.push("Place in your bedroom or health area");
    }
    
    return suggestions;
  }

  private getTimingRecommendations(method: string): string {
    const timing = {
      visualization: "Best during quiet evening hours when your mind is relaxed and focused.",
      elemental: "Charge during dawn or dusk when elemental energies are most balanced.",
      planetary: "Use planetary hours and days corresponding to your intention's planet.",
      personal: "Work during your personal power hours when you feel most energetically aligned."
    };
    
    return timing[method as keyof typeof timing] || timing.visualization;
  }

  private determineElementalCorrespondences(composition: SigilComposition): Record<string, string> {
    const correspondences: Record<string, string> = {};
    
    // Analyze shapes to determine elemental associations
    const dominantShapes = this.identifyDominantShapes(composition);
    
    dominantShapes.forEach(shape => {
      if (shape === 'line') correspondences.air = "Linear elements suggest air energy - communication and mental clarity";
      if (shape === 'circle') correspondences.spirit = "Circular elements suggest spirit energy - wholeness and completion";
      if (shape === 'curve') correspondences.water = "Curved elements suggest water energy - flow and intuition";
    });
    
    // Add general correspondence
    correspondences.earth = "The physical manifestation of your intention into reality";
    
    return correspondences;
  }

  private determinePlanetaryInfluences(composition: SigilComposition, input: SigilForgeInput): Record<string, string> {
    const influences: Record<string, string> = {};
    
    // Determine primary planet based on intention keywords
    const intention = input.intention.toLowerCase();
    
    if (intention.includes('love') || intention.includes('beauty')) {
      influences.venus = "Venus influences this sigil with harmonious and attractive energies";
    }
    if (intention.includes('money') || intention.includes('prosperity')) {
      influences.jupiter = "Jupiter expands and magnifies your intention for abundance";
    }
    if (intention.includes('strength') || intention.includes('power')) {
      influences.mars = "Mars energizes this sigil with assertive and dynamic force";
    }
    if (intention.includes('wisdom') || intention.includes('knowledge')) {
      influences.mercury = "Mercury facilitates communication and learning through this sigil";
    }
    
    // Add sun as general life force
    influences.sun = "The Sun provides vital life force energy to manifest your intention";
    
    return influences;
  }

  private calculateCenter(points: [number, number][]): [number, number] {
    const sumX = points.reduce((sum, point) => sum + point[0], 0);
    const sumY = points.reduce((sum, point) => sum + point[1], 0);
    return [sumX / points.length, sumY / points.length];
  }

  private calculateBoundingBox(points: [number, number][]): [number, number, number, number] {
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }

  private createHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private createSimpleHash(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  protected _interpret(calculationResults: Record<string, any>, input: SigilForgeInput): string {
    const composition = calculationResults.sigil_composition as SigilComposition;
    const analysis = calculationResults.sigil_analysis as SigilAnalysis;
    const activationGuidance = calculationResults.activation_guidance as ActivationGuidance;

    return `
🎭 SIGIL FORGE SYNTHESIZER - INTENTION CRYSTALLIZED 🎭

═══ INTENTION MANIFESTATION ═══

Original Intention: "${calculationResults.intention}"
Unique Letters: ${calculationResults.unique_letters}
Letter Values: ${calculationResults.letter_numbers.join(', ')}

Method Used: ${this.GENERATION_METHODS[calculationResults.method_used as keyof typeof this.GENERATION_METHODS]?.name}
${this.GENERATION_METHODS[calculationResults.method_used as keyof typeof this.GENERATION_METHODS]?.description}

═══ SIGIL ANALYSIS ═══

Complexity Score: ${(analysis.complexity_score * 100).toFixed(1)}%
Balance Score: ${(analysis.balance_score * 100).toFixed(1)}%
Symmetry Score: ${(analysis.symmetry_score * 100).toFixed(1)}%
Element Count: ${analysis.element_count}
Dominant Shapes: ${analysis.dominant_shapes.join(', ')}
Energy Flow: ${analysis.energy_flow}

═══ MYSTICAL CORRESPONDENCES ═══

Elemental Associations:
${Object.entries(calculationResults.elemental_correspondences).map(([element, desc]) => 
  `${element.toUpperCase()}: ${desc}`).join('\n')}

Planetary Influences:
${Object.entries(calculationResults.planetary_influences).map(([planet, desc]) => 
  `${planet.toUpperCase()}: ${desc}`).join('\n')}

═══ ACTIVATION PROTOCOL ═══

Charging Instructions:
${activationGuidance.charging_instructions}

Meditation Technique:
${activationGuidance.meditation_technique}

Optimal Timing:
${activationGuidance.timing_recommendations}

Placement Suggestions:
${activationGuidance.placement_suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

═══ MANIFESTATION GUIDANCE ═══

Your sigil is now a living symbol containing the essence of your intention.
It serves as a bridge between conscious desire and unconscious manifestation.
Work with it regularly until your intention becomes reality, then release it with gratitude.

Remember: The power lies not in the symbol itself, but in your focused intention
and unwavering belief in the manifestation process.
    `.trim();
  }

  protected _generateRecommendations(calculationResults: Record<string, any>, input: SigilForgeInput): string[] {
    const analysis = calculationResults.sigil_analysis as SigilAnalysis;
    const activationGuidance = calculationResults.activation_guidance as ActivationGuidance;
    const recommendations: string[] = [];

    // Core sigil work recommendations
    recommendations.push("Charge your sigil during a focused meditation session before first use");
    recommendations.push("Keep the sigil in a place where you'll see it daily for subconscious programming");
    recommendations.push("Visualize your intention as already fulfilled when working with the sigil");

    // Analysis-based recommendations
    if (analysis.complexity_score > 0.7) {
      recommendations.push("This complex sigil contains multiple layers - work with it gradually to understand all aspects");
    } else if (analysis.complexity_score < 0.3) {
      recommendations.push("This simple sigil is ideal for daily meditation and easy visualization");
    }

    if (analysis.balance_score > 0.8) {
      recommendations.push("The balanced energy of this sigil makes it suitable for long-term manifestation work");
    }

    // Method-specific recommendations
    const method = calculationResults.method_used;
    if (method === 'traditional') {
      recommendations.push("Focus on the letter-derived elements to connect with the linguistic power of your intention");
    } else if (method === 'geometric') {
      recommendations.push("Meditate on the sacred geometry to align with universal patterns and harmonies");
    } else if (method === 'personal') {
      recommendations.push("Connect with the personal elements to activate your unique energetic signature");
    }

    // Add activation guidance
    recommendations.push(activationGuidance.charging_instructions);

    return recommendations;
  }

  protected _generateRealityPatches(calculationResults: Record<string, any>, input: SigilForgeInput): string[] {
    const composition = calculationResults.sigil_composition as SigilComposition;
    const patches: string[] = [];

    // Sigil-specific patches
    patches.push(`Intention "${calculationResults.intention}" crystallized into symbolic form`);
    patches.push(`${composition.symmetry_type} sigil pattern reality matrix activated`);
    patches.push(`${composition.elements.length}-element manifestation grid established`);

    // Method-based patches
    const method = calculationResults.method_used;
    patches.push(`${method} sigil generation protocol engaged`);

    // Elemental patches
    Object.keys(calculationResults.elemental_correspondences).forEach(element => {
      patches.push(`${element} elemental resonance frequency aligned`);
    });

    // Planetary patches
    Object.keys(calculationResults.planetary_influences).forEach(planet => {
      patches.push(`${planet} planetary influence channel opened`);
    });

    // Manifestation patches
    patches.push('Conscious-unconscious communication bridge activated');
    patches.push('Symbolic manifestation pathway established');
    patches.push('Reality programming sigil deployed');
    patches.push('Intention-reality convergence field generated');

    return patches;
  }

  protected _identifyArchetypalThemes(calculationResults: Record<string, any>, input: SigilForgeInput): string[] {
    const themes: string[] = [];
    const method = calculationResults.method_used;
    const analysis = calculationResults.sigil_analysis as SigilAnalysis;

    // Core sigil archetypes
    themes.push('The Symbol Maker - Creator of Sacred Geometry');
    themes.push('The Intention Weaver - Bridge Between Worlds');

    // Method-specific archetypes
    if (method === 'traditional') {
      themes.push('The Ancient Scribe - Keeper of Letter Mysteries');
      themes.push('The Geometric Alchemist - Transformer of Word to Symbol');
    } else if (method === 'geometric') {
      themes.push('The Sacred Geometer - Builder of Divine Patterns');
      themes.push('The Cosmic Architect - Designer of Universal Forms');
    } else if (method === 'hybrid') {
      themes.push('The Synthesis Master - Unifier of Approaches');
      themes.push('The Pattern Weaver - Integrator of Systems');
    } else if (method === 'personal') {
      themes.push('The Personal Mystic - Embodier of Individual Power');
      themes.push('The Self-Sovereign - Creator of Personal Reality');
    }

    // Energy flow archetypes
    if (analysis.energy_flow === 'ascending') {
      themes.push('The Ascending Phoenix - Rising Energy Pattern');
    } else if (analysis.energy_flow === 'circular') {
      themes.push('The Eternal Cycle - Continuous Flow Pattern');
    } else if (analysis.energy_flow === 'radiating') {
      themes.push('The Solar Emanator - Outward Expansion Pattern');
    }

    // Manifestation archetypes
    themes.push('The Reality Programmer - Coder of Consciousness');
    themes.push('The Intention Alchemist - Transformer of Desire into Form');

    return themes;
  }

  protected _calculateConfidence(calculationResults: Record<string, any>, input: SigilForgeInput): number {
    let confidence = 0.85; // Base confidence for sigil generation

    // Increase confidence for traditional methods
    if (calculationResults.method_used === 'traditional') {
      confidence += 0.05;
    }

    // Increase confidence for clear, focused intentions
    if (input.intention.length >= 10 && input.intention.length <= 50) {
      confidence += 0.05;
    }

    // Slight reduction for complex hybrid methods
    if (calculationResults.method_used === 'hybrid') {
      confidence -= 0.05;
    }

    return Math.min(confidence, 0.95);
  }

  public async calculate(input: SigilForgeInput): Promise<SigilForgeOutput> {
    const calculationResults = await this._calculate(input);
    
    const interpretation = this._interpret(calculationResults, input);
    const recommendations = this._generateRecommendations(calculationResults, input);
    const realityPatches = this._generateRealityPatches(calculationResults, input);
    const archetypalThemes = this._identifyArchetypalThemes(calculationResults, input);
    const confidence = this._calculateConfidence(calculationResults, input);

    const output: SigilForgeOutput = {
      sigil_composition: calculationResults.sigil_composition,
      sigil_analysis: calculationResults.sigil_analysis,
      method_used: calculationResults.method_used,
      unique_letters: calculationResults.unique_letters,
      letter_numbers: calculationResults.letter_numbers,
      activation_guidance: calculationResults.activation_guidance,
      symbolic_meaning: this.generateSymbolicMeaning(calculationResults),
      elemental_correspondences: calculationResults.elemental_correspondences,
      planetary_influences: calculationResults.planetary_influences,
      sigil_description: this.generateSigilDescription(calculationResults),
      
      // Base engine outputs
      interpretation,
      recommendations,
      reality_patches: realityPatches,
      archetypal_themes: archetypalThemes,
      confidence,
      timestamp: new Date().toISOString()
    };

    return output;
  }

  private generateSymbolicMeaning(results: Record<string, any>): string {
    const composition = results.sigil_composition as SigilComposition;
    const method = results.method_used;
    
    let meaning = `This sigil represents the crystallization of your intention "${results.intention}" into symbolic form. `;
    
    if (method === 'traditional') {
      meaning += "Through the traditional letter elimination process, the linguistic essence of your desire has been distilled into pure geometric expression.";
    } else if (method === 'geometric') {
      meaning += "Sacred geometric forms provide the foundation, connecting your intention to universal patterns and cosmic harmonies.";
    } else if (method === 'hybrid') {
      meaning += "The fusion of traditional and geometric approaches creates a multidimensional symbol that operates on both personal and universal levels.";
    } else if (method === 'personal') {
      meaning += "Personal elements integrated into the design make this a uniquely powerful tool for your individual manifestation work.";
    }
    
    meaning += ` With ${composition.elements.length} symbolic elements, it serves as a bridge between conscious intention and unconscious manifestation.`;
    
    return meaning;
  }

  private generateSigilDescription(results: Record<string, any>): string {
    const composition = results.sigil_composition as SigilComposition;
    const analysis = results.sigil_analysis as SigilAnalysis;
    
    let description = `A ${composition.symmetry_type} sigil composed of ${composition.elements.length} geometric elements. `;
    description += `The design exhibits ${analysis.energy_flow} energy flow with ${analysis.dominant_shapes.join(' and ')} as the primary forms. `;
    description += `Complexity level: ${(analysis.complexity_score * 100).toFixed(0)}%, `;
    description += `Balance score: ${(analysis.balance_score * 100).toFixed(0)}%. `;
    
    if (analysis.symmetry_score > 0.7) {
      description += "The high symmetry creates a harmonious and stable energy pattern.";
    } else {
      description += "The asymmetric design provides dynamic and flexible energy expression.";
    }
    
    return description;
  }
}
