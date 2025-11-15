const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = '$2a$10$j/KCE2ssT13HxS505UR7HecVmy53oekUg.2k5/8omY6CDoFEvYgU2';

bcrypt.compare(password, hash).then(result => {
  console.log('Password match:', result);
  if (result) {
    console.log('✅ رمز عبور صحیح است');
  } else {
    console.log('❌ رمز عبور اشتباه است');
  }
}).catch(err => {
  console.error('Error:', err);
});
