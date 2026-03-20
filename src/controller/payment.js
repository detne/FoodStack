const { CreatePaymentBodySchema } = require('../dto/payment/create-payment');
const { GetCheckoutPreviewQuerySchema } = require('../dto/payment/get-checkout-preview');

class PaymentController {
  constructor(processPaymentUseCase, verifyPaymentWebhookUseCase, getCheckoutPreviewUseCase, getPaymentDetailsUseCase) {
    this.processPaymentUseCase = processPaymentUseCase;
    this.verifyPaymentWebhookUseCase = verifyPaymentWebhookUseCase;
    this.getCheckoutPreviewUseCase = getCheckoutPreviewUseCase;
    this.getPaymentDetailsUseCase = getPaymentDetailsUseCase;
  }

  async getDetails(req, res, next) {
    try {
      console.log('GET PAYMENT DETAILS req.user =', req.user);

      const { paymentId } = req.params;

      const result = await this.getPaymentDetailsUseCase.execute(
        paymentId,
        req.user
      );

      return res.status(200).json({
        success: true,
        message: 'Payment details fetched successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCheckoutPreview(req, res, next) {
    try {
      const dto = GetCheckoutPreviewQuerySchema.parse(req.query);

      const result = await this.getCheckoutPreviewUseCase.execute(dto);

      return res.status(200).json({
        success: true,
        message: 'Checkout preview fetched successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
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
}

module.exports = { PaymentController };