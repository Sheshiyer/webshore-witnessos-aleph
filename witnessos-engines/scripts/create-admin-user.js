/**
 * Script to create the default admin user for WitnessOS production
 * Run with: node scripts/create-admin-user.js
 */

const bcrypt = require('bcryptjs');

// Admin user details
const ADMIN_USER = {
  email: 'sheshnarayan.iyer@gmail.com',
  password: 'admin123', // Simple password for testing
  fullName: 'Cumbipuram Nateshan Sheshanarayan Iyer',
  birthDate: '1991-08-13',
  birthTime: '13:31',
  birthLocation: 'Bengaluru, India',
  latitude: 12.9629,
  longitude: 77.5775,
  timezone: 'Asia/Kolkata'
};

// Consciousness profile data
const CONSCIOUSNESS_PROFILE = {
  personalData: {
    fullName: ADMIN_USER.fullName,
    name: ADMIN_USER.fullName,
    preferredName: 'Shesh',
    birthDate: ADMIN_USER.birthDate,
  },
  birthData: {
    birthDate: ADMIN_USER.birthDate,
    birthTime: ADMIN_USER.birthTime,
    birthLocation: [ADMIN_USER.latitude, ADMIN_USER.longitude],
    timezone: ADMIN_USER.timezone,
    date: ADMIN_USER.birthDate,
    time: ADMIN_USER.birthTime,
    location: [ADMIN_USER.latitude, ADMIN_USER.longitude],
  },
  location: {
    city: 'Bengaluru',
    country: 'India',
    latitude: ADMIN_USER.latitude,
    longitude: ADMIN_USER.longitude,
    timezone: ADMIN_USER.timezone,
  },
  preferences: {
    primaryShape: 'circle',
    spectralDirection: 'north',
    consciousnessLevel: 1,
  },
  archetypalSignature: {
    // Will be populated by engines
  },
};

async function createAdminUser() {
  try {
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(ADMIN_USER.password, 12);
    
    console.log('📝 Admin user details:');
    console.log(`Email: ${ADMIN_USER.email}`);
    console.log(`Name: ${ADMIN_USER.fullName}`);
    console.log(`Birth: ${ADMIN_USER.birthDate} at ${ADMIN_USER.birthTime}`);
    console.log(`Location: ${ADMIN_USER.birthLocation} (${ADMIN_USER.latitude}°N, ${ADMIN_USER.longitude}°E)`);
    console.log(`Password Hash: ${passwordHash}`);
    
    console.log('\n🗄️ SQL Commands to execute:');
    console.log('\n-- 1. Create admin user');
    console.log(`INSERT INTO users (email, password_hash, name, created_at, updated_at, verified, preferences, is_admin, has_completed_onboarding) VALUES ('${ADMIN_USER.email}', '${passwordHash}', '${ADMIN_USER.fullName}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, '{}', 1, 1);`);
    
    console.log('\n-- 2. Create consciousness profile (replace USER_ID with the actual user ID from step 1)');
    console.log(`INSERT INTO consciousness_profiles (user_id, profile_data, created_at, updated_at, is_active) VALUES (1, '${JSON.stringify(CONSCIOUSNESS_PROFILE)}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1);`);
    
    console.log('\n✅ Admin user creation script completed!');
    console.log('\nNext steps:');
    console.log('1. Copy the SQL commands above');
    console.log('2. Execute them using wrangler d1 execute');
    console.log('3. Test login with the provided credentials');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();
