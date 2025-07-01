/**
 * Vimshottari Dasha Timeline Mapper Engine for WitnessOS
 * 
 * Calculates Vedic astrology Dasha periods using astronomical data.
 * Provides current and future planetary periods with timing and interpretation.
 * 
 * Ported from Python reference implementation with simplified astronomical calculations.
 */

import { BaseEngine } from './core/base-engine';
import type { BaseEngineInput, BaseEngineOutput } from './core/types';

// Vimshottari Input Interface
export interface VimshottariInput extends BaseEngineInput {
  birth_date: string; // ISO date string
  birth_time: string; // HH:MM format
  birth_location: [number, number]; // [latitude, longitude]
  timezone?: string; // Default to UTC
  current_date?: string; // ISO date string, defaults to today
  include_sub_periods?: boolean; // Include Antardasha and Pratyantardasha
  years_forecast?: number; // 1-50 years forecast
}

// Dasha Period Interface
export interface DashaPeriod {
  planet: string;
  period_type: 'Mahadasha' | 'Antardasha' | 'Pratyantardasha';
  start_date: string;
  end_date: string;
  duration_years: number;
  is_current?: boolean;
  is_upcoming?: boolean;
  general_theme: string;
  opportunities: string[];
  challenges: string[];
  recommendations: string[];
}

// Nakshatra Information Interface
export interface NakshatraInfo {
  name: string;
  pada: number; // 1-4
  ruling_planet: string;
  degrees_in_nakshatra: number;
  symbol: string;
  deity: string;
  nature: string;
  meaning: string;
  characteristics: string[];
}

// Dasha Timeline Interface
export interface DashaTimeline {
  birth_nakshatra: NakshatraInfo;
  current_mahadasha: DashaPeriod;
  current_antardasha?: DashaPeriod;
  current_pratyantardasha?: DashaPeriod;
  all_mahadashas: DashaPeriod[];
  upcoming_periods: DashaPeriod[];
  life_phase_analysis: string;
  karmic_themes: string[];
}

// Vimshottari Output Interface
export interface VimshottariOutput extends BaseEngineOutput {
  timeline: DashaTimeline;
  birth_info: Record<string, any>;
  calculation_date: string;
  current_period_analysis: string;
  upcoming_opportunities: string;
  karmic_guidance: string;
  favorable_periods: string[];
  challenging_periods: string[];
}

export class VimshottariEngine extends BaseEngine<VimshottariInput, VimshottariOutput> {
  public readonly name = 'vimshottari';
  public readonly description = 'Calculates Vedic astrology Dasha periods and timeline with karmic guidance';

  protected validateInput(input: VimshottariInput): boolean {
    return !!(input.birth_date && input.full_name);
  }

  protected async performCalculation(input: VimshottariInput): Promise<Record<string, unknown>> {
    return this._calculate(input);
  }

  protected generateInterpretation(results: Record<string, unknown>, input: VimshottariInput): string {
    return this._interpret(results, input);
  }

  protected generateRecommendations(results: Record<string, unknown>, input: VimshottariInput): string[] {
    return this._generateRecommendations(results, input);
  }

  protected generateRealityPatches(results: Record<string, unknown>, input: VimshottariInput): string[] {
    return this._generateRealityPatches(results, input);
  }

  protected identifyArchetypalThemes(results: Record<string, unknown>, input: VimshottariInput): string[] {
    return this._identifyArchetypalThemes(results, input);
  }

  protected calculateConfidence(results: Record<string, unknown>, input: VimshottariInput): number {
    return this._calculateConfidence(results, input);
  }

  // Vimshottari Dasha periods (in years)
  private readonly DASHA_PERIODS: Record<string, number> = {
    'Ketu': 7,
    'Venus': 20,
    'Sun': 6,
    'Moon': 10,
    'Mars': 7,
    'Rahu': 18,
    'Jupiter': 16,
    'Saturn': 19,
    'Mercury': 17
  };

