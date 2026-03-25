class VerifySubscriptionWebhookUseCase {
  constructor(payOSService, subscriptionRepository, prisma) {
    this.payOSService = payOSService;
    this.subscriptionRepository = subscriptionRepository;
    this.prisma = prisma;
  }

  async execute(webhookBody) {
    console.log('SUBSCRIPTION WEBHOOK RAW:', JSON.stringify(webhookBody, null, 2));

    if (!webhookBody || typeof webhookBody !== 'object') {
      throw new Error('Invalid webhook body');
    }

    // PayOS confirmation ping
    const pingOrderCode = String(webhookBody.data?.orderCode || '');
    if (pingOrderCode === '0') {
      return { message: 'Webhook confirmed' };
    }

    // Verify signature
    let isValid = false;
    try {
      isValid = this.payOSService.verifyWebhookSignature(webhookBody);
    } catch (error) {
      console.error('Signature verification failed:', error);
      isValid = false;
    }

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const { data } = webhookBody;
    const orderCode = String(data.orderCode || '');

    if (!orderCode || orderCode === '0') {
      return { message: 'Webhook confirmed' };
    }

    return this.prisma.$transaction(async (tx) => {
      // Find payment by order code
      const payment = await this.subscriptionRepository.findPaymentByOrderCode(orderCode, tx);

      if (!payment) {
        console.warn(`Payment not found for order code: ${orderCode}`);
        return { message: 'Payment not found' };
      }

      // Check if already processed
      if (payment.status === 'PAID') {
        console.log(`Payment ${payment.id} already marked as paid`);
        return { message: 'Payment already processed' };
      }

      // Get subscription ID from payos_data
      const subscriptionId = payment.payos_data?.subscription_id || payment.order_id;

      if (!subscriptionId) {
        console.error('No subscription ID found in payment');
        return { message: 'Invalid payment data' };
      }

      const isSuccess = data.code === '00' && data.desc === 'success';

      if (isSuccess) {
        // Update payment status
        await this.subscriptionRepository.updatePaymentStatus(
          payment.id,
          'PAID',
          {
            transactionRef: data.reference || data.transactionDateTime,
            payosData: {
              ...payment.payos_data,
              webhookData: data,
              paidAt: new Date().toISOString(),
            },
          },
          tx
        );

        // Activate subscription
        await this.subscriptionRepository.updateSubscriptionStatus(
          subscriptionId,
          'ACTIVE',
          tx
        );

        console.log(`✅ Subscription ${subscriptionId} activated successfully`);

        return {
          success: true,
          message: 'Subscription activated',
          subscriptionId: subscriptionId,
          paymentId: payment.id,
        };
      } else {
        // Payment failed
        await this.subscriptionRepository.updatePaymentStatus(
          payment.id,
          'FAILED',
          {
            payosData: {
              ...payment.payos_data,
              webhookData: data,
              failedAt: new Date().toISOString(),
              failureReason: data.desc || 'Payment failed',
            },
          },
          tx
        );

        // Cancel subscription
        await this.subscriptionRepository.updateSubscriptionStatus(
          subscriptionId,
          'CANCELLED',
          tx
        );

        console.log(`❌ Subscription ${subscriptionId} payment failed`);

        return {
          success: false,
          message: 'Payment failed',
          subscriptionId: subscriptionId,
          paymentId: payment.id,
        };
      }
    });
  }
}

module.exports = VerifySubscriptionWebhookUseCase;
