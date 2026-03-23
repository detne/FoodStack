const { v4: uuidv4 } = require('uuid');

// Mock payment storage (trong thực tế sẽ dùng database)
const mockPayments = new Map();

class MockPaymentController {
  // Tạo payment link mock
  async createPaymentLink(req, res) {
    try {
      const { amount, description, returnUrl, cancelUrl } = req.body;
      
      // Tạo order code giả
      const orderCode = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Lưu thông tin payment
      const paymentData = {
        orderCode,
        amount,
        description,
        status: 'PENDING',
        returnUrl,
        cancelUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockPayments.set(orderCode, paymentData);
      
      // Trả về mock payment URL
      const checkoutUrl = `${process.env.FRONTEND_URL}/payment/mock-gateway?orderCode=${orderCode}`;
      
      res.json({
        error: 0,
        message: 'Success',
        data: {
          bin: 'MOCK_BIN',
          accountNumber: 'MOCK_ACCOUNT',
          accountName: 'MOCK PAYMENT GATEWAY',
          amount,
          description,
          orderCode,
          currency: 'VND',
          paymentLinkId: `mock_${orderCode}`,
          status: 'PENDING',
          checkoutUrl,
          qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 1,
        message: error.message
      });
    }
  }

  // Kiểm tra trạng thái payment
  async getPaymentInfo(req, res) {
    try {
      const { orderCode } = req.params;
      
      const payment = mockPayments.get(orderCode);
      if (!payment) {
        return res.status(404).json({
          error: 1,
          message: 'Payment not found'
        });
      }
      
      res.json({
        error: 0,
        message: 'Success',
        data: {
          orderCode: payment.orderCode,
          amount: payment.amount,
          amountPaid: payment.status === 'PAID' ? payment.amount : 0,
          amountRemaining: payment.status === 'PAID' ? 0 : payment.amount,
          status: payment.status,
          createdAt: payment.createdAt,
          transactions: payment.status === 'PAID' ? [{
            reference: `MOCK_TXN_${payment.orderCode}`,
            amount: payment.amount,
            accountNumber: 'MOCK_ACCOUNT',
            description: payment.description,
            transactionDateTime: payment.updatedAt,
            virtualAccountName: 'MOCK PAYMENT',
            virtualAccountNumber: 'MOCK_VA'
          }] : []
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 1,
        message: error.message
      });
    }
  }

  // Mô phỏng thanh toán thành công
  async simulatePayment(req, res) {
    try {
      const { orderCode, action } = req.body; // action: 'success' | 'cancel'
      
      const payment = mockPayments.get(orderCode);
      if (!payment) {
        return res.status(404).json({
          error: 1,
          message: 'Payment not found'
        });
      }
      
      // Cập nhật trạng thái
      payment.status = action === 'success' ? 'PAID' : 'CANCELLED';
      payment.updatedAt = new Date();
      mockPayments.set(orderCode, payment);
      
      // Gọi webhook (mô phỏng PayOS webhook)
      setTimeout(() => {
        this.triggerWebhook(payment);
      }, 1000);
      
      res.json({
        error: 0,
        message: 'Payment simulation completed',
        data: {
          orderCode,
          status: payment.status,
          redirectUrl: action === 'success' ? payment.returnUrl : payment.cancelUrl
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 1,
        message: error.message
      });
    }
  }

  // Mock webhook trigger
  async triggerWebhook(payment) {
    try {
      const webhookUrl = `${process.env.BASE_URL}/api/v1/payments/webhook/payos`;
      
      const webhookData = {
        code: '00',
        desc: payment.status === 'PAID' ? 'success' : 'cancelled',
        data: {
          orderCode: payment.orderCode,
          amount: payment.amount,
          description: payment.description,
          accountNumber: 'MOCK_ACCOUNT',
          reference: `MOCK_TXN_${payment.orderCode}`,
          transactionDateTime: payment.updatedAt.toISOString(),
          currency: 'VND',
          paymentLinkId: `mock_${payment.orderCode}`,
          code: '00',
          desc: 'success',
          counterAccountBankId: 'MOCK_BANK',
          counterAccountBankName: 'Mock Bank',
          counterAccountName: 'Mock User',
          counterAccountNumber: 'MOCK_USER_ACCOUNT',
          virtualAccountName: 'MOCK PAYMENT',
          virtualAccountNumber: 'MOCK_VA'
        },
        signature: 'mock_signature'
      };

      // Gọi webhook endpoint
      const fetch = require('node-fetch');
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });
      
      console.log(`Mock webhook triggered for order: ${payment.orderCode}`);
    } catch (error) {
      console.error('Mock webhook error:', error);
    }
  }

  // Mock webhook endpoint
  async mockWebhook(req, res) {
    try {
      console.log('Mock webhook received:', req.body);
      
      // Xử lý giống như PayOS webhook
      const { data } = req.body;
      const { orderCode, code } = data;
      
      if (code === '00') {
        // Cập nhật database order status
        // TODO: Implement order status update
        console.log(`Order ${orderCode} payment confirmed via mock webhook`);
      }
      
      res.json({
        error: 0,
        message: 'Mock webhook processed'
      });
    } catch (error) {
      res.status(500).json({
        error: 1,
        message: error.message
      });
    }
  }
}

module.exports = new MockPaymentController();