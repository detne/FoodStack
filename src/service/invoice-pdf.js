const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoicePdfService {
  async generateInvoicePdf(invoice, order) {
    const outputDir = path.join(process.cwd(), 'uploads', 'invoices');
    fs.mkdirSync(outputDir, { recursive: true });

    const fileName = `${invoice.invoice_number}.pdf`;
    const filePath = path.join(outputDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice No: ${invoice.invoice_number}`);
    doc.text(`Order ID: ${order.id}`);
    if (invoice.payment_id) {
      doc.text(`Payment ID: ${invoice.payment_id}`);
    }
    doc.text(`Issued At: ${new Date(invoice.issued_at).toLocaleString()}`);
    if (invoice.paid_at) {
      doc.text(`Paid At: ${new Date(invoice.paid_at).toLocaleString()}`);
    }
    doc.moveDown();

    if (invoice.customer_name) doc.text(`Customer Name: ${invoice.customer_name}`);
    if (invoice.customer_email) doc.text(`Customer Email: ${invoice.customer_email}`);
    if (invoice.customer_phone) doc.text(`Customer Phone: ${invoice.customer_phone}`);
    doc.moveDown();

    doc.text('Order Summary:');
    doc.moveDown(0.5);

    (order.order_items || []).forEach((item, index) => {
      const itemName = item.menu_items?.name || item.menu_item_id || 'Item';
      doc.text(`${index + 1}. ${itemName} x${item.quantity} - ${item.subtotal}`);
      if (item.notes) {
        doc.fontSize(10).text(`   Notes: ${item.notes}`);
        doc.fontSize(12);
      }
    });

    doc.moveDown();
    doc.text(`Subtotal: ${order.subtotal}`);
    doc.text(`Tax: ${order.tax}`);
    doc.text(`Service Charge: ${order.service_charge}`);
    doc.fontSize(14).text(`Total: ${order.total}`);
    doc.moveDown();
    doc.fontSize(12).text('Thank you for dining with us.');

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return {
      fileName,
      filePath,
      pdfUrl: `/uploads/invoices/${fileName}`,
    };
  }
}

module.exports = { InvoicePdfService };