class VerifyPaymentWebhookUseCase {
  constructor(
    payOSService,
    paymentRepository,
    orderRepository,
    generateInvoiceUseCase,
    prisma
  ) {
    this.payOSService = payOSService;
    this.paymentRepository = paymentRepository;
    this.orderRepository = orderRepository;
    this.generateInvoiceUseCase = generateInvoiceUseCase;
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

    let paidPaymentId = null;

    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await this.paymentRepository.findByPayOSOrderCode(
        orderCode,
        tx
      );

      if (!payment) {
        return {
          message: `Webhook received but payment not found for orderCode=${orderCode}`,
        };
      }

      if (payment.status === 'PAID') {
        paidPaymentId = payment.id;
        return { message: 'Payment already confirmed' };
      }

      const isSuccess =
        webhookBody.success === true && String(data.code) === '00';

      if (isSuccess) {
        const updatedPayment =
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

        paidPaymentId = updatedPayment.id;

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

    // Tạo invoice sau khi transaction DB hoàn tất
    if (paidPaymentId) {
      try {
        await this.generateInvoiceUseCase.execute(paidPaymentId);
      } catch (error) {
        console.error('GENERATE INVOICE ERROR:', error);
      }
    }

    return result;
  }
}

module.exports = { VerifyPaymentWebhookUseCase };