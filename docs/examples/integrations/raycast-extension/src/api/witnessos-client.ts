// Note: In a real Raycast extension, import from @raycast/api
// For documentation purposes, we'll define the interfaces
interface Toast {
  Style: {
    Success: string;
    Failure: string;
  };
}

interface ToastOptions {
  style: string;
  title: string;
  message: string;
}

// Mock functions for documentation - replace with actual @raycast/api imports
const showToast = async (options: ToastOptions): Promise<void> => {
  console.log('Toast:', options);
};

const getPreferenceValues = <T>(): T => {
  // In real implementation, this would get values from Raycast preferences
  return {} as T;
};

const Toast = {
  Style: {
    Success: 'success',
    Failure: 'failure'
  }
};

interface Preferences {
  apiToken: string;
  apiBaseUrl: string;
  fullName: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  processingTime?: number;
  cached?: boolean;
  requestId?: string;
}

interface EngineCalculationRequest {
  input: Record<string, any>;
  options?: {
    useCache?: boolean;
    saveProfile?: boolean;
  };
}

interface WorkflowRequest {
  userProfile: {
    fullName: string;
    birthDate: string;
    birthTime?: string;
    birthLocation?: string;
  };
  intention: string;
}

interface NumerologyResult {
  life_path: number;
  expression: number;
  soul_urge: number;
  personality: number;
  interpretation: {
    life_path_meaning: string;
    expression_meaning: string;
    soul_urge_meaning: string;
    personality_meaning: string;
  };
}

interface TarotResult {
  cards: Array<{
    name: string;
    suit: string;
    position: string;
    meaning: string;
    reversed: boolean;
  }>;
  spread_type: string;
  interpretation: {
    overall_message: string;
    detailed_interpretation: string;
  };
}

interface BiorhythmResult {
  physical: {
    value: number;
    phase: string;
    description: string;
  };
  emotional: {
    value: number;
    phase: string;
    description: string;
  };
  intellectual: {
    value: number;
    phase: string;
    description: string;
  };
  interpretation: {
    overall_energy: string;
    recommendations: string[];
  };
}

interface IChingResult {
  hexagram: {
    number: number;
    name: string;
    chinese_name: string;
    trigrams: {
      upper: string;
      lower: string;
    };
  };
  interpretation: {
    judgment: string;
    image: string;
    guidance: string;
  };
  changing_lines?: Array<{
    line: number;
    meaning: string;
  }>;
}

interface WorkflowResult {
  workflow_type: string;
  engines_used: string[];
  results: Record<string, any>;
  synthesis: {
    summary: string;
    detailed_interpretation: string;
    key_insights: string[];
    recommendations: string[];
  };
}

export class WitnessOSAPI {
  private baseUrl: string;
  private token: string;
  private userProfile: {
    fullName: string;
    birthDate: string;
    birthTime?: string;
    birthLocation?: string;
  };

  constructor(config?: {
    baseUrl?: string;
    token?: string;
    userProfile?: {
      fullName: string;
      birthDate: string;
      birthTime?: string;
      birthLocation?: string;
    };
  }) {
    if (config) {
      // Direct configuration for non-Raycast usage
      this.baseUrl = config.baseUrl || "https://api.witnessos.space";
      this.token = config.token || "";
      this.userProfile = config.userProfile || {
        fullName: "",
        birthDate: ""
      };
    } else {
      // Raycast preferences (when used in actual extension)
      const preferences = getPreferenceValues<Preferences>();
      this.baseUrl = preferences.apiBaseUrl || "https://api.witnessos.space";
      this.token = preferences.apiToken || "";
      this.userProfile = {
        fullName: preferences.fullName || "",
        birthDate: preferences.birthDate || "",
        birthTime: preferences.birthTime,
        birthLocation: preferences.birthLocation,
      };
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      
      await showToast({
        style: Toast.Style.Failure,
        title: "API Request Failed",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      });
      
      throw error;
    }
  }

  // Health and System Methods
  async healthCheck(): Promise<APIResponse> {
    return this.makeRequest("/health");
  }

  async listEngines(): Promise<APIResponse> {
    return this.makeRequest("/engines");
  }

  async getEngineMetadata(engineName: string): Promise<APIResponse> {
    return this.makeRequest(`/engines/${engineName}/metadata`);
  }

  // Individual Engine Methods
  async calculateNumerology(
    customInput?: Partial<{ birth_date: string; full_name: string; birth_name: string }>
  ): Promise<APIResponse<NumerologyResult>> {
    const input = {
      birth_date: this.userProfile.birthDate,
      full_name: this.userProfile.fullName,
      ...customInput,
    };

    return this.makeRequest("/engines/numerology/calculate", {
      method: "POST",
      body: JSON.stringify({ input, options: { useCache: true } }),
    });
  }

