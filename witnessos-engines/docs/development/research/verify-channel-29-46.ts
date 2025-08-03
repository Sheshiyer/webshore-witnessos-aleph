/**
 * Verify Channel 29-46 with both gates in Personality
 */

import { preciseAstronomicalCalculator } from '../../src/engines/calculators/precise-astronomical-calculator';

console.log('🔗 Verifying Channel 29-46 Formation');
console.log('=' .repeat(50));

const birthDate = new Date('1991-08-13T08:01:00Z');
const latitude = 12.9716;
const longitude = 77.5946;

// Calculate gates
const result = preciseAstronomicalCalculator.calculateAllGates(birthDate, latitude, longitude);

// Collect all active gates from both personality and design
const allActiveGates = new Set<number>();

console.log('🎯 Collecting All Active Gates:');
console.log('\nPersonality Gates:');
for (const [planet, position] of Object.entries(result.personality)) {
  allActiveGates.add(position.gate);
  console.log(`  ${planet}: Gate ${position.gate}.${position.line}`);
}

console.log('\nDesign Gates:');
for (const [planet, position] of Object.entries(result.design)) {
  allActiveGates.add(position.gate);
  console.log(`  ${planet}: Gate ${position.gate}.${position.line}`);
}

console.log(`\nTotal Unique Gates: ${allActiveGates.size}`);
console.log(`Active Gates: ${Array.from(allActiveGates).sort((a, b) => a - b).join(', ')}`);

// Check Channel 29-46 specifically
const hasGate29 = allActiveGates.has(29);
const hasGate46 = allActiveGates.has(46);

console.log('\n🔗 Channel 29-46 Analysis:');
console.log(`Gate 29: ${hasGate29 ? '✅ ACTIVE' : '❌ MISSING'}`);
console.log(`Gate 46: ${hasGate46 ? '✅ ACTIVE' : '❌ MISSING'}`);

if (hasGate29 && hasGate46) {
  console.log('🎉 CHANNEL 29-46 (PERSEVERANCE) IS COMPLETE!');
  
  // Find where each gate is located
  const gate29Location = Object.entries(result.personality).find(([_, pos]) => pos.gate === 29) || 
                         Object.entries(result.design).find(([_, pos]) => pos.gate === 29);
  const gate46Location = Object.entries(result.personality).find(([_, pos]) => pos.gate === 46) || 
                         Object.entries(result.design).find(([_, pos]) => pos.gate === 46);
  
  if (gate29Location) {
    const [planet, position] = gate29Location;
    const side = Object.values(result.personality).includes(position) ? 'Personality' : 'Design';
    console.log(`  Gate 29: ${side} ${planet} (${position.gate}.${position.line})`);
  }
  
  if (gate46Location) {
    const [planet, position] = gate46Location;
    const side = Object.values(result.personality).includes(position) ? 'Personality' : 'Design';
    console.log(`  Gate 46: ${side} ${planet} (${position.gate}.${position.line})`);
  }
  
  console.log('\n✅ This channel connects to the SACRAL CENTER');
  console.log('✅ Sacral center should be DEFINED');
} else {
  console.log('❌ Channel 29-46 is incomplete');
}

// Check all Sacral channels
console.log('\n🏛️  SACRAL CENTER ANALYSIS:');
const sacralChannels = [
  { gates: [34, 20], name: 'Now' },
  { gates: [5, 15], name: 'Fixed Rhythms' },
  { gates: [14, 2], name: 'The Beat' },
  { gates: [29, 46], name: 'Perseverance' },
  { gates: [59, 6], name: 'Mating' },
  { gates: [9, 52], name: 'Concentration' },
  { gates: [3, 60], name: 'Mutation' },
  { gates: [42, 53], name: 'Maturation' },
  { gates: [27, 50], name: 'Preservation' }
];

let completeSacralChannels = 0;

for (const channel of sacralChannels) {
  const [gate1, gate2] = channel.gates;
  const hasGate1 = allActiveGates.has(gate1);
  const hasGate2 = allActiveGates.has(gate2);
  const isComplete = hasGate1 && hasGate2;
  
  if (isComplete) {
    completeSacralChannels++;
    console.log(`✅ Channel ${gate1}-${gate2} (${channel.name}): COMPLETE`);
  } else if (hasGate1 || hasGate2) {
    console.log(`🔸 Channel ${gate1}-${gate2} (${channel.name}): PARTIAL (${hasGate1 ? gate1 : gate2})`);
  }
}

console.log(`\n📊 Sacral Center Summary:`);
console.log(`Complete Channels: ${completeSacralChannels}`);
console.log(`Sacral Defined: ${completeSacralChannels > 0 ? 'YES' : 'NO'}`);

if (completeSacralChannels > 0) {
  console.log('\n🎯 TYPE DETERMINATION:');
  console.log('✅ Sacral Center is DEFINED');
  console.log('🎯 Type should be Generator or Manifesting Generator');
  console.log('🎯 Authority should be SACRAL (unless Solar Plexus is also defined)');
} else {
  console.log('\n❌ Sacral Center is UNDEFINED');
  console.log('🎯 Type should be Projector, Manifestor, or Reflector');
}
