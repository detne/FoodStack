// update-staff-password.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    const email = 'ngocquyentcv95@gmail.com';
    const newPassword = 'staff123';

    console.log('Updating password for:', email);
    console.log('New password:', newPassword);
    console.log('');

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log('Hashed password:', hashedPassword);
    console.log('');

    // Update in database
    const result = await prisma.users.update({
      where: { email },
      data: {
        password_hash: hashedPassword,
        updated_at: new Date(),
      },
    });

    console.log('✅ Password updated successfully!');
    console.log('User:', result.email);
    console.log('Role:', result.role);
    console.log('');

    // Verify
    const isMatch = await bcrypt.compare(newPassword, result.password_hash);
    console.log('Verification - Password matches:', isMatch);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
