const { PrismaClient, Prisma } = require('@prisma/client');
const { randomUUID } = require('crypto');

class InvoiceRepository {
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  getClient(tx) {
    return tx || this.prisma;
  }

  async findByOrderId(orderId, tx) {
    const client = this.getClient(tx);

    return client.invoices.findFirst({
      where: { order_id: orderId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByPaymentId(paymentId, tx) {
    const client = this.getClient(tx);

    return client.invoices.findFirst({
      where: { payment_id: paymentId },
    });
  }

  async findById(invoiceId, tx) {
    const client = this.getClient(tx);

    return client.invoices.findUnique({
      where: { id: invoiceId },
    });
  }

  async create(data, tx) {
    const client = this.getClient(tx);

    return client.invoices.create({
      data: {
        id: data.id || randomUUID(),
        order_id: data.orderId,
        payment_id: data.paymentId || null,
        invoice_number: data.invoiceNumber,
        customer_name: data.customerName || null,
        customer_email: data.customerEmail || null,
        customer_phone: data.customerPhone || null,
        subtotal: new Prisma.Decimal(data.subtotal || 0),
        tax: new Prisma.Decimal(data.tax || 0),
        service_charge: new Prisma.Decimal(data.serviceCharge || 0),
        total: new Prisma.Decimal(data.total || 0),
        status: data.status || 'ISSUED',
        pdf_url: data.pdfUrl || null,
        issued_at: data.issuedAt || new Date(),
        paid_at: data.paidAt || null,
        created_at: data.createdAt || new Date(),
        updated_at: data.updatedAt || new Date(),
      },
    });
  }

  async update(invoiceId, data, tx) {
    const client = this.getClient(tx);

    return client.invoices.update({
      where: { id: invoiceId },
      data: {
        ...data,
        updated_at: data.updated_at || new Date(),
      },
    });
  }
}

module.exports = { InvoiceRepository };