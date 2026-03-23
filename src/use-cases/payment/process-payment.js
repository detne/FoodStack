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

  buildDescription(order) {
    const base = `TT ${String(order.id).slice(0, 8)}`;
    return base.slice(0, 25);
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
      account_number: payment.payos_data?.accountNumber || null,
      account_name: payment.payos_data?.accountName || null,
      bin: payment.payos_data?.bin || null,
      description: payment.payos_data?.description || null,
    };
  }

  async validateOrderBelongsToQrTable(order, qrToken, tx) {
    const client = tx || this.prisma;

    const table = await client.tables.findFirst({
      where: {
        qr_token: qrToken,
      },
      select: {
        id: true,
        area_id: true,
        qr_token: true,
        areas: {
          select: {
            id: true,
            branch_id: true,
          },
        },
      },
    });

    if (!table) {
      const err = new Error('Invalid QR token');
      err.status = 400;
      throw err;
    }

    if (!order.table_id) {
      const err = new Error('Order is not associated with a table');
      err.status = 400;
      throw err;
    }

    if (String(order.table_id) !== String(table.id)) {
      const err = new Error('Order does not belong to the scanned table');
      err.status = 403;
      throw err;
    }

    return table;
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

    await this.validateOrderBelongsToQrTable(order, dto.qrToken);

    if (order.payment_status === 'PAID') {
      const err = new Error('Order already paid');
      err.status = 409;
      throw err;
    }

    const orderTotal = Number(order.total || 0);
    if (!orderTotal || orderTotal <= 0) {
      const err = new Error('Order total is invalid');
      err.status = 400;
      throw err;
    }

    const existing = await this.paymentRepository.findByIdempotencyKey(
      idempotencyKey
    );

    if (existing) {
      if (String(existing.order_id) !== String(order.id)) {
        const err = new Error('Payment does not belong to this order');
        err.status = 403;
        throw err;
      }

      if (existing.status === 'PENDING' || existing.status === 'PAID') {
        return this.mapPaymentResponse(existing);
      }
    }

    // CASH: chỉ tạo yêu cầu thanh toán tiền mặt, chưa mark PAID
    if (dto.method === 'CASH') {
      const payment = await this.prisma.$transaction(async (tx) => {
        const freshOrder = await this.orderRepository.findById(dto.orderId, tx);

        if (!freshOrder) {
          const err = new Error('Order not found');
          err.status = 404;
          throw err;
        }

        await this.validateOrderBelongsToQrTable(freshOrder, dto.qrToken, tx);

        if (freshOrder.payment_status === 'PAID') {
          const err = new Error('Order already paid');
          err.status = 409;
          throw err;
        }

        return this.paymentRepository.create(
          {
            orderId: freshOrder.id,
            amount: freshOrder.total,
            method: 'CASH',
            status: 'PENDING',
            transactionRef: null,
            payosData: {
              qrToken: dto.qrToken,
              tableId: freshOrder.table_id || null,
              requestedAt: new Date().toISOString(),
            },
            idempotencyKey,
          },
          tx
        );
      });

      return this.mapPaymentResponse(payment);
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
    const description = this.buildDescription(order);

    const payment = await this.prisma.$transaction(async (tx) => {
      const freshOrder = await this.orderRepository.findById(dto.orderId, tx);

      if (!freshOrder) {
        const err = new Error('Order not found');
        err.status = 404;
        throw err;
      }

      await this.validateOrderBelongsToQrTable(freshOrder, dto.qrToken, tx);

      if (freshOrder.payment_status === 'PAID') {
        const err = new Error('Order already paid');
        err.status = 409;
        throw err;
      }

      return this.paymentRepository.create(
        {
          orderId: freshOrder.id,
          amount: freshOrder.total,
          method: 'QR_PAY',
          status: 'PENDING',
          transactionRef: null,
          idempotencyKey,
          payosData: {
            orderCode: String(payosOrderCode),
            description,
            qrToken: dto.qrToken,
            tableId: freshOrder.table_id || null,
          },
        },
        tx
      );
    });

    let gatewayResult;

    try {
      // Check if mock mode is enabled
      const useMockPayment = process.env.USE_MOCK_PAYMENT === 'true';
      
      if (useMockPayment) {
        // Use mock payment gateway
        const mockResult = await this.createMockPayment({
          orderId: order.id,
          amount: orderTotal,
          orderCode: payosOrderCode,
          description,
        });
        gatewayResult = mockResult;
      } else {
        // Use real PayOS
        gatewayResult = await this.paymentGatewayService.charge({
          orderId: order.id,
          amount: orderTotal,
          method: 'QR_PAY',
          orderCode: payosOrderCode,
          description,
          items: [
            {
              name: 'Thanh toan don hang',
              quantity: 1,
              price: orderTotal,
            },
          ],
        });
      }
    } catch (error) {
      const failedPayment = await this.prisma.$transaction(async (tx) => {
        return this.paymentRepository.update(
          payment.id,
          {
            status: 'FAILED',
            payos_data: {
              ...(payment.payos_data || {}),
              error: error.message || 'Create payment link failed',
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
            amount: orderTotal,
            raw: gatewayResult.raw || null,
          },
          updated_at: new Date(),
        },
        tx
      );
    });

    return this.mapPaymentResponse(updatedPayment);
  }

  async createMockPayment({ orderId, amount, orderCode, description }) {
    const fetch = require('node-fetch');
    
    try {
      const response = await fetch(`${process.env.BASE_URL}/api/v1/mock-payments/create-payment-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          returnUrl: `${process.env.FRONTEND_URL}/payment/success?orderCode=${orderCode}`,
          cancelUrl: `${process.env.FRONTEND_URL}/payment/success?orderCode=${orderCode}&cancel=true`,
        }),
      });

      const result = await response.json();
      
      if (result.error === 0) {
        return {
          success: true,
          paymentLinkId: result.data.paymentLinkId,
          checkoutUrl: result.data.checkoutUrl,
          qrCode: result.data.qrCode,
          accountNumber: result.data.accountNumber,
          accountName: result.data.accountName,
          bin: result.data.bin,
          raw: result.data,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Mock payment creation failed',
          raw: result,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Mock payment service error',
      };
    }
  }
}

module.exports = { ProcessPaymentUseCase };