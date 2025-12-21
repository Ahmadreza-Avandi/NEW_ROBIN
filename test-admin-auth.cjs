const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// تست ایجاد توکن
const testToken = jwt.sign(
  { id: 1, email: 'admin@example.com', name: 'Super Admin' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('Test Token:', testToken);

// تست تأیید توکن
try {
  const decoded = jwt.verify(testToken, JWT_SECRET);
  console.log('Decoded Token:', decoded);
} catch (error) {
  console.error('Token verification failed:', error.message);
}