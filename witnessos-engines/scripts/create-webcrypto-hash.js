/**
 * Create password hash using the same WebCrypto method as the auth service
 */

const encoder = new TextEncoder();

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 32 bytes
  );
  
  const hashBytes = new Uint8Array(derivedBits);
  
  // Combine salt and hash
  const combined = new Uint8Array(salt.length + hashBytes.length);
  combined.set(salt);
  combined.set(hashBytes, salt.length);
  
  // Convert to base64
  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

async function createWebCryptoHash() {
  const password = 'admin123';
  console.log('Creating WebCrypto hash for password:', password);
  
  const hash = await hashPassword(password);
  console.log('WebCrypto hash:', hash);
  
  console.log('\nSQL command to update user:');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE id = 5;`);
}

createWebCryptoHash().catch(console.error);
