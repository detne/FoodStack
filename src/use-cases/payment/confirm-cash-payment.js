class ConfirmCashPaymentUseCase {
  constructor(paymentRepository, orderRepository, generateInvoiceUseCase, userRepository, prisma) {
    this.paymentRepository = paymentRepository;
    this.orderRepository = orderRepository;
    this.generateInvoiceUseCase = generateInvoiceUseCase;
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  async execute(paymentId, currentUser) {
    const currentUserId = currentUser?.id || currentUser?.userId;

    if (!currentUserId) {
      const err = new Error('Unauthorized');
      err.status = 401;
      throw err;
    }

    const user = await this.userRepository.findById(currentUserId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 401;
      throw err;
    }

    if (!['OWNER', 'MANAGER', 'STAFF'].includes(user.role)) {
      const err = new Error('You do not have permission to confirm cash payment');
      err.status = 403;
      throw err;
    }

    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      const err = new Error('Payment not found');
      err.status = 404;
      throw err;
    }

    if (payment.method !== 'CASH') {
      const err = new Error('Only CASH payment can be confirmed here');
      err.status = 400;
      throw err;
    }

    if (payment.status === 'PAID') {
      return {
        paymentId: payment.id,
        orderId: payment.order_id,
        method: payment.method,
        status: payment.status,
        message: 'Cash payment already confirmed',
      };
    }

    const updatedPayment = await this.prisma.$transaction(async (tx) => {
      const order = await this.orderRepository.findById(payment.order_id, tx);
      if (!order) {
        const err = new Error('Order not found');
        err.status = 404;
        throw err;
      }

      const nextPayOSData = {
        ...(payment.payos_data || {}),
        confirmedBy: currentUserId,
        confirmedAt: new Date().toISOString(),
      };

      const paidPayment = await this.paymentRepository.update(
        payment.id,
        {
          status: 'PAID',
          payos_data: nextPayOSData,
          updated_at: new Date(),
        },
        tx
      );

      await this.orderRepository.update(
        order.id,
        {
          payment_status: 'PAID',
          status: 'COMPLETED',
          updated_at: new Date(),
        },
        tx
      );

      return paidPayment;
    });

    try {
      await this.generateInvoiceUseCase.execute(updatedPayment.id);
    } catch (error) {
      console.error('GENERATE INVOICE ERROR (CASH):', error);
    }

    return {
      paymentId: updatedPayment.id,
      orderId: updatedPayment.order_id,
      amount: updatedPayment.amount,
      method: updatedPayment.method,
      status: updatedPayment.status,
      message: 'Cash payment confirmed successfully',
    };
  }
}

module.exports = { ConfirmCashPaymentUseCase };