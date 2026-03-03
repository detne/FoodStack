const { PrismaClient } = require('@prisma/client');

async function migrate() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Adding reset_token columns to users table...');
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP;
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
    `);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