  // Dasha sequence (120-year cycle)
  private readonly DASHA_SEQUENCE = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];

  // Simplified Nakshatra data (27 lunar mansions)
  private readonly NAKSHATRA_DATA: Record<string, Omit<NakshatraInfo, 'name'|'pada'|'degrees_in_nakshatra'>> = {
    'Ashwini': {
      ruling_planet: 'Ketu',
      symbol: "Horse's head",
      deity: 'Ashwini Kumaras',
      nature: 'Rajas',
      meaning: 'Born of a horse',
      characteristics: ['Quick action', 'Healing abilities', 'Pioneering spirit', 'Impatience']
    },
    'Bharani': {
      ruling_planet: 'Venus',
      symbol: 'Yoni',
      deity: 'Yama',
      nature: 'Rajas', 
      meaning: 'The bearer',
      characteristics: ['Creativity', 'Sexuality', 'Transformation', 'Responsibility']
    },
    'Krittika': {
      ruling_planet: 'Sun',
      symbol: 'Razor or flame',
      deity: 'Agni',
      nature: 'Rajas',
      meaning: 'The cutter',
      characteristics: ['Sharp intellect', 'Purification', 'Leadership', 'Critical nature']
    },
    'Rohini': {
      ruling_planet: 'Moon',
      symbol: 'Ox cart',
      deity: 'Brahma',
      nature: 'Rajas',
      meaning: 'The red one',
      characteristics: ['Beauty', 'Fertility', 'Growth', 'Material success']
    },
    'Mrigashira': {
      ruling_planet: 'Mars',
      symbol: "Deer's head",
      deity: 'Soma',
      nature: 'Tamas',
      meaning: 'Deer head',
      characteristics: ['Searching nature', 'Curiosity', 'Gentleness', 'Restlessness']
    },
    'Ardra': {
      ruling_planet: 'Rahu',
      symbol: 'Teardrop',
      deity: 'Rudra',
      nature: 'Tamas',
      meaning: 'Moist',
      characteristics: ['Emotional intensity', 'Transformation', 'Destruction and renewal', 'Research abilities']
    },
    'Punarvasu': {
      ruling_planet: 'Jupiter',
      symbol: 'Bow and quiver',
      deity: 'Aditi',
      nature: 'Sattva',
      meaning: 'Return of the light',
      characteristics: ['Renewal', 'Optimism', 'Spiritual growth', 'Adaptability']
    },
    'Pushya': {
      ruling_planet: 'Saturn',
      symbol: "Cow's udder",
      deity: 'Brihaspati',
      nature: 'Sattva',
      meaning: 'Nourisher',
      characteristics: ['Nourishment', 'Spirituality', 'Discipline', 'Service']
    }
  };

  // Planet characteristics for interpretation
  private readonly PLANET_CHARACTERISTICS: Record<string, Record<string, any>> = {
    'Sun': {
      nature: 'Leadership and self-expression',
      keywords: ['authority', 'confidence', 'leadership', 'recognition'],
      opportunities: ['Career advancement', 'Government connections', 'Leadership roles'],
      challenges: ['Ego conflicts', 'Authority issues', 'Health problems']
    },
    'Moon': {
      nature: 'Emotions and intuition',
      keywords: ['emotions', 'intuition', 'public relations', 'travel'],
      opportunities: ['Emotional fulfillment', 'Public recognition', 'Travel opportunities'],
      challenges: ['Emotional instability', 'Family issues', 'Mental stress']
    },
    'Mars': {
      nature: 'Energy and action',
      keywords: ['energy', 'courage', 'sports', 'competition'],
      opportunities: ['Physical achievements', 'Military/police success', 'Property acquisition'],
      challenges: ['Accidents', 'Conflicts', 'Health issues', 'Legal troubles']
    },
    'Mercury': {
      nature: 'Communication and intellect',
      keywords: ['communication', 'business', 'writing', 'learning'],
      opportunities: ['Education success', 'Business growth', 'Communication skills'],
      challenges: ['Nervous disorders', 'Business losses', 'Communication problems']
    },
    'Jupiter': {
      nature: 'Wisdom and expansion',
      keywords: ['wisdom', 'spirituality', 'teaching', 'expansion'],
      opportunities: ['Spiritual growth', 'Higher education', 'Teaching opportunities', 'Financial gains'],
      challenges: ['Over-expansion', 'Weight gain', 'Liver problems', 'Excessive optimism']
    },
    'Venus': {
      nature: 'Love and beauty',
      keywords: ['love', 'beauty', 'arts', 'luxury'],
      opportunities: ['Romantic relationships', 'Artistic success', 'Luxury acquisition', 'Social connections'],
      challenges: ['Relationship problems', 'Financial overspending', 'Sensual indulgence']
    },
    'Saturn': {
      nature: 'Discipline and karma',
      keywords: ['discipline', 'karma', 'delays', 'hard work'],
      opportunities: ['Career stability', 'Long-term success', 'Spiritual discipline', 'Property gains'],
      challenges: ['Delays', 'Obstacles', 'Health issues', 'Depression', 'Career setbacks']
    },
    'Rahu': {
      nature: 'Desires and obsessions',
      keywords: ['ambition', 'foreigners', 'technology', 'unconventional'],
      opportunities: ['Foreign opportunities', 'Technology success', 'Unconventional gains', 'Political success'],
      challenges: ['Confusion', 'Deception', 'Addictions', 'Scandals', 'Health mysteries']
    },
    'Ketu': {
      nature: 'Spirituality and detachment',
      keywords: ['spirituality', 'mysticism', 'detachment', 'research'],
      opportunities: ['Spiritual awakening', 'Research success', 'Mystical experiences', 'Liberation'],
      challenges: ['Confusion', 'Isolation', 'Accidents', 'Unexpected events', 'Health issues']
    }
  };

  protected async _calculate(input: VimshottariInput): Promise<Record<string, any>> {
    const birthDate = new Date(input.birth_date);
    const currentDate = input.current_date ? new Date(input.current_date) : new Date();
    const yearsHindForecast = input.years_forecast || 10;
    const includeSubPeriods = input.include_sub_periods !== false;

    // Validate inputs
    this.validateInputs(input);

    // Calculate birth nakshatra (simplified calculation)
    const nakshatraInfo = this.calculateBirthNakshatra(birthDate, input.birth_time, input.birth_location);

    // Calculate Dasha timeline
    const timeline = this.calculateDashaTimeline(birthDate, nakshatraInfo, currentDate);

    // Find current periods
    const currentPeriods = this.findCurrentPeriods(timeline, currentDate, includeSubPeriods);

    // Generate upcoming periods
    const upcomingPeriods = this.generateUpcomingPeriods(timeline, currentDate, yearsHindForecast);

    // Analyze karmic themes
    const karmicThemes = this.analyzeKarmicThemes(currentPeriods, upcomingPeriods);

    return {
      birth_info: {
        date: input.birth_date,
        time: input.birth_time,
        location: input.birth_location,
        timezone: input.timezone || 'UTC'
      },
      calculation_date: currentDate.toISOString().split('T')[0],
      nakshatra_info: nakshatraInfo,
      timeline,
      current_periods: currentPeriods,
      upcoming_periods: upcomingPeriods,
      karmic_themes: karmicThemes
    };
  }

  private validateInputs(input: VimshottariInput): void {
    // Validate birth date
    const birthDate = new Date(input.birth_date);
    if (isNaN(birthDate.getTime())) {
      throw new Error('Invalid birth date format');
    }

    // Validate birth time
    if (!input.birth_time || !/^\d{2}:\d{2}$/.test(input.birth_time)) {
      throw new Error('Birth time must be in HH:MM format');
    }

    // Validate coordinates
    const [lat, lon] = input.birth_location;
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (lon < -180 || lon > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    // Validate forecast years
    if (input.years_forecast && (input.years_forecast < 1 || input.years_forecast > 50)) {
      throw new Error('Years forecast must be between 1 and 50');
    }
  }

  private calculateBirthNakshatra(birthDate: Date, birthTime: string, location: [number, number]): NakshatraInfo {
    // Simplified nakshatra calculation based on birth date
    // In reality, this would require precise astronomical calculations
    
    const dayOfYear = this.getDayOfYear(birthDate);
    const nakshatraIndex = Math.floor(dayOfYear / 365 * 27) % 27;
    
    // Get nakshatra name from simplified list
    const nakshatraNames = Object.keys(this.NAKSHATRA_DATA);
    const nakshatraName = nakshatraNames[nakshatraIndex % nakshatraNames.length] || 'Ashwini';
    
    const nakshatraData = this.NAKSHATRA_DATA[nakshatraName];
    
    // Calculate pada (simplified)
    const pada = (Math.floor(dayOfYear / 91) % 4) + 1;
    
    // Calculate degrees in nakshatra (simplified)
    const degreesInNakshatra = (dayOfYear % 365) / 365 * 13.33; // Each nakshatra spans ~13.33 degrees
    
    return {
      name: nakshatraName,
      pada,
      ruling_planet: nakshatraData.ruling_planet,
      degrees_in_nakshatra: degreesInNakshatra,
      symbol: nakshatraData.symbol,
      deity: nakshatraData.deity,
      nature: nakshatraData.nature,
      meaning: nakshatraData.meaning,
      characteristics: nakshatraData.characteristics
    };
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private calculateDashaTimeline(birthDate: Date, nakshatraInfo: NakshatraInfo, currentDate: Date): DashaPeriod[] {
    const timeline: DashaPeriod[] = [];
    const firstPlanet = nakshatraInfo.ruling_planet;
    const firstPeriodYears = this.DASHA_PERIODS[firstPlanet];

    // Calculate balance of first Mahadasha at birth
    const completedFraction = nakshatraInfo.degrees_in_nakshatra / 13.33;
    const remainingYears = firstPeriodYears * (1 - completedFraction);

    let currentStartDate = new Date(birthDate);

    // Add first (partial) Mahadasha
    const firstEndDate = new Date(currentStartDate);
    firstEndDate.setFullYear(firstEndDate.getFullYear() + remainingYears);

    timeline.push(this.createDashaPeriod(
      firstPlanet,
      'Mahadasha',
      currentStartDate,
      firstEndDate,
      remainingYears
    ));

    currentStartDate = new Date(firstEndDate);

    // Add subsequent complete Mahadashas
    let planetIndex = (this.DASHA_SEQUENCE.indexOf(firstPlanet) + 1) % this.DASHA_SEQUENCE.length;
    let yearsCalculated = remainingYears;

    // Calculate for next 120 years (full cycle)
    while (yearsCalculated < 120) {
      const planet = this.DASHA_SEQUENCE[planetIndex];
      const periodYears = this.DASHA_PERIODS[planet];

      const endDate = new Date(currentStartDate);
      endDate.setFullYear(endDate.getFullYear() + periodYears);

      timeline.push(this.createDashaPeriod(
        planet,
        'Mahadasha',
        currentStartDate,
        endDate,
        periodYears
      ));

      currentStartDate = new Date(endDate);
      yearsCalculated += periodYears;
      planetIndex = (planetIndex + 1) % this.DASHA_SEQUENCE.length;
    }

    return timeline;
  }

  private createDashaPeriod(
    planet: string,
    periodType: 'Mahadasha' | 'Antardasha' | 'Pratyantardasha',
    startDate: Date,
    endDate: Date,
    durationYears: number
  ): DashaPeriod {
    const planetChar = this.PLANET_CHARACTERISTICS[planet] || {};
    
    return {
      planet,
      period_type: periodType,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      duration_years: Math.round(durationYears * 100) / 100,
      general_theme: planetChar.nature || `${planet} period`,
      opportunities: planetChar.opportunities || [],
      challenges: planetChar.challenges || [],
      recommendations: this.generatePeriodRecommendations(planet)
    };
  }

  private generatePeriodRecommendations(planet: string): string[] {
    const recommendations: Record<string, string[]> = {
      'Sun': ['Focus on leadership development', 'Seek positions of authority', 'Pay attention to heart health'],
      'Moon': ['Cultivate emotional intelligence', 'Consider travel opportunities', 'Strengthen family relationships'],
      'Mars': ['Channel energy into physical activities', 'Be cautious with aggression', 'Focus on property matters'],
      'Mercury': ['Enhance communication skills', 'Pursue learning opportunities', 'Focus on business ventures'],
      'Jupiter': ['Pursue higher education', 'Practice spiritual disciplines', 'Teach or mentor others'],
      'Venus': ['Cultivate artistic talents', 'Focus on relationships', 'Enjoy beauty and luxury in moderation'],
      'Saturn': ['Practice discipline and patience', 'Focus on long-term goals', 'Serve others selflessly'],
      'Rahu': ['Embrace innovation and technology', 'Be cautious of illusions', 'Consider foreign opportunities'],
      'Ketu': ['Focus on spiritual practices', 'Practice detachment', 'Engage in research and investigation']
    };

    return recommendations[planet] || [`Make the most of ${planet} period energy`];
  }

  private findCurrentPeriods(timeline: DashaPeriod[], currentDate: Date, includeSubPeriods: boolean): Record<string, DashaPeriod> {
    const currentPeriods: Record<string, DashaPeriod> = {};

    // Find current Mahadasha
    for (const period of timeline) {
      const startDate = new Date(period.start_date);
      const endDate = new Date(period.end_date);
      
      if (startDate <= currentDate && currentDate <= endDate) {
        period.is_current = true;
        currentPeriods.mahadasha = period;
        break;
      }
    }

    if (includeSubPeriods && currentPeriods.mahadasha) {
      // Calculate current Antardasha (simplified)
      const mahadasha = currentPeriods.mahadasha;
      const antardasha = this.calculateCurrentAntardasha(mahadasha, currentDate);
      if (antardasha) {
        currentPeriods.antardasha = antardasha;
      }
    }

    return currentPeriods;
  }

  private calculateCurrentAntardasha(mahadasha: DashaPeriod, currentDate: Date): DashaPeriod | null {
    const mahaDashaPlanet = mahadasha.planet;
    const startIndex = this.DASHA_SEQUENCE.indexOf(mahaDashaPlanet);
    const antardashaSequence = [
      ...this.DASHA_SEQUENCE.slice(startIndex),
      ...this.DASHA_SEQUENCE.slice(0, startIndex)
    ];

    const mahadashaStart = new Date(mahadasha.start_date);
    const mahadashaDuration = mahadasha.duration_years;
    
    // Calculate total antardasha years
    const totalAntardashaYears = antardashaSequence.reduce((sum, planet) => 
      sum + this.DASHA_PERIODS[planet], 0
    );

    let currentStart = new Date(mahadashaStart);

    for (const antarDashaPlanet of antardashaSequence) {
      const antardashaRatio = this.DASHA_PERIODS[antarDashaPlanet] / totalAntardashaYears;
      const antardashaDuration = mahadashaDuration * antardashaRatio;
      
      const antardashaEnd = new Date(currentStart);
      antardashaEnd.setFullYear(antardashaEnd.getFullYear() + antardashaDuration);

      if (currentStart <= currentDate && currentDate <= antardashaEnd) {
        return this.createDashaPeriod(
          antarDashaPlanet,
          'Antardasha',
          currentStart,
          antardashaEnd,
          antardashaDuration
        );
      }

      currentStart = new Date(antardashaEnd);
    }

    return null;
  }

  private generateUpcomingPeriods(timeline: DashaPeriod[], currentDate: Date, yearsAhead: number): DashaPeriod[] {
    const futureDate = new Date(currentDate);
    futureDate.setFullYear(futureDate.getFullYear() + yearsAhead);

    return timeline.filter(period => {
      const startDate = new Date(period.start_date);
      return startDate > currentDate && startDate <= futureDate;
    }).map(period => ({
      ...period,
      is_upcoming: true
    }));
  }

  private analyzeKarmicThemes(currentPeriods: Record<string, DashaPeriod>, upcomingPeriods: DashaPeriod[]): string[] {
    const themes: string[] = [];

    // Current period themes
    if (currentPeriods.mahadasha) {
      const planet = currentPeriods.mahadasha.planet;
      themes.push(`Current ${planet} Mahadasha emphasizes ${this.PLANET_CHARACTERISTICS[planet]?.nature || 'planetary energy'}`);
    }

    if (currentPeriods.antardasha) {
      const planet = currentPeriods.antardasha.planet;
      themes.push(`${planet} Antardasha brings focus on ${this.PLANET_CHARACTERISTICS[planet]?.keywords?.join(', ') || 'specific energies'}`);
    }

    // Upcoming themes
    if (upcomingPeriods.length > 0) {
      const nextMajorPeriod = upcomingPeriods.find(p => p.period_type === 'Mahadasha');
      if (nextMajorPeriod) {
        themes.push(`Upcoming ${nextMajorPeriod.planet} period will focus on ${this.PLANET_CHARACTERISTICS[nextMajorPeriod.planet]?.nature || 'new themes'}`);
      }
    }

    return themes;
  }

  protected _interpret(calculationResults: Record<string, any>, input: VimshottariInput): string {
    const nakshatraInfo = calculationResults.nakshatra_info as NakshatraInfo;
    const currentPeriods = calculationResults.current_periods as Record<string, DashaPeriod>;
    const upcomingPeriods = calculationResults.upcoming_periods as DashaPeriod[];

    return `
🌙 VIMSHOTTARI DASHA TIMELINE - ${calculationResults.calculation_date} 🌙

═══ BIRTH NAKSHATRA ANALYSIS ═══

Birth Nakshatra: ${nakshatraInfo.name} (Pada ${nakshatraInfo.pada})
Ruling Planet: ${nakshatraInfo.ruling_planet}
Symbol: ${nakshatraInfo.symbol}
Deity: ${nakshatraInfo.deity}
Nature: ${nakshatraInfo.nature}
Meaning: ${nakshatraInfo.meaning}

Nakshatra Characteristics:
${nakshatraInfo.characteristics.map(char => `• ${char}`).join('\n')}

═══ CURRENT PLANETARY PERIODS ═══

${this.formatCurrentPeriods(currentPeriods)}

═══ KARMIC GUIDANCE ═══

${calculationResults.karmic_themes.join('\n')}

═══ UPCOMING SIGNIFICANT PERIODS ═══

${upcomingPeriods.slice(0, 3).map(period => this.formatPeriodSummary(period)).join('\n\n')}

═══ LIFE TIMING WISDOM ═══

The Vimshottari Dasha system reveals the cosmic timing of your karmic unfoldment.
Each planetary period activates specific themes and opportunities in your consciousness.
Work with these energies rather than against them for optimal spiritual growth.

Remember: Dashas are not fate, but rather cosmic weather patterns that influence
the manifestation of your karma. Free will and conscious action remain supreme.
    `.trim();
  }

  private formatCurrentPeriods(currentPeriods: Record<string, DashaPeriod>): string {
    let formatted = '';

    if (currentPeriods.mahadasha) {
      const period = currentPeriods.mahadasha;
      formatted += `🔥 MAHADASHA: ${period.planet} (${period.start_date} to ${period.end_date})\n`;
      formatted += `Duration: ${period.duration_years} years\n`;
      formatted += `Theme: ${period.general_theme}\n`;
      formatted += `Opportunities: ${period.opportunities.join(', ')}\n`;
      formatted += `Challenges: ${period.challenges.join(', ')}\n`;
    }

    if (currentPeriods.antardasha) {
      const period = currentPeriods.antardasha;
      formatted += `\n⚡ ANTARDASHA: ${period.planet} (${period.start_date} to ${period.end_date})\n`;
      formatted += `Theme: ${period.general_theme}\n`;
    }

    return formatted || 'No current periods calculated';
  }

  private formatPeriodSummary(period: DashaPeriod): string {
    return `${period.period_type}: ${period.planet} (${period.start_date} to ${period.end_date})
Theme: ${period.general_theme}
Key Opportunities: ${period.opportunities.slice(0, 2).join(', ')}`;
  }

  protected _generateRecommendations(calculationResults: Record<string, any>, input: VimshottariInput): string[] {
    const currentPeriods = calculationResults.current_periods as Record<string, DashaPeriod>;
    const upcomingPeriods = calculationResults.upcoming_periods as DashaPeriod[];
    const recommendations: string[] = [];

    // Current period recommendations
    if (currentPeriods.mahadasha) {
      recommendations.push(...currentPeriods.mahadasha.recommendations);
    }

    if (currentPeriods.antardasha) {
      recommendations.push(`Focus on ${currentPeriods.antardasha.planet} themes in current sub-period`);
    }

    // Upcoming period preparation
    if (upcomingPeriods.length > 0) {
      const nextPeriod = upcomingPeriods[0];
      recommendations.push(`Prepare for upcoming ${nextPeriod.planet} period by ${nextPeriod.recommendations[0] || 'aligning with planetary energy'}`);
    }

    // General timing advice
    recommendations.push('Work with planetary energies rather than against them');
    recommendations.push('Use challenging periods for inner growth and purification');
    recommendations.push('Maximize favorable periods with conscious action');

    return recommendations;
  }

  protected _generateRealityPatches(calculationResults: Record<string, any>, input: VimshottariInput): string[] {
    const currentPeriods = calculationResults.current_periods as Record<string, DashaPeriod>;
    const nakshatraInfo = calculationResults.nakshatra_info as NakshatraInfo;
    const patches: string[] = [];

    // Nakshatra patches
    patches.push(`${nakshatraInfo.name} nakshatra consciousness activated`);
    patches.push(`${nakshatraInfo.ruling_planet} birth energy field established`);

    // Current period patches
    if (currentPeriods.mahadasha) {
      patches.push(`${currentPeriods.mahadasha.planet} Mahadasha reality field active`);
      patches.push(`Karmic ${currentPeriods.mahadasha.general_theme.toLowerCase()} timeline engaged`);
    }

    if (currentPeriods.antardasha) {
      patches.push(`${currentPeriods.antardasha.planet} Antardasha sub-reality activated`);
    }

    // Vedic timing patches
    patches.push('Vimshottari time matrix synchronized');
    patches.push('Karmic timing awareness enhanced');
    patches.push('Planetary period optimization enabled');

    return patches;
  }

  protected _identifyArchetypalThemes(calculationResults: Record<string, any>, input: VimshottariInput): string[] {
    const currentPeriods = calculationResults.current_periods as Record<string, DashaPeriod>;
    const nakshatraInfo = calculationResults.nakshatra_info as NakshatraInfo;
    const themes: string[] = [];

    // Nakshatra archetypal themes
    themes.push(`${nakshatraInfo.name} - ${nakshatraInfo.meaning}`);
    themes.push(`${nakshatraInfo.deity} Divine Archetype`);

    // Current planetary archetypes
    if (currentPeriods.mahadasha) {
      const planet = currentPeriods.mahadasha.planet;
      themes.push(`${planet} Mahadasha - Planetary Ruler Archetype`);
      
      // Planet-specific archetypes
      const planetArchetypes: Record<string, string> = {
        'Sun': 'The King - Divine Authority and Leadership',
        'Moon': 'The Mother - Nurturing and Intuitive Wisdom',
        'Mars': 'The Warrior - Courage and Action',
        'Mercury': 'The Messenger - Communication and Intelligence',
        'Jupiter': 'The Guru - Wisdom and Spiritual Teaching',
        'Venus': 'The Lover - Beauty and Harmony',
        'Saturn': 'The Sage - Discipline and Karmic Justice',
        'Rahu': 'The Shadow - Desires and Illusions',
        'Ketu': 'The Mystic - Detachment and Spiritual Liberation'
      };
      
      if (planetArchetypes[planet]) {
        themes.push(planetArchetypes[planet]);
      }
    }

    // Life phase archetypes
    themes.push('The Seeker - Following Cosmic Timing');
    themes.push('The Student of Karma - Learning from Planetary Lessons');

    return themes;
  }

  protected _calculateConfidence(calculationResults: Record<string, any>, input: VimshottariInput): number {
    let confidence = 0.75; // Base confidence for simplified astronomical calculations

    // Increase confidence if birth time is provided
    if (input.birth_time) {
      confidence += 0.1;
    }

    // Increase confidence if location is provided
    if (input.birth_location) {
      confidence += 0.1;
    }

    // Reduce confidence for simplified nakshatra calculation
    confidence -= 0.15;

    return Math.min(confidence, 0.85);
  }

  public async calculate(input: VimshottariInput): Promise<VimshottariOutput> {
    const calculationResults = await this._calculate(input);
    
    const interpretation = this._interpret(calculationResults, input);
    const recommendations = this._generateRecommendations(calculationResults, input);
    const realityPatches = this._generateRealityPatches(calculationResults, input);
    const archetypalThemes = this._identifyArchetypalThemes(calculationResults, input);
    const confidence = this._calculateConfidence(calculationResults, input);

    // Create timeline object
    const currentPeriods = calculationResults.current_periods as Record<string, DashaPeriod>;
    const timeline: DashaTimeline = {
      birth_nakshatra: calculationResults.nakshatra_info,
      current_mahadasha: currentPeriods.mahadasha,
      current_antardasha: currentPeriods.antardasha,
      all_mahadashas: calculationResults.timeline.filter((p: DashaPeriod) => p.period_type === 'Mahadasha'),
      upcoming_periods: calculationResults.upcoming_periods,
      life_phase_analysis: this.generateLifePhaseAnalysis(currentPeriods),
      karmic_themes: calculationResults.karmic_themes
    };

    const output: VimshottariOutput = {
      timeline,
      birth_info: calculationResults.birth_info,
      calculation_date: calculationResults.calculation_date,
      current_period_analysis: this.generateCurrentPeriodAnalysis(currentPeriods),
      upcoming_opportunities: this.generateUpcomingOpportunities(calculationResults.upcoming_periods),
      karmic_guidance: this.generateKarmicGuidance(calculationResults.karmic_themes),
      favorable_periods: this.identifyFavorablePeriods(calculationResults.upcoming_periods),
      challenging_periods: this.identifyChallengingPeriods(calculationResults.upcoming_periods),
      
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

  private generateLifePhaseAnalysis(currentPeriods: Record<string, DashaPeriod>): string {
    if (!currentPeriods.mahadasha) return 'Life phase analysis unavailable';
    
    const planet = currentPeriods.mahadasha.planet;
    const theme = this.PLANET_CHARACTERISTICS[planet]?.nature || 'planetary influence';
    
    return `Current life phase emphasizes ${theme}. This is a time to focus on ${planet.toLowerCase()} qualities and embrace the lessons this planetary period offers.`;
  }

  private generateCurrentPeriodAnalysis(currentPeriods: Record<string, DashaPeriod>): string {
    if (!currentPeriods.mahadasha) return 'No current period analysis available';
    
    const maha = currentPeriods.mahadasha;
    let analysis = `Your current ${maha.planet} Mahadasha (${maha.start_date} to ${maha.end_date}) focuses on ${maha.general_theme.toLowerCase()}.`;
    
    if (currentPeriods.antardasha) {
      const antar = currentPeriods.antardasha;
      analysis += ` The ${antar.planet} Antardasha adds emphasis on ${antar.general_theme.toLowerCase()}.`;
    }
    
    return analysis;
  }

  private generateUpcomingOpportunities(upcomingPeriods: DashaPeriod[]): string {
    if (upcomingPeriods.length === 0) return 'Continuing in current period energies';
    
    const nextPeriod = upcomingPeriods[0];
    return `Your next significant period (${nextPeriod.planet} ${nextPeriod.period_type}) begins ${nextPeriod.start_date} and offers opportunities in: ${nextPeriod.opportunities.join(', ')}.`;
  }

  private generateKarmicGuidance(karmicThemes: string[]): string {
    return karmicThemes.length > 0 
      ? `Your current karmic focus involves: ${karmicThemes.join('. ')}. Work with these themes for spiritual growth.`
      : 'Focus on spiritual development and conscious action during this period.';
  }

  private identifyFavorablePeriods(upcomingPeriods: DashaPeriod[]): string[] {
    const favorablePlanets = ['Jupiter', 'Venus', 'Moon', 'Mercury'];
    return upcomingPeriods
      .filter(period => favorablePlanets.includes(period.planet))
      .slice(0, 3)
      .map(period => `${period.planet} ${period.period_type} (${period.start_date})`);
  }

  private identifyChallengingPeriods(upcomingPeriods: DashaPeriod[]): string[] {
    const challengingPlanets = ['Saturn', 'Rahu', 'Ketu', 'Mars'];
    return upcomingPeriods
      .filter(period => challengingPlanets.includes(period.planet))
      .slice(0, 3)
      .map(period => `${period.planet} ${period.period_type} (${period.start_date})`);
  }
}