  async getTarotReading(
    question: string,
    spreadType: string = "three_card",
    deck: string = "rider_waite"
  ): Promise<APIResponse<TarotResult>> {
    const input = {
      question,
      spread_type: spreadType,
      deck,
    };

    return this.makeRequest("/engines/tarot/calculate", {
      method: "POST",
      body: JSON.stringify({ input }),
    });
  }

  async calculateBiorhythm(
    targetDate?: string,
    daysAhead: number = 7
  ): Promise<APIResponse<BiorhythmResult>> {
    const input = {
      birth_date: this.userProfile.birthDate,
      target_date: targetDate || new Date().toISOString().split('T')[0],
      days_ahead: daysAhead,
    };

    return this.makeRequest("/engines/biorhythm/calculate", {
      method: "POST",
      body: JSON.stringify({ input, options: { useCache: true } }),
    });
  }

  async consultIChing(
    question: string,
    method: string = "coins",
    includeChangingLines: boolean = true
  ): Promise<APIResponse<IChingResult>> {
    const input = {
      question,
      method,
      includeChangingLines,
    };

    return this.makeRequest("/engines/iching/calculate", {
      method: "POST",
      body: JSON.stringify({ input }),
    });
  }

  async calculateHumanDesign(): Promise<APIResponse> {
    if (!this.userProfile.birthTime || !this.userProfile.birthLocation) {
      throw new Error("Birth time and location are required for Human Design calculations");
    }

    const input = {
      birth_date: this.userProfile.birthDate,
      birth_time: this.userProfile.birthTime,
      birth_location: this.userProfile.birthLocation,
      includeChannels: true,
      includeGates: true,
    };

    return this.makeRequest("/engines/human_design/calculate", {
      method: "POST",
      body: JSON.stringify({ input, options: { useCache: true } }),
    });
  }

  // Workflow Methods
  async getDailyGuidance(
    intention: string = "guidance for today and optimal energy management"
  ): Promise<APIResponse<WorkflowResult>> {
    const request: WorkflowRequest = {
      userProfile: this.userProfile,
      intention,
    };

    return this.makeRequest("/workflows/daily", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getNatalAnalysis(
    intention: string = "understanding my life purpose and spiritual path"
  ): Promise<APIResponse<WorkflowResult>> {
    const request: WorkflowRequest = {
      userProfile: this.userProfile,
      intention,
    };

    return this.makeRequest("/workflows/natal", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getCareerGuidance(
    intention: string = "finding my ideal career path and life purpose"
  ): Promise<APIResponse<WorkflowResult>> {
    const request: WorkflowRequest = {
      userProfile: this.userProfile,
      intention,
    };

    return this.makeRequest("/workflows/career", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getSpiritualGuidance(
    intention: string = "deepening my spiritual practice and understanding"
  ): Promise<APIResponse<WorkflowResult>> {
    const request: WorkflowRequest = {
      userProfile: this.userProfile,
      intention,
    };

    return this.makeRequest("/workflows/spiritual", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getRelationshipInsights(
    intention: string = "understanding my relationship patterns and compatibility"
  ): Promise<APIResponse<WorkflowResult>> {
    const request: WorkflowRequest = {
      userProfile: this.userProfile,
      intention,
    };

    return this.makeRequest("/workflows/relationships", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // AI-Enhanced Methods
  async getAIEnhancedReading(
    engineName: string,
    input: Record<string, any>,
    focusArea?: string,
    personalContext?: string
  ): Promise<APIResponse> {
    const aiConfig = {
      model: "anthropic/claude-3-sonnet",
      temperature: 0.7,
      focusArea: focusArea || "spiritual development",
      personalContext: personalContext || "seeking deeper understanding",
    };

    return this.makeRequest(`/engines/${engineName}/ai-enhanced`, {
      method: "POST",
      body: JSON.stringify({ input, aiConfig }),
    });
  }

  async synthesizeResults(
    results: Array<{ engine: string; data: any }>,
    userContext?: {
      currentChallenge?: string;
      goals?: string[];
    }
  ): Promise<APIResponse> {
    return this.makeRequest("/ai/synthesis", {
      method: "POST",
      body: JSON.stringify({ results, userContext }),
    });
  }

  // Batch Processing
  async batchCalculate(
    calculations: Array<{
      engine: string;
      input: Record<string, any>;
    }>,
    parallel: boolean = true
  ): Promise<APIResponse> {
    return this.makeRequest("/batch", {
      method: "POST",
      body: JSON.stringify({
        calculations,
        options: { parallel, useCache: true },
      }),
    });
  }

  // Utility Methods
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  validateUserProfile(): boolean {
    return !!(this.userProfile.fullName && this.userProfile.birthDate);
  }

  getUserProfile() {
    return this.userProfile;
  }

  updateUserProfile(updates: Partial<typeof this.userProfile>) {
    this.userProfile = { ...this.userProfile, ...updates };
  }
}

export default WitnessOSAPI;