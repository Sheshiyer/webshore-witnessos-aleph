// Note: In a real Raycast extension, import from @raycast/api
// For documentation purposes, we'll define the interfaces
import { useState, useEffect } from "react";
import WitnessOSAPI from "./api/witnessos-client";

// Mock Raycast API interfaces for documentation
interface ActionPanel {
  children: React.ReactNode;
}

interface Action {
  title: string;
  icon?: any;
  onAction?: () => void;
}

interface ActionCopyToClipboard {
  title: string;
  content: string;
}

interface ListItem {
  title: string;
  subtitle?: string;
  icon?: any;
  accessories?: Array<{ text: string }>;
  actions?: React.ReactNode;
}

interface List {
  isLoading?: boolean;
  children?: React.ReactNode;
}

interface ListSection {
  title: string;
  children: React.ReactNode;
}

interface Detail {
  markdown: string;
  actions?: React.ReactNode;
}

interface ToastOptions {
  style: string;
  title: string;
  message: string;
}

// Mock components and functions
const ActionPanel = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const Action = ({ title, onAction }: { title: string; onAction?: () => void }) => (
  <button onClick={onAction}>{title}</button>
);
Action.CopyToClipboard = ({ title, content }: { title: string; content: string }) => (
  <button onClick={() => navigator.clipboard?.writeText(content)}>{title}</button>
);
Action.ArrowLeft = "←";

const List = ({ isLoading, children }: { isLoading?: boolean; children?: React.ReactNode }) => (
  <div>{isLoading ? "Loading..." : children}</div>
);
List.Item = ({ title, subtitle, icon, accessories, actions }: {
  title: string;
  subtitle?: string;
  icon?: any;
  accessories?: Array<{ text: string }>;
  actions?: React.ReactNode;
}) => (
  <div>
    <h3>{title}</h3>
    {subtitle && <p>{subtitle}</p>}
    {accessories && accessories.map((acc, i) => <span key={i}>{acc.text}</span>)}
    {actions}
  </div>
);
List.Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2>{title}</h2>
    {children}
  </section>
);

const Detail = ({ markdown, actions }: { markdown: string; actions?: React.ReactNode }) => (
  <div>
    <pre>{markdown}</pre>
    {actions}
  </div>
);

const showToast = async (options: ToastOptions): Promise<void> => {
  console.log('Toast:', options);
};

const Toast = {
  Style: {
    Success: 'success',
    Failure: 'failure'
  }
};

const Icon = {
  ChevronUp: "↑",
  ChevronDown: "↓",
  Minus: "−",
  ExclamationMark: "!",
  ArrowClockwise: "↻",
  QuestionMark: "?",
  Sun: "☀",
  Eye: "👁",
  Book: "📖",
  Stars: "⭐",
  Lightbulb: "💡",
  CheckCircle: "✓",
  Document: "📄",
  ArrowLeft: "←"
};

const Color = {
  Green: "green",
  Yellow: "yellow",
  Red: "red",
  Orange: "orange",
  Purple: "purple",
  Magenta: "magenta",
  Blue: "blue"
};

interface GuidanceData {
  workflow_type: string;
  engines_used: string[];
  results: {
    biorhythm?: {
      physical: { value: number; phase: string; description: string };
      emotional: { value: number; phase: string; description: string };
      intellectual: { value: number; phase: string; description: string };
    };
    iching?: {
      hexagram: {
        number: number;
        name: string;
        chinese_name: string;
      };
      interpretation: {
        judgment: string;
        guidance: string;
      };
    };
    tarot?: {
      cards: Array<{
        name: string;
        position: string;
        meaning: string;
      }>;
      interpretation: {
        overall_message: string;
      };
    };
  };
  synthesis: {
    summary: string;
    detailed_interpretation: string;
    key_insights: string[];
    recommendations: string[];
  };
}

function getBiorhythmIcon(value: number): { icon: Icon; color: Color } {
  if (value > 0.5) return { icon: Icon.ChevronUp, color: Color.Green };
  if (value > 0) return { icon: Icon.Minus, color: Color.Yellow };
  return { icon: Icon.ChevronDown, color: Color.Red };
}

