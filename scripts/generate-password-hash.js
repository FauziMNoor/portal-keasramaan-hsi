// Script untuk generate password hash
// Jalankan: node scripts/generate-password-hash.js

const bcrypt = require('bcryptjs');

const password = 'admin123'; // Password yang akan di-hash

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('\n===========================================');
  console.log('PASSWORD HASH GENERATED!');
  console.log('===========================================\n');
  console.log('Password:', password);
  console.log('\nHash:');
  console.log(hash);
  console.log('\n===========================================');
  console.log('COPY hash di atas dan jalankan SQL ini:');
  console.log('===========================================\n');
  console.log(`UPDATE users_keasramaan`);
  console.log(`SET password_hash = '${hash}'`);
  console.log(`WHERE email = 'admin@hsi.sch.id';`);
  console.log('\n===========================================\n');
});
