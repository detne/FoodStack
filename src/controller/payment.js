const { CreatePaymentBodySchema } = require('../dto/payment/create-payment');
const { GetCheckoutPreviewQuerySchema } = require('../dto/payment/get-checkout-preview');
const { GetPaymentHistoryQuerySchema } = require('../dto/payment/get-payment-history');
const { GetPaymentStatisticsQuerySchema } = require('../dto/payment/get-payment-statistics');

class PaymentController {
  constructor(
    processPaymentUseCase,
    verifyPaymentWebhookUseCase,
    getCheckoutPreviewUseCase,
    getPaymentDetailsUseCase,
    getPaymentHistoryUseCase,
    getPaymentStatisticsUseCase,
    confirmCashPaymentUseCase
  ) {
    this.processPaymentUseCase = processPaymentUseCase;
    this.verifyPaymentWebhookUseCase = verifyPaymentWebhookUseCase;
    this.getCheckoutPreviewUseCase = getCheckoutPreviewUseCase;
    this.getPaymentDetailsUseCase = getPaymentDetailsUseCase;
    this.getPaymentHistoryUseCase = getPaymentHistoryUseCase;
    this.getPaymentStatisticsUseCase = getPaymentStatisticsUseCase;
    this.confirmCashPaymentUseCase = confirmCashPaymentUseCase;

    this.getDetails = this.getDetails.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.confirmCash = this.confirmCash.bind(this);
    this.getCheckoutPreview = this.getCheckoutPreview.bind(this);
    this.process = this.process.bind(this);
    this.webhook = this.webhook.bind(this);
    this.getStatistics = this.getStatistics.bind(this);
    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  /** Public endpoint — customer polls this to check if payment is PAID */
  async getStatus(req, res, next) {
    try {
      const { paymentId } = req.params;
      // Dùng repository trực tiếp để tránh auth check
      const payment = await this.getPaymentDetailsUseCase.paymentRepository.findById(paymentId);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
      return res.status(200).json({
        success: true,
        data: { id: payment.id, status: payment.status, method: payment.method, amount: payment.amount },
      });
    } catch (err) {
      next(err);
    }
  }

  async getDetails(req, res, next) {
    try {
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

  async getHistory(req, res, next) {
    try {
      const dto = GetPaymentHistoryQuerySchema.parse(req.query);

      const result = await this.getPaymentHistoryUseCase.execute(dto, req.user);

      return res.status(200).json({
        success: true,
        message: 'Payment history fetched successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async confirmCash(req, res, next) {
    try {
      const { paymentId } = req.params;

      const result = await this.confirmCashPaymentUseCase.execute(
        paymentId,
        req.user
      );

      return res.status(200).json({
        success: true,
        message: result.message || 'Cash payment confirmed successfully',
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
      const result = await this.verifyPaymentWebhookUseCase.execute(req.body);

      return res.status(200).json({
        success: true,
        message: result?.message || 'Webhook processed successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const dto = GetPaymentStatisticsQuerySchema.parse(req.query);

      const result = await this.getPaymentStatisticsUseCase.execute(
        dto,
        req.user
      );

      return res.status(200).json({
        success: true,
        message: 'Payment statistics fetched successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async handleSuccess(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Thanh toán thành công!',
      });
    } catch (err) {
      next(err);
    }
  }

  async handleCancel(req, res, next) {
    try {
      return res.status(200).json({
        success: false,
        message: 'Thanh toán đã bị hủy!',
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = { PaymentController };