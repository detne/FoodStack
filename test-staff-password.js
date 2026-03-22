// test-staff-password.js
const bcrypt = require('bcryptjs');

async function testPassword() {
  const plainPassword = 'staff123';
  const hashedFromDB = '$2a$12$Y0xdnsCCnfDcpxUdBXF2oOXXawp/EiwmqcfOji2qQ8HEyRYFl6Ndq';

  console.log('Testing password...\n');
  console.log('Plain password:', plainPassword);
  console.log('Hash from DB:', hashedFromDB);
  console.log('');

  // Test if password matches
  const isMatch = await bcrypt.compare(plainPassword, hashedFromDB);
  console.log('Password matches:', isMatch);

  if (!isMatch) {
    console.log('\n❌ Password does NOT match!');
    console.log('Creating new hash for "staff123"...\n');
    
    const newHash = await bcrypt.hash(plainPassword, 12);
    console.log('New hash:', newHash);
    console.log('\nUpdate your database with this SQL:');
    console.log(`UPDATE users SET password_hash = '${newHash}' WHERE email = 'phulam123@gmail.com';`);
  } else {
    console.log('\n✅ Password matches! Login should work.');
  }
}

testPassword();
