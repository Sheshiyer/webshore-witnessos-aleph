# Admin Profile Configuration - WitnessOS Raycast Extension

This directory contains pre-configured profile data for the admin user (`sheshnarayan.iyer@gmail.com`) to enable automatic population of consciousness engine parameters without manual input.

## 📁 Files

- `admin-profile.ts` - Complete admin user configuration with engine input generators
- `README.md` - This usage guide

## 🚀 Quick Start

### 1. Import the Configuration

```typescript
import AdminConfig from './config/admin-profile';

// Get pre-configured engine inputs
const numerologyInput = AdminConfig.generators.numerology();
const humanDesignInput = AdminConfig.generators.humanDesign();
const tarotInput = AdminConfig.generators.tarot();
```

### 2. Use in Raycast Commands

```typescript
// In your daily-guidance command
import { getPreferenceValues } from '@raycast/api';
import AdminConfig from '../config/admin-profile';

export default function DailyGuidance() {
  const preferences = getPreferenceValues<Preferences>();
  
  // Use admin profile if no custom preferences set
  const userProfile = preferences.userProfile || AdminConfig.profile.fullName;
  const birthDate = preferences.birthDate || AdminConfig.profile.birthData.date;
  
  // Generate engine inputs automatically
  const numerologyInput = AdminConfig.generators.numerology();
  const biorhythmInput = AdminConfig.generators.biorhythm();
  
  // ... rest of your component
}
```

### 3. Sync with Live Backend Data

```typescript
import AdminConfig from '../config/admin-profile';

// Fetch live data from backend
const liveData = await AdminConfig.utils.fetchLiveUserData(apiToken);

if (liveData.error) {
  // Fallback to static configuration
  console.log('Using static admin profile');
} else {
  // Use live data
  console.log('Synced with backend:', liveData.lastSync);
}
```

## 🎯 Available Data

### User Profile
```typescript
AdminConfig.profile = {
  fullName: 'Cumbipuram Nateshan Sheshanarayan Iyer',
  email: 'sheshnarayan.iyer@gmail.com',
  birthData: {
    date: '1991-08-13',
    time: '13:31',
    location: 'Bengaluru, India',
    latitude: 12.9629,
    longitude: 77.5775,
    timezone: 'Asia/Kolkata'
  },
  preferences: {
    direction: 'east',
    card: 'alchemist',
    favoriteEngines: ['numerology', 'human_design', 'tarot', 'biorhythm']
  }
}
```

### Engine Input Generators
```typescript
// Numerology
AdminConfig.generators.numerology() 
// Returns: { birth_date: '1991-08-13', full_name: 'Cumbipuram...' }

// Human Design  
AdminConfig.generators.humanDesign()
// Returns: { birth_date: '1991-08-13', birth_time: '13:31', birth_latitude: 12.9629, birth_longitude: 77.5775 }

// Tarot (with random spiritual question)
AdminConfig.generators.tarot()
// Returns: { question: 'What guidance...', spread_type: 'three_card', deck: 'rider_waite' }

// Biorhythm (for today)
AdminConfig.generators.biorhythm()
// Returns: { birth_date: '1991-08-13', target_date: '2025-01-29', days_ahead: 7 }

// I-Ching (with consciousness question)
AdminConfig.generators.iching()
// Returns: { question: 'What is the nature...', method: 'coins' }
```

### Reading History
```typescript
AdminConfig.history = {
  totalReadings: 247,
  favoriteEngines: ['numerology', 'human_design', 'tarot'],
  recentResults: {
    numerology: { lifePath: 8, expression: 3, soulUrge: 11 },
    humanDesign: { type: 'Generator', profile: '2/4', authority: 'Sacral' }
  }
}
```

## 🔧 Integration Examples

### Example 1: Daily Guidance with Admin Profile

