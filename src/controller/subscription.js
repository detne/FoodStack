const SubscriptionRepository = require('../repository/subscription');
const CreateSubscriptionPaymentUseCase = require('../use-cases/subscription/create-subscription-payment');
const VerifySubscriptionWebhookUseCase = require('../use-cases/subscription/verify-subscription-webhook');
const { PayOSService } = require('../service/payos');
const { SubscriptionLimitService } = require('../service/subscription-limit.service');
const { PrismaClient } = require('@prisma/client');

class SubscriptionController {
  constructor() {
    this.prisma = new PrismaClient();
    this.subscriptionRepository = new SubscriptionRepository(this.prisma);
    this.subscriptionLimitService = new SubscriptionLimitService(this.prisma);
    this.payOSService = new PayOSService();
    
    this.createSubscriptionPaymentUseCase = new CreateSubscriptionPaymentUseCase(
      this.subscriptionRepository,
      this.payOSService,
      this.prisma
    );
    
    this.verifySubscriptionWebhookUseCase = new VerifySubscriptionWebhookUseCase(
      this.payOSService,
      this.subscriptionRepository,
      this.prisma
    );
  }

  async getPlans(req, res) {
    try {
      const plans = await this.subscriptionRepository.getPlans();
      
      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error('Get plans error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get subscription plans',
      });
    }
  }

  async getCurrentSubscription(req, res) {
    try {
      const restaurantId = req.user?.restaurantId;
      
      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID not found',
        });
      }

      const subscription = await this.subscriptionRepository.getCurrentSubscription(restaurantId);
      
      res.json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      console.error('Get current subscription error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get current subscription',
      });
    }
  }

  async createPayment(req, res) {
    try {
      const restaurantId = req.user?.restaurantId;
      const { planName, paymentMethod } = req.body;

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID not found',
        });
      }

      if (!planName || !['pro', 'vip'].includes(planName)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan name. Must be "pro" or "vip"',
        });
      }

      if (!paymentMethod || !['card', 'momo', 'zalopay'].includes(paymentMethod)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method',
        });
      }

      const result = await this.createSubscriptionPaymentUseCase.execute({
        restaurantId,
        planName,
        paymentMethod,
      });

      res.json(result);
    } catch (error) {
      console.error('Create subscription payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create subscription payment',
      });
    }
  }

  async handleWebhook(req, res) {
    try {
      const result = await this.verifySubscriptionWebhookUseCase.execute(req.body);
      
      res.json(result);
    } catch (error) {
      console.error('Subscription webhook error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Webhook processing failed',
      });
    }
  }

  async getPaymentHistory(req, res) {
    try {
      const restaurantId = req.user?.restaurantId;
      const limit = parseInt(req.query.limit) || 10;

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID not found',
        });
      }

      const history = await this.subscriptionRepository.getPaymentHistory(restaurantId, limit);
      
      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get payment history',
      });
    }
  }

  async getLimits(req, res) {
    try {
      const restaurantId = req.user?.restaurantId;

      if (!restaurantId) {
        return res.status(400).json({
          success: false,
          message: 'Restaurant ID not found',
        });
      }

      const limitsInfo = await this.subscriptionLimitService.getLimitsInfo(restaurantId);
      
      res.json({
        success: true,
        data: limitsInfo,
      });
    } catch (error) {
      console.error('Get subscription limits error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get subscription limits',
      });
    }
  }
}

// Export factory to avoid initialization errors
let controllerInstance = null;

function getControllerInstance() {
  if (!controllerInstance) {
    controllerInstance = new SubscriptionController();
  }
  return controllerInstance;
}

module.exports = {
  getPlans: (req, res, next) => getControllerInstance().getPlans(req, res, next),
  getCurrentSubscription: (req, res, next) => getControllerInstance().getCurrentSubscription(req, res, next),
  createPayment: (req, res, next) => getControllerInstance().createPayment(req, res, next),
  handleWebhook: (req, res, next) => getControllerInstance().handleWebhook(req, res, next),
  getPaymentHistory: (req, res, next) => getControllerInstance().getPaymentHistory(req, res, next),
  getLimits: (req, res, next) => getControllerInstance().getLimits(req, res, next),
};
