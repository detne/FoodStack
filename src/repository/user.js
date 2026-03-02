// src/repository/user.js
class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data, tx) {
    const client = tx || this.prisma;
    return client.user.create({ data });
  }

  async update(id, data) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async saveVerificationToken(userId, token, tx) {
    const client = tx || this.prisma;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    return client.verificationToken.create({
      data: {
        userId,
        token,
        type: 'EMAIL_VERIFICATION',
        expiresAt,
      },
    });
  }
}

module.exports = { UserRepository };
