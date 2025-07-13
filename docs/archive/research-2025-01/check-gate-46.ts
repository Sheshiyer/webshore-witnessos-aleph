/**
 * Check if we have Gate 46 to complete the 29-46 channel
 */

import { simpleAstronomicalCalculator } from '../../src/engines/calculators/simple-astronomical-calculator';

console.log('🔍 Checking Gate 46 for Channel 29-46');
console.log('=' .repeat(40));

const birthDate = new Date('1991-08-13T08:01:00Z');
const designDate = new Date('1991-05-13T08:28:00Z');
const latitude = 12.9716;
const longitude = 77.5946;

// Calculate all gates
const personalityGates = simpleAstronomicalCalculator.calculatePersonalityGates(
  birthDate, latitude, longitude
);

const designGates = simpleAstronomicalCalculator.calculatePersonalityGates(
  designDate, latitude, longitude
);

console.log('🎯 Looking for Gate 29 and Gate 46:');

// Check for Gate 29
const gate29Positions = [];
const gate46Positions = [];

for (const [planet, position] of Object.entries(personalityGates)) {
  if (position.gate === 29) {
    gate29Positions.push(`Personality ${planet}: Gate ${position.gate}.${position.line}`);
  }
  if (position.gate === 46) {
    gate46Positions.push(`Personality ${planet}: Gate ${position.gate}.${position.line}`);
  }
}

for (const [planet, position] of Object.entries(designGates)) {
  if (position.gate === 29) {
    gate29Positions.push(`Design ${planet}: Gate ${position.gate}.${position.line}`);
  }
  if (position.gate === 46) {
    gate46Positions.push(`Design ${planet}: Gate ${position.gate}.${position.line}`);
  }
}

console.log('\n✅ Gate 29 Activations:');
if (gate29Positions.length > 0) {
  gate29Positions.forEach(pos => console.log(`  ${pos}`));
} else {
  console.log('  None found');
}

console.log('\n🔍 Gate 46 Activations:');
if (gate46Positions.length > 0) {
  gate46Positions.forEach(pos => console.log(`  ${pos}`));
} else {
  console.log('  None found');
}

console.log('\n🔗 Channel 29-46 Status:');
const hasGate29 = gate29Positions.length > 0;
const hasGate46 = gate46Positions.length > 0;

if (hasGate29 && hasGate46) {
  console.log('✅ COMPLETE CHANNEL: Both Gate 29 and Gate 46 activated!');
  console.log('✅ Sacral Center should be DEFINED');
} else if (hasGate29) {
  console.log('⚠️  INCOMPLETE CHANNEL: Gate 29 activated but missing Gate 46');
  console.log('❌ Sacral Center remains UNDEFINED');
} else if (hasGate46) {
  console.log('⚠️  INCOMPLETE CHANNEL: Gate 46 activated but missing Gate 29');
  console.log('❌ Sacral Center remains UNDEFINED');
} else {
  console.log('❌ NO CHANNEL: Neither Gate 29 nor Gate 46 activated');
}

// Check all Sacral channels
console.log('\n🔍 All Sacral Channels Check:');
const sacralChannels = [
  [34, 20], // Channel 20-34: "Now"
  [5, 15],  // Channel 5-15: "Fixed Rhythms"
  [14, 2],  // Channel 2-14: "The Beat"
  [29, 46], // Channel 29-46: "Perseverance"
  [59, 6],  // Channel 6-59: "Mating"
  [9, 52],  // Channel 9-52: "Concentration"
  [3, 60],  // Channel 3-60: "Mutation"
  [42, 53], // Channel 42-53: "Maturation"
  [27, 50]  // Channel 27-50: "Preservation"
];

const allGates = new Set();
for (const position of Object.values(personalityGates)) {
  allGates.add(position.gate);
}
for (const position of Object.values(designGates)) {
  allGates.add(position.gate);
}

console.log('Active Sacral Channels:');
let activeSacralChannels = 0;

for (const [gate1, gate2] of sacralChannels) {
  const hasGate1 = allGates.has(gate1);
  const hasGate2 = allGates.has(gate2);
  const isComplete = hasGate1 && hasGate2;
  
  const status = isComplete ? '✅ COMPLETE' : 
                 hasGate1 || hasGate2 ? '⚠️  PARTIAL' : '❌ NONE';
  
  console.log(`  Channel ${gate1}-${gate2}: ${status}`);
  
  if (isComplete) {
    activeSacralChannels++;
  }
}

console.log(`\n🎯 Summary:`);
console.log(`Active Sacral Channels: ${activeSacralChannels}`);
console.log(`Sacral Center Defined: ${activeSacralChannels > 0 ? 'YES' : 'NO'}`);

if (activeSacralChannels > 0) {
  console.log('🎉 SUCCESS: Sacral center should be defined!');
  console.log('🎯 Type should be Generator or Manifesting Generator');
} else {
  console.log('❌ ISSUE: No complete Sacral channels found');
  console.log('💡 Need to activate harmonic gates to complete channels');
}
