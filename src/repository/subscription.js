const { PrismaClient } = require('@prisma/client');

class SubscriptionRepository {
  constructor(prisma = new PrismaClient()) {
    this.prisma = prisma;
  }

  async getPlans() {
    return this.prisma.subscription_plans.findMany({
      where: { is_active: true },
      orderBy: { price: 'asc' }
    });
  }

  async getPlanByName(name) {
    return this.prisma.subscription_plans.findFirst({
      where: { 
        name: name,
        is_active: true 
      }
    });
  }

  async getCurrentSubscription(restaurantId, tx = null) {
    const client = tx || this.prisma;
    
    // Get current subscription for restaurant
    const subscription = await client.subscriptions.findFirst({
      where: {
        restaurant_id: restaurantId,
        status: 'ACTIVE'
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!subscription) return null;

    // Get plan details
    const plan = await client.subscription_plans.findFirst({
      where: { name: subscription.plan_type }
    });

    return {
      ...subscription,
      plan_name: plan?.name,
      plan_display_name: plan?.name,
      plan_price: plan?.price,
      plan_features: plan?.features,
      plan_limits: {
        branches: plan?.max_branches,
        tables: plan?.max_tables,
        menu_items: plan?.max_menu_items
      }
    };
  }

  async createSubscription(data, tx = null) {
    const client = tx || this.prisma;
    
    return client.subscriptions.create({
      data: {
        restaurant_id: data.restaurantId,
        plan_type: data.planName || 'free',
        status: data.status || 'PENDING',
        start_date: data.startedAt || new Date(),
        end_date: data.expiresAt,
        max_branches: data.maxBranches || 1,
        max_tables: data.maxTables || 10
      }
    });
  }

  async updateSubscriptionStatus(subscriptionId, status, tx = null) {
    const client = tx || this.prisma;
    
    return client.subscriptions.update({
      where: { id: subscriptionId },
      data: { 
        status: status.toUpperCase(),
        updated_at: new Date()
      }
    });
  }

  async createPayment(data, tx = null) {
    const client = tx || this.prisma;
    
    // For MongoDB, we'll store payment info in a separate collection
    // Since there's no subscription_payments table in the schema,
    // we'll use the payments table with additional metadata
    return client.payments.create({
      data: {
        order_id: data.subscriptionId, // Use subscription ID as order ID
        amount: data.totalAmount,
        method: data.paymentMethod,
        status: (data.status || 'pending').toUpperCase(),
        transaction_ref: data.payosOrderCode,
        idempotency_key: `sub_${data.subscriptionId}_${Date.now()}`, // Generate unique key
        payos_data: {
          ...data.payosData,
          subscription_id: data.subscriptionId,
          plan_id: data.planId,
          restaurant_id: data.restaurantId,
          amount: data.amount,
          vat_amount: data.vatAmount,
          total_amount: data.totalAmount,
          payment_type: 'subscription'
        },
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  async findPaymentByOrderCode(orderCode, tx = null) {
    const client = tx || this.prisma;
    
    return client.payments.findFirst({
      where: {
        transaction_ref: orderCode
      }
    });
  }

  async updatePaymentStatus(paymentId, status, data = {}, tx = null) {
    const client = tx || this.prisma;
    
    const updateData = {
      status: status.toUpperCase(),
      updated_at: new Date()
    };

    if (data.transactionRef) {
      updateData.transaction_ref = data.transactionRef;
    }

    if (data.payosData) {
      // Merge with existing payos_data
      const existing = await client.payments.findUnique({
        where: { id: paymentId },
        select: { payos_data: true }
      });
      
      updateData.payos_data = {
        ...(existing?.payos_data || {}),
        ...data.payosData
      };
    }

    return client.payments.update({
      where: { id: paymentId },
      data: updateData
    });
  }

  async getPaymentHistory(restaurantId, limit = 10) {
    // Get payments that are subscription-related
    const payments = await this.prisma.payments.findMany({
      where: {
        payos_data: {
          path: ['payment_type'],
          equals: 'subscription'
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      take: limit
    });

    // Enrich with plan details
    return Promise.all(payments.map(async (payment) => {
      const planName = payment.payos_data?.plan_id;
      const plan = planName ? await this.prisma.subscription_plans.findFirst({
        where: { name: planName }
      }) : null;

      return {
        ...payment,
        plan_name: plan?.name,
        plan_display_name: plan?.name
      };
    }));
  }
}

module.exports = SubscriptionRepository;
