class CreateSubscriptionPaymentUseCase {
  constructor(subscriptionRepository, paymentGatewayService, prisma) {
    this.subscriptionRepository = subscriptionRepository;
    this.paymentGatewayService = paymentGatewayService;
    this.prisma = prisma;
  }

  buildPayOSOrderCode() {
    return Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-15));
  }

  async execute(dto) {
    const { restaurantId, planName, paymentMethod } = dto;

    // Get plan details
    const plan = await this.subscriptionRepository.getPlanByName(planName);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    if (plan.name === 'free') {
      throw new Error('Free plan does not require payment');
    }

    // Calculate amounts
    const amount = parseFloat(plan.price);
    const vatAmount = amount * 0.1; // 10% VAT
    const totalAmount = amount + vatAmount;

    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return this.prisma.$transaction(async (tx) => {
      // Delete any existing subscriptions for this restaurant
      // This is needed because restaurant_id has unique constraint
      await tx.subscriptions.deleteMany({
        where: {
          restaurant_id: restaurantId
        }
      });

      // Create new subscription (pending until payment confirmed)
      const subscription = await this.subscriptionRepository.createSubscription(
        {
          restaurantId,
          planId: plan.id,
          status: 'pending',
          startedAt: new Date(),
          expiresAt,
          autoRenew: true,
        },
        tx
      );

      // Generate PayOS order code
      const payosOrderCode = this.buildPayOSOrderCode();

      // Create payment record
      const payment = await this.subscriptionRepository.createPayment(
        {
          subscriptionId: subscription.id,
          restaurantId,
          planId: plan.id,
          amount,
          vatAmount,
          totalAmount,
          paymentMethod,
          status: 'pending',
          payosOrderCode: String(payosOrderCode),
          payosData: {
            orderCode: String(payosOrderCode),
            planName: plan.name,
            planDisplayName: plan.display_name,
          },
        },
        tx
      );

      // Create PayOS payment link
      let gatewayResult;
      try {
        gatewayResult = await this.paymentGatewayService.charge({
          orderId: subscription.id,
          amount: Math.round(totalAmount),
          method: 'QR_PAY',
          orderCode: payosOrderCode,
          description: `Goi ${plan.name.toUpperCase()}`, // Max 25 chars: "Goi PRO" or "Goi VIP"
          items: [
            {
              name: `Goi ${plan.name.toUpperCase()}`,
              quantity: 1,
              price: Math.round(totalAmount),
            },
          ],
          isSubscription: true, // Use subscription return URL
        });

        if (!gatewayResult.success) {
          throw new Error(gatewayResult.message || 'Failed to create payment link');
        }

        // Update payment with PayOS data
        await this.subscriptionRepository.updatePaymentStatus(
          payment.id,
          'pending',
          {
            payosData: {
              ...payment.payos_data,
              paymentLinkId: gatewayResult.paymentLinkId,
              checkoutUrl: gatewayResult.checkoutUrl,
              qrCode: gatewayResult.qrCode,
              accountNumber: gatewayResult.accountNumber,
              accountName: gatewayResult.accountName,
            },
          },
          tx
        );

        return {
          success: true,
          subscription: {
            id: subscription.id,
            planName: plan.name,
            planDisplayName: plan.display_name,
            amount,
            vatAmount,
            totalAmount,
            expiresAt,
          },
          payment: {
            id: payment.id,
            orderCode: payosOrderCode,
            checkoutUrl: gatewayResult.checkoutUrl,
            qrCode: gatewayResult.qrCode,
            accountNumber: gatewayResult.accountNumber,
            accountName: gatewayResult.accountName,
          },
        };
      } catch (error) {
        console.error('PayOS error:', error);
        
        // Update payment status to failed
        await this.subscriptionRepository.updatePaymentStatus(
          payment.id,
          'failed',
          {
            payosData: {
              ...payment.payos_data,
              error: error.message,
            },
          },
          tx
        );

        throw new Error('Failed to create payment link: ' + error.message);
      }
    });
  }
}

module.exports = CreateSubscriptionPaymentUseCase;
