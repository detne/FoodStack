/**
 * Prisma Reconnect Middleware
 * Workaround for "prepared statement already exists" error
 */

let reconnectCount = 0;
const MAX_RECONNECTS = 3;

async function prismaReconnectMiddleware(req, res, next) {
  // Only reconnect on auth endpoints to avoid performance issues
  const isAuthEndpoint = req.path.includes('/auth/');
  
  if (isAuthEndpoint && req.app.locals.prisma) {
    try {
      // Force disconnect and reconnect
      await req.app.locals.prisma.$disconnect();
      await req.app.locals.prisma.$connect();
      reconnectCount++;
      
      if (reconnectCount % 10 === 0) {
        console.log(`[PRISMA] Reconnected ${reconnectCount} times`);
      }
    } catch (error) {
      console.error('[PRISMA] Reconnect failed:', error.message);
    }
  }
  
  next();
}

module.exports = { prismaReconnectMiddleware };
