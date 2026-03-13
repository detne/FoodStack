const QRCode = require('qrcode');

class QrService {
  /**
   * @param {string} text
   * @returns {Promise<Buffer>} PNG buffer
   */
  async generatePngBuffer(text) {
    return await QRCode.toBuffer(text, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 512,
    });
  }
}

module.exports = { QrService };