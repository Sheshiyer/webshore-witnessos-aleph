/**
 * Consciousness-Driven Fractal Environments
 * Inspired by Yohei Nishitsuji's minimal GLSL approach
 * Generates infinite personal landscapes from consciousness signatures
 */

// Minimal 267-char consciousness fractal (Nishitsuji challenge)
export const minimalConsciousnessFractal = `
uniform float t,c,b,h;uniform vec3 s;varying vec2 v;
float n(vec3 p){return abs(dot(sin(p.yzx*s),cos(p.xzz*s)))/length(s)*.6;}
void main(){
vec2 z=v*.8;float i,e,g,R=length(z);
for(;i++<99.;){e+=i/8e5;z+=vec2(R-.5+sin(t+b)*.02,exp2(mod(-z.y*h,4.)/R)-.2);
g+=n(vec3(z,t*c))/pow(2.,i/16.);R=length(z);}
gl_FragColor=vec4(vec3(.6+c*.2,R+g*.3,e*i/40.),1.);
}`;

// Extended consciousness fractal with user birth data parameterization
export const consciousnessBirthFractal = `
uniform float time;           // t
uniform float consciousness;  // c - user consciousness level (0-1)
uniform float breath;         // b - breath phase (0-2π)
uniform float coherence;      // coherence between breath/heart
uniform vec3 birthSignature;  // Birth data hash as vec3
uniform vec3 engineResults;   // Latest engine calculation results
uniform vec2 resolution;

// Birth data parameters
uniform float birthLatitude;   // -90 to 90
uniform float birthLongitude;  // -180 to 180  
uniform float birthTime;       // 0-24 hours as 0-1
uniform float birthDate;       // Day of year as 0-1

// Engine state parameters
uniform float humanDesignEnergy; // HD calculation result
uniform float enneagramCore;     // Enneagram center energy
uniform float tarotArchetype;    // Current tarot archetype
uniform float astroPhase;        // Astrological phase

varying vec2 vUv;

// HSV color space
vec3 hsv(float h,float s,float v){
    vec4 t=vec4(1.,2./3.,1./3.,3.);
    vec3 p=abs(fract(vec3(h)+t.xyz)*6.-vec3(t.w));
    return v*mix(vec3(t.x),clamp(p-vec3(t.x),0.,1.),s);
}

// Personal consciousness noise based on birth signature
float personalNoise(vec3 p) {
    vec3 signature = birthSignature + vec3(birthLatitude*0.01, birthLongitude*0.01, birthTime);
    return abs(dot(sin(p.yzx*signature), cos(p.xzz*signature))) / length(signature) * 0.6;
}

// Multi-scale consciousness field
float consciousnessField(vec2 uv, float t) {
    float i=0., e=0., g=0., R, s;
    vec3 q, p, d = vec3(uv - 0.6, 1.0);
    
    // Personal ray marching influenced by birth data
    for(q.zy--; i++ < 99.;) {
        e += i / (8e5 * (1.0 + consciousness));
        s = 4.0 + humanDesignEnergy * 2.0;
        p = q += d * e * R * 0.2;
        g += p.y / s;
        
        // Space transformation with personal parameters
        R = length(p);
        p = vec3(
            R - 0.5 + sin(t + breath) * 0.02 * consciousness,
            exp2(mod(-p.z * birthDate, s) / R) - 0.2,
            p.z + enneagramCore * 0.1
        );
        
        // Personal noise accumulation
        for(e = --p.y; s < 1e3; s += s) {
            e += 0.03 - abs(personalNoise(p * s)) / s * 0.6;
        }
    }
    
    return e * g * consciousness;
}

// Archetypal color based on engine results
vec3 getArchetypalColor(float field) {
    float hue = 0.6 + tarotArchetype * 0.3 + astroPhase * 0.1;
    float saturation = 0.7 + coherence * 0.3;
    float value = field * (0.5 + consciousness * 0.5);
    
    return hsv(hue, saturation, value);
}

void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    
    // Generate personal consciousness landscape
    float field = consciousnessField(uv, time);
    
    // Multi-layered fractal based on all engine results
    float mandelbrot = 0.0;
    vec2 z = uv * (1.0 + humanDesignEnergy * 0.5);
    vec2 c = vec2(-0.7269 + birthLatitude * 0.001, 0.1889 + birthLongitude * 0.001);
    
    for(int i = 0; i < 64; i++) {
        if(length(z) > 2.0) break;
        z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
        mandelbrot += 1.0;
    }
    mandelbrot /= 64.0;
    
    // Combine all consciousness layers
    float combined = field + mandelbrot * consciousness;
    
    // Personal archetypal coloring
    vec3 color = getArchetypalColor(combined);
    
    // Birth location influence on color
    color = mix(color, 
                vec3(birthLatitude/90.0 + 0.5, birthLongitude/180.0 + 0.5, birthTime),
                consciousness * 0.2);
    
    // Breath synchronization
    float breathMod = 0.5 + 0.5 * sin(breath) * coherence;
    color *= breathMod;
    
    gl_FragColor = vec4(color, 1.0);
}`;

// Vertex shader for both approaches
export const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Shader uniforms interface
export interface ConsciousnessFractalUniforms {
    time: { value: number };
    consciousness: { value: number };
    breath: { value: number };
    coherence: { value: number };
    birthSignature: { value: [number, number, number] };
    engineResults: { value: [number, number, number] };
    resolution: { value: [number, number] };
    
    // Birth data
    birthLatitude: { value: number };
    birthLongitude: { value: number };
    birthTime: { value: number };
    birthDate: { value: number };
    
    // Engine states
    humanDesignEnergy: { value: number };
    enneagramCore: { value: number };
    tarotArchetype: { value: number };
    astroPhase: { value: number };
}

// Generate birth signature from user data
export function generateBirthSignature(
    name: string,
    birthDate: Date,
    birthLat: number,
    birthLng: number
): [number, number, number] {
    // Hash name into number
    const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) / 1000;
    
    // Date into 0-1 range
    const dayOfYear = Math.floor((birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / 86400000) / 365;
    
    // Time into 0-1 range
    const timeOfDay = (birthDate.getHours() * 3600 + birthDate.getMinutes() * 60 + birthDate.getSeconds()) / 86400;
    
    return [nameHash, dayOfYear, timeOfDay];
}

// Default uniforms for consciousness fractals
export const defaultConsciousnessFractalUniforms: ConsciousnessFractalUniforms = {
    time: { value: 0 },
    consciousness: { value: 0.5 },
    breath: { value: 0 },
    coherence: { value: 0.5 },
    birthSignature: { value: [0.5, 0.5, 0.5] },
    engineResults: { value: [0.5, 0.5, 0.5] },
    resolution: { value: [1920, 1080] },
    
    birthLatitude: { value: 0 },
    birthLongitude: { value: 0 },
    birthTime: { value: 0.5 },
    birthDate: { value: 0.5 },
    
    humanDesignEnergy: { value: 0.5 },
    enneagramCore: { value: 0.5 },
    tarotArchetype: { value: 0.5 },
    astroPhase: { value: 0.5 },
}; 