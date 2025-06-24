# Debug Navigation System for WitnessOS Webshore

## Overview

The Debug Navigation System provides a comprehensive development interface for testing and navigating between consciousness layers in WitnessOS Webshore. This system is **development-only** and automatically disabled in production builds.

## Features

### 🎛️ Debug Navigation Panel
- **Floating Interface**: Cyberpunk-styled debug console with WitnessOS aesthetic
- **Layer Selection**: Visual buttons for instant switching between Layers 0-3
- **Real-time Metrics**: Live consciousness, breath, and performance data
- **Active Engine Display**: Shows which consciousness engines are active per layer
- **Debug Overrides**: Toggle development features like mock data and enhanced visuals

### 🔘 Debug Toggle Button
- **Quick Access**: Floating button in bottom-right corner
- **Layer Indicator**: Shows current layer number
- **Visual Feedback**: Glowing indicator when panel is active

### ⌨️ Keyboard Shortcuts
- **Ctrl+D** (or Cmd+D): Toggle debug panel
- **0-3**: Switch to specific layer (when panel is open)
- **Escape**: Close debug panel

## Consciousness Layers

### Layer 0: Portal 🌀
- **Description**: Breathing chamber and consciousness entry
- **Engines**: None (pure portal experience)
- **Focus**: Breath detection, portal activation, archetypal fractals

### Layer 1: Awakening 🧭
- **Description**: Symbol garden and compass plaza
- **Engines**: Sacred Geometry, Biorhythm
- **Focus**: Initial exploration, symbol discovery, compass navigation

### Layer 2: Recognition 🔍
- **Description**: System understanding spaces
- **Engines**: Numerology, Vimshottari, Tarot, I-Ching
- **Focus**: Pattern recognition, system learning, deep understanding

### Layer 3: Integration ⚡
- **Description**: Archetype temples and mastery areas
- **Engines**: Human Design, Gene Keys, Enneagram, Sigil Forge
- **Focus**: Personal mastery, archetype integration, consciousness synthesis

## Usage

### Accessing Debug Mode

1. **Automatic Activation**: Debug mode is automatically enabled in development environment
2. **Toggle Panel**: Press `Ctrl+D` or click the floating debug button
3. **Layer Navigation**: Click layer buttons or use number keys 0-3

### Debug Overrides

- **Skip Onboarding**: Bypass the data collection flow
- **Mock Breath Data**: Simulate enhanced breath coherence for testing
- **Enhanced Visuals**: Enable additional visual effects for demonstration

### Performance Monitoring

The debug panel displays real-time metrics:
- **FPS**: Current frame rate
- **Frame Time**: Milliseconds per frame
- **Consciousness Level**: Current awareness percentage
- **Breath Coherence**: Real-time breath synchronization
- **Time in Layer**: Duration spent in current layer

## Technical Implementation

### Components

```typescript
// Core debug components
import { 
  DebugProvider,      // Context provider for debug state
  DebugNavigationPanel, // Main debug interface
  DebugToggleButton,   // Quick access button
  useDebug            // Hook for debug state access
} from '@/components/debug';
```

### Integration

The debug system is integrated at the root level in `layout.tsx`:

```typescript
<DebugProvider>
  {children}
  <DebugNavigationPanel />
  <DebugToggleButton />
</DebugProvider>
```

### Layer Switching

Debug mode allows instant layer switching without progression requirements:

```typescript
const { setCurrentLayer } = useDebug();
setCurrentLayer(2); // Jump directly to Recognition layer
```

## Development Workflow

### Testing Consciousness Layers

1. **Start Development Server**: `npm run dev`
2. **Open Debug Panel**: Press `Ctrl+D`
3. **Navigate Layers**: Click layer buttons or use number keys
4. **Monitor Metrics**: Watch real-time consciousness and breath data
5. **Test Overrides**: Enable mock data for consistent testing

### Layer-Specific Testing

- **Layer 0**: Test breath detection, portal activation, archetypal fractals
- **Layer 1**: Verify symbol discovery, compass navigation, awakening mechanics
- **Layer 2**: Check pattern recognition, system understanding, learning progression
- **Layer 3**: Validate archetype integration, mastery mechanics, consciousness synthesis

## Production Behavior

- **Automatic Disable**: Debug components are automatically disabled in production
- **No Performance Impact**: Debug code is tree-shaken out of production builds
- **Clean UI**: No debug elements visible to end users

## Troubleshooting

### Debug Panel Not Appearing
- Ensure you're in development mode (`NODE_ENV=development`)
- Check browser console for errors
- Verify debug components are properly imported

### Layer Switching Issues
- Check that all layer components are properly implemented
- Verify consciousness engine integrations
- Monitor browser console for component errors

### Performance Issues
- Use debug metrics to identify bottlenecks
- Enable/disable visual effects via debug overrides
- Monitor frame rate and adjust quality settings

## Future Enhancements

- **Layer State Persistence**: Save/restore layer states
- **Automated Testing**: Record and replay user interactions
- **Performance Profiling**: Detailed performance analysis tools
- **Visual Debugging**: 3D scene inspection and manipulation
- **Engine Configuration**: Real-time consciousness engine parameter tuning

---

*This debug system enables efficient development and testing of the WitnessOS consciousness exploration experience while maintaining a clean production environment.*
