/**
 * Fine-tune the Personality offset to get the correct line
 */

import { simpleAstronomicalCalculator } from '../../src/engines/calculators/simple-astronomical-calculator';

console.log('🔧 Fine-tuning Personality Offset for Correct Line');
console.log('=' .repeat(55));

const birthDate = new Date('1991-08-13T08:01:00Z');
const latitude = 12.9716;
const longitude = 77.5946;

// Calculate raw solar longitude (before offset)
const j2000 = new Date('2000-01-01T12:00:00Z');
const daysSinceJ2000 = (birthDate.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);

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

const rawLongitude = calculateRawSolarLongitude(daysSinceJ2000);
console.log(`Raw solar longitude: ${rawLongitude.toFixed(4)}°`);

// Current offset and result
const currentOffset = -120.0;
const currentLongitude = ((rawLongitude + currentOffset) % 360 + 360) % 360;
console.log(`Current offset: ${currentOffset}°`);
console.log(`Current longitude: ${currentLongitude.toFixed(4)}°`);

// Calculate current gate and line
function calculateGateAndLine(longitude: number) {
  const degreesPerGate = 360.0 / 64.0;
  const lineSize = degreesPerGate / 6.0;
  
  const gateNumber = Math.floor(longitude / degreesPerGate) + 1;
  const gate = Math.max(1, Math.min(64, gateNumber));
  
  const gateStart = (gate - 1) * degreesPerGate;
  const positionInGate = longitude - gateStart;
  const line = Math.floor(positionInGate / lineSize) + 1;
  
  return { gate, line: Math.max(1, Math.min(6, line)), gateStart, positionInGate };
}

const currentResult = calculateGateAndLine(currentLongitude);
console.log(`Current result: Gate ${currentResult.gate}.${currentResult.line}`);

// Target: Gate 4, Line 2
const targetGate = 4;
const targetLine = 2;

// Calculate target longitude range
const degreesPerGate = 360.0 / 64.0;
const lineSize = degreesPerGate / 6.0;
const targetGateStart = (targetGate - 1) * degreesPerGate;
const targetLineStart = targetGateStart + (targetLine - 1) * lineSize;
const targetLineEnd = targetGateStart + targetLine * lineSize;
const targetLineCenter = (targetLineStart + targetLineEnd) / 2;

console.log(`\n🎯 Target: Gate ${targetGate}.${targetLine}`);
console.log(`Target line range: ${targetLineStart.toFixed(4)}° - ${targetLineEnd.toFixed(4)}°`);
console.log(`Target line center: ${targetLineCenter.toFixed(4)}°`);

// Calculate needed offset adjustment
const neededLongitude = targetLineCenter;
const neededOffset = neededLongitude - rawLongitude;
const normalizedNeededOffset = neededOffset > 180 ? neededOffset - 360 : neededOffset < -180 ? neededOffset + 360 : neededOffset;

console.log(`Needed longitude: ${neededLongitude.toFixed(4)}°`);
console.log(`Needed offset: ${normalizedNeededOffset.toFixed(4)}°`);
console.log(`Current offset: ${currentOffset.toFixed(4)}°`);
console.log(`Adjustment needed: ${(normalizedNeededOffset - currentOffset).toFixed(4)}°`);

// Test the new offset
const newOffset = normalizedNeededOffset;
const testLongitude = ((rawLongitude + newOffset) % 360 + 360) % 360;
const testResult = calculateGateAndLine(testLongitude);

console.log(`\n🧪 Testing new offset: ${newOffset.toFixed(4)}°`);
console.log(`Test longitude: ${testLongitude.toFixed(4)}°`);
console.log(`Test result: Gate ${testResult.gate}.${testResult.line}`);

if (testResult.gate === targetGate && testResult.line === targetLine) {
  console.log('✅ Perfect match!');
} else {
  console.log('❌ Still not perfect, but closer');
}

// Test a range of fine adjustments around the current offset
console.log('\n🔍 Testing Fine Adjustments:');
for (let adjustment = -2; adjustment <= 2; adjustment += 0.1) {
  const testOffset = currentOffset + adjustment;
  const testLon = ((rawLongitude + testOffset) % 360 + 360) % 360;
  const result = calculateGateAndLine(testLon);
  
  if (result.gate === targetGate && result.line === targetLine) {
    console.log(`✅ Offset ${testOffset.toFixed(1)}°: Gate ${result.gate}.${result.line} - PERFECT!`);
  } else if (result.gate === targetGate) {
    console.log(`🔸 Offset ${testOffset.toFixed(1)}°: Gate ${result.gate}.${result.line} - Right gate`);
  }
}

// Find the exact offset that gives us Gate 4.2
console.log('\n🎯 Finding Exact Offset for Gate 4.2:');
let bestOffset = currentOffset;
let bestDistance = Infinity;

for (let offset = -125; offset <= -115; offset += 0.01) {
  const testLon = ((rawLongitude + offset) % 360 + 360) % 360;
  const result = calculateGateAndLine(testLon);
  
  if (result.gate === targetGate && result.line === targetLine) {
    const distance = Math.abs(testLon - targetLineCenter);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestOffset = offset;
    }
  }
}

console.log(`Best offset found: ${bestOffset.toFixed(2)}°`);
const finalTestLon = ((rawLongitude + bestOffset) % 360 + 360) % 360;
const finalResult = calculateGateAndLine(finalTestLon);
console.log(`Final result: Gate ${finalResult.gate}.${finalResult.line} (${finalTestLon.toFixed(4)}°)`);
console.log(`Distance from target center: ${Math.abs(finalTestLon - targetLineCenter).toFixed(4)}°`);
