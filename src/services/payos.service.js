const PayOS = require('@payos/node');

class PayOSService {
  constructor() {
    this.payOS = new PayOS(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY
    );
  }

  async createPaymentLink(orderData) {
    const { orderId, amount, description, items } = orderData;
    
    const paymentData = {
      orderCode: Number(String(Date.now()).slice(-6)),
      amount: amount,
      description: description || `Thanh toán đơn hàng #${orderId}`,
      items: items || [{ name: 'Đơn hàng', quantity: 1, price: amount }],
      returnUrl: process.env.PAYOS_RETURN_URL,
      cancelUrl: process.env.PAYOS_CANCEL_URL
    };

    const paymentLink = await this.payOS.createPaymentLink(paymentData);
    return paymentLink;
  }

  async getPaymentInfo(orderCode) {
    return await this.payOS.getPaymentLinkInformation(orderCode);
  }

  async cancelPaymentLink(orderCode) {
    return await this.payOS.cancelPaymentLink(orderCode);
  }

  verifyWebhookData(webhookData) {
    return this.payOS.verifyPaymentWebhookData(webhookData);
  }
}

module.exports = new PayOSService();