```typescript
// src/commands/daily-guidance.tsx
import { ActionPanel, Action, List, Detail } from '@raycast/api';
import { useState, useEffect } from 'react';
import AdminConfig from '../config/admin-profile';

export default function DailyGuidance() {
  const [guidance, setGuidance] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateDailyGuidance();
  }, []);

  async function generateDailyGuidance() {
    try {
      // Use admin profile for automatic input generation
      const config = AdminConfig.utils.getDailyGuidanceConfig();
      
      // Generate inputs for favorite engines
      const inputs = {
        numerology: AdminConfig.generators.numerology(),
        biorhythm: AdminConfig.generators.biorhythm(),
        tarot: AdminConfig.generators.tarot('What guidance do I need today?')
      };

      // Call WitnessOS API with pre-configured inputs
      // ... API calls using inputs
      
      setGuidance('Your personalized consciousness guidance...');
    } catch (error) {
      console.error('Failed to generate guidance:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Detail
      isLoading={loading}
      markdown={guidance}
      actions={
        <ActionPanel>
          <Action title="Refresh" onAction={generateDailyGuidance} />
        </ActionPanel>
      }
    />
  );
}
```

### Example 2: Quick Numerology Calculation

```typescript
// src/commands/quick-numerology.tsx
import { ActionPanel, Action, Detail } from '@raycast/api';
import { useState } from 'react';
import AdminConfig from '../config/admin-profile';

export default function QuickNumerology() {
  const [result, setResult] = useState<string>('');

  async function calculateNumerology() {
    // Use admin profile data automatically
    const input = AdminConfig.generators.numerology();
    
    // Call API with pre-configured input
    const response = await fetch(`${AdminConfig.profile.apiConfig.baseUrl}/api/engines/numerology/calculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getPreferenceValues().apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input })
    });

    const data = await response.json();
    
    // Format result using consciousness profile
    const profile = AdminConfig.utils.getConsciousnessProfile();
    setResult(`
# 🌸 Numerology Reading for ${AdminConfig.profile.displayName}

**Life Path:** ${profile.coreNumbers.lifePath} - Material mastery and spiritual balance
**Expression:** ${profile.coreNumbers.expression} - Creative divine expression  
**Soul Urge:** ${profile.coreNumbers.soulUrge} - Master intuition and spiritual enlightenment

*Based on your birth data: ${AdminConfig.profile.birthData.date}*
    `);
  }

  return (
    <Detail
      markdown={result || 'Press Enter to calculate your numerology...'}
      actions={
        <ActionPanel>
          <Action title="Calculate" onAction={calculateNumerology} />
        </ActionPanel>
      }
    />
  );
}
```

## 🔐 Security Notes

1. **API Token**: Never hardcode API tokens in the configuration file. Always use Raycast preferences.
2. **Personal Data**: This configuration contains personal birth data. Keep it secure.
3. **Backend Sync**: Use `fetchLiveUserData()` to sync with actual backend when possible.

## 🔄 Updating Configuration

To update the admin profile configuration:

1. Modify `admin-profile.ts` with new data
2. Update engine input generators if needed
3. Test with Raycast extension
4. Sync with backend using `fetchLiveUserData()` for live updates

## � Reading Persistence & History

### **Automatic Reading Storage**
All consciousness engine calculations performed through the Raycast extension are automatically stored for history tracking and pattern analysis.

#### **Storage Endpoints**
```typescript
// Store reading result
POST /api/readings/store
{
  "userId": 1,
  "engineName": "numerology",
  "inputParameters": {
    "birth_date": "1991-08-13",
    "full_name": "Cumbipuram Nateshan Sheshanarayan Iyer"
  },
  "result": { /* engine calculation result */ },
  "metadata": {
    "source": "raycast_extension",
    "timestamp": "2025-01-30T12:00:00Z",
    "executionTime": 1250,
    "version": "1.0.0"
  }
}
```

#### **History Retrieval**
```typescript
// Get reading history
GET /api/readings/history?userId=1&limit=50&timeRange=30d&engine=numerology

// Get specific reading
GET /api/readings/{readingId}

// Get reading statistics
GET /api/readings/stats?userId=1&timeRange=90d
```

### **Reading History Integration**
```typescript
import AdminConfig from '../config/admin-profile';

// Store reading automatically after calculation
async function calculateAndStore(engineName: string, customParams?: any) {
  const input = AdminConfig.generators.getEngineInput(engineName, customParams);

  // Calculate
  const result = await AdminIntegration.api.calculateEngine(engineName, customParams);

  // Store reading
  await storeReading({
    engineName,
    inputParameters: input,
    result: result.data,
    metadata: {
      source: 'raycast_extension',
      timestamp: new Date().toISOString(),
      executionTime: result.executionTime || 0
    }
  });

  return result;
}
```

## 🔄 Action Endpoints & Persistence

### **Core Action Endpoints**

#### **1. Daily Guidance Generation**
```typescript
// Generate daily guidance
POST /api/workflows/daily-guidance
{
  "userId": 1,
  "engines": ["numerology", "biorhythm", "tarot"],
  "preferences": {
    "aiModel": "gpt-4",
    "creativity": "balanced",
    "focusArea": "consciousness_expansion"
  },
  "includeHistory": true
}

