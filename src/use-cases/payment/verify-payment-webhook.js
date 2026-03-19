class VerifyPaymentWebhookUseCase {
  constructor(payOSService, paymentRepository, orderRepository, prisma) {
    this.payOSService = payOSService;
    this.paymentRepository = paymentRepository;
    this.orderRepository = orderRepository;
    this.prisma = prisma;
  }

  async execute(webhookBody) {
    console.log('PAYOS WEBHOOK RAW:', JSON.stringify(webhookBody, null, 2));

    if (!webhookBody || typeof webhookBody !== 'object') {
      return { message: 'Webhook received' };
    }

    if (!webhookBody.data || !webhookBody.signature) {
      return { message: 'Webhook received without signature/data' };
    }

    const isValid = this.payOSService.verifyWebhookSignature(webhookBody);

    if (!isValid) {
      return { message: 'Webhook received with invalid signature' };
    }

    const data = webhookBody.data || {};
    const orderCode = String(data.orderCode || '');

    if (!orderCode) {
      return { message: 'Webhook received without orderCode' };
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await this.paymentRepository.findByPayOSOrderCode(
        orderCode,
        tx
      );

      // QUAN TRỌNG: không throw nữa
      if (!payment) {
        return {
          message: `Webhook received but payment not found for orderCode=${orderCode}`,
        };
      }

      if (payment.status === 'PAID') {
        return { message: 'Payment already confirmed' };
      }

      const isSuccess =
        webhookBody.success === true && String(data.code) === '00';

      if (isSuccess) {
        await this.paymentRepository.markPaidByPayOSOrderCode(
          orderCode,
          {
            paymentLinkId: data.paymentLinkId || null,
            reference: data.reference || null,
            transactionDateTime: data.transactionDateTime || null,
            rawWebhook: webhookBody,
            paidData: data,
          },
          tx
        );

        await this.orderRepository.update(
          payment.order_id,
          {
            payment_status: 'PAID',
            updated_at: new Date(),
          },
          tx
        );

        return { message: 'Payment confirmed' };
      }

      await this.paymentRepository.markFailedByPayOSOrderCode(
        orderCode,
        {
          rawWebhook: webhookBody,
          failedData: data,
        },
        tx
      );

      await this.orderRepository.update(
        payment.order_id,
        {
          payment_status: 'FAILED',
          updated_at: new Date(),
        },
        tx
      );

      return { message: 'Payment not successful' };
    });
  }
}

module.exports = { VerifyPaymentWebhookUseCase };