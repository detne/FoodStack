const { z } = require('zod');

const VerifyEmailOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^[0-9]{6}$/),
});

module.exports = { VerifyEmailOtpSchema };