// Store guidance session
POST /api/sessions/guidance
{
  "userId": 1,
  "guidanceResult": { /* AI-generated guidance */ },
  "enginesUsed": ["numerology", "biorhythm", "tarot"],
  "sessionDuration": 1200,
  "userFeedback": null
}
```

#### **2. Engine Calculations**
```typescript
// Individual engine calculation
POST /engines/{engineName}/calculate
{
  "input": { /* engine-specific parameters */ },
  "options": {
    "storeResult": true,
    "includeInterpretation": true,
    "format": "detailed"
  }
}

// Batch engine calculations
POST /api/workflows/batch-calculate
{
  "userId": 1,
  "engines": [
    {
      "name": "numerology",
      "input": { "birth_date": "1991-08-13", "full_name": "..." }
    },
    {
      "name": "biorhythm",
      "input": { "birth_date": "1991-08-13", "target_date": "2025-01-30" }
    }
  ],
  "storeResults": true
}
```

#### **3. Consciousness Profile Management**
```typescript
// Update consciousness profile
PUT /api/user/consciousness-profile
{
  "userId": 1,
  "profileData": {
    "coreNumbers": { "lifePath": 5, "expression": 3, "soulUrge": 1 },
    "humanDesign": { "type": "Generator", "profile": "2/4" },
    "preferences": { "favoriteEngines": ["numerology", "tarot"] }
  },
  "source": "raycast_extension"
}

// Get consciousness profile
GET /api/user/consciousness-profile?userId=1&includeHistory=true
```

### **Action Tracking & Analytics**

#### **User Activity Logging**
```typescript
// Log user action
POST /api/analytics/action
{
  "userId": 1,
  "action": "calculate_numerology",
  "source": "raycast_extension",
  "metadata": {
    "engineName": "numerology",
    "executionTime": 1250,
    "success": true,
    "timestamp": "2025-01-30T12:00:00Z"
  }
}

// Get user activity stats
GET /api/analytics/user-stats?userId=1&timeRange=30d
```

#### **Usage Pattern Analysis**
```typescript
// Get usage patterns
GET /api/analytics/patterns?userId=1
{
  "success": true,
  "data": {
    "favoriteEngines": ["numerology", "tarot", "biorhythm"],
    "peakUsageHours": [8, 9, 20, 21],
    "averageSessionLength": 15.5,
    "totalCalculations": 247,
    "streakDays": 12,
    "lastActive": "2025-01-30T12:00:00Z"
  }
}
```

## 💾 Data Persistence Implementation

### **Reading Storage Helper**
```typescript
// src/utils/reading-storage.ts
import { getPreferenceValues } from '@raycast/api';
import AdminConfig from '../config/admin-profile';

interface ReadingRecord {
  id?: string;
  userId: number;
  engineName: string;
  inputParameters: Record<string, any>;
  result: any;
  metadata: {
    source: 'raycast_extension';
    timestamp: string;
    executionTime: number;
    version: string;
  };
}

