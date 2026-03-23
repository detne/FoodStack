#!/usr/bin/env node

/**
 * Generate Secure Secrets for Production
 * Tạo JWT secrets an toàn cho production
 */

const crypto = require('crypto');

console.log('🔐 Generating secure secrets for production...\n');

const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
const sessionSecret = crypto.randomBytes(32).toString('hex');

console.log('Copy these to your production environment variables:\n');
console.log('━'.repeat(80));
console.log('\n# JWT Secrets');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_TOKEN_SECRET=${jwtRefreshSecret}`);
console.log(`\n# Session Secret`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log('\n' + '━'.repeat(80));
console.log('\n⚠️  IMPORTANT: Keep these secrets safe and never commit to Git!\n');
