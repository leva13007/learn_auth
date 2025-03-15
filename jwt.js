const jwt = require('jsonwebtoken');

const secretKey = "super_secret_key";
const payload = { id: 1, email: "user@example.com", role: "user", password: "123"};

const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

console.log("JWT Token:", token);

const decoded = jwt.decode(token);
console.log('Decoded Payload:', decoded);

const modifiedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwicGFzc3dvcmQiOiIxMjMiLCJpYXQiOjE3NDE5ODU0NjEsImV4cCI6MTc0MTk4OTA2MX0.zQlp0XqsMuTJUDUKlwx91t7nmRSunOYAJ06Sguko9mU"

jwt.verify(modifiedToken, secretKey, (err, decoded) => {
  if (err) {
    console.error('❌ Invalid token:', err.message);
  } else {
    console.log('✅ Verified token:', decoded);
  }
});