/**
 * Server Entry Point
 * Start the Express server
 */

require('dotenv').config();
const { createApp } = require('./app');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create app
const app = createApp();

// Start server
app.listen(PORT, () => {
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
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
