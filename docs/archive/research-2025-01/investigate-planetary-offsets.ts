/**
 * Investigate planetary-specific offsets to find missing Sacral gates
 */

import { simpleAstronomicalCalculator } from '../../src/engines/calculators/simple-astronomical-calculator';

console.log('🔍 Investigating Planetary-Specific Offsets');
console.log('=' .repeat(50));

const birthDate = new Date('1991-08-13T08:01:00Z');
const correctDesignDate = new Date('1991-05-13T08:28:00Z');
const latitude = 12.9716;
const longitude = 77.5946;

// Sacral gates that we need to find
const sacralGates = [5, 14, 29, 59, 9, 3, 42, 27, 34];
console.log(`Sacral gates we need: ${sacralGates.join(', ')}`);

// Get current planetary positions
const personalityGates = simpleAstronomicalCalculator.calculatePersonalityGates(
  birthDate, latitude, longitude
);

const designGates = simpleAstronomicalCalculator.calculatePersonalityGates(
  correctDesignDate, latitude, longitude
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

// Check if any planets are close to Sacral gates
console.log('\n🔍 Checking Proximity to Sacral Gates:');

function findClosestSacralGate(longitude: number) {
  const degreesPerGate = 360.0 / 64.0;
  let closestGate = null;
  let minDistance = Infinity;
  
  for (const sacralGate of sacralGates) {
    const gateCenter = (sacralGate - 1) * degreesPerGate + degreesPerGate / 2;
    let distance = Math.abs(longitude - gateCenter);
    if (distance > 180) distance = 360 - distance;
    
    if (distance < minDistance) {
      minDistance = distance;
      closestGate = sacralGate;
    }
  }
  
  return { gate: closestGate, distance: minDistance };
}

const allPlanets = [...Object.entries(personalityGates), ...Object.entries(designGates)];

for (const [planet, position] of allPlanets) {
  const closest = findClosestSacralGate(position.longitude);
  if (closest.distance < 10) { // Within 10 degrees
    console.log(`${planet}: Current Gate ${position.gate}, closest Sacral Gate ${closest.gate} (${closest.distance.toFixed(2)}° away)`);
  }
}

// Test different offsets for non-Sun planets
console.log('\n🧪 Testing Different Offsets for Other Planets:');

// Test Moon specifically (often important for Sacral)
const moonPersonality = personalityGates.MOON;
const moonDesign = designGates.MOON;

console.log(`\nMoon Analysis:`);
console.log(`Personality Moon: Gate ${moonPersonality.gate}.${moonPersonality.line} (${moonPersonality.longitude.toFixed(2)}°)`);
console.log(`Design Moon: Gate ${moonDesign.gate}.${moonDesign.line} (${moonDesign.longitude.toFixed(2)}°)`);

// Test what offset would put Moon in a Sacral gate
function testOffsetForSacralGate(longitude: number, planetName: string) {
  console.log(`\nTesting offsets for ${planetName} (${longitude.toFixed(2)}°):`);
  
  for (const sacralGate of sacralGates) {
    const degreesPerGate = 360.0 / 64.0;
    const targetLongitude = (sacralGate - 1) * degreesPerGate + degreesPerGate / 2;
    
    let neededOffset = targetLongitude - longitude;
    if (neededOffset > 180) neededOffset -= 360;
    if (neededOffset < -180) neededOffset += 360;
    
    if (Math.abs(neededOffset) < 90) { // Only show reasonable offsets
      console.log(`  Gate ${sacralGate.toString().padStart(2)}: offset ${neededOffset.toFixed(1)}°`);
    }
  }
}

testOffsetForSacralGate(moonPersonality.longitude, 'Personality Moon');
testOffsetForSacralGate(moonDesign.longitude, 'Design Moon');

// Test Mars (motor planet, often in Sacral)
const marsPersonality = personalityGates.MARS;
const marsDesign = designGates.MARS;

testOffsetForSacralGate(marsPersonality.longitude, 'Personality Mars');
testOffsetForSacralGate(marsDesign.longitude, 'Design Mars');

// Check if we're missing any planets in our calculation
console.log('\n🔍 Checking Calculated Planets:');
const expectedPlanets = ['SUN', 'EARTH', 'MOON', 'MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'PLUTO', 'NORTH_NODE', 'SOUTH_NODE'];
const actualPlanets = Object.keys(personalityGates);

console.log(`Expected planets: ${expectedPlanets.join(', ')}`);
console.log(`Actual planets: ${actualPlanets.join(', ')}`);

const missingPlanets = expectedPlanets.filter(p => !actualPlanets.includes(p));
if (missingPlanets.length > 0) {
  console.log(`❌ Missing planets: ${missingPlanets.join(', ')}`);
} else {
  console.log(`✅ All expected planets are calculated`);
}

// Summary
console.log('\n🎯 Summary:');
console.log(`Current Sacral gates: NONE`);
console.log(`Need at least one Sacral gate for Generator type`);
console.log(`Possible solutions:`);
console.log(`1. Different offsets for different planets`);
console.log(`2. Missing planets in calculation`);
console.log(`3. Different calculation method for non-Sun planets`);
