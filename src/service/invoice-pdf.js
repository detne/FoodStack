const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class InvoicePdfService {
  formatCurrency(value) {
    const number = Number(value || 0);
    return `${number.toLocaleString('vi-VN')} VND`;
  }

  formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleString('vi-VN');
  }

  async downloadImageToBuffer(url) {
    if (!url) return null;

    const client = url.startsWith('https') ? https : http;

    return new Promise((resolve) => {
      client
        .get(url, (res) => {
          if (res.statusCode !== 200) {
            resolve(null);
            return;
          }

          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
        })
        .on('error', () => resolve(null));
    });
  }

  async generateInvoicePdf(invoice, order, branding = {}) {
    const outputDir = path.join(process.cwd(), 'uploads', 'invoices');
    fs.mkdirSync(outputDir, { recursive: true });

    const fileName = `${invoice.invoice_number}.pdf`;
    const filePath = path.join(outputDir, fileName);

    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - 80;

    const restaurantName = branding.restaurantName || 'FoodStack';
    const branchName = branding.branchName || null;
    const restaurantLogoUrl = branding.restaurantLogoUrl || null;

    const drawLine = (y) => {
      doc
        .moveTo(40, y)
        .lineTo(pageWidth - 40, y)
        .strokeColor('#D9D9D9')
        .lineWidth(1)
        .stroke();
    };

    const labelValueRow = (label, value, y, options = {}) => {
      const labelWidth = options.labelWidth || 120;
      const valueX = 40 + labelWidth;

      doc
        .font('Helvetica-Bold')
        .fontSize(options.labelSize || 10)
        .fillColor('#444444')
        .text(label, 40, y, { width: labelWidth });

      doc
        .font(options.valueBold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(options.valueSize || 10)
        .fillColor('#111111')
        .text(value || '-', valueX, y, {
          width: contentWidth - labelWidth,
          align: options.align || 'left',
        });
    };

    // ===== HEADER =====
    const logoBuffer = await this.downloadImageToBuffer(restaurantLogoUrl);

    if (logoBuffer) {
      try {
        doc.image(logoBuffer, 40, 30, {
          fit: [60, 60],
          align: 'left',
          valign: 'center',
        });
      } catch (error) {
        // bỏ qua nếu logo lỗi định dạng
      }
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor('#111111')
      .text(restaurantName, logoBuffer ? 115 : 40, 35, {
        width: 300,
      });

    if (branchName) {
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#666666')
        .text(`Chi nhánh: ${branchName}`, logoBuffer ? 115 : 40, 63, {
          width: 300,
        });
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(26)
      .fillColor('#111111')
      .text('INVOICE', 0, 40, {
        align: 'right',
      });

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#666666')
      .text(`Invoice No: ${invoice.invoice_number}`, 0, 72, {
        align: 'right',
      });

    drawLine(110);

    // ===== INFO BLOCKS =====
    const leftX = 40;
    const rightX = 320;
    const topY = 130;

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#111111')
      .text('Invoice Information', leftX, topY);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#333333')
      .text(`Order ID: ${order.id}`, leftX, topY + 22)
      .text(`Payment ID: ${invoice.payment_id || '-'}`, leftX, topY + 40)
      .text(`Issued At: ${this.formatDate(invoice.issued_at)}`, leftX, topY + 58)
      .text(`Paid At: ${this.formatDate(invoice.paid_at) || '-'}`, leftX, topY + 76);

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#111111')
      .text('Customer Information', rightX, topY);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#333333')
      .text(`Name: ${invoice.customer_name || 'Guest Customer'}`, rightX, topY + 22)
      .text(`Email: ${invoice.customer_email || '-'}`, rightX, topY + 40)
      .text(`Phone: ${invoice.customer_phone || '-'}`, rightX, topY + 58)
      .text(`Status: ${invoice.status || '-'}`, rightX, topY + 76);

    drawLine(250);

    // ===== ORDER SUMMARY =====
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#111111')
      .text('Order Summary', 40, 265);

    const tableTop = 295;
    const col1 = 40;
    const col2 = 300;
    const col3 = 360;
    const col4 = 470;

    doc
      .rect(40, tableTop, contentWidth, 24)
      .fill('#F5F5F5');

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#111111')
      .text('Item', col1, tableTop + 7, { width: 240 })
      .text('Qty', col2, tableTop + 7, { width: 40, align: 'center' })
      .text('Price', col3, tableTop + 7, { width: 90, align: 'right' })
      .text('Subtotal', col4, tableTop + 7, { width: 90, align: 'right' });

    let y = tableTop + 34;

    (order.order_items || []).forEach((item, index) => {
      const itemName = item.menu_items?.name || item.menu_item_id || 'Item';
      const notes = item.notes ? `Notes: ${item.notes}` : '';
      const rowHeight = notes ? 34 : 22;

      if (index % 2 === 0) {
        doc
          .rect(40, y - 4, contentWidth, rowHeight)
          .fill('#FCFCFC');
      }

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#111111')
        .text(itemName, col1, y, { width: 240 })
        .text(String(item.quantity), col2, y, { width: 40, align: 'center' })
        .text(this.formatCurrency(item.price), col3, y, { width: 90, align: 'right' })
        .text(this.formatCurrency(item.subtotal), col4, y, { width: 90, align: 'right' });

      if (notes) {
        doc
          .font('Helvetica-Oblique')
          .fontSize(9)
          .fillColor('#666666')
          .text(notes, col1, y + 16, { width: 240 });
      }

      y += rowHeight;
    });

    drawLine(y + 4);

    // ===== TOTAL BLOCK =====
    const totalBlockY = y + 20;
    const totalLabelX = 350;

    labelValueRow('Subtotal', this.formatCurrency(order.subtotal), totalBlockY, {
      labelWidth: totalLabelX - 40,
      align: 'right',
    });

    labelValueRow('Tax', this.formatCurrency(order.tax), totalBlockY + 20, {
      labelWidth: totalLabelX - 40,
      align: 'right',
    });

    labelValueRow(
      'Service Charge',
      this.formatCurrency(order.service_charge),
      totalBlockY + 40,
      {
        labelWidth: totalLabelX - 40,
        align: 'right',
      }
    );

    doc
      .rect(340, totalBlockY + 68, 215, 32)
      .fill('#F5F5F5');

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('#111111')
      .text('TOTAL', 355, totalBlockY + 78, { width: 80 });

    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor('#111111')
      .text(this.formatCurrency(order.total), 430, totalBlockY + 76, {
        width: 110,
        align: 'right',
      });

    // ===== FOOTER =====
    const footerY = totalBlockY + 130;
    drawLine(footerY);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#555555')
      .text('Thank you for dining with us.', 40, footerY + 15, {
        align: 'center',
        width: contentWidth,
      });

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#888888')
      .text(`Generated by ${restaurantName}`, 40, footerY + 35, {
        align: 'center',
        width: contentWidth,
      });

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