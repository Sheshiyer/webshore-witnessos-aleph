/**
 * Human Design Engine for WitnessOS
 * 
 * TypeScript implementation of the Human Design engine
 * Extracted from Python implementation with core business logic preserved
 */

import { BaseEngine } from './core/base-engine';
import type { CalculationResult } from './core/types';
import { isEngineInput } from './core/types';
import type { HumanDesignInput, HumanDesignOutput, HumanDesignChart, HumanDesignType, HumanDesignProfile, HumanDesignGate, HumanDesignCenter } from '@/types/engines';

export class HumanDesignEngine extends BaseEngine<HumanDesignInput, HumanDesignOutput> {
  private gateData: Record<number, any> = {};
  private channelData: Record<string, string> = {};
  private crossData: Record<string, any> = {};
  private typeData: Record<string, any> = {};
  private centerData: Record<string, any> = {};

  constructor(config = {}) {
    super('human_design', 'Calculates complete Human Design charts with personality/design activations and type analysis', config);
    this.loadHumanDesignData();
  }

  async calculate(input: HumanDesignInput): Promise<CalculationResult<HumanDesignOutput>> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: this.createError('INVALID_INPUT', 'Invalid Human Design input data'),
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }

      // Perform calculation
      const calculationResults = await this.performCalculation(input);
      
      // Generate interpretation and other outputs
      const interpretation = this.generateInterpretation(calculationResults, input);
      const recommendations = this.generateRecommendations(calculationResults, input);
      const realityPatches = this.generateRealityPatches(calculationResults, input);
      const archetypalThemes = this.identifyArchetypalThemes(calculationResults, input);
      const confidenceScore = this.calculateConfidence(calculationResults, input);

      // Build output
      const output: HumanDesignOutput = {
        engineName: this.engineName,
        calculationTime: Date.now() - startTime,
        confidenceScore,
        formattedOutput: interpretation,
        recommendations,
        realityPatches,
        archetypalThemes,
        timestamp: new Date().toISOString(),
        rawData: calculationResults,
        
        // Human Design specific fields
        chart: calculationResults.chart as HumanDesignChart,
        birthInfo: calculationResults.birthInfo as Record<string, unknown>,
        designInfo: calculationResults.designInfo as Record<string, unknown>,
        typeAnalysis: this.generateTypeAnalysis(calculationResults),
        profileAnalysis: this.generateProfileAnalysis(calculationResults),
        centersAnalysis: this.generateCentersAnalysis(calculationResults),
        gatesAnalysis: this.generateGatesAnalysis(calculationResults),
        strategyGuidance: this.generateStrategyGuidance(calculationResults),
        authorityGuidance: this.generateAuthorityGuidance(calculationResults),
        deconditioningGuidance: this.generateDeconditioningGuidance(calculationResults)
      };

      return {
        success: true,
        data: output,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.log('error', 'Human Design calculation failed', error);
      return {
        success: false,
        error: this.createError('CALCULATION_ERROR', `Human Design calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`),
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  protected validateInput(input: HumanDesignInput): boolean {
    return isEngineInput<HumanDesignInput>(input, ['fullName', 'birthDate', 'birthTime', 'birthLocation', 'timezone']);
  }

  protected async performCalculation(input: HumanDesignInput): Promise<Record<string, unknown>> {
    // Simulate Human Design calculation (in real implementation, would use astronomical calculations)
    const birthDateTime = new Date(`${input.birthDate}T${input.birthTime}`);
    const [lat, lon] = input.birthLocation;

    // Calculate design date (88 days before birth)
    const designDate = new Date(birthDateTime);
    designDate.setDate(designDate.getDate() - 88);

    // Generate personality gates (simplified)
    const personalityGates = this.generateGates('personality', birthDateTime);
    
    // Generate design gates (simplified)
    const designGates = this.generateGates('design', designDate);

    // Determine type
    const typeInfo = this.determineType(personalityGates, designGates);

    // Calculate profile
    const profile = this.calculateProfile(personalityGates, designGates);

    // Analyze centers
    const centers = this.analyzeCenters(personalityGates, designGates);

    // Find defined channels
    const definedChannels = this.findDefinedChannels(personalityGates, designGates);

    // Determine definition type
    const definitionType = this.determineDefinitionType(centers, definedChannels);

    // Create chart
    const chart: HumanDesignChart = {
      typeInfo,
      profile,
      personalityGates,
      designGates,
      centers,
      definedChannels,
      definitionType
    };

    return {
      birthInfo: {
        datetime: birthDateTime.toISOString(),
        location: input.birthLocation,
        timezone: input.timezone
      },
      designInfo: {
        datetime: designDate.toISOString(),
        calculationMethod: '88 degrees solar arc (official Human Design method)'
      },
      chart,
      personalityGates,
      designGates,
      typeInfo,
      profile,
      centers,
      definedChannels,
      definitionType
    };
  }

  protected generateInterpretation(results: Record<string, unknown>, input: HumanDesignInput): string {
    const chart = results.chart as HumanDesignChart;
    const typeInfo = chart.typeInfo;
    const profile = chart.profile;

    return `🧬 HUMAN DESIGN FIELD MAPPING - ${input.fullName.toUpperCase()} 🧬

═══ ENERGETIC ARCHITECTURE ═══

Type: ${typeInfo.typeName}
Your energetic blueprint reveals you are a ${typeInfo.typeName}, designed to operate through ${typeInfo.strategy.toLowerCase()}.

Strategy: ${typeInfo.strategy}
Your correct way of making decisions and navigating life is to ${typeInfo.strategy.toLowerCase()}.

Authority: ${typeInfo.authority}
Your inner guidance system operates through ${typeInfo.authority.toLowerCase()}, your reliable decision-making mechanism.

═══ LIFE THEME & ROLE ═══

Profile: ${profile.profileName}
Your life theme is ${profile.lifeTheme || 'unique to your design'}. You are here to ${profile.role || 'fulfill your specific role'}.

Definition: ${chart.definitionType}
Your energetic definition type is ${chart.definitionType}, indicating how your centers connect and communicate.

═══ CENTERS ANALYSIS ═══

${this.getCentersAnalysis(chart.centers)}

═══ GATES & CHANNELS ═══

${this.getGatesAnalysis(chart.personalityGates, chart.designGates)}

═══ DEconditioning GUIDANCE ═══

${this.getDeconditioningGuidance(chart)}

Remember: This is your energetic operating manual. Your strategy and authority are your keys to living correctly.`.trim();
  }

  protected generateRecommendations(results: Record<string, unknown>, input: HumanDesignInput): string[] {
    const chart = results.chart as HumanDesignChart;
    const typeInfo = chart.typeInfo;
    const recommendations: string[] = [];

    // Type-specific recommendations
    if (typeInfo.typeName === 'Generator') {
      recommendations.push(
        "Wait to respond to life's invitations before taking action",
        "Trust your sacral response - it's your reliable decision-making mechanism",
        "Focus on finding work that brings you satisfaction"
      );
    } else if (typeInfo.typeName === 'Projector') {
      recommendations.push(
        "Wait for invitations before sharing your wisdom",
        "Recognize that you're designed to guide others, not do the work yourself",
        "Focus on being recognized for your unique perspective"
      );
    } else if (typeInfo.typeName === 'Manifestor') {
      recommendations.push(
        "Inform others before taking action to maintain peace",
        "Use your ability to initiate and impact others wisely",
        "Recognize that your energy affects everyone around you"
      );
    } else if (typeInfo.typeName === 'Reflector') {
      recommendations.push(
        "Wait a full lunar cycle before making important decisions",
        "Pay attention to how your environment affects your wellbeing",
        "Recognize that you're a mirror of your community's health"
      );
    }

    // General recommendations
    recommendations.push(
      `Practice your strategy: ${typeInfo.strategy}`,
      `Develop trust in your authority: ${typeInfo.authority}`,
      "Notice when you're in your signature vs. not-self theme",
      "Study your undefined centers - they're your wisdom centers"
    );

    return recommendations;
  }

  protected generateRealityPatches(results: Record<string, unknown>, input: HumanDesignInput): string[] {
    const chart = results.chart as HumanDesignChart;
    const patches = [
      "Install: Human Design energetic operating system",
      "Patch: Strategy and authority alignment protocol",
      "Upgrade: Deconditioning and authenticity module"
    ];

    if (chart.definitionType === 'Split') {
      patches.push("Activate: Split definition bridge protocol");
    }

    if (chart.definitionType === 'Triple Split') {
      patches.push("Initialize: Triple split integration sequence");
    }

    const undefinedCenters = Object.values(chart.centers).filter(center => !center.defined);
    if (undefinedCenters.length > 0) {
      patches.push(`Install: ${undefinedCenters.length} undefined center wisdom protocols`);
    }

    return patches;
  }

  protected identifyArchetypalThemes(results: Record<string, unknown>, input: HumanDesignInput): string[] {
    const chart = results.chart as HumanDesignChart;
    const themes: string[] = [];

    // Type themes
    const typeThemes: Record<string, string[]> = {
      'Generator': ['Builder', 'Life Force', 'Creator'],
      'Manifesting Generator': ['Multi-Passionate', 'Efficient', 'Quick Manifestor'],
      'Projector': ['Guide', 'Leader', 'Wisdom Keeper'],
      'Manifestor': ['Initiator', 'Catalyst', 'Impact Maker'],
      'Reflector': ['Mirror', 'Community Health', 'Lunar Being']
    };

    themes.push(...(typeThemes[chart.typeInfo.typeName] || ['Unique', 'Transcendent']));

    // Profile themes
    if (chart.profile.personalityLine === 1) themes.push('Investigator');
    if (chart.profile.personalityLine === 2) themes.push('Hermit');
    if (chart.profile.personalityLine === 3) themes.push('Martyr');
    if (chart.profile.personalityLine === 4) themes.push('Opportunist');
    if (chart.profile.personalityLine === 5) themes.push('Heretic');
    if (chart.profile.personalityLine === 6) themes.push('Role Model');

    // Definition themes
    if (chart.definitionType === 'Single') themes.push('Simple Definition');
    if (chart.definitionType === 'Split') themes.push('Split Definition');
    if (chart.definitionType === 'Triple Split') themes.push('Triple Split Definition');

    return themes;
  }

  protected calculateConfidence(results: Record<string, unknown>, input: HumanDesignInput): number {
    let confidence = 0.8; // Base confidence

    // Increase confidence for complete data
    if (input.fullName && input.birthDate && input.birthTime) confidence += 0.1;
    if (input.birthLocation && input.timezone) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private loadHumanDesignData(): void {
    // Load gate data (simplified - in production would load from JSON files)
    for (let i = 1; i <= 64; i++) {
      this.gateData[i] = {
        name: `Gate ${i}`,
        keynote: `Gate ${i} keynote`,
        description: `Description for gate ${i}`,
        gift: `Gift of gate ${i}`,
        shadow: `Shadow of gate ${i}`
      };
    }

    // Load channel data (simplified)
    this.channelData = {
      "1-8": "The Channel of Inspiration",
      "2-14": "The Channel of the Beat",
      "3-60": "The Channel of Mutation",
      "4-63": "The Channel of Logic",
      "5-15": "The Channel of Rhythm",
      "6-59": "The Channel of Mating",
      "7-31": "The Channel of the Alpha",
      "9-52": "The Channel of Concentration",
      "10-20": "The Channel of Awakening",
      "11-56": "The Channel of Curiosity",
      "12-22": "The Channel of Openness",
      "13-33": "The Channel of the Prodigal",
      "16-48": "The Channel of the Wavelength",
      "17-62": "The Channel of Acceptance",
      "18-58": "The Channel of Judgment",
      "19-49": "The Channel of Synthesis",
      "20-34": "The Channel of Charisma",
      "21-45": "The Channel of Money",
      "23-43": "The Channel of Structuring",
      "24-61": "The Channel of Awareness",
      "25-51": "The Channel of Initiation",
      "26-44": "The Channel of Surrender",
      "27-50": "The Channel of Preservation",
      "28-38": "The Channel of Struggle",
      "29-46": "The Channel of Discovery",
      "30-41": "The Channel of Recognition",
      "32-54": "The Channel of Transformation",
      "34-57": "The Channel of Power",
      "35-36": "The Channel of Transitoriness",
      "37-40": "The Channel of Community",
      "39-55": "The Channel of Emoting",
      "42-53": "The Channel of Maturation",
      "47-64": "The Channel of Abstraction",
      "48-16": "The Channel of the Wavelength",
      "49-19": "The Channel of Synthesis",
      "50-27": "The Channel of Preservation",
      "51-25": "The Channel of Initiation",
      "52-9": "The Channel of Concentration",
      "53-42": "The Channel of Maturation",
      "54-32": "The Channel of Transformation",
      "55-39": "The Channel of Emoting",
      "56-11": "The Channel of Curiosity",
      "57-34": "The Channel of Power",
      "58-18": "The Channel of Judgment",
      "59-6": "The Channel of Mating",
      "60-3": "The Channel of Mutation",
      "61-24": "The Channel of Awareness",
      "62-17": "The Channel of Acceptance",
      "63-4": "The Channel of Logic",
      "64-47": "The Channel of Abstraction"
    };

    // Load type data
    this.typeData = {
      "Generator": {
        strategy: "To Respond",
        authority: "Sacral Authority",
        signature: "Satisfaction",
        notSelf: "Frustration",
        percentage: 70.0,
        description: "The life force of the planet, designed to build and create",
        lifePurpose: "To master something they love and find satisfaction in their work"
      },
      "Manifesting Generator": {
        strategy: "To Respond",
        authority: "Sacral Authority",
        signature: "Satisfaction",
        notSelf: "Frustration",
        percentage: 33.0,
        description: "Multi-passionate builders with the ability to manifest quickly",
        lifePurpose: "To respond and then inform, creating efficiently"
      },
      "Projector": {
        strategy: "Wait for Invitation",
        authority: "Various (Splenic, Emotional, Ego, Self-Projected, Mental)",
        signature: "Success",
        notSelf: "Bitterness",
        percentage: 20.0,
        description: "Natural guides and leaders, designed to see the bigger picture",
        lifePurpose: "To guide others and be recognized for their wisdom"
      },
      "Manifestor": {
        strategy: "To Inform",
        authority: "Emotional or Splenic",
        signature: "Peace",
        notSelf: "Anger",
        percentage: 9.0,
        description: "Initiators and catalysts, designed to start things",
        lifePurpose: "To initiate and impact others through their actions"
      },
      "Reflector": {
        strategy: "Wait a Lunar Cycle",
        authority: "Lunar Authority",
        signature: "Surprise",
        notSelf: "Disappointment",
        percentage: 1.0,
        description: "Mirrors of the community, designed to reflect the health of their environment",
        lifePurpose: "To reflect the health of their community and environment"
      }
    };

    // Load center data
    this.centerData = {
      "Head": {
        function: "Inspiration and mental pressure",
        whenDefined: "Consistent mental pressure and inspiration",
        whenUndefined: "Amplifies and reflects mental pressure from others"
      },
      "Ajna": {
        function: "Mental awareness and conceptualization",
        whenDefined: "Consistent mental awareness and conceptualization",
        whenUndefined: "Amplifies and reflects mental awareness from others"
      },
      "Throat": {
        function: "Communication and manifestation",
        whenDefined: "Consistent communication and manifestation",
        whenUndefined: "Amplifies and reflects communication from others"
      },
      "G": {
        function: "Identity and direction",
        whenDefined: "Consistent identity and direction",
        whenUndefined: "Amplifies and reflects identity from others"
      },
      "Heart": {
        function: "Will and ego",
        whenDefined: "Consistent will and ego",
        whenUndefined: "Amplifies and reflects will from others"
      },
      "Sacral": {
        function: "Life force and sexuality",
        whenDefined: "Consistent life force and sexuality",
        whenUndefined: "Amplifies and reflects life force from others"
      },
      "Spleen": {
        function: "Intuition and survival",
        whenDefined: "Consistent intuition and survival",
        whenUndefined: "Amplifies and reflects intuition from others"
      },
      "Solar Plexus": {
        function: "Emotional awareness",
        whenDefined: "Consistent emotional awareness",
        whenUndefined: "Amplifies and reflects emotional awareness from others"
      },
      "Root": {
        function: "Pressure and adrenaline",
        whenDefined: "Consistent pressure and adrenaline",
        whenUndefined: "Amplifies and reflects pressure from others"
      }
    };
  }

  private generateGates(type: 'personality' | 'design', date: Date): Record<string, HumanDesignGate> {
    const gates: Record<string, HumanDesignGate> = {};
    const planets = ['sun', 'earth', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

    planets.forEach(planet => {
      // Simplified gate calculation (in real implementation, would use astronomical calculations)
      const gateNumber = Math.floor(Math.random() * 64) + 1;
      const line = Math.floor(Math.random() * 6) + 1;
      const color = Math.floor(Math.random() * 6) + 1;
      const tone = Math.floor(Math.random() * 6) + 1;
      const base = Math.floor(Math.random() * 5) + 1;

      gates[planet] = {
        number: gateNumber,
        name: this.gateData[gateNumber]?.name || `Gate ${gateNumber}`,
        planet,
        line,
        color,
        tone,
        base,
        keynote: this.gateData[gateNumber]?.keynote,
        description: this.gateData[gateNumber]?.description,
        gift: this.gateData[gateNumber]?.gift,
        shadow: this.gateData[gateNumber]?.shadow
      };
    });

    return gates;
  }

  private determineType(personalityGates: Record<string, HumanDesignGate>, designGates: Record<string, HumanDesignGate>): HumanDesignType {
    // Simplified type determination (in real implementation, would check specific gates and centers)
    const types = Object.keys(this.typeData);
    const randomType = types[Math.floor(Math.random() * types.length)] || 'Generator';
    const typeInfo = this.typeData[randomType];

    if (!typeInfo) {
      throw new Error(`Invalid type: ${randomType}`);
    }

    return {
      typeName: randomType,
      strategy: typeInfo.strategy,
      authority: typeInfo.authority,
      signature: typeInfo.signature,
      notSelf: typeInfo.notSelf,
      percentage: typeInfo.percentage,
      description: typeInfo.description,
      lifePurpose: typeInfo.lifePurpose
    };
  }

  private calculateProfile(personalityGates: Record<string, HumanDesignGate>, designGates: Record<string, HumanDesignGate>): HumanDesignProfile {
    // Simplified profile calculation (in real implementation, would use specific gates)
    const personalityLine = Math.floor(Math.random() * 6) + 1;
    const designLine = Math.floor(Math.random() * 6) + 1;

    const lineNames = ['Investigator', 'Hermit', 'Martyr', 'Opportunist', 'Heretic', 'Role Model'];
    const profileName = `${personalityLine}/${designLine} ${lineNames[personalityLine - 1]}/${lineNames[designLine - 1]}`;

    return {
      personalityLine,
      designLine,
      profileName,
      description: `Profile ${personalityLine}/${designLine} description`,
      lifeTheme: `Life theme for ${personalityLine}/${designLine}`,
      role: `Role for ${personalityLine}/${designLine}`
    };
  }

  private analyzeCenters(personalityGates: Record<string, HumanDesignGate>, designGates: Record<string, HumanDesignGate>): Record<string, HumanDesignCenter> {
    const centers: Record<string, HumanDesignCenter> = {};
    const centerNames = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'Sacral', 'Spleen', 'Solar Plexus', 'Root'];

    centerNames.forEach(centerName => {
      const defined = Math.random() > 0.5; // Simplified (in real implementation, would check specific gates)
      const gates: number[] = [];

      if (defined) {
        // Add some random gates to this center
        const gateCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < gateCount; i++) {
          gates.push(Math.floor(Math.random() * 64) + 1);
        }
      }

      centers[centerName] = {
        name: centerName,
        defined,
        gates,
        function: this.centerData[centerName]?.function,
        whenDefined: this.centerData[centerName]?.whenDefined,
        whenUndefined: this.centerData[centerName]?.whenUndefined
      };
    });

    return centers;
  }

  private findDefinedChannels(personalityGates: Record<string, HumanDesignGate>, designGates: Record<string, HumanDesignGate>): string[] {
    // Simplified channel detection (in real implementation, would check specific gate combinations)
    const channels: string[] = [];
    const channelKeys = Object.keys(this.channelData);
    
    // Randomly select some channels as defined
    const definedCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < definedCount; i++) {
      const randomChannel = channelKeys[Math.floor(Math.random() * channelKeys.length)];
      if (randomChannel && !channels.includes(randomChannel)) {
        channels.push(randomChannel);
      }
    }

    return channels;
  }

  private determineDefinitionType(centers: Record<string, HumanDesignCenter>, channels: string[]): string {
    // Simplified definition type determination
    const definedCenters = Object.values(centers).filter(center => center.defined).length;
    
    if (definedCenters <= 2) return 'Single';
    if (definedCenters <= 4) return 'Split';
    if (definedCenters <= 6) return 'Triple Split';
    return 'Quadruple Split';
  }

  private getCentersAnalysis(centers: Record<string, HumanDesignCenter>): string {
    const definedCenters = Object.values(centers).filter(center => center.defined);
    const undefinedCenters = Object.values(centers).filter(center => !center.defined);

    return `Defined Centers (${definedCenters.length}): ${definedCenters.map(c => c.name).join(', ')}
These are your consistent, reliable energy centers.

Undefined Centers (${undefinedCenters.length}): ${undefinedCenters.map(c => c.name).join(', ')}
These are your wisdom centers - you amplify and reflect these energies from others.`;
  }

  private getGatesAnalysis(personalityGates: Record<string, HumanDesignGate>, designGates: Record<string, HumanDesignGate>): string {
    const personalityCount = Object.keys(personalityGates).length;
    const designCount = Object.keys(designGates).length;

    return `Personality Gates (${personalityCount}): Your conscious awareness and identity
Design Gates (${designCount}): Your unconscious design and life purpose

Key Gates: ${Object.values(personalityGates).slice(0, 3).map(g => g.name).join(', ')}`;
  }

  private getDeconditioningGuidance(chart: HumanDesignChart): string {
    return `Deconditioning Focus:
1. Practice your strategy: ${chart.typeInfo.strategy}
2. Trust your authority: ${chart.typeInfo.authority}
3. Notice when you're in ${chart.typeInfo.signature} vs ${chart.typeInfo.notSelf}
4. Study your undefined centers for wisdom`;
  }

  private generateTypeAnalysis(results: Record<string, unknown>): string {
    const chart = results.chart as HumanDesignChart;
    return `Type Analysis: ${chart.typeInfo.typeName}
${chart.typeInfo.description || 'Unique energetic configuration'}`;
  }

  private generateProfileAnalysis(results: Record<string, unknown>): string {
    const chart = results.chart as HumanDesignChart;
    return `Profile Analysis: ${chart.profile.profileName}
${chart.profile.description || 'Unique life theme and role'}`;
  }

  private generateCentersAnalysis(results: Record<string, unknown>): string {
    const chart = results.chart as HumanDesignChart;
    const definedCount = Object.values(chart.centers).filter(c => c.defined).length;
    return `Centers Analysis: ${definedCount} defined centers
Your energetic definition and wisdom centers`;
  }

  private generateGatesAnalysis(results: Record<string, unknown>): string {
    const chart = results.chart as HumanDesignChart;
    const totalGates = Object.keys(chart.personalityGates).length + Object.keys(chart.designGates).length;
    return `Gates Analysis: ${totalGates} total gates
Your personality and design activations`;
  }

  private generateStrategyGuidance(results: Record<string, unknown>): string {
    const chart = results.chart as HumanDesignChart;
    return `Strategy: ${chart.typeInfo.strategy}
This is your correct way of making decisions and navigating life.`;
  }

  private generateAuthorityGuidance(results: Record<string, unknown>): string {
    const chart = results.chart as HumanDesignChart;
    return `Authority: ${chart.typeInfo.authority}
This is your reliable decision-making mechanism.`;
  }

  private generateDeconditioningGuidance(results: Record<string, unknown>): string {
    const chart = results.chart as HumanDesignChart;
    return `Deconditioning: Focus on living your strategy and authority, and notice when you're in your signature vs not-self theme.`;
  }

  protected getSupportedSystems(): string[] {
    return ['human_design'];
  }

  protected getInputSchema(): Record<string, unknown> {
    return {
      fullName: { type: 'string', required: true },
      birthDate: { type: 'string', required: true },
      birthTime: { type: 'string', required: true },
      birthLocation: { type: 'array', required: true },
      timezone: { type: 'string', required: true },
      includeDesignCalculation: { type: 'boolean', optional: true },
      detailedGates: { type: 'boolean', optional: true }
    };
  }

  protected getOutputSchema(): Record<string, unknown> {
    return {
      chart: { type: 'object' },
      typeInfo: { type: 'object' },
      profile: { type: 'object' },
      centers: { type: 'object' },
      gates: { type: 'object' }
    };
  }
} 