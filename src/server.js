/**
 * Server Entry Point
 * Start the Express server
 */

require('dotenv').config();
const { createApp } = require('./app');
const { redisService } = require('./service/redis.service');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // Connect to Redis if enabled
    if (process.env.REDIS_ENABLED === 'true') {
      console.log('🔄 Connecting to Redis...');
      await redisService.connect();
      console.log('✅ Redis connected\n');
    } else {
      console.log('⚠️  Redis is disabled\n');
    }

    // Create app
    const app = createApp();

    // Start server
    const server = app.listen(PORT, () => {
      console.log('╔════════════════════════════════════════╗');
      console.log('║     FoodStack API Server Started      ║');
      console.log('╚════════════════════════════════════════╝');
      console.log('');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/v1`);
      console.log('');
      console.log('Available endpoints:');
      console.log('  POST /api/v1/auth/login');
      console.log('  POST /api/v1/auth/register');
      console.log('  POST /api/v1/auth/refresh-token');
      console.log('  POST /api/v1/auth/logout');
      console.log('');
      console.log('Press CTRL+C to stop');
      console.log('════════════════════════════════════════');
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('\n🛑 Shutting down gracefully...');
      
      // Disconnect Redis
      if (process.env.REDIS_ENABLED === 'true') {
        await redisService.disconnect();
        console.log('✅ Redis disconnected');
      }
      
      // Close server
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
