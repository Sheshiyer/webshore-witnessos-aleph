# Audio-Reactive Quantum Visualizer

## Overview
This component transforms the original static quantum shader into a fully interactive audio-reactive visualizer that maintains the WitnessOS cyberpunk aesthetic while adding powerful real-time audio analysis capabilities.

## Features

### 🎵 Audio Analysis
- **Real-time frequency analysis** using Web Audio API
- **Multi-band processing**: Bass, Mid, and Treble frequency separation
- **Adjustable sensitivity** for different audio sources
- **Multiple input sources**: File upload, demo tracks, microphone

### 🎨 Visual Components

#### 1. Enhanced Quantum Shader (Background)
- **Audio-reactive parameters**: Distortion, pulse, and color intensity respond to audio
- **Frequency-based effects**: Different frequency bands affect different visual aspects
- **WitnessOS color scheme**: Cyan (treble), Magenta (mid), Purple (bass)
- **Maintains original quantum aesthetic** while adding audio reactivity

#### 2. 3D Anomaly Object (Three.js)
- **Interactive 3D wireframe** that responds to audio levels
- **Audio-reactive distortion** and rotation speed
- **Draggable interaction** with physics simulation
- **Fresnel shading** with audio-enhanced glow effects

#### 3. Circular Audio Visualizer
- **Multi-ring frequency display** with different frequency ranges
- **Real-time waveform visualization** in circular format
- **Gradient colors** matching WitnessOS theme
- **Pulsing center** that responds to overall audio level

### 🎛️ Audio Controls
- **File Upload**: Support for any audio file format
- **Demo Tracks**: Pre-loaded test tracks for immediate visualization
- **Microphone Input**: Real-time visualization of microphone audio
- **Sensitivity Control**: Adjustable audio reactivity (0.1x to 3.0x)
- **Play/Pause Controls**: Standard audio playback controls
- **Real-time Metrics**: Live display of audio levels by frequency band

## Technical Implementation

### Audio Processing Pipeline
1. **Audio Context**: Web Audio API initialization with proper browser compatibility
2. **Analyser Node**: FFT analysis with 2048 sample size and 0.8 smoothing
3. **Frequency Separation**: Automatic splitting into bass (0-10%), mid (10-40%), treble (40-100%)
4. **Real-time Updates**: 60fps analysis loop feeding all visual components

### Shader Integration
- **Enhanced Uniforms**: Added audio-reactive uniforms to existing quantum shader
- **Preserved Aesthetics**: Maintains original visual style while adding audio responsiveness
- **Performance Optimized**: Efficient GPU processing with minimal CPU overhead

### React Integration
- **Custom Hooks**: `useAudioAnalyzer` for clean audio state management
- **Proper Cleanup**: Audio context and animation frame cleanup on unmount
- **TypeScript Support**: Full type safety for all audio and Three.js components

## Usage

### Basic Setup
The component automatically initializes when mounted and provides immediate visual feedback even without audio input.

### Audio Input Methods
1. **File Upload**: Click "Choose File" to upload any audio file
2. **Demo Tracks**: Click any demo track button for instant playback
3. **Microphone**: Click "MIC" button to visualize real-time microphone input
4. **Manual Play**: Use "PLAY/PAUSE" for manual audio control

### Customization
- **Sensitivity**: Adjust the slider to increase/decrease audio reactivity
- **Visual Feedback**: Real-time display shows current audio levels by frequency band

## Integration with WitnessOS

### Preserved Features
- **Glassmorphic Navigation**: Maintains compatibility with existing UI elements
- **Color Scheme**: Uses WitnessOS cyan/magenta/purple theme throughout
- **Positioning**: Same canvas positioning and z-index structure
- **Performance**: Optimized for smooth operation alongside other UI components

### Enhanced Experience
- **Audio Context**: Adds immersive audio-visual experience to the main interface
- **Interactive Elements**: 3D anomaly object provides engaging user interaction
- **Real-time Feedback**: Live audio metrics enhance the "consciousness" theme

## Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Web Audio API**: Required for audio analysis functionality
- **WebGL2**: Required for enhanced shader features
- **File API**: Required for audio file upload
- **MediaDevices**: Required for microphone input

## Performance Notes
- **GPU Accelerated**: All visual effects run on GPU for smooth performance
- **Optimized Analysis**: Efficient frequency analysis with minimal CPU usage
- **Memory Management**: Proper cleanup prevents memory leaks
- **Responsive Design**: Adapts to different screen sizes and orientations
