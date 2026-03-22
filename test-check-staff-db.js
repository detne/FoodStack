// test-check-staff-db.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkStaff() {
  try {
    console.log('Checking staff user in database...\n');

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: 'ngocquyentcv95@gmail.com' },
      include: {
        restaurants: {
          select: { id: true, name: true, email_verified: true }
        }
      }
    });

    if (!user) {
      console.log('❌ User NOT found in database!');
      console.log('Email: ngocquyentcv95@gmail.com');
      return;
    }

    console.log('✅ User found!');
    console.log('Email:', user.email);
    console.log('Full Name:', user.full_name);
    console.log('Role:', user.role);
    console.log('Status:', user.status);
    console.log('Restaurant ID:', user.restaurant_id);
    console.log('Branch ID:', user.branch_id);
    console.log('Password Hash:', user.password_hash.substring(0, 30) + '...');
    console.log('');

    // Test password
    const testPassword = 'staff123';
    const isMatch = await bcrypt.compare(testPassword, user.password_hash);
    console.log('Password "staff123" matches:', isMatch);

    if (!isMatch) {
      console.log('\n❌ Password does NOT match!');
      console.log('Generating new hash...');
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log('New hash:', newHash);
      console.log('\nRun this SQL to fix:');
      console.log(`UPDATE users SET password_hash = '${newHash}' WHERE email = 'ngocquyentcv95@gmail.com';`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStaff();