export async function storeReading(reading: Omit<ReadingRecord, 'id' | 'userId'>): Promise<string> {
  const preferences = getPreferenceValues();
  const userId = AdminConfig.profile.id; // Admin user ID

  const response = await fetch(`${preferences.apiBaseUrl}/api/readings/store`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${preferences.apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      ...reading
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to store reading: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.readingId;
}

export async function getReadingHistory(options: {
  limit?: number;
  timeRange?: string;
  engine?: string;
}): Promise<ReadingRecord[]> {
  const preferences = getPreferenceValues();
  const userId = AdminConfig.profile.id;

  const params = new URLSearchParams({
    userId: userId.toString(),
    limit: (options.limit || 50).toString(),
    timeRange: options.timeRange || '30d',
    ...(options.engine && { engine: options.engine })
  });

  const response = await fetch(`${preferences.apiBaseUrl}/api/readings/history?${params}`, {
    headers: {
      'Authorization': `Bearer ${preferences.apiToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reading history: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.readings;
}
```

### **Enhanced Calculation with Storage**
```typescript
// src/utils/enhanced-calculation.ts
import AdminIntegration from './admin-integration';
import { storeReading } from './reading-storage';

export async function calculateWithStorage(
  engineName: string,
  customParams?: Record<string, any>
): Promise<{ result: any; readingId: string }> {

  const startTime = Date.now();

  try {
    // Generate input parameters
    const input = AdminIntegration.engines.generateInput(engineName, customParams);

    // Perform calculation
    const result = await AdminIntegration.api.calculateEngine(engineName, customParams);

    const executionTime = Date.now() - startTime;

    // Store reading for history
    const readingId = await storeReading({
      engineName,
      inputParameters: input,
      result: result.data,
      metadata: {
        source: 'raycast_extension',
        timestamp: new Date().toISOString(),
        executionTime,
        version: '1.0.0'
      }
    });

    return { result, readingId };

  } catch (error) {
    // Log failed calculation
    await logAction('calculate_failed', {
      engineName,
      error: error.message,
      executionTime: Date.now() - startTime
    });

    throw error;
  }
}

async function logAction(action: string, metadata: Record<string, any>) {
  const preferences = getPreferenceValues();

  try {
    await fetch(`${preferences.apiBaseUrl}/api/analytics/action`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${preferences.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: AdminConfig.profile.id,
        action,
        source: 'raycast_extension',
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString()
        }
      })
    });
  } catch (error) {
    console.error('Failed to log action:', error);
    // Don't throw - logging failures shouldn't break the main flow
  }
}
```

## 📈 Reading History Commands

### **History Viewer Command**
```typescript
// src/commands/reading-history.tsx
import { ActionPanel, Action, List, Detail } from '@raycast/api';
import { useState, useEffect } from 'react';
import { getReadingHistory } from '../utils/reading-storage';
import AdminIntegration from '../utils/admin-integration';

export default function ReadingHistory() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEngine, setSelectedEngine] = useState('all');

  useEffect(() => {
    loadHistory();
  }, [selectedEngine]);

  async function loadHistory() {
    try {
      const history = await getReadingHistory({
        limit: 100,
        timeRange: '90d',
        engine: selectedEngine === 'all' ? undefined : selectedEngine
      });
      setReadings(history);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <List
      isLoading={loading}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by Engine"
          value={selectedEngine}
          onChange={setSelectedEngine}
        >
          <List.Dropdown.Item title="All Engines" value="all" />
          <List.Dropdown.Item title="Numerology" value="numerology" />
          <List.Dropdown.Item title="Human Design" value="human_design" />
          <List.Dropdown.Item title="Tarot" value="tarot" />
          <List.Dropdown.Item title="Biorhythm" value="biorhythm" />
        </List.Dropdown>
      }
    >
      {readings.map((reading) => (
        <List.Item
          key={reading.id}
          title={`${reading.engineName} - ${new Date(reading.metadata.timestamp).toLocaleDateString()}`}
          subtitle={`Execution: ${reading.metadata.executionTime}ms`}
          accessories={[
            { text: new Date(reading.metadata.timestamp).toLocaleTimeString() }
          ]}
          actions={
            <ActionPanel>
              <Action.Push
                title="View Details"
                target={<ReadingDetail reading={reading} />}
              />
              <Action
                title="Recalculate"
                onAction={() => recalculate(reading)}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function ReadingDetail({ reading }) {
  const formattedResult = AdminIntegration.engines.formatResult(
    reading.engineName,
    reading.result
  );

  return (
    <Detail
      markdown={formattedResult}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Engine" text={reading.engineName} />
          <Detail.Metadata.Label title="Date" text={new Date(reading.metadata.timestamp).toLocaleString()} />
          <Detail.Metadata.Label title="Execution Time" text={`${reading.metadata.executionTime}ms`} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label title="Input Parameters" text={JSON.stringify(reading.inputParameters, null, 2)} />
        </Detail.Metadata>
      }
    />
  );
}
```

## �📚 Related Documentation

- [WitnessOS API Documentation](../../../docs/api/)
- [Raycast Extension Development](https://developers.raycast.com/)
- [Consciousness Engine Reference](../../../docs/engines/)
- [Reading Storage API](../../../docs/api/readings/)
- [Analytics & Tracking](../../../docs/api/analytics/)
