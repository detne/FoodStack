#!/usr/bin/env node

/**
 * Script test payment flow với PayOS
 * Sử dụng: node scripts/test-payment.js
 */

require('dotenv').config();
const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testPayment() {
  log('\n💳 Test Payment Flow với PayOS\n', 'cyan');

  // 1. Lấy thông tin từ user
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  
  log('📝 Nhập thông tin test:', 'blue');
  const amount = await question('   Số tiền (VNĐ) [mặc định: 50000]: ') || '50000';
  const description = await question('   Mô tả [mặc định: Test payment]: ') || 'Test payment';
  
  // Lấy JWT token (nếu cần)
  const token = await question('\n🔑 JWT Token (bỏ qua nếu không cần auth): ');

  log('\n🚀 Đang tạo payment link...', 'yellow');

  try {
    // 2. Tạo payment
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Tạo order code unique
    const orderCode = Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-15));

    const paymentData = {
      amount: parseInt(amount),
      description: description,
      orderCode: orderCode,
      returnUrl: process.env.PAYOS_RETURN_URL,
      cancelUrl: process.env.PAYOS_CANCEL_URL
    };

    log('\n📤 Request data:', 'blue');
    console.log(JSON.stringify(paymentData, null, 2));

    const response = await axios.post(
      `${baseUrl}/api/v1/payments/create`,
      paymentData,
      { headers, timeout: 10000 }
    );

    log('\n✅ Payment link đã được tạo!', 'green');
    log('\n📋 Thông tin thanh toán:', 'cyan');
    
    const { data } = response.data;
    
    console.log(`   Order Code: ${data.orderCode || orderCode}`);
    console.log(`   Amount: ${amount} VNĐ`);
    console.log(`   Description: ${description}`);
    console.log(`\n   🔗 Checkout URL: ${data.checkoutUrl || data.checkout_url || 'N/A'}`);
    console.log(`   📱 QR Code: ${data.qrCode || data.qr_code || 'N/A'}`);

    log('\n📝 Hướng dẫn test:', 'yellow');
    log('   1. Mở Checkout URL trên trình duyệt', 'yellow');
    log('   2. Quét QR code bằng app ngân hàng (test mode)', 'yellow');
    log('   3. Hoàn tất thanh toán', 'yellow');
    log('   4. Kiểm tra webhook logs trên backend', 'yellow');
    log('   5. Kiểm tra PayOS dashboard: https://payos.vn/portal/transactions', 'yellow');

    log('\n💡 Tips:', 'blue');
    log('   - PayOS test mode: Dùng số điện thoại test từ dashboard', 'blue');
    log('   - Webhook logs: Xem terminal backend có log "PAYOS WEBHOOK RAW"', 'blue');
    log('   - Ngrok dashboard: http://localhost:4040 để xem requests', 'blue');

    // Hỏi có muốn mở browser không
    const openBrowser = await question('\n🌐 Mở checkout URL trên browser? (y/n): ');
    if (openBrowser.toLowerCase() === 'y') {
      const checkoutUrl = data.checkoutUrl || data.checkout_url;
      if (checkoutUrl) {
        const { exec } = require('child_process');
        const command = process.platform === 'win32' ? 'start' : 
                       process.platform === 'darwin' ? 'open' : 'xdg-open';
        exec(`${command} ${checkoutUrl}`);
        log('✅ Đã mở browser', 'green');
      }
    }

  } catch (error) {
    log('\n❌ Lỗi khi tạo payment:', 'red');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Không nhận được response từ server');
      console.error('Kiểm tra backend có đang chạy không:', baseUrl);
    } else {
      console.error('Error:', error.message);
    }

    log('\n💡 Các bước khắc phục:', 'yellow');
    log('   1. Kiểm tra backend đang chạy: npm run dev:backend', 'yellow');
    log('   2. Kiểm tra cấu hình: npm run payos:check', 'yellow');
    log('   3. Xem logs backend để biết chi tiết lỗi', 'yellow');
  }

  rl.close();
}

// Chạy test
testPayment().catch(error => {
  log(`\n❌ Lỗi: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
