const { PaymentRequests, Webhooks } = require('@payos/node');

class PayOSService {
  constructor() {
    this.paymentRequests = new PaymentRequests(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY
    );
    this.webhooks = new Webhooks(process.env.PAYOS_CHECKSUM_KEY);
  }

  async createPaymentLink(orderData) {
    const { orderId, amount, description, orderCode, items } = orderData;

    const paymentData = {
      orderCode: orderCode || Number(String(Date.now()).slice(-6)),
      amount,
      description: description || `Thanh toan don hang #${orderId}`,
      items: items || [{ name: 'Don hang', quantity: 1, price: amount }],
      returnUrl: process.env.PAYOS_RETURN_URL,
      cancelUrl: process.env.PAYOS_CANCEL_URL,
    };

    return this.paymentRequests.create(paymentData);
  }

  async getPaymentInfo(orderCode) {
    return this.paymentRequests.get(orderCode);
  }

  async cancelPaymentLink(orderCode) {
    return this.paymentRequests.cancel(orderCode);
  }

  /**
   * Verify webhook signature.
   * Returns parsed webhook data if valid, throws if invalid.
   */
  verifyWebhookData(webhookBody) {
    try {
      return this.webhooks.verify(webhookBody);
    } catch (err) {
      return null;
    }
  }

  /**
   * Confirm webhook URL (PayOS calls this when saving webhook URL in dashboard).
   * Returns 200 response data.
   */
  async confirmWebhookUrl(url) {
    return this.webhooks.confirm(url);
  }
}

module.exports = new PayOSService();
