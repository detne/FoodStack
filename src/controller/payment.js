const { CreatePaymentBodySchema } = require('../dto/payment/create-payment');

class PaymentController {
  constructor(processPaymentUseCase, verifyPaymentWebhookUseCase, payOSService) {
    this.processPaymentUseCase = processPaymentUseCase;
    this.verifyPaymentWebhookUseCase = verifyPaymentWebhookUseCase;
    this.payOSService = payOSService;
  }

  async process(req, res, next) {
    try {
      const dto = CreatePaymentBodySchema.parse(req.body);

      const idempotencyKey =
        req.headers['idempotency-key'] ||
        req.headers['x-idempotency-key'] ||
        null;

      const result = await this.processPaymentUseCase.execute(dto, {
        idempotencyKey,
      });

      return res.status(200).json({
        success: true,
        message:
          dto.method === 'QR_PAY'
            ? 'Payment link created successfully'
            : 'Payment processed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async webhook(req, res, next) {
    try {
      console.log('PAYOS WEBHOOK BODY:', JSON.stringify(req.body, null, 2));

      const result = await this.verifyPaymentWebhookUseCase.execute(req.body);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error('PAYOS WEBHOOK ERROR:', err);
      next(err);
    }
  }

  async confirmWebhook(req, res, next) {
    try {
      const { webhookUrl } = req.body;

      if (!webhookUrl) {
        return res.status(400).json({
          success: false,
          message: 'webhookUrl is required',
        });
      }

      const result = await this.payOSService.confirmWebhook(webhookUrl);

      return res.status(200).json({
        success: true,
        message: 'Webhook confirmed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { PaymentController };