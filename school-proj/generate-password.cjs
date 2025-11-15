const bcrypt = require('bcryptjs');

const password = 'admin123';

bcrypt.hash(password, 10).then(hash => {
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n--- SQL Query to update user ---');
  console.log(`UPDATE user SET password = '${hash}' WHERE nationalCode = '1';`);
}).catch(err => {
  console.error('Error:', err);
});
