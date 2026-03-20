const axios = require('axios');
const crypto = require('crypto');

class PayOSService {
  constructor() {
    this.clientId = process.env.PAYOS_CLIENT_ID;
    this.apiKey = process.env.PAYOS_API_KEY;
    this.checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    this.returnUrl = process.env.PAYOS_RETURN_URL;
    this.cancelUrl = process.env.PAYOS_CANCEL_URL;
    this.apiBaseUrl =
      process.env.PAYOS_API_BASE_URL || 'https://api-merchant.payos.vn';
  }

  normalizeWebhookValue(value) {
    if (
      value === null ||
      value === undefined ||
      value === 'null' ||
      value === 'undefined'
    ) {
      return '';
    }
    return String(value);
  }

  createPaymentSignature({
    amount,
    orderCode,
    description,
    returnUrl,
    cancelUrl,
  }) {
    const raw =
      `amount=${amount}` +
      `&cancelUrl=${cancelUrl}` +
      `&description=${description}` +
      `&orderCode=${orderCode}` +
      `&returnUrl=${returnUrl}`;

    console.log('PAYOS SIGN RAW:', raw);
    console.log('PAYOS CHECKSUM KEY EXISTS:', Boolean(this.checksumKey));

    return crypto
      .createHmac('sha256', this.checksumKey)
      .update(raw)
      .digest('hex');
  }

  verifyWebhookSignature(webhookBody) {
    if (!webhookBody?.data || !webhookBody?.signature) {
      return false;
    }

    const rawData = Object.keys(webhookBody.data)
      .sort()
      .map(
        (key) => `${key}=${this.normalizeWebhookValue(webhookBody.data[key])}`
      )
      .join('&');

    const expectedSignature = crypto
      .createHmac('sha256', this.checksumKey)
      .update(rawData)
      .digest('hex');

    return expectedSignature === webhookBody.signature;
  }

  async createPaymentLink({ orderCode, amount, description, items = [] }) {
    const payload = {
      orderCode: Number(orderCode),
      amount: Number(amount),
      description: String(description),
      items,
      returnUrl: String(this.returnUrl),
      cancelUrl: String(this.cancelUrl),
    };

    payload.signature = this.createPaymentSignature(payload);

    console.log('PAYOS CREATE PAYMENT PAYLOAD:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${this.apiBaseUrl}/v2/payment-requests`,
      payload,
      {
        headers: {
          'x-client-id': this.clientId,
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const body = response.data;
    console.log('PAYOS CREATE PAYMENT RESPONSE:', JSON.stringify(body, null, 2));

    if (body.code !== '00') {
      return {
        success: false,
        message: body.desc || 'Create payment link failed',
        raw: body,
      };
    }

    return {
      success: true,
      paymentLinkId: body.data?.paymentLinkId || null,
      checkoutUrl: body.data?.checkoutUrl || null,
      qrCode: body.data?.qrCode || null,
      accountNumber: body.data?.accountNumber || null,
      accountName: body.data?.accountName || null,
      bin: body.data?.bin || null,
      raw: body.data || body,
    };
  }

  async charge({ orderId, amount, method, orderCode, description, items = [] }) {
    if (method === 'QR_PAY') {
      return this.createPaymentLink({
        orderCode,
        amount,
        description: description || `DH${orderId}`,
        items,
      });
    }

    return {
      success: false,
      message: `Unsupported payment method: ${method}`,
      raw: null,
    };
  }
}

module.exports = { PayOSService };