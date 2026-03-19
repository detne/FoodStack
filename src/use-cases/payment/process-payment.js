const { v4: uuidv4 } = require('uuid');

class ProcessPaymentUseCase {
  constructor(orderRepository, paymentRepository, paymentGatewayService, prisma) {
    this.orderRepository = orderRepository;
    this.paymentRepository = paymentRepository;
    this.paymentGatewayService = paymentGatewayService;
    this.prisma = prisma;
  }

  buildPayOSOrderCode() {
    return Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-15));
  }

  mapPaymentResponse(payment) {
    return {
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      transaction_ref: payment.transaction_ref,
      idempotency_key: payment.idempotency_key,
      payos_data: payment.payos_data || null,
      checkout_url: payment.payos_data?.checkoutUrl || null,
      qr_code: payment.payos_data?.qrCode || null,
      payment_link_id: payment.payos_data?.paymentLinkId || null,
    };
  }

  async execute(dto, context = {}) {
    const idempotencyKey =
      context.idempotencyKey || `payment_${dto.orderId}_${dto.method}`;

    const order = await this.orderRepository.findById(dto.orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    if (order.payment_status === 'PAID') {
      const err = new Error('Order already paid');
      err.status = 409;
      throw err;
    }

    const existing = await this.paymentRepository.findByIdempotencyKey(
      idempotencyKey
    );

    if (existing) {
      return this.mapPaymentResponse(existing);
    }

    if (dto.method === 'CASH') {
      return await this.prisma.$transaction(async (tx) => {
        const freshOrder = await this.orderRepository.findById(dto.orderId, tx);

        if (!freshOrder) {
          const err = new Error('Order not found');
          err.status = 404;
          throw err;
        }

        if (freshOrder.payment_status === 'PAID') {
          const err = new Error('Order already paid');
          err.status = 409;
          throw err;
        }

        const payment = await this.paymentRepository.create(
          {
            id: uuidv4(),
            orderId: freshOrder.id,
            amount: freshOrder.total,
            method: 'CASH',
            status: 'PAID',
            transactionRef: null,
            payosData: null,
            idempotencyKey,
          },
          tx
        );

        await this.orderRepository.update(
          freshOrder.id,
          {
            payment_status: 'PAID',
            updated_at: new Date(),
          },
          tx
        );

        return this.mapPaymentResponse(payment);
      });
    }

    if (dto.method === 'E_WALLET') {
      const err = new Error('E_WALLET is not implemented yet');
      err.status = 400;
      throw err;
    }

    if (dto.method !== 'QR_PAY') {
      const err = new Error(`Unsupported payment method: ${dto.method}`);
      err.status = 400;
      throw err;
    }

    const payosOrderCode = this.buildPayOSOrderCode();

    const payment = await this.prisma.$transaction(async (tx) => {
      const freshOrder = await this.orderRepository.findById(dto.orderId, tx);

      if (!freshOrder) {
        const err = new Error('Order not found');
        err.status = 404;
        throw err;
      }

      if (freshOrder.payment_status === 'PAID') {
        const err = new Error('Order already paid');
        err.status = 409;
        throw err;
      }

      return this.paymentRepository.create(
        {
          id: uuidv4(),
          orderId: freshOrder.id,
          amount: freshOrder.total,
          method: 'QR_PAY',
          status: 'PENDING',
          transactionRef: null,
          idempotencyKey,
          payosData: {
            orderCode: String(payosOrderCode),
            description: dto.description || `DH${freshOrder.id}`,
            customerName: dto.customerName || null,
            items: dto.items || [],
          },
        },
        tx
      );
    });

    let gatewayResult;

    try {
      gatewayResult = await this.paymentGatewayService.charge({
        orderId: order.id,
        amount: Number(order.total),
        method: 'QR_PAY',
        orderCode: payosOrderCode,
        description: dto.description || `DH${order.id}`,
        customerName: dto.customerName || null,
        items: dto.items || [],
      });
    } catch (error) {
      const failedPayment = await this.prisma.$transaction(async (tx) => {
        return this.paymentRepository.update(
          payment.id,
          {
            status: 'FAILED',
            payos_data: {
              ...(payment.payos_data || {}),
              error: error.message || 'Create PayOS payment link failed',
            },
            updated_at: new Date(),
          },
          tx
        );
      });

      return this.mapPaymentResponse(failedPayment);
    }

    if (!gatewayResult?.success) {
      const failedPayment = await this.prisma.$transaction(async (tx) => {
        return this.paymentRepository.update(
          payment.id,
          {
            status: 'FAILED',
            payos_data: {
              ...(payment.payos_data || {}),
              error: gatewayResult?.message || 'Payment link creation failed',
              raw: gatewayResult?.raw || null,
            },
            updated_at: new Date(),
          },
          tx
        );
      });

      return this.mapPaymentResponse(failedPayment);
    }

    const updatedPayment = await this.prisma.$transaction(async (tx) => {
      return this.paymentRepository.update(
        payment.id,
        {
          status: 'PENDING',
          payos_data: {
            ...(payment.payos_data || {}),
            paymentLinkId: gatewayResult.paymentLinkId || null,
            checkoutUrl: gatewayResult.checkoutUrl || null,
            qrCode: gatewayResult.qrCode || null,
            accountNumber: gatewayResult.accountNumber || null,
            accountName: gatewayResult.accountName || null,
            bin: gatewayResult.bin || null,
            raw: gatewayResult.raw || null,
          },
          updated_at: new Date(),
        },
        tx
      );
    });

    return this.mapPaymentResponse(updatedPayment);
  }
}

module.exports = { ProcessPaymentUseCase };