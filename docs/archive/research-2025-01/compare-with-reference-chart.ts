/**
 * Compare our calculations with the reference Human Design chart
 */

import { simpleAstronomicalCalculator } from '../../src/engines/calculators/simple-astronomical-calculator';

console.log('🔍 Comparing with Reference Human Design Chart');
console.log('=' .repeat(60));

const birthDate = new Date('1991-08-13T08:01:00Z');
const designDate = new Date('1991-05-13T08:28:00Z');
const latitude = 12.9716;
const longitude = 77.5946;

// Expected results from the reference chart
const expectedResults = {
  personality: {
    SUN: { gate: 4, line: 2 },
    EARTH: { gate: 49, line: 2 },
    MOON: { gate: 46, line: 6 },
    MERCURY: { gate: 59, line: 5 },
    VENUS: { gate: 59, line: 5 },
    MARS: { gate: 47, line: 1 },
    JUPITER: { gate: 4, line: 5 },
    SATURN: { gate: 41, line: 1 },
    URANUS: { gate: 38, line: 1 },
    NEPTUNE: { gate: 38, line: 6 },
    PLUTO: { gate: 1, line: 5 },
    NORTH_NODE: { gate: 31, line: 5 },
    SOUTH_NODE: { gate: 41, line: 6 }
  },
  design: {
    SUN: { gate: 23, line: 4 },
    EARTH: { gate: 43, line: 4 },
    MOON: { gate: 24, line: 4 },
    MERCURY: { gate: 42, line: 6 },
    VENUS: { gate: 52, line: 1 },
    MARS: { gate: 62, line: 2 },
    JUPITER: { gate: 54, line: 6 },
    SATURN: { gate: 54, line: 2 },
    URANUS: { gate: 38, line: 5 },
    NEPTUNE: { gate: 43, line: 1 },
    PLUTO: { gate: 43, line: 1 }
  }
};

// Calculate our results
const personalityGates = simpleAstronomicalCalculator.calculatePersonalityGates(
  birthDate, latitude, longitude
);

const designGates = simpleAstronomicalCalculator.calculatePersonalityGates(
  designDate, latitude, longitude
);

console.log('📊 PERSONALITY COMPARISON:');
console.log('Planet'.padEnd(12) + 'Expected'.padEnd(12) + 'Our Result'.padEnd(12) + 'Match'.padEnd(8) + 'Difference');
console.log('-'.repeat(60));

let personalityMatches = 0;
let personalityTotal = 0;

for (const [planet, expected] of Object.entries(expectedResults.personality)) {
  const ourResult = personalityGates[planet];
  if (ourResult) {
    personalityTotal++;
    const gateMatch = ourResult.gate === expected.gate;
    const lineMatch = ourResult.line === expected.line;
    const fullMatch = gateMatch && lineMatch;
    
    if (fullMatch) personalityMatches++;
    
    const matchStatus = fullMatch ? '✅' : gateMatch ? '🔸' : '❌';
    const difference = gateMatch ? `Line: ${ourResult.line - expected.line}` : `Gate: ${ourResult.gate - expected.gate}`;
    
    console.log(
      planet.padEnd(12) + 
      `${expected.gate}.${expected.line}`.padEnd(12) + 
      `${ourResult.gate}.${ourResult.line}`.padEnd(12) + 
      matchStatus.padEnd(8) + 
      difference
    );
  }
}

console.log('\n📊 DESIGN COMPARISON:');
console.log('Planet'.padEnd(12) + 'Expected'.padEnd(12) + 'Our Result'.padEnd(12) + 'Match'.padEnd(8) + 'Difference');
console.log('-'.repeat(60));

let designMatches = 0;
let designTotal = 0;

for (const [planet, expected] of Object.entries(expectedResults.design)) {
  const ourResult = designGates[planet];
  if (ourResult) {
    designTotal++;
    const gateMatch = ourResult.gate === expected.gate;
    const lineMatch = ourResult.line === expected.line;
    const fullMatch = gateMatch && lineMatch;
    
    if (fullMatch) designMatches++;
    
    const matchStatus = fullMatch ? '✅' : gateMatch ? '🔸' : '❌';
    const difference = gateMatch ? `Line: ${ourResult.line - expected.line}` : `Gate: ${ourResult.gate - expected.gate}`;
    
    console.log(
      planet.padEnd(12) + 
      `${expected.gate}.${expected.line}`.padEnd(12) + 
      `${ourResult.gate}.${ourResult.line}`.padEnd(12) + 
      matchStatus.padEnd(8) + 
      difference
    );
  }
}

