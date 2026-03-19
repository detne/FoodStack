const { PrismaClient, Prisma } = require('@prisma/client');
const { randomUUID } = require('crypto');

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
        id: data.id || randomUUID(),
        order_id: data.orderId,
        amount: new Prisma.Decimal(data.amount),
        method: data.method || 'PAYOS',
        status: data.status || 'PENDING',
        transaction_ref: data.transactionRef || null,
        payos_data: data.payosData || {},
        idempotency_key: data.idempotencyKey || null,
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
      data,
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
}

module.exports = { PaymentRepository };