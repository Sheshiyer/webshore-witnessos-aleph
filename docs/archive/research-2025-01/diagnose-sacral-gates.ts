/**
 * Diagnostic test to understand why we're missing Sacral gates
 */

import { simpleAstronomicalCalculator } from '../../src/engines/calculators/simple-astronomical-calculator';

console.log('🔍 Diagnosing Sacral Gate Issue');
console.log('=' .repeat(50));

const birthDate = new Date('1991-08-13T08:01:00Z');
const designDate = new Date('1991-05-13T08:28:00Z'); // From validation data
const latitude = 12.9716;
const longitude = 77.5946;

// Sacral gates we need to find
const sacralGates = [5, 14, 29, 59, 9, 3, 42, 27, 34];
console.log(`Target Sacral gates: ${sacralGates.join(', ')}`);

// Calculate current planetary positions
const personalityGates = simpleAstronomicalCalculator.calculatePersonalityGates(
  birthDate, latitude, longitude
);

const designGates = simpleAstronomicalCalculator.calculatePersonalityGates(
  designDate, latitude, longitude
);

console.log('\n📊 Current Planetary Positions:');
console.log('\nPersonality (Birth):');
for (const [planet, position] of Object.entries(personalityGates)) {
  const isSacral = sacralGates.includes(position.gate);
  const marker = isSacral ? '🎯' : '  ';
  console.log(`${marker} ${planet.padEnd(12)}: Gate ${position.gate.toString().padStart(2)}.${position.line} (${position.longitude.toFixed(2)}°)`);
}

console.log('\nDesign:');
for (const [planet, position] of Object.entries(designGates)) {
  const isSacral = sacralGates.includes(position.gate);
  const marker = isSacral ? '🎯' : '  ';
  console.log(`${marker} ${planet.padEnd(12)}: Gate ${position.gate.toString().padStart(2)}.${position.line} (${position.longitude.toFixed(2)}°)`);
}

// Calculate where Sacral gates should be in degrees
console.log('\n📐 Sacral Gate Positions (I-Ching Wheel):');
const gateOrder = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];

const degreesPerGate = 360.0 / 64.0; // 5.625°

for (const sacralGate of sacralGates) {
  const gateIndex = gateOrder.indexOf(sacralGate);
  const startDegree = gateIndex * degreesPerGate;
  const endDegree = (gateIndex + 1) * degreesPerGate;
  const centerDegree = startDegree + degreesPerGate / 2;
  
  console.log(`Gate ${sacralGate.toString().padStart(2)}: ${startDegree.toFixed(2)}° - ${endDegree.toFixed(2)}° (center: ${centerDegree.toFixed(2)}°)`);
}

// Check how close our planets are to Sacral gates
console.log('\n🎯 Proximity Analysis:');
const allPlanets = [...Object.entries(personalityGates), ...Object.entries(designGates)];

for (const [planet, position] of allPlanets) {
  let closestSacralGate = null;
  let minDistance = Infinity;
  
  for (const sacralGate of sacralGates) {
    const gateIndex = gateOrder.indexOf(sacralGate);
    const gateCenter = gateIndex * degreesPerGate + degreesPerGate / 2;
    
    let distance = Math.abs(position.longitude - gateCenter);
    if (distance > 180) distance = 360 - distance;
    
    if (distance < minDistance) {
      minDistance = distance;
      closestSacralGate = sacralGate;
    }
  }
  
  if (minDistance < 20) { // Within 20 degrees
    console.log(`${planet}: Current Gate ${position.gate}, closest Sacral Gate ${closestSacralGate} (${minDistance.toFixed(2)}° away)`);
  }
}

// Test what offset would put our planets in Sacral gates
console.log('\n🧪 Testing Offset Adjustments:');

function testOffset(longitude: number, planetName: string, offset: number) {
  const adjustedLon = ((longitude + offset) % 360 + 360) % 360;
  
  // Find gate using I-Ching wheel
  const gateIndex = Math.floor(adjustedLon / degreesPerGate);
  const clampedIndex = Math.max(0, Math.min(63, gateIndex));
  const gate = gateOrder[clampedIndex];
  
  return { gate, longitude: adjustedLon };
}

// Test a few key planets with different offsets
const testPlanets = [
  ['Personality Moon', personalityGates.MOON.longitude],
  ['Design Moon', designGates.MOON.longitude],
  ['Personality Mars', personalityGates.MARS.longitude],
  ['Design Mars', designGates.MARS.longitude],
];

for (const [planetName, longitude] of testPlanets) {
  console.log(`\n${planetName} (${longitude.toFixed(2)}°):`);
  
  for (let offset = -30; offset <= 30; offset += 10) {
    const result = testOffset(longitude, planetName, offset);
    if (sacralGates.includes(result.gate)) {
      console.log(`  ✅ Offset ${offset.toString().padStart(3)}°: Gate ${result.gate} (SACRAL!)`);
    }
  }
}

// Summary
console.log('\n🎯 Summary:');
const activeSacralGates = [...Object.values(personalityGates), ...Object.values(designGates)]
  .filter(p => sacralGates.includes(p.gate))
  .map(p => p.gate);

console.log(`Active Sacral gates: ${activeSacralGates.length > 0 ? activeSacralGates.join(', ') : 'NONE'}`);
console.log(`Issue: ${activeSacralGates.length === 0 ? 'No Sacral gates activated - this prevents Generator type' : 'Sacral gates found!'}`);

if (activeSacralGates.length === 0) {
  console.log('\n💡 Possible Solutions:');
  console.log('1. Adjust planetary calculation formulas');
  console.log('2. Apply planet-specific offsets');
  console.log('3. Use more accurate astronomical data');
  console.log('4. Check if we\'re using the wrong epoch');
}
