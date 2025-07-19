const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'admin123';
  const hash = '$2b$12$7tV3vXJMd6zAib7y02.0f.cXvtSdD2BwFmOKeYAWMsYOXZX8QBXnG';
  
  console.log('Testing password:', password);
  console.log('Against hash:', hash);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Password valid:', isValid);
  
  // Create a new hash for testing
  const newHash = await bcrypt.hash(password, 12);
  console.log('New hash:', newHash);
  
  const isNewValid = await bcrypt.compare(password, newHash);
  console.log('New hash valid:', isNewValid);
}

testPassword();
