// generateKeys.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PRIVATE_KEY_PATH = path.join(__dirname, 'private.pem');
const PUBLIC_KEY_PATH = path.join(__dirname, 'public.pem');

// Solo generamos si no existen
if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
  console.log('✅ Las claves ya existen. No se generó nada.');
  process.exit(0);
}

// Generar par de claves RSA 2048 bits
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Guardar las claves en archivos
fs.writeFileSync(PRIVATE_KEY_PATH, privateKey, { mode: 0o600 });
fs.writeFileSync(PUBLIC_KEY_PATH, publicKey, { mode: 0o644 });

console.log('🔐 Claves generadas y guardadas como:');
console.log(`   📄 ${PRIVATE_KEY_PATH}`);
console.log(`   📄 ${PUBLIC_KEY_PATH}`);
