// src/repository/user.js
class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findByEmail(email) {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async create(data, tx) {
    const client = tx || this.prisma;
    const { v4: uuidv4 } = require('uuid');
    
    return client.users.create({ 
      data: {
        id: uuidv4(),
        email: data.email,
        password_hash: data.passwordHash,
        full_name: data.fullName,
        phone: data.phone,
        role: data.role,
        restaurant_id: data.restaurantId,
        status: data.status,
        updated_at: new Date(),
      }
    });
  }

  async update(id, data) {
    return this.prisma.users.update({
      where: { id },
      data,
    });
  }

  async saveVerificationToken(userId, token, tx) {
    // TODO: Implement verification token storage
    // For now, just return success
    console.log(`Verification token generated for user ${userId}: ${token}`);
    return { userId, token };
  }

  async logAuthEvent(userId, action, ipAddress) {
    // TODO: Implement auth event logging
    console.log(`Auth event: ${action} for user ${userId} from IP ${ipAddress}`);
    return true;
  }

  async updateLastLogin(userId) {
    return this.prisma.users.update({
      where: { id: userId },
      data: { 
        last_login_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
}

module.exports = { UserRepository };
