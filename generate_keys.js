const crypto = require('crypto');
const fs = require('fs');

// Генеруємо пару ключів RSA (2048 біт)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Зберігаємо ключі у файли
fs.writeFileSync('./private.key', privateKey);
fs.writeFileSync('./public.key', publicKey);

console.log("✅ RSA ключі згенеровано!");