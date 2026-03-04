// src/service/email.js
class EmailService {
  constructor() {
    // TODO: Configure email provider (SendGrid, AWS SES, Nodemailer, etc.)
  }

  async sendVerificationEmail(email, name, token) {
    try {
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

      console.log(`
        ========================================
        📧 VERIFICATION EMAIL
        ========================================
        To: ${email}
        Name: ${name}
        Verification URL: ${verificationUrl}
        ========================================
      `);

      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  // ✅ ADD THIS: Send OTP email for email verification
  async sendOtpEmail(email, name, otp) {
    try {
      console.log(`
        ========================================
        📧 OTP EMAIL VERIFICATION
        ========================================
        To: ${email}
        Name: ${name}
        OTP: ${otp}
        Expires in: 10 minutes
        ========================================
      `);

      // TODO: Implement actual email sending
      // await emailProvider.send({
      //   to: email,
      //   subject: 'Your OTP Code',
      //   html: `<p>Hi ${name}, your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`
      // });

      return true;
    } catch (error) {
      console.error('OTP email sending failed:', error);
      throw error;
    }
  }
}

module.exports = { EmailService };