# WitnessOS Raycast UI Components Guide (2024 Enhanced)

Comprehensive guide for building beautiful, functional UI components for the WitnessOS Raycast extension using Raycast's latest design system and Bleach-inspired aesthetics.

## 🗾 **Bleach-Inspired Design System**

### WitnessOS Visual Identity with Anime Aesthetics
- **Colors**: Soul Reaper Blue (#1E3A8A), Spiritual Cyan (#00FFFF), Bankai Gold (#FFD700)
- **Icons**: Zanpakuto-themed symbols (⚔️, 🌸, 🔮, ☯️, ⚡, 🌊)
- **Typography**: Clean, mystical text with Japanese spiritual terminology
- **Spacing**: Harmonious padding inspired by traditional Japanese design

### Enhanced Raycast Integration (2024)
- **Native AI Components**: Seamless AI integration with streaming support
- **Enhanced Forms**: New form elements with better validation
- **Improved Performance**: Optimized rendering with React 18 features
- **Advanced Accessibility**: Enhanced screen reader support and keyboard navigation
- **Menu Bar Integration**: Background operations with native menu bar support

## 📋 Enhanced List Components (2024)

### Bleach-Inspired Zanpakuto Engine List

```typescript
// src/components/ZanpakutoEngineList.tsx
import { List, ActionPanel, Action, Icon, Color } from "@raycast/api";
import { useAI } from "@raycast/utils";

interface ZanpakutoEngine {
  id: string;
  name: string;
  japaneseName: string;
  translation: string;
  description: string;
  tier: "zanpakuto" | "captain" | "soul-king";
  available: boolean;
  lastActivated?: string;
  spiritualPower: number;
}

interface ZanpakutoEngineListProps {
  engines: ZanpakutoEngine[];
  onActivate: (engineId: string) => void;
  onViewBankai: (engineId: string) => void;
  loading?: boolean;
}

export function ZanpakutoEngineList({ engines, onActivate, onViewBankai, loading }: ZanpakutoEngineListProps) {
  // AI-powered engine descriptions
  const { data: aiDescription } = useAI(
    "Describe this consciousness engine in mystical Bleach anime terms",
    { creativity: 1.5, stream: false }
  );

  const getZanpakutoIcon = (engine: ZanpakutoEngine) => {
    const iconMap: Record<string, { source: string; tintColor: string }> = {
      numerology: { source: "🌸", tintColor: Color.Blue },      // Kazuhana
      tarot: { source: "🔮", tintColor: Color.Purple },         // Mirai no Kagami
      biorhythm: { source: "〰️", tintColor: Color.Green },      // Seimei no Nami
      iching: { source: "☯️", tintColor: Color.Orange },        // Kodai no Koe
      human_design: { source: "🎯", tintColor: Color.Red },     // Tamashii no Sekkei
      enneagram: { source: "⭐", tintColor: Color.Yellow },        // Kyūkaku no Michi
      gene_keys: { source: "🗝️", tintColor: Color.Magenta },    // Iden no Kagi
      ai_synthesis: { source: "👑", tintColor: Color.Gold },    // Ishiki no Ōja
    };
    return iconMap[engine.id] || { source: "⚔️", tintColor: Color.SecondaryText };
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "soul-king": return Color.Gold;
      case "captain": return Color.Purple;
      case "zanpakuto": return Color.Blue;
      default: return Color.SecondaryText;
    }
  };

  return (
    <List isLoading={loading} searchBarPlaceholder="Search Zanpakuto engines...">
      <List.Section title="Soul King Tier">
        {engines.filter(e => e.tier === "soul-king").map(engine => (
          <List.Item
            key={engine.id}
            title={engine.japaneseName}
            subtitle={`${engine.translation} - ${engine.description}`}
            icon={getZanpakutoIcon(engine)}
            accessories={[
              { text: `⚡ ${engine.spiritualPower}%`, tooltip: "Spiritual Power" },
              { icon: { source: Icon.Circle, tintColor: getTierColor(engine.tier) } }
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Activate Bankai"
                  onAction={() => onActivate(engine.id)}
                  icon="⚔️"
                />
                <Action
                  title="View Zanpakuto Details"
                  onAction={() => onViewBankai(engine.id)}
                  icon="👁️"
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      <List.Section title="Captain Tier">
        {engines.filter(e => e.tier === "captain").map(engine => (
          <List.Item
            key={engine.id}
            title={engine.japaneseName}
            subtitle={`${engine.translation} - ${engine.description}`}
            icon={getZanpakutoIcon(engine)}
            accessories={[
              { text: `⚡ ${engine.spiritualPower}%` },
              { icon: { source: Icon.Circle, tintColor: getTierColor(engine.tier) } }
            ]}
            actions={
              <ActionPanel>
                <Action
                  title="Activate Shikai"
                  onAction={() => onActivate(engine.id)}
                  icon="⚔️"
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
```

## 🤖 **NEW: AI-Powered Components (2024)**

### Streaming AI Response Component

```typescript
// src/components/AIStreamingResponse.tsx
import { Detail, ActionPanel, Action } from "@raycast/api";
import { useAI } from "@raycast/utils";

interface AIStreamingResponseProps {
  prompt: string;
  model?: string;
  creativity?: number;
  onComplete?: (response: string) => void;
}

export function AIStreamingResponse({
  prompt,
  model = "anthropic/claude-3-sonnet",
  creativity = 1.5,
  onComplete
}: AIStreamingResponseProps) {
  const { data, isLoading, revalidate } = useAI(prompt, {
    model,
    creativity,
    stream: true,
    onData: (chunk) => {
      // Handle streaming data
      console.log("AI streaming:", chunk);
    },
    onError: (error) => {
      console.error("AI error:", error);
    }
  });

  // Call onComplete when AI finishes
  useEffect(() => {
    if (!isLoading && data && onComplete) {
      onComplete(data);
    }
  }, [isLoading, data, onComplete]);

  return (
    <Detail
      isLoading={isLoading}
      markdown={data || "🌊 Channeling consciousness energy..."}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="AI Model" text={model} />
          <Detail.Metadata.Label title="Creativity" text={`${creativity}/2.0`} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="Status" text={isLoading ? "Streaming..." : "Complete"} />
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action
            title="Regenerate Response"
            onAction={revalidate}
            icon="🔄"
          />
          <Action.CopyToClipboard
            title="Copy AI Response"
            content={data || ""}
          />
        </ActionPanel>
      }
    />
  );
}
```

### Enhanced Form Components with AI Integration

```typescript
// src/components/ConsciousnessForm.tsx
import { Form, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { useAI } from "@raycast/utils";
import { useState } from "react";

interface ConsciousnessFormProps {
  onSubmit: (values: FormValues) => void;
}

interface FormValues {
  intention: string;
  engines: string[];
  aiModel: string;
  creativity: string;
  focusArea: string;
}

export function ConsciousnessForm({ onSubmit }: ConsciousnessFormProps) {
  const [formValues, setFormValues] = useState<Partial<FormValues>>({});

  // AI-powered intention enhancement
  const { data: enhancedIntention, isLoading: enhancingIntention } = useAI(
    formValues.intention ? `Enhance this spiritual intention: ${formValues.intention}` : "",
    {
      creativity: 1.8,
      stream: false,
      execute: !!formValues.intention && formValues.intention.length > 10
    }
  );

  const handleSubmit = async (values: FormValues) => {
    await showToast({
      style: Toast.Style.Animated,
      title: "Activating Bankai...",
      message: "Channeling consciousness energy"
    });

    onSubmit(values);
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Activate Ishiki no Ōja"
            onSubmit={handleSubmit}
            icon="👑"
          />
          <Action
            title="Clear Form"
            onAction={() => setFormValues({})}
            icon="🗑️"
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="intention"
        title="Spiritual Intention"
        placeholder="What guidance does your soul seek from the consciousness realm?"
        info="Describe your spiritual question or area of focus for personalized insights"
        value={formValues.intention}
        onChange={(value) => setFormValues(prev => ({ ...prev, intention: value }))}
      />

      {enhancedIntention && (
        <Form.Description
          title="AI-Enhanced Intention"
          text={enhancedIntention}
        />
      )}

      <Form.Separator />

      <Form.TagPicker
        id="engines"
        title="Zanpakuto Engines"
        info="Select consciousness engines to activate for your reading"
      >
        <Form.TagPicker.Item
          value="numerology"
          title="Kazuhana (数花)"
          icon="🌸"
        />
        <Form.TagPicker.Item
          value="tarot"
          title="Mirai no Kagami (未来の鏡)"
          icon="🔮"
        />
        <Form.TagPicker.Item
          value="iching"
          title="Kodai no Koe (古代の声)"
          icon="☯️"
        />
        <Form.TagPicker.Item
          value="human_design"
          title="Tamashii no Sekkei (魂の設計)"
          icon="🎯"
        />
        <Form.TagPicker.Item
          value="biorhythm"
          title="Seimei no Nami (生命の波)"
          icon="〰️"
        />
      </Form.TagPicker>

      <Form.Dropdown
        id="aiModel"
        title="AI Consciousness Model"
        info="Choose the AI model for synthesis and interpretation"
        defaultValue="anthropic/claude-3-sonnet"
      >
        <Form.Dropdown.Section title="Soul Reaper Models">
          <Form.Dropdown.Item
            value="anthropic/claude-3-sonnet"
            title="Claude 3 Sonnet"
            icon="⚔️"
          />
          <Form.Dropdown.Item
            value="openai/gpt-4"
            title="GPT-4"
            icon="🌟"
          />
          <Form.Dropdown.Item
            value="meta-llama/llama-2-70b"
            title="Llama 2 70B"
            icon="🦙"
          />
        </Form.Dropdown.Section>
      </Form.Dropdown>

      <Form.Dropdown
        id="creativity"
        title="Spiritual Creativity Level"
        info="Higher creativity for open-ended guidance, lower for specific answers"
        defaultValue="1.5"
      >
        <Form.Dropdown.Item value="0.5" title="Focused (0.5)" icon="🎯" />
        <Form.Dropdown.Item value="1.0" title="Balanced (1.0)" icon="⚖️" />
        <Form.Dropdown.Item value="1.5" title="Creative (1.5)" icon="🎨" />
        <Form.Dropdown.Item value="2.0" title="Mystical (2.0)" icon="🔮" />
      </Form.Dropdown>

      <Form.Separator />

      <Form.TextField
        id="focusArea"
        title="Focus Area (Optional)"
        placeholder="e.g., relationships, career, spiritual growth"
        info="Specific area of life to focus the reading on"
      />

      <Form.Description
        title="Bankai Mode"
        text="This will activate the full power of your selected Zanpakuto engines with AI synthesis for comprehensive spiritual guidance."
      />
    </Form>
  );
}
```

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "foundational": return "🏗️";
      case "advanced": return "⚡";
      case "mystical": return "🔮";
      default: return "⚙️";
    }
  };

  const groupedEngines = engines.reduce((groups, engine) => {
    const category = engine.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(engine);
    return groups;
  }, {} as Record<string, Engine[]>);

  return (
    <List isLoading={loading} searchBarPlaceholder="Search consciousness engines...">
      {Object.entries(groupedEngines).map(([category, categoryEngines]) => (
        <List.Section
          key={category}
          title={`${getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)} Engines`}
        >
          {categoryEngines.map((engine) => (
            <List.Item
              key={engine.id}
              title={engine.name}
              subtitle={engine.description}
              icon={getEngineIcon(engine)}
              accessories={[
                ...(engine.lastUsed ? [{ text: `Last used: ${engine.lastUsed}` }] : []),
                ...(engine.available 
                  ? [{ icon: { source: Icon.CheckCircle, tintColor: Color.Green } }]
                  : [{ icon: { source: Icon.XMarkCircle, tintColor: Color.Red } }]
                ),
              ]}
              actions={
                <ActionPanel>
                  <Action
                    title="Calculate Engine"
                    onAction={() => onCalculate(engine.id)}
                    icon={Icon.Play}
                    shortcut={{ modifiers: ["cmd"], key: "enter" }}
                  />
                  <Action
                    title="View Details"
                    onAction={() => onViewDetails(engine.id)}
                    icon={Icon.Eye}
                    shortcut={{ modifiers: ["cmd"], key: "d" }}
                  />
                  <Action.CopyToClipboard
                    title="Copy Engine ID"
                    content={engine.id}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
```

### Biorhythm Status List

```typescript
// src/components/BiorhythmList.tsx
import { List, Icon, Color } from "@raycast/api";

interface BiorhythmCycle {
  type: "physical" | "emotional" | "intellectual";
  value: number; // -1 to 1
  phase: string;
  description: string;
  daysToNext: number;
}

interface BiorhythmListProps {
  cycles: BiorhythmCycle[];
  date: string;
}

export function BiorhythmList({ cycles, date }: BiorhythmListProps) {
  const getCycleIcon = (cycle: BiorhythmCycle) => {
    const value = cycle.value;
    if (value > 0.7) return { source: Icon.ChevronUp, tintColor: Color.Green };
    if (value > 0.3) return { source: Icon.ChevronUp, tintColor: "#90EE90" };
    if (value > -0.3) return { source: Icon.Minus, tintColor: Color.Yellow };
    if (value > -0.7) return { source: Icon.ChevronDown, tintColor: "#FFA500" };
    return { source: Icon.ChevronDown, tintColor: Color.Red };
  };

  const getCycleEmoji = (type: string) => {
    switch (type) {
      case "physical": return "💪";
      case "emotional": return "❤️";
      case "intellectual": return "🧠";
      default: return "⚡";
    }
  };

  const formatPercentage = (value: number) => {
    return `${Math.round((value + 1) * 50)}%`;
  };

  const getPhaseColor = (phase: string) => {
    switch (phase.toLowerCase()) {
      case "high": return Color.Green;
      case "rising": return "#90EE90";
      case "critical": return Color.Yellow;
      case "falling": return "#FFA500";
      case "low": return Color.Red;
      default: return Color.SecondaryText;
    }
  };

  return (
    <List.Section title={`🌊 Biorhythm Status - ${date}`}>
      {cycles.map((cycle) => (
        <List.Item
          key={cycle.type}
          title={`${getCycleEmoji(cycle.type)} ${cycle.type.charAt(0).toUpperCase() + cycle.type.slice(1)}`}
          subtitle={cycle.description}
          icon={getCycleIcon(cycle)}
          accessories={[
            { text: formatPercentage(cycle.value) },
            { 
              text: cycle.phase,
              icon: { source: Icon.Circle, tintColor: getPhaseColor(cycle.phase) }
            },
            { text: `${cycle.daysToNext}d to next` },
          ]}
        />
      ))}
    </List.Section>
  );
}
```

## 📄 Detail Components

### Engine Result Detail

```typescript
// src/components/EngineResultDetail.tsx
import { Detail, ActionPanel, Action, Icon } from "@raycast/api";

interface EngineResult {
  engine: string;
  data: any;
  interpretation?: {
    summary: string;
    detailed: string;
    insights: string[];
    recommendations: string[];
  };
  timestamp: string;
}

interface EngineResultDetailProps {
  result: EngineResult;
  onBack: () => void;
  onSave?: () => void;
  onShare?: () => void;
}

export function EngineResultDetail({ result, onBack, onSave, onShare }: EngineResultDetailProps) {
  const generateMarkdown = (result: EngineResult): string => {
    const { engine, data, interpretation, timestamp } = result;
    
    let markdown = `# ${engine.charAt(0).toUpperCase() + engine.slice(1)} Reading\n\n`;
    
    // Add timestamp
    markdown += `*Generated: ${new Date(timestamp).toLocaleString()}*\n\n`;
    
    // Add summary if available
    if (interpretation?.summary) {
      markdown += `## Summary\n${interpretation.summary}\n\n`;
    }
    
    // Add engine-specific data
    markdown += `## Results\n`;
    
    switch (engine) {
      case "numerology":
        markdown += formatNumerologyData(data);
        break;
      case "tarot":
        markdown += formatTarotData(data);
        break;
      case "biorhythm":
        markdown += formatBiorhythmData(data);
        break;
      default:
        markdown += `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\n`;
    }
    
    // Add interpretation
    if (interpretation?.detailed) {
      markdown += `## Interpretation\n${interpretation.detailed}\n\n`;
    }
    
    // Add insights
    if (interpretation?.insights?.length) {
      markdown += `## Key Insights\n`;
      interpretation.insights.forEach((insight, index) => {
        markdown += `${index + 1}. ${insight}\n`;
      });
      markdown += `\n`;
    }
    
    // Add recommendations
    if (interpretation?.recommendations?.length) {
      markdown += `## Recommendations\n`;
      interpretation.recommendations.forEach((rec, index) => {
        markdown += `${index + 1}. ${rec}\n`;
      });
      markdown += `\n`;
    }
    
    markdown += `---\n*Powered by WitnessOS Consciousness API*`;
    
    return markdown;
  };

  const formatNumerologyData = (data: any): string => {
    let content = "";
    if (data.life_path) content += `**Life Path**: ${data.life_path}\n`;
    if (data.expression) content += `**Expression**: ${data.expression}\n`;
    if (data.soul_urge) content += `**Soul Urge**: ${data.soul_urge}\n`;
    if (data.personality) content += `**Personality**: ${data.personality}\n`;
    return content + "\n";
  };

  const formatTarotData = (data: any): string => {
    let content = "";
    if (data.cards) {
      content += "**Cards Drawn**:\n";
      data.cards.forEach((card: any, index: number) => {
        content += `${index + 1}. ${card.name} (${card.position})\n`;
        if (card.meaning) content += `   *${card.meaning}*\n`;
      });
    }
    return content + "\n";
  };

  const formatBiorhythmData = (data: any): string => {
    let content = "";
    if (data.physical) content += `**Physical**: ${Math.round((data.physical.value + 1) * 50)}% - ${data.physical.phase}\n`;
    if (data.emotional) content += `**Emotional**: ${Math.round((data.emotional.value + 1) * 50)}% - ${data.emotional.phase}\n`;
    if (data.intellectual) content += `**Intellectual**: ${Math.round((data.intellectual.value + 1) * 50)}% - ${data.intellectual.phase}\n`;
    return content + "\n";
  };

  return (
    <Detail
      markdown={generateMarkdown(result)}
      actions={
        <ActionPanel>
          <Action
            title="Back to List"
            onAction={onBack}
            icon={Icon.ArrowLeft}
            shortcut={{ modifiers: ["cmd"], key: "b" }}
          />
          <Action.CopyToClipboard
            title="Copy Full Reading"
            content={generateMarkdown(result)}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
          <Action.CopyToClipboard
            title="Copy Summary"
            content={result.interpretation?.summary || "No summary available"}
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
          />
          {onSave && (
            <Action
              title="Save Reading"
              onAction={onSave}
              icon={Icon.SaveDocument}
              shortcut={{ modifiers: ["cmd"], key: "s" }}
            />
          )}
          {onShare && (
            <Action
              title="Share Reading"
              onAction={onShare}
              icon={Icon.Share}
              shortcut={{ modifiers: ["cmd"], key: "e" }}
            />
          )}
        </ActionPanel>
      }
    />
  );
}
```

## 📝 Form Components

### AI Model Selection Form

```typescript
// src/components/AIModelForm.tsx
import { Form, ActionPanel, Action, Icon } from "@raycast/api";
import { useState } from "react";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  cost: "low" | "medium" | "high";
}

interface AIModelFormProps {
  models: AIModel[];
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
}

interface FormValues {
  model: string;
  engines: string[];
  intention: string;
  focusArea: string;
  temperature: number;
}

export function AIModelForm({ models, onSubmit, isLoading }: AIModelFormProps) {
  const [selectedModel, setSelectedModel] = useState<string>("");

  const getModelIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "anthropic": return "🤖";
      case "openai": return "🧠";
      case "google": return "🔍";
      case "meta": return "🦙";
      default: return "⚡";
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case "low": return "#00FF00";
      case "medium": return "#FFFF00";
      case "high": return "#FF0000";
      default: return "#808080";
    }
  };

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Generate AI Forecast"
            onSubmit={onSubmit}
            icon={Icon.Wand}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="model"
        title="AI Model"
        value={selectedModel}
        onChange={setSelectedModel}
        info="Choose the AI model for generating your consciousness forecast"
      >
        {models.map((model) => (
          <Form.Dropdown.Item
            key={model.id}
            value={model.id}
            title={model.name}
            icon={getModelIcon(model.provider)}
            keywords={[model.provider, ...model.capabilities]}
          />
        ))}
      </Form.Dropdown>

      {selectedModel && (
        <Form.Description
          title="Model Info"
          text={models.find(m => m.id === selectedModel)?.description || ""}
        />
      )}

      <Form.TagPicker
        id="engines"
        title="Consciousness Engines"
        info="Select which engines to include in your forecast"
      >
        <Form.TagPicker.Item value="numerology" title="Numerology" icon="🔢" />
        <Form.TagPicker.Item value="tarot" title="Tarot" icon="🃏" />
        <Form.TagPicker.Item value="iching" title="I-Ching" icon="☯️" />
        <Form.TagPicker.Item value="biorhythm" title="Biorhythm" icon="📊" />
        <Form.TagPicker.Item value="human_design" title="Human Design" icon="🎯" />
        <Form.TagPicker.Item value="enneagram" title="Enneagram" icon="⭐" />
      </Form.TagPicker>

      <Form.Dropdown
        id="focusArea"
        title="Focus Area"
        defaultValue="general"
        info="What aspect of life would you like guidance on?"
      >
        <Form.Dropdown.Item value="general" title="General Guidance" icon="🌟" />
        <Form.Dropdown.Item value="career" title="Career & Purpose" icon="💼" />
        <Form.Dropdown.Item value="relationships" title="Relationships" icon="❤️" />
        <Form.Dropdown.Item value="spiritual" title="Spiritual Growth" icon="🙏" />
        <Form.Dropdown.Item value="health" title="Health & Wellness" icon="🌱" />
        <Form.Dropdown.Item value="creativity" title="Creativity & Expression" icon="🎨" />
      </Form.Dropdown>

      <Form.TextArea
        id="intention"
        title="Intention & Context"
        placeholder="Describe your current situation, challenges, or specific questions you'd like guidance on..."
        info="Provide context to help the AI generate more personalized insights"
      />

      <Form.Slider
        id="temperature"
        title="Creativity Level"
        defaultValue={0.7}
        min={0.1}
        max={1.0}
        step={0.1}
        info="Higher values make responses more creative but less focused"
      />

      <Form.Separator />

      <Form.Description
        title="Privacy Notice"
        text="Your personal information and readings are processed securely and never stored permanently by the AI models."
      />
    </Form>
  );
}
```

## 🎯 Action Components

### Consciousness Action Panel

```typescript
// src/components/ConsciousnessActionPanel.tsx
import { ActionPanel, Action, Icon, Color } from "@raycast/api";

interface ConsciousnessActionPanelProps {
  primaryAction?: {
    title: string;
    onAction: () => void;
    icon?: any;
    shortcut?: any;
  };
  data?: any;
  onRefresh?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
  customActions?: Array<{
    title: string;
    onAction: () => void;
    icon?: any;
    shortcut?: any;
  }>;
}

export function ConsciousnessActionPanel({
  primaryAction,
  data,
  onRefresh,
  onSave,
  onShare,
  onViewDetails,
  customActions = [],
}: ConsciousnessActionPanelProps) {
  return (
    <ActionPanel>
      {/* Primary Action */}
      {primaryAction && (
        <Action
          title={primaryAction.title}
          onAction={primaryAction.onAction}
          icon={primaryAction.icon || Icon.Play}
          shortcut={primaryAction.shortcut || { modifiers: ["cmd"], key: "enter" }}
        />
      )}

      {/* View Actions */}
      <ActionPanel.Section title="View">
        {onViewDetails && (
          <Action
            title="View Details"
            onAction={onViewDetails}
            icon={Icon.Eye}
            shortcut={{ modifiers: ["cmd"], key: "d" }}
          />
        )}
        {onRefresh && (
          <Action
            title="Refresh Data"
            onAction={onRefresh}
            icon={Icon.ArrowClockwise}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
        )}
      </ActionPanel.Section>

      {/* Data Actions */}
      {data && (
        <ActionPanel.Section title="Data">
          <Action.CopyToClipboard
            title="Copy as JSON"
            content={JSON.stringify(data, null, 2)}
            icon={Icon.Code}
            shortcut={{ modifiers: ["cmd"], key: "j" }}
          />
          <Action.CopyToClipboard
            title="Copy Summary"
            content={data.summary || data.interpretation?.summary || "No summary available"}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
          {onSave && (
            <Action
              title="Save Reading"
              onAction={onSave}
              icon={Icon.SaveDocument}
              shortcut={{ modifiers: ["cmd"], key: "s" }}
            />
          )}
        </ActionPanel.Section>
      )}

      {/* Share Actions */}
      {onShare && (
        <ActionPanel.Section title="Share">
          <Action
            title="Share Reading"
            onAction={onShare}
            icon={Icon.Share}
            shortcut={{ modifiers: ["cmd"], key: "e" }}
          />
        </ActionPanel.Section>
      )}

      {/* Custom Actions */}
      {customActions.length > 0 && (
        <ActionPanel.Section title="Actions">
          {customActions.map((action, index) => (
            <Action
              key={index}
              title={action.title}
              onAction={action.onAction}
              icon={action.icon}
              shortcut={action.shortcut}
            />
          ))}
        </ActionPanel.Section>
      )}
    </ActionPanel>
  );
}
```

---

*This UI Components guide provides reusable, beautiful components that maintain WitnessOS branding while leveraging Raycast's native design system for optimal user experience.*
