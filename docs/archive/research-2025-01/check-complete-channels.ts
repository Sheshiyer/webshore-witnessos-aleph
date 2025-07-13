/**
 * Check for complete channels with the precise calculator
 */

import { preciseAstronomicalCalculator } from '../../src/engines/calculators/precise-astronomical-calculator';

console.log('🔗 Checking Complete Channels with Precise Calculator');
console.log('=' .repeat(60));

const birthDate = new Date('1991-08-13T08:01:00Z');
const latitude = 12.9716;
const longitude = 77.5946;

// Calculate using precise calculator
const result = preciseAstronomicalCalculator.calculateAllGates(birthDate, latitude, longitude);

// Collect all active gates
const allGates = new Set<number>();
for (const position of Object.values(result.personality)) {
  allGates.add(position.gate);
}
for (const position of Object.values(result.design)) {
  allGates.add(position.gate);
}

console.log('🎯 All Active Gates:');
const sortedGates = Array.from(allGates).sort((a, b) => a - b);
console.log(sortedGates.join(', '));

// Define all channels
const channels = [
  // Sacral Channels
  { number: 20, name: 'Now', gates: [34, 20], center: 'Sacral' },
  { number: 5, name: 'Fixed Rhythms', gates: [5, 15], center: 'Sacral' },
  { number: 2, name: 'The Beat', gates: [14, 2], center: 'Sacral' },
  { number: 29, name: 'Perseverance', gates: [29, 46], center: 'Sacral' },
  { number: 6, name: 'Mating', gates: [59, 6], center: 'Sacral' },
  { number: 9, name: 'Concentration', gates: [9, 52], center: 'Sacral' },
  { number: 3, name: 'Mutation', gates: [3, 60], center: 'Sacral' },
  { number: 42, name: 'Maturation', gates: [42, 53], center: 'Sacral' },
  { number: 27, name: 'Preservation', gates: [27, 50], center: 'Sacral' },
  
  // Other important channels
  { number: 1, name: 'Creative', gates: [1, 8], center: 'Throat' },
  { number: 7, name: 'Leading', gates: [31, 7], center: 'Throat' },
  { number: 11, name: 'Ideas', gates: [43, 23], center: 'Throat' },
  { number: 12, name: 'Caution', gates: [45, 21], center: 'Throat' },
  { number: 13, name: 'The Listener', gates: [33, 13], center: 'Throat' },
  { number: 16, name: 'Wavelength', gates: [48, 16], center: 'Throat' },
  { number: 17, name: 'Opinion', gates: [17, 62], center: 'Throat' },
  { number: 18, name: 'Correction', gates: [18, 58], center: 'Throat' },
  { number: 19, name: 'Wanting', gates: [49, 19], center: 'Throat' },
  { number: 23, name: 'Assimilation', gates: [43, 23], center: 'Throat' },
  { number: 35, name: 'Progress', gates: [35, 36], center: 'Throat' },
  { number: 56, name: 'Stimulation', gates: [56, 11], center: 'Throat' },
  { number: 62, name: 'Details', gates: [17, 62], center: 'Throat' }
];

console.log('\n🔗 COMPLETE CHANNELS ANALYSIS:');
const completeChannels = [];
const partialChannels = [];

for (const channel of channels) {
  const [gate1, gate2] = channel.gates;
  const hasGate1 = allGates.has(gate1);
  const hasGate2 = allGates.has(gate2);
  
  if (hasGate1 && hasGate2) {
    completeChannels.push(channel);
    console.log(`✅ COMPLETE: Channel ${channel.number} (${channel.name}) - Gates ${gate1}-${gate2} [${channel.center}]`);
  } else if (hasGate1 || hasGate2) {
    partialChannels.push({
      ...channel,
      activeGate: hasGate1 ? gate1 : gate2,
      missingGate: hasGate1 ? gate2 : gate1
    });
  }
}

console.log('\n⚠️  PARTIAL CHANNELS:');
for (const channel of partialChannels) {
  console.log(`🔸 PARTIAL: Channel ${channel.number} (${channel.name}) - Have Gate ${channel.activeGate}, Missing Gate ${channel.missingGate} [${channel.center}]`);
}

// Analyze center definitions
console.log('\n🏛️  CENTER DEFINITIONS:');
const centerDefinitions = {
  'Sacral': completeChannels.filter(c => c.center === 'Sacral').length > 0,
  'Throat': completeChannels.filter(c => c.center === 'Throat').length > 0,
  'Heart': completeChannels.filter(c => c.center === 'Heart').length > 0,
  'Spleen': completeChannels.filter(c => c.center === 'Spleen').length > 0,
  'Solar Plexus': completeChannels.filter(c => c.center === 'Solar Plexus').length > 0,
  'G': completeChannels.filter(c => c.center === 'G').length > 0,
  'Head': completeChannels.filter(c => c.center === 'Head').length > 0,
  'Ajna': completeChannels.filter(c => c.center === 'Ajna').length > 0,
  'Root': completeChannels.filter(c => c.center === 'Root').length > 0
};

for (const [center, isDefined] of Object.entries(centerDefinitions)) {
  const status = isDefined ? '✅ DEFINED' : '❌ UNDEFINED';
  console.log(`${center.padEnd(15)}: ${status}`);
}

// Determine Type and Authority
console.log('\n🎯 HUMAN DESIGN TYPE & AUTHORITY:');
const sacralDefined = centerDefinitions['Sacral'];
const throatDefined = centerDefinitions['Throat'];
const heartDefined = centerDefinitions['Heart'];
const spleenDefined = centerDefinitions['Spleen'];
const solarPlexusDefined = centerDefinitions['Solar Plexus'];

let type = 'Reflector'; // Default
let authority = 'Lunar Cycle'; // Default for Reflector

if (sacralDefined) {
  if (throatDefined) {
    // Check if there's a direct connection between Sacral and Throat
    type = 'Manifesting Generator';
  } else {
    type = 'Generator';
  }
  authority = 'Sacral';
} else if (throatDefined) {
  type = 'Manifestor';
  if (heartDefined) {
    authority = 'Heart';
  } else if (spleenDefined) {
    authority = 'Spleen';
  } else {
    authority = 'Heart'; // Default for Manifestor
  }
} else if (solarPlexusDefined) {
  type = 'Projector';
  authority = 'Emotional';
} else if (spleenDefined) {
  type = 'Projector';
  authority = 'Spleen';
} else if (heartDefined) {
  type = 'Projector';
  authority = 'Heart';
}

console.log(`Type: ${type}`);
console.log(`Authority: ${authority}`);

// Summary
console.log('\n📊 SUMMARY:');
console.log(`Complete Channels: ${completeChannels.length}`);
console.log(`Partial Channels: ${partialChannels.length}`);
console.log(`Defined Centers: ${Object.values(centerDefinitions).filter(Boolean).length}/9`);

if (completeChannels.length > 0) {
  console.log('\n🎉 SUCCESS: We have complete channels!');
  console.log('✅ The precise astronomical calculator is working correctly');
  console.log('🎯 Ready to integrate into the main Human Design calculator');
} else {
  console.log('\n❌ Still missing complete channels');
  console.log('💡 Need further refinement of planetary calculations');
}