function formatBiorhythmValue(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export default function DailyGuidance() {
  const [guidance, setGuidance] = useState<GuidanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const api = new WitnessOSAPI();

  useEffect(() => {
    async function fetchGuidance() {
      try {
        setLoading(true);
        setError(null);

        // Validate user profile
        if (!api.validateUserProfile()) {
          throw new Error("Please configure your profile in extension preferences");
        }

        const result = await api.getDailyGuidance();
        
        if (result.success && result.data) {
          setGuidance(result.data);
          await showToast({
            style: Toast.Style.Success,
            title: "Daily guidance loaded",
            message: "Your consciousness insights are ready",
          });
        } else {
          throw new Error(result.message || "Failed to fetch guidance");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch guidance",
          message: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchGuidance();
  }, []);

  if (loading) {
    return <List isLoading={true} />;
  }

  if (error) {
    return (
      <List>
        <List.Item
          title="Error Loading Guidance"
          subtitle={error}
          icon={{ source: Icon.ExclamationMark, tintColor: Color.Red }}
          actions={
            <ActionPanel>
              <Action
                title="Retry"
                icon={Icon.ArrowClockwise}
                onAction={() => window.location.reload()}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  if (!guidance) {
    return (
      <List>
        <List.Item
          title="No Guidance Available"
          subtitle="Unable to load consciousness insights"
          icon={{ source: Icon.QuestionMark, tintColor: Color.Orange }}
        />
      </List>
    );
  }

  if (selectedItem === "detailed") {
    const markdown = `
# Daily Consciousness Guidance

## Summary
${guidance.synthesis.summary}

## Detailed Interpretation
${guidance.synthesis.detailed_interpretation}

## Key Insights
${guidance.synthesis.key_insights.map(insight => `• ${insight}`).join('\n')}

## Recommendations
${guidance.synthesis.recommendations.map(rec => `• ${rec}`).join('\n')}

---

## Biorhythm Analysis
${guidance.results.biorhythm ? `
**Physical**: ${formatBiorhythmValue(guidance.results.biorhythm.physical.value)} - ${guidance.results.biorhythm.physical.description}

**Emotional**: ${formatBiorhythmValue(guidance.results.biorhythm.emotional.value)} - ${guidance.results.biorhythm.emotional.description}

**Intellectual**: ${formatBiorhythmValue(guidance.results.biorhythm.intellectual.value)} - ${guidance.results.biorhythm.intellectual.description}
` : 'Not available'}

## I-Ching Wisdom
${guidance.results.iching ? `
**Hexagram ${guidance.results.iching.hexagram.number}**: ${guidance.results.iching.hexagram.name} (${guidance.results.iching.hexagram.chinese_name})

**Judgment**: ${guidance.results.iching.interpretation.judgment}

**Guidance**: ${guidance.results.iching.interpretation.guidance}
` : 'Not available'}

## Tarot Insight
${guidance.results.tarot ? `
**Cards**: ${guidance.results.tarot.cards.map(card => `${card.name} (${card.position})`).join(', ')}

**Message**: ${guidance.results.tarot.interpretation.overall_message}
` : 'Not available'}

---

*Generated by WitnessOS Consciousness API*
    `;

    return (
      <Detail
        markdown={markdown}
        actions={
          <ActionPanel>
            <Action
              title="Back to Overview"
              icon={Icon.ArrowLeft}
              onAction={() => setSelectedItem(null)}
            />
            <Action.CopyToClipboard
              title="Copy Full Guidance"
              content={markdown}
            />
            <Action.CopyToClipboard
              title="Copy Summary"
              content={guidance.synthesis.summary}
            />
          </ActionPanel>
        }
      />
    );
  }

  return (
    <List>
      <List.Section title="Today's Consciousness Guidance">
        <List.Item
          title="Daily Summary"
          subtitle={guidance.synthesis.summary}
          icon={{ source: Icon.Sun, tintColor: Color.Yellow }}
          actions={
            <ActionPanel>
              <Action
                title="View Detailed Guidance"
                icon={Icon.Eye}
                onAction={() => setSelectedItem("detailed")}
              />
              <Action.CopyToClipboard
                title="Copy Summary"
                content={guidance.synthesis.summary}
              />
            </ActionPanel>
          }
        />
      </List.Section>

      {guidance.results.biorhythm && (
        <List.Section title="Biorhythm Status">
          <List.Item
            title="Physical Energy"
            subtitle={`${formatBiorhythmValue(guidance.results.biorhythm.physical.value)} - ${guidance.results.biorhythm.physical.phase}`}
            icon={getBiorhythmIcon(guidance.results.biorhythm.physical.value)}
            accessories={[
              { text: guidance.results.biorhythm.physical.description }
            ]}
          />
          <List.Item
            title="Emotional State"
            subtitle={`${formatBiorhythmValue(guidance.results.biorhythm.emotional.value)} - ${guidance.results.biorhythm.emotional.phase}`}
            icon={getBiorhythmIcon(guidance.results.biorhythm.emotional.value)}
            accessories={[
              { text: guidance.results.biorhythm.emotional.description }
            ]}
          />
          <List.Item
            title="Intellectual Clarity"
            subtitle={`${formatBiorhythmValue(guidance.results.biorhythm.intellectual.value)} - ${guidance.results.biorhythm.intellectual.phase}`}
            icon={getBiorhythmIcon(guidance.results.biorhythm.intellectual.value)}
            accessories={[
              { text: guidance.results.biorhythm.intellectual.description }
            ]}
          />
        </List.Section>
      )}

      {guidance.results.iching && (
        <List.Section title="I-Ching Wisdom">
          <List.Item
            title={`Hexagram ${guidance.results.iching.hexagram.number}: ${guidance.results.iching.hexagram.name}`}
            subtitle={guidance.results.iching.hexagram.chinese_name}
            icon={{ source: Icon.Book, tintColor: Color.Purple }}
            accessories={[
              { text: "Ancient Wisdom" }
            ]}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  title="Copy I-Ching Guidance"
                  content={guidance.results.iching.interpretation.guidance}
                />
              </ActionPanel>
            }
          />
        </List.Section>
      )}

      {guidance.results.tarot && (
        <List.Section title="Tarot Insight">
          <List.Item
            title="Today's Cards"
            subtitle={guidance.results.tarot.cards.map(card => card.name).join(", ")}
            icon={{ source: Icon.Stars, tintColor: Color.Magenta }}
            accessories={[
              { text: guidance.results.tarot.interpretation.overall_message }
            ]}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  title="Copy Tarot Message"
                  content={guidance.results.tarot.interpretation.overall_message}
                />
              </ActionPanel>
            }
          />
        </List.Section>
      )}

      <List.Section title="Key Insights">
        {guidance.synthesis.key_insights.map((insight, index) => (
          <List.Item
            key={index}
            title={`Insight ${index + 1}`}
            subtitle={insight}
            icon={{ source: Icon.Lightbulb, tintColor: Color.Orange }}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  title="Copy Insight"
                  content={insight}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      <List.Section title="Recommendations">
        {guidance.synthesis.recommendations.map((recommendation, index) => (
          <List.Item
            key={index}
            title={`Action ${index + 1}`}
            subtitle={recommendation}
            icon={{ source: Icon.CheckCircle, tintColor: Color.Green }}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard
                  title="Copy Recommendation"
                  content={recommendation}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      <List.Section title="Actions">
        <List.Item
          title="Refresh Guidance"
          subtitle="Get updated consciousness insights"
          icon={{ source: Icon.ArrowClockwise, tintColor: Color.Blue }}
          actions={
            <ActionPanel>
              <Action
                title="Refresh"
                icon={Icon.ArrowClockwise}
                onAction={() => window.location.reload()}
              />
            </ActionPanel>
          }
        />
        <List.Item
          title="View Full Report"
          subtitle="See detailed consciousness analysis"
          icon={{ source: Icon.Document, tintColor: Color.Blue }}
          actions={
            <ActionPanel>
              <Action
                title="View Details"
                icon={Icon.Eye}
                onAction={() => setSelectedItem("detailed")}
              />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}