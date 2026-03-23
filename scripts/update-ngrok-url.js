#!/usr/bin/env node

/**
 * Script tự động cập nhật URL ngrok vào file .env
 * Sử dụng: node scripts/update-ngrok-url.js <ngrok-url>
 * Ví dụ: node scripts/update-ngrok-url.js https://abc123.ngrok-free.app
 */

const fs = require('fs');
const path = require('path');

// Lấy URL từ command line argument
const ngrokUrl = process.argv[2];

if (!ngrokUrl) {
  console.error('❌ Vui lòng cung cấp URL ngrok!');
  console.log('📝 Cách sử dụng: node scripts/update-ngrok-url.js <ngrok-url>');
  console.log('📝 Ví dụ: node scripts/update-ngrok-url.js https://abc123.ngrok-free.app');
  process.exit(1);
}

// Validate URL
if (!ngrokUrl.startsWith('http://') && !ngrokUrl.startsWith('https://')) {
  console.error('❌ URL không hợp lệ! URL phải bắt đầu với http:// hoặc https://');
  process.exit(1);
}

// Remove trailing slash
const cleanUrl = ngrokUrl.replace(/\/$/, '');

// Đường dẫn file .env
const envPath = path.join(__dirname, '..', '.env');

try {
  // Đọc file .env
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Backup file .env
  const backupPath = path.join(__dirname, '..', '.env.backup');
  fs.writeFileSync(backupPath, envContent);
  console.log('✅ Đã backup file .env → .env.backup');

  // Cập nhật các URL PayOS
  const updates = [
    {
      key: 'PAYOS_RETURN_URL',
      value: `${cleanUrl}/payment/success`,
      regex: /PAYOS_RETURN_URL=.*/
    },
    {
      key: 'PAYOS_CANCEL_URL',
      value: `${cleanUrl}/payment/cancel`,
      regex: /PAYOS_CANCEL_URL=.*/
    },
    {
      key: 'PAYOS_WEBHOOK_URL',
      value: `${cleanUrl}/api/v1/payments/webhook/payos`,
      regex: /PAYOS_WEBHOOK_URL=.*/
    }
  ];

  updates.forEach(({ key, value, regex }) => {
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
      console.log(`✅ Đã cập nhật ${key}=${value}`);
    } else {
      console.warn(`⚠️  Không tìm thấy ${key} trong file .env`);
    }
  });

  // Ghi lại file .env
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Đã cập nhật file .env thành công!');
  console.log('\n📋 Các bước tiếp theo:');
  console.log('1. Restart backend: npm run dev:backend');
  console.log('2. Cập nhật URL trên PayOS dashboard:');
  console.log(`   - Webhook URL: ${cleanUrl}/api/v1/payments/webhook/payos`);
  console.log(`   - Return URL: ${cleanUrl}/payment/success`);
  console.log(`   - Cancel URL: ${cleanUrl}/payment/cancel`);
  console.log('\n🔗 PayOS Dashboard: https://payos.vn/portal/settings');

} catch (error) {
  console.error('❌ Lỗi khi cập nhật file .env:', error.message);
  process.exit(1);
}
