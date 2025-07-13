/**
 * Find the correct offset for Design calculations using the validation Design date
 */

import { simpleAstronomicalCalculator } from '../../src/engines/calculators/simple-astronomical-calculator';

// Use the correct Design date from validation data
const correctDesignDate = new Date('1991-05-13T08:28:00Z');
const latitude = 12.9716;
const longitude = 77.5946;

console.log('🔍 Finding Correct Design Offset with Validation Date');
console.log('=' .repeat(55));

// Calculate raw solar longitude for the correct Design date
const j2000 = new Date('2000-01-01T12:00:00Z');
const daysSinceJ2000 = (correctDesignDate.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);

function calculateRawSolarLongitude(daysSinceJ2000: number): number {
  const T = daysSinceJ2000 / 36525.0;
  const L0 = 280.4664567 + 36000.76982779 * T + 0.0003032028 * T * T;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536667 * T * T;
  const M_rad = M * Math.PI / 180;
  const C = (1.9146 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_rad) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * M_rad) +
            0.000289 * Math.sin(3 * M_rad);
  return ((L0 + C) % 360 + 360) % 360;
}

const rawDesignSunLon = calculateRawSolarLongitude(daysSinceJ2000);
console.log(`Raw Design Sun longitude: ${rawDesignSunLon.toFixed(2)}°`);

// Calculate what longitude Gate 23 should be at
const targetGate = 23;
const degreesPerGate = 360.0 / 64.0;
const targetLongitude = (targetGate - 1) * degreesPerGate + degreesPerGate / 2;
console.log(`Target longitude for Gate 23: ${targetLongitude.toFixed(2)}°`);

// Calculate needed offset
let neededOffset = targetLongitude - rawDesignSunLon;

// Normalize to -180 to +180
while (neededOffset > 180) neededOffset -= 360;
while (neededOffset < -180) neededOffset += 360;

console.log(`Needed offset for Design: ${neededOffset.toFixed(2)}°`);

// Test this offset
function testSequentialWithOffset(longitude: number, offset: number) {
  const adjustedLon = ((longitude + offset) % 360 + 360) % 360;
  const gateNumber = Math.floor(adjustedLon / degreesPerGate) + 1;
  const gate = Math.max(1, Math.min(64, gateNumber));
  
  // Calculate line
  const positionInGate = (adjustedLon % degreesPerGate) / degreesPerGate;
  const line = Math.floor(positionInGate * 6) + 1;
  
  return { gate, line: Math.max(1, Math.min(6, line)), longitude: adjustedLon };
}

const testResult = testSequentialWithOffset(rawDesignSunLon, neededOffset);
console.log(`Test result: Gate ${testResult.gate}.${testResult.line} (${testResult.longitude.toFixed(2)}°)`);

if (testResult.gate === 23) {
  console.log('✅ Perfect match! This offset works for Design.');
} else {
  console.log('❌ Offset doesn\'t work perfectly.');
}

// Compare with Personality offset
console.log('\n🔍 Offset Comparison:');
console.log(`Personality offset: -120°`);
console.log(`Design offset needed: ${neededOffset.toFixed(2)}°`);
console.log(`Difference: ${(neededOffset - (-120)).toFixed(2)}°`);

// Test a range of offsets to see if there's a pattern
console.log('\n🔍 Testing Range of Design Offsets:');
for (let offset = -180; offset <= 180; offset += 15) {
  const result = testSequentialWithOffset(rawDesignSunLon, offset);
  if (result.gate === 23) {
    console.log(`✅ Offset ${offset.toString().padStart(4)}°: Gate ${result.gate}.${result.line} - PERFECT MATCH!`);
  } else if (Math.abs(result.gate - 23) <= 2) {
    console.log(`🔸 Offset ${offset.toString().padStart(4)}°: Gate ${result.gate}.${result.line} - Close`);
  }
}

// Test what our current method gives
console.log('\n🧪 Current Method Results:');
const currentDesignGates = simpleAstronomicalCalculator.calculatePersonalityGates(
  correctDesignDate, latitude, longitude
);
console.log(`Current method: Gate ${currentDesignGates.SUN.gate}.${currentDesignGates.SUN.line} (${currentDesignGates.SUN.longitude.toFixed(2)}°)`);

// Calculate what offset our current method is using
const currentOffset = currentDesignGates.SUN.longitude - rawDesignSunLon;
const normalizedCurrentOffset = currentOffset > 180 ? currentOffset - 360 : currentOffset < -180 ? currentOffset + 360 : currentOffset;
console.log(`Current method offset: ${normalizedCurrentOffset.toFixed(2)}°`);

console.log('\n🎯 Summary:');
console.log(`Raw Design Sun: ${rawDesignSunLon.toFixed(2)}°`);
console.log(`Target for Gate 23: ${targetLongitude.toFixed(2)}°`);
console.log(`Needed offset: ${neededOffset.toFixed(2)}°`);
console.log(`Current offset: ${normalizedCurrentOffset.toFixed(2)}°`);
console.log(`Adjustment needed: ${(neededOffset - normalizedCurrentOffset).toFixed(2)}°`);