// Analyze Sacral gates from reference chart
console.log('\n🎯 SACRAL GATE ANALYSIS:');
const sacralGates = [5, 14, 29, 59, 9, 3, 42, 27, 34];
const expectedSacralGates = [];
const ourSacralGates = [];

// Check expected Sacral gates
for (const [planet, expected] of Object.entries(expectedResults.personality)) {
  if (sacralGates.includes(expected.gate)) {
    expectedSacralGates.push(`Personality ${planet}: Gate ${expected.gate}.${expected.line}`);
  }
}

for (const [planet, expected] of Object.entries(expectedResults.design)) {
  if (sacralGates.includes(expected.gate)) {
    expectedSacralGates.push(`Design ${planet}: Gate ${expected.gate}.${expected.line}`);
  }
}

// Check our Sacral gates
for (const [planet, result] of Object.entries(personalityGates)) {
  if (sacralGates.includes(result.gate)) {
    ourSacralGates.push(`Personality ${planet}: Gate ${result.gate}.${result.line}`);
  }
}

for (const [planet, result] of Object.entries(designGates)) {
  if (sacralGates.includes(result.gate)) {
    ourSacralGates.push(`Design ${planet}: Gate ${result.gate}.${result.line}`);
  }
}

console.log('Expected Sacral Gates:');
expectedSacralGates.forEach(gate => console.log(`  ✅ ${gate}`));

console.log('\nOur Sacral Gates:');
if (ourSacralGates.length > 0) {
  ourSacralGates.forEach(gate => console.log(`  🔸 ${gate}`));
} else {
  console.log('  ❌ None found');
}

// Key insights
console.log('\n🔍 KEY INSIGHTS:');

// Check for Gate 46 specifically (needed for Channel 29-46)
const expectedGate46 = expectedResults.personality.MOON; // Gate 46.6
const ourMoon = personalityGates.MOON;

console.log(`\n🎯 Critical Gate 46 Analysis:`);
console.log(`Expected: Personality Moon at Gate ${expectedGate46.gate}.${expectedGate46.line}`);
console.log(`Our result: Personality Moon at Gate ${ourMoon.gate}.${ourMoon.line}`);
console.log(`Gate difference: ${ourMoon.gate - expectedGate46.gate} gates`);

// Calculate longitude difference
const expectedGate46Longitude = (45 * 5.625) + (5.5 * 0.9375); // Gate 46, line 6
const ourMoonLongitude = ourMoon.longitude;
const longitudeDifference = ourMoonLongitude - expectedGate46Longitude;

console.log(`Expected longitude: ~${expectedGate46Longitude.toFixed(2)}°`);
console.log(`Our longitude: ${ourMoonLongitude.toFixed(2)}°`);
console.log(`Longitude difference: ${longitudeDifference.toFixed(2)}°`);

// Summary
console.log('\n📈 ACCURACY SUMMARY:');
console.log(`Personality matches: ${personalityMatches}/${personalityTotal} (${(personalityMatches/personalityTotal*100).toFixed(1)}%)`);
console.log(`Design matches: ${designMatches}/${designTotal} (${(designMatches/designTotal*100).toFixed(1)}%)`);
console.log(`Overall accuracy: ${(personalityMatches + designMatches)}/${(personalityTotal + designTotal)} (${((personalityMatches + designMatches)/(personalityTotal + designTotal)*100).toFixed(1)}%)`);

console.log('\n💡 NEXT STEPS:');
if (personalityMatches === 2 && designMatches === 2) {
  console.log('✅ Sun positions are perfect - astronomical core is working');
  console.log('🔧 Need to improve planetary calculation precision');
  console.log('🎯 Focus on Moon calculation to get Gate 46 for Sacral channel');
} else {
  console.log('❌ Need to investigate coordinate system and offsets');
}
