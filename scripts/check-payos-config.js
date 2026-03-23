#!/usr/bin/env node

/**
 * Script kiểm tra cấu hình PayOS
 * Sử dụng: node scripts/check-payos-config.js
 */

require('dotenv').config();
const axios = require('axios');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkPayOSConfig() {
  log('\n🔍 Kiểm tra cấu hình PayOS...\n', 'cyan');

  const checks = [];

  // 1. Kiểm tra biến môi trường
  log('1️⃣  Kiểm tra biến môi trường:', 'blue');
  const requiredEnvVars = [
    'PAYOS_CLIENT_ID',
    'PAYOS_API_KEY',
    'PAYOS_CHECKSUM_KEY',
    'PAYOS_RETURN_URL',
    'PAYOS_CANCEL_URL',
    'PAYOS_WEBHOOK_URL'
  ];

  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value !== 'YOUR_CLIENT_ID' && value !== 'YOUR_API_KEY' && value !== 'YOUR_CHECKSUM_KEY') {
      log(`   ✅ ${varName}: ${value.substring(0, 20)}...`, 'green');
      checks.push({ name: varName, status: 'ok' });
    } else {
      log(`   ❌ ${varName}: Chưa cấu hình hoặc dùng giá trị mặc định`, 'red');
      checks.push({ name: varName, status: 'error' });
    }
  });

  // 2. Kiểm tra URL format
  log('\n2️⃣  Kiểm tra định dạng URL:', 'blue');
  const urlVars = ['PAYOS_RETURN_URL', 'PAYOS_CANCEL_URL', 'PAYOS_WEBHOOK_URL'];
  
  urlVars.forEach(varName => {
    const url = process.env[varName];
    if (url) {
      try {
        new URL(url);
        if (url.includes('ngrok') || url.includes('localhost') || url.includes('http')) {
          log(`   ✅ ${varName}: ${url}`, 'green');
          checks.push({ name: `${varName}_format`, status: 'ok' });
        } else {
          log(`   ⚠️  ${varName}: ${url} (Có thể không phải ngrok URL)`, 'yellow');
          checks.push({ name: `${varName}_format`, status: 'warning' });
        }
      } catch (e) {
        log(`   ❌ ${varName}: URL không hợp lệ - ${url}`, 'red');
        checks.push({ name: `${varName}_format`, status: 'error' });
      }
    }
  });

  // 3. Kiểm tra backend đang chạy
  log('\n3️⃣  Kiểm tra backend:', 'blue');
  const backendPort = process.env.PORT || 3000;
  try {
    await axios.get(`http://localhost:${backendPort}/api/v1/health`, { timeout: 3000 });
    log(`   ✅ Backend đang chạy trên port ${backendPort}`, 'green');
    checks.push({ name: 'backend', status: 'ok' });
  } catch (error) {
    log(`   ❌ Backend không chạy trên port ${backendPort}`, 'red');
    log(`   💡 Chạy: npm run dev:backend`, 'yellow');
    checks.push({ name: 'backend', status: 'error' });
  }

  // 4. Kiểm tra ngrok
  log('\n4️⃣  Kiểm tra ngrok:', 'blue');
  const webhookUrl = process.env.PAYOS_WEBHOOK_URL;
  if (webhookUrl && webhookUrl.includes('ngrok')) {
    try {
      await axios.get(webhookUrl.replace('/api/v1/payments/webhook/payos', '/api/v1/health'), { 
        timeout: 5000,
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      log(`   ✅ Ngrok đang hoạt động: ${webhookUrl}`, 'green');
      checks.push({ name: 'ngrok', status: 'ok' });
    } catch (error) {
      log(`   ❌ Không thể kết nối tới ngrok URL`, 'red');
      log(`   💡 Kiểm tra: ngrok http ${backendPort}`, 'yellow');
      checks.push({ name: 'ngrok', status: 'error' });
    }
  } else {
    log(`   ⚠️  Webhook URL không sử dụng ngrok`, 'yellow');
    checks.push({ name: 'ngrok', status: 'warning' });
  }

  // 5. Tổng kết
  log('\n📊 Tổng kết:', 'cyan');
  const okCount = checks.filter(c => c.status === 'ok').length;
  const errorCount = checks.filter(c => c.status === 'error').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  log(`   ✅ Thành công: ${okCount}`, 'green');
  if (warningCount > 0) log(`   ⚠️  Cảnh báo: ${warningCount}`, 'yellow');
  if (errorCount > 0) log(`   ❌ Lỗi: ${errorCount}`, 'red');

  // 6. Hướng dẫn tiếp theo
  if (errorCount > 0) {
    log('\n📋 Các bước khắc phục:', 'yellow');
    log('   1. Đảm bảo đã cấu hình đúng PAYOS_CLIENT_ID, API_KEY, CHECKSUM_KEY trong .env');
    log('   2. Chạy backend: npm run dev:backend');
    log('   3. Chạy ngrok: ngrok http 3000');
    log('   4. Cập nhật URL ngrok: node scripts/update-ngrok-url.js <ngrok-url>');
    log('   5. Cập nhật URL trên PayOS dashboard: https://payos.vn/portal/settings');
  } else {
    log('\n✅ Cấu hình PayOS đã sẵn sàng!', 'green');
    log('💡 Bạn có thể test thanh toán ngay bây giờ.', 'cyan');
  }

  log('\n🔗 Tài liệu:', 'blue');
  log('   - Hướng dẫn: docs/PAYOS_SETUP_GUIDE.md');
  log('   - PayOS Dashboard: https://payos.vn/portal');
  log('   - PayOS Docs: https://payos.vn/docs\n');
}

// Chạy kiểm tra
checkPayOSConfig().catch(error => {
  log(`\n❌ Lỗi: ${error.message}`, 'red');
  process.exit(1);
});
