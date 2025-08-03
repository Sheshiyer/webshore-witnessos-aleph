# Latest Raycast API Features & Enhancements (2024)

## 🤖 **AI Integration Revolution**

### Native AI Support with useAI Hook
Raycast now provides native AI integration through the `useAI` hook, enabling seamless AI-powered extensions:

```typescript
import { useAI } from "@raycast/utils";

const { data, isLoading, revalidate } = useAI(
  "Channel consciousness wisdom for spiritual guidance",
  {
    creativity: 1.5,        // 0-2 scale for creativity control
    model: "anthropic/claude-3-sonnet",
    stream: true,           // Real-time streaming responses
    onData: (chunk) => console.log("AI streaming:", chunk),
    onError: (error) => showToast({ title: "AI Error", message: error.message })
  }
);
```

### AI Extension Types
- **AI Commands**: Direct AI integration for specific tasks
- **AI Chat**: Natural language conversations within Raycast
- **Quick AI**: Instant AI responses from any context
- **AI Extensions**: Full AI-powered extension experiences

### Supported AI Models
- **Anthropic Claude 3 Sonnet**: Best for reasoning and analysis
- **OpenAI GPT-4**: Excellent for creative and general tasks
- **Meta Llama 2 70B**: Open-source alternative
- **Google Gemini Pro**: Multimodal capabilities

## 🎨 **Enhanced UI Components**

### New Form Elements
```typescript
// Enhanced form components with better UX
<Form.Separator />
<Form.Description 
  title="Information" 
  text="Helpful context for users"
/>
<Form.FilePicker 
  id="file-upload"
  title="Select Files"
  allowMultipleSelection={true}
  canChooseDirectories={false}
/>
```

### Improved List Components
- **Enhanced Search**: Better filtering and search capabilities
- **Section Headers**: Improved visual organization
- **Accessories**: More flexible item decorations
- **Loading States**: Better loading indicators

### Grid Enhancements
- **Size Controls**: Small, medium, large grid options
- **Fit Options**: Better image scaling and fitting
- **Performance**: Optimized rendering for large datasets

## 🔧 **Developer Experience Improvements**

### New React Hooks
```typescript
// Enhanced data fetching
import { 
  useAI, 
  useCachedPromise, 
  useStreamJSON, 
  useLocalStorage,
  useFrecencySorting 
} from "@raycast/utils";

// AI-powered data processing
const { data } = useAI("Analyze this data", { stream: true });

// Cached API calls with better performance
const { data, isLoading } = useCachedPromise(
  fetchData,
  [],
  { keepPreviousData: true, backgroundRefresh: true }
);

// Real-time JSON streaming
const { data } = useStreamJSON(websocketUrl, options);

// Local storage with React state sync
const [value, setValue] = useLocalStorage("key", defaultValue);

// Intelligent sorting based on user behavior
const sortedItems = useFrecencySorting(items, "id");
```

### Enhanced CLI Tools
```bash
# New CLI commands and options
ray develop --hot-reload     # Instant development updates
ray build --optimize         # Production-optimized builds
ray publish --team           # Team/private publishing
ray lint --fix --ai          # AI-powered code fixes
ray test --coverage          # Testing with coverage reports
```

### Template System Overhaul
- **AI Template**: Ready-to-use AI integration template
- **Enhanced Templates**: All templates updated with latest features
- **Extension Boilerplates**: Team-ready templates with customization
- **Template Marketplace**: Community-contributed templates

## 📱 **Platform Enhancements**

### Menu Bar Integration
```typescript
// Enhanced menu bar support
export default function MenuBarCommand() {
  return (
    <MenuBarExtra icon="🌊" title="WitnessOS">
      <MenuBarExtra.Item 
        title="Daily Guidance"
        onAction={() => open("raycast://extensions/witnessos/daily")}
        shortcut={{ modifiers: ["cmd"], key: "d" }}
      />
      <MenuBarExtra.Separator />
      <MenuBarExtra.Submenu title="Engines">
        <MenuBarExtra.Item title="Numerology" onAction={activateNumerology} />
        <MenuBarExtra.Item title="Tarot" onAction={activateTarot} />
      </MenuBarExtra.Submenu>
    </MenuBarExtra>
  );
}
```

### Background Processing
- **Background Refresh**: Automatic data updates
- **Scheduled Tasks**: Periodic background operations
- **Push Notifications**: System-level notifications
- **State Persistence**: Better state management across sessions

### Performance Optimizations
- **Lazy Loading**: Components load on demand
- **Memory Management**: Better memory usage patterns
- **Caching Improvements**: Smarter caching strategies
- **Bundle Optimization**: Smaller extension bundles

## 🔐 **Security & Privacy**

### Enhanced Authentication
- **OAuth 2.0**: Improved OAuth flow support
- **Token Management**: Automatic token refresh
- **Secure Storage**: Enhanced encryption for sensitive data
- **Privacy Controls**: Better user privacy options

### Data Protection
- **Local Encryption**: All local data encrypted
- **Secure Communication**: HTTPS-only API calls
- **Data Minimization**: Only necessary data stored
- **User Control**: Clear data management options

## 🚀 **Migration Guide**

### Updating Existing Extensions
```json
{
  "dependencies": {
    "@raycast/api": "^1.59.0",
    "@raycast/utils": "^1.10.0"
  }
}
```

### Breaking Changes
- **API Version**: Update to latest API version
- **Hook Changes**: Some hooks have new signatures
- **TypeScript**: Enhanced type definitions
- **ESLint Rules**: New linting rules for AI features

### Best Practices
- **AI Integration**: Use streaming for better UX
- **Error Handling**: Implement comprehensive error boundaries
- **Performance**: Leverage new caching mechanisms
- **Accessibility**: Follow updated accessibility guidelines

## 📚 **Resources & Documentation**

### Updated Documentation
- **AI Extension Guide**: Complete AI integration documentation
- **Hook Reference**: Detailed hook documentation with examples
- **Template Gallery**: Visual template showcase
- **Best Practices**: Updated development guidelines

### Community Resources
- **Extension Store**: Browse latest community extensions
- **GitHub Examples**: Open-source extension examples
- **Discord Community**: Active developer community
- **Office Hours**: Regular developer Q&A sessions

---

*This document covers the major Raycast API enhancements available in 2024. For the most up-to-date information, visit [developers.raycast.com](https://developers.raycast.com).*
