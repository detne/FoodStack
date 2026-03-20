const { randomUUID } = require('crypto');

class GenerateInvoiceUseCase {
  constructor(paymentRepository, orderRepository, invoiceRepository, invoicePdfService, prisma) {
    this.paymentRepository = paymentRepository;
    this.orderRepository = orderRepository;
    this.invoiceRepository = invoiceRepository;
    this.invoicePdfService = invoicePdfService;
    this.prisma = prisma;
  }

  buildInvoiceNumber() {
    return `INV-${Date.now()}`;
  }

  async execute(paymentId) {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      const err = new Error('Payment not found');
      err.status = 404;
      throw err;
    }

    if (payment.status !== 'PAID') {
      const err = new Error('Invoice can only be generated for PAID payment');
      err.status = 400;
      throw err;
    }

    const existingInvoice = await this.invoiceRepository.findByPaymentId(payment.id);
    if (existingInvoice) {
      return {
        invoiceId: existingInvoice.id,
        invoiceNumber: existingInvoice.invoice_number,
        orderId: existingInvoice.order_id,
        paymentId: existingInvoice.payment_id,
        subtotal: existingInvoice.subtotal,
        tax: existingInvoice.tax,
        serviceCharge: existingInvoice.service_charge,
        total: existingInvoice.total,
        status: existingInvoice.status,
        issuedAt: existingInvoice.issued_at,
        paidAt: existingInvoice.paid_at,
        pdfUrl: existingInvoice.pdf_url,
      };
    }

    const order = await this.orderRepository.findByIdWithDetails(payment.order_id);
    if (!order) {
      const err = new Error('Order not found');
      err.status = 404;
      throw err;
    }

    const invoice = await this.prisma.$transaction(async (tx) => {
      return this.invoiceRepository.create(
        {
          id: randomUUID(),
          orderId: order.id,
          paymentId: payment.id,
          invoiceNumber: this.buildInvoiceNumber(),
          customerName: null,
          customerEmail: null,
          customerPhone: null,
          subtotal: order.subtotal,
          tax: order.tax,
          serviceCharge: order.service_charge,
          total: order.total,
          status: 'ISSUED',
          issuedAt: new Date(),
          paidAt: new Date(),
          pdfUrl: null,
        },
        tx
      );
    });

    const pdfResult = await this.invoicePdfService.generateInvoicePdf(invoice, order);

    const updatedInvoice = await this.invoiceRepository.update(invoice.id, {
      pdf_url: pdfResult.pdfUrl,
    });

    return {
      invoiceId: updatedInvoice.id,
      invoiceNumber: updatedInvoice.invoice_number,
      orderId: updatedInvoice.order_id,
      paymentId: updatedInvoice.payment_id,
      subtotal: updatedInvoice.subtotal,
      tax: updatedInvoice.tax,
      serviceCharge: updatedInvoice.service_charge,
      total: updatedInvoice.total,
      status: updatedInvoice.status,
      issuedAt: updatedInvoice.issued_at,
      paidAt: updatedInvoice.paid_at,
      pdfUrl: updatedInvoice.pdf_url,
    };
  }
}

module.exports = { GenerateInvoiceUseCase };