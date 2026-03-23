const { PrismaClient, Prisma } = require('@prisma/client');

class PaymentRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  getClient(tx) {
    return tx || this.prisma;
  }

  async create(data, tx) {
    const client = this.getClient(tx);

    return client.payments.create({
      data: {
        order_id: data.orderId,
        amount: new Prisma.Decimal(data.amount),
        method: data.method || 'QR_PAY',
        status: data.status || 'PENDING',
        transaction_ref: data.transactionRef || null,
        payos_data: data.payosData || {},
        idempotency_key: data.idempotencyKey || null,
        created_at: data.createdAt || new Date(),
        updated_at: data.updatedAt || new Date(),
      },
    });
  }

  async findByTransactionRef(transactionRef, tx) {
    const client = this.getClient(tx);

    return client.payments.findFirst({
      where: { transaction_ref: transactionRef },
    });
  }

  async findByOrderId(orderId, tx) {
    const client = this.getClient(tx);

    return client.payments.findFirst({
      where: { order_id: orderId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findById(paymentId, tx) {
    const client = this.getClient(tx);

    return client.payments.findUnique({
      where: { id: paymentId },
    });
  }

  async findPaymentHistoryByRestaurant(restaurantId, options = {}, tx) {
    const client = this.getClient(tx);
    const { page = 1, limit = 10, startDate, endDate } = options;

    const skip = (page - 1) * limit;

    const where = {
      orders: {
        branches: {
          restaurant_id: restaurantId,
        },
      },
    };

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = startDate;
      if (endDate) where.created_at.lte = endDate;
    }

    const [items, total] = await Promise.all([
      client.payments.findMany({
        where,
        include: {
          orders: {
            select: {
              id: true,
              order_number: true,
              branch_id: true,
              branches: {
                select: {
                  id: true,
                  name: true,
                  restaurant_id: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      client.payments.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPaymentHistoryByRestaurantRaw(restaurantId, options = {}, tx) {
    const client = this.getClient(tx);
    const { page = 1, limit = 10, startDate, endDate } = options;

    const skip = (page - 1) * limit;

    const where = {
      order: {
        branch: {
          restaurant_id: restaurantId,
        },
      },
    };

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = startDate;
      if (endDate) where.created_at.lte = endDate;
    }

    const [items, total] = await Promise.all([
      client.payments.findMany({
        where,
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      client.payments.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByPayOSOrderCode(orderCode, tx) {
    const client = this.getClient(tx);

    const rows = await client.$queryRaw`
      SELECT *
      FROM payments
      WHERE payos_data ->> 'orderCode' = ${String(orderCode)}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return rows[0] || null;
  }

  async findByIdempotencyKey(idempotencyKey, tx) {
    const client = this.getClient(tx);

    return client.payments.findFirst({
      where: { idempotency_key: idempotencyKey },
      orderBy: { created_at: 'desc' },
    });
  }

  async update(paymentId, data, tx) {
    const client = this.getClient(tx);

    return client.payments.update({
      where: { id: paymentId },
      data: {
        ...data,
        updated_at: data.updated_at || new Date(),
      },
    });
  }

  async updatePaymentLinkByPayOSOrderCode(orderCode, paymentLink, tx) {
    const payment = await this.findByPayOSOrderCode(orderCode, tx);

    if (!payment) {
      throw new Error(`Payment not found for payOS orderCode=${orderCode}`);
    }

    const nextPayOSData = {
      ...(payment.payos_data || {}),
      paymentLinkId: paymentLink.paymentLinkId || null,
      checkoutUrl: paymentLink.checkoutUrl || null,
      qrCode: paymentLink.qrCode || null,
      accountNumber: paymentLink.accountNumber || null,
      accountName: paymentLink.accountName || null,
      bin: paymentLink.bin || null,
      status: paymentLink.status || 'PENDING',
      amount: paymentLink.amount || payment.amount,
    };

    return this.update(
      payment.id,
      {
        status: paymentLink.status || 'PENDING',
        payos_data: nextPayOSData,
      },
      tx
    );
  }

  async markPaidByPayOSOrderCode(orderCode, extra = {}, tx) {
    const payment = await this.findByPayOSOrderCode(orderCode, tx);

    if (!payment) {
      throw new Error(`Payment not found for payOS orderCode=${orderCode}`);
    }

    const nextPayOSData = {
      ...(payment.payos_data || {}),
      paymentLinkId:
        extra.paymentLinkId || payment.payos_data?.paymentLinkId || null,
      transactionDateTime: extra.transactionDateTime || null,
      lastWebhook: extra.rawWebhook || null,
      paidData: extra.paidData || null,
    };

    return this.update(
      payment.id,
      {
        status: 'PAID',
        transaction_ref: extra.reference || payment.transaction_ref || null,
        payos_data: nextPayOSData,
      },
      tx
    );
  }

  async markFailedByPayOSOrderCode(orderCode, extra = {}, tx) {
    const payment = await this.findByPayOSOrderCode(orderCode, tx);

    if (!payment) {
      throw new Error(`Payment not found for payOS orderCode=${orderCode}`);
    }

    const nextPayOSData = {
      ...(payment.payos_data || {}),
      lastWebhook: extra.rawWebhook || null,
      failedData: extra.failedData || null,
    };

    return this.update(
      payment.id,
      {
        status: 'FAILED',
        payos_data: nextPayOSData,
      },
      tx
    );
  }

  async getPaymentStatisticsByRestaurant(restaurantId, options = {}, tx) {
    const client = this.getClient(tx);
    const { startDate, endDate } = options;

    const where = {
      status: 'PAID',
      orders: {
        branches: {
          restaurant_id: restaurantId,
        },
      },
    };

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = startDate;
      if (endDate) where.created_at.lte = endDate;
    }

    const [aggregate, transactionCount] = await Promise.all([
      client.payments.aggregate({
        where,
        _sum: {
          amount: true,
        },
      }),
      client.payments.count({
        where,
      }),
    ]);

    return {
      totalRevenue: aggregate._sum.amount || 0,
      transactionCount,
    };
  }
}

module.exports = { PaymentRepository };