const payOSService = require('../services/payos.service');

class PaymentController {
  async createPayment(req, res) {
    try {
      const { orderId, amount, description, items } = req.body;
      
      const paymentLink = await payOSService.createPaymentLink({
        orderId,
        amount,
        description,
        items
      });

      res.json({
        success: true,
        data: paymentLink
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async handleWebhook(req, res) {
    try {
      const webhookData = req.body;
      const verifiedData = payOSService.verifyWebhookData(webhookData);
      
      // Xử lý logic cập nhật đơn hàng
      // verifiedData.orderCode, verifiedData.status, etc.
      
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async handleSuccess(req, res) {
    // Hiển thị trang thanh toán thành công
    res.send('Thanh toán thành công!');
  }

  async handleCancel(req, res) {
    // Hiển thị trang hủy thanh toán
    res.send('Thanh toán đã bị hủy!');
  }
}

module.exports = new PaymentController();
