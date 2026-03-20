/**
 * MongoDB Setup Script
 * Sets up MongoDB database with initial data and indexes
 */

const { PrismaClient } = require('@prisma/client');
const { logger } = require('../src/config/logger.config');

const prisma = new PrismaClient();

/**
 * Create initial roles
 */
const createInitialRoles = async () => {
  const roles = [
    {
      name: 'OWNER',
      description: 'Restaurant owner with full access'
    },
    {
      name: 'MANAGER', 
      description: 'Branch manager with management access'
    },
    {
      name: 'STAFF', 
      description: 'Staff member with limited access'
    },
    {
      name: 'CASHIER',
      description: 'Cashier with payment access'
    }
  ];

  for (const role of roles) {
    await prisma.roles.upsert({
      where: { name: role.name },
      update: role,
      create: role
    });
  }

  logger.info('Initial roles created');
};

/**
 * Create initial permissions
 */
const createInitialPermissions = async () => {
  const permissions = [
    // Restaurant management
    { name: 'restaurant:create', resource: 'restaurant', action: 'create' },
    { name: 'restaurant:read', resource: 'restaurant', action: 'read' },
    { name: 'restaurant:update', resource: 'restaurant', action: 'update' },
    { name: 'restaurant:delete', resource: 'restaurant', action: 'delete' },
    
    // Branch management
    { name: 'branch:create', resource: 'branch', action: 'create' },
    { name: 'branch:read', resource: 'branch', action: 'read' },
    { name: 'branch:update', resource: 'branch', action: 'update' },
    { name: 'branch:delete', resource: 'branch', action: 'delete' },
    
    // Menu management
    { name: 'menu:create', resource: 'menu', action: 'create' },
    { name: 'menu:read', resource: 'menu', action: 'read' },
    { name: 'menu:update', resource: 'menu', action: 'update' },
    { name: 'menu:delete', resource: 'menu', action: 'delete' },
    
    // Order management
    { name: 'order:create', resource: 'order', action: 'create' },
    { name: 'order:read', resource: 'order', action: 'read' },
    { name: 'order:update', resource: 'order', action: 'update' },
    { name: 'order:cancel', resource: 'order', action: 'cancel' },
    
    // Payment management
    { name: 'payment:process', resource: 'payment', action: 'process' },
    { name: 'payment:refund', resource: 'payment', action: 'refund' },
    
    // Staff management
    { name: 'staff:create', resource: 'staff', action: 'create' },
    { name: 'staff:read', resource: 'staff', action: 'read' },
    { name: 'staff:update', resource: 'staff', action: 'update' },
    { name: 'staff:delete', resource: 'staff', action: 'delete' }
  ];

  for (const permission of permissions) {
    await prisma.permissions.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission
    });
  }

  logger.info('Initial permissions created');
};

/**
 * Create subscription plans
 */
const createSubscriptionPlans = async () => {
  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for small restaurants',
      price: 29.99,
      billing_cycle: 'monthly',
      max_branches: 1,
      max_tables: 10,
      max_menu_items: 50,
      features: {
        qr_ordering: true,
        payment_integration: true,
        basic_analytics: true,
        email_support: true
      },
      branding_features: {
        custom_logo: false,
        custom_domain: false,
        remove_branding: false
      }
    },
    {
      name: 'Professional', 
      description: 'For growing restaurant chains',
      price: 79.99,
      billing_cycle: 'monthly',
      max_branches: 5,
      max_tables: 50,
      max_menu_items: 200,
      features: {
        qr_ordering: true,
        payment_integration: true,
        advanced_analytics: true,
        priority_support: true,
        staff_management: true,
        inventory_tracking: true
      },
      branding_features: {
        custom_logo: true,
        custom_domain: true,
        remove_branding: false
      }
    },
    {
      name: 'Enterprise',
      description: 'For large restaurant enterprises',
      price: 199.99,
      billing_cycle: 'monthly',
      max_branches: -1, // unlimited
      max_tables: -1, // unlimited
      max_menu_items: -1, // unlimited
      features: {
        qr_ordering: true,
        payment_integration: true,
        enterprise_analytics: true,
        dedicated_support: true,
        staff_management: true,
        inventory_tracking: true,
        multi_location: true,
        api_access: true
      },
      branding_features: {
        custom_logo: true,
        custom_domain: true,
        remove_branding: true,
        white_label: true
      }
    }
  ];

  for (const plan of plans) {
    await prisma.subscription_plans.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan
    });
  }

  logger.info('Subscription plans created');
};

/**
 * Main setup function
 */
const setupMongoDB = async () => {
  try {
    logger.info('Setting up MongoDB database...');
    
    await prisma.$connect();
    
    // Create initial data
    await createInitialRoles();
    await createInitialPermissions();
    await createSubscriptionPlans();
    
    logger.info('MongoDB setup completed successfully!');
    
  } catch (error) {
    logger.error('MongoDB setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

// Run setup if called directly
if (require.main === module) {
  setupMongoDB();
}

module.exports = {
  setupMongoDB,
  createInitialRoles,
  createInitialPermissions,
  createSubscriptionPlans
};