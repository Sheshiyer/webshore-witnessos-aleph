#!/usr/bin/env node

/**
 * Migration script to load Human Design data into Cloudflare D1 database
 * This removes the need to reference files directly and prevents code bloat
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = 'docs/api/engines/data/human_design';

// Database schema for Human Design data
const SCHEMA = `
-- Human Design Gates
CREATE TABLE IF NOT EXISTS hd_gates (
  id INTEGER PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  keynote TEXT,
  description TEXT,
  center TEXT,
  channel_partner INTEGER,
  gift TEXT,
  shadow TEXT,
  siddhi TEXT,
  codon TEXT,
  amino_acid TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Human Design Channels
CREATE TABLE IF NOT EXISTS hd_channels (
  id INTEGER PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  gate1 INTEGER NOT NULL,
  gate2 INTEGER NOT NULL,
  center1 TEXT,
  center2 TEXT,
  circuitry TEXT,
  theme TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Human Design Centers
CREATE TABLE IF NOT EXISTS hd_centers (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  theme TEXT,
  function TEXT,
  biological_correlation TEXT,
  defined_characteristics TEXT,
  undefined_characteristics TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Human Design Types
CREATE TABLE IF NOT EXISTS hd_types (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  strategy TEXT,
  signature TEXT,
  not_self_theme TEXT,
  percentage REAL,
  characteristics TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Human Design Authorities
CREATE TABLE IF NOT EXISTS hd_authorities (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  decision_making TEXT,
  characteristics TEXT,
  centers_required TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Human Design Profiles
CREATE TABLE IF NOT EXISTS hd_profiles (
  id INTEGER PRIMARY KEY,
  profile TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  line1_description TEXT,
  line2_description TEXT,
  theme TEXT,
  characteristics TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Human Design Lines
CREATE TABLE IF NOT EXISTS hd_lines (
  id INTEGER PRIMARY KEY,
  line_number INTEGER NOT NULL,
  gate_number INTEGER NOT NULL,
  name TEXT,
  description TEXT,
  keynote TEXT,
  characteristics TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(line_number, gate_number)
);

-- Human Design Incarnation Crosses
CREATE TABLE IF NOT EXISTS hd_incarnation_crosses (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  personality_sun INTEGER,
  personality_earth INTEGER,
  design_sun INTEGER,
  design_earth INTEGER,
  theme TEXT,
  purpose TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

async function loadJsonFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

async function migrateGates(db) {
  console.log('Migrating gates data...');
  const gatesData = await loadJsonFile('gates.json');
  
  for (const [gateNum, gate] of Object.entries(gatesData.gates)) {
    await db.prepare(`
      INSERT OR REPLACE INTO hd_gates 
      (number, name, keynote, description, center, channel_partner, gift, shadow, siddhi, codon, amino_acid)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      gate.number,
      gate.name,
      gate.keynote,
      gate.description,
      gate.center,
      gate.channel_partner,
      gate.gift,
      gate.shadow,
      gate.siddhi,
      gate.codon,
      gate.amino_acid
    ).run();
  }
  console.log(`Migrated ${Object.keys(gatesData.gates).length} gates`);
}

async function migrateChannels(db) {
  console.log('Migrating channels data...');
  const channelsData = await loadJsonFile('channels.json');
  
  for (const [channelKey, channel] of Object.entries(channelsData.channels)) {
    const [gate1, gate2] = channelKey.split('-').map(Number);
    
    await db.prepare(`
      INSERT OR REPLACE INTO hd_channels 
      (number, name, description, gate1, gate2, center1, center2, circuitry, theme)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      channel.number,
      channel.name,
      channel.description,
      gate1,
      gate2,
      channel.center1,
      channel.center2,
      channel.circuitry,
      channel.theme
    ).run();
  }
  console.log(`Migrated ${Object.keys(channelsData.channels).length} channels`);
}

async function migrateCenters(db) {
  console.log('Migrating centers data...');
  const centersData = await loadJsonFile('centers.json');
  
  for (const [centerName, center] of Object.entries(centersData.centers)) {
    await db.prepare(`
      INSERT OR REPLACE INTO hd_centers 
      (name, description, theme, function, biological_correlation, defined_characteristics, undefined_characteristics)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      centerName,
      center.description,
      center.theme,
      center.function,
      center.biological_correlation,
      JSON.stringify(center.defined_characteristics),
      JSON.stringify(center.undefined_characteristics)
    ).run();
  }
  console.log(`Migrated ${Object.keys(centersData.centers).length} centers`);
}

// Export for use in Cloudflare Workers
export { SCHEMA, migrateGates, migrateChannels, migrateCenters };
