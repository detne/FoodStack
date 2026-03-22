# Hướng Dẫn Implement Logout với Redis

## Tổng Quan

Khi user logout, token sẽ được thêm vào Redis blacklist. Mỗi request sẽ check token có trong blacklist không.

## Bước 1: Cài Đặt Redis

### 1.1. Cài Redis trên Windows

**Option 1: Dùng WSL (Khuyến nghị)**
```bash
# Trong WSL Ubuntu
sudo apt update
sudo apt install redis-server
sudo service redis-server start

# Test
redis-cli ping
# Kết quả: PONG
```

**Option 2: Dùng Docker**
```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

**Option 3: Download Windows build**
- Tải từ: https://github.com/microsoftarchive/redis/releases
- Giải nén và chạy `redis-server.exe`

### 1.2. Cài Redis Client cho Node.js

```bash
npm install redis
```

## Bước 2: Tạo Redis Service

Tạo file `src/service/redis.service.js`:

```javascript
// src/service/redis.service.js
const redis = require('redis');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis: Too many reconnection attempts');
              return new Error('Too many retries');
            }
            return retries * 100; // Retry after 100ms, 200ms, 300ms...
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('⚠️  Redis disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  // Blacklist token (TTL = token expiry time)
  async blacklistToken(token, expiryInSeconds) {
    if (!this.isConnected) {
      console.warn('Redis not connected, skipping blacklist');
      return false;
    }

    try {
      const key = `blacklist:${token}`;
      await this.client.setEx(key, expiryInSeconds, 'blacklisted');
      return true;
    } catch (error) {
      console.error('Error blacklisting token:', error);
      return false;
    }
  }

  // Check if token is blacklisted
  async isTokenBlacklisted(token) {
    if (!this.isConnected) {
      console.warn('Redis not connected, assuming token is valid');
      return false;
    }

    try {
      const key = `blacklist:${token}`;
      const result = await this.client.get(key);
      return result !== null;
    } catch (error) {
      console.error('Error checking blacklist:', error);
      return false;
    }
  }

  // Remove token from blacklist (optional, for testing)
  async removeFromBlacklist(token) {
    if (!this.isConnected) return false;

    try {
      const key = `blacklist:${token}`;
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      return false;
    }
  }

  // Get all blacklisted tokens (for debugging)
  async getAllBlacklistedTokens() {
    if (!this.isConnected) return [];

    try {
      const keys = await this.client.keys('blacklist:*');
      return keys;
    } catch (error) {
      console.error('Error getting blacklisted tokens:', error);
      return [];
    }
  }
}

// Singleton instance
const redisService = new RedisService();

module.exports = { redisService, RedisService };
```

## Bước 3: Cập Nhật .env

Thêm vào file `.env`:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true
```

## Bước 4: Khởi Tạo Redis trong Server

Cập nhật `src/server.js`:

```javascript
// src/server.js
const { createApp } = require('./app');
const { redisService } = require('./service/redis.service');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to Redis
    if (process.env.REDIS_ENABLED === 'true') {
      await redisService.connect();
    }

    // Start Express server
    const app = createApp();
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      await redisService.disconnect();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      await redisService.disconnect();
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

## Bước 5: Cập Nhật Auth Middleware

Cập nhật `src/middleware/auth.js`:

```javascript
const { verifyAccessToken } = require('../utils/jwt');
const { redisService } = require('../service/redis.service');

function createAuthMiddleware(tokenService) {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || '';
      const [type, token] = header.split(' ');

      if (type !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Check Redis blacklist first (faster)
      if (process.env.REDIS_ENABLED === 'true') {
        const isBlacklisted = await redisService.isTokenBlacklisted(token);
        if (isBlacklisted) {
          return res.status(401).json({ 
            success: false, 
            message: 'Token has been revoked' 
          });
        }
      }

      // Verify JWT
      const payload = verifyAccessToken(token);

      // Check token version (for invalidating all tokens)
      const currentVersion = await tokenService.getTokenVersion(payload.userId);
      if ((payload.tv ?? 0) !== currentVersion) {
        return res.status(401).json({ 
          success: false, 
          message: 'Token has been revoked' 
        });
      }

      req.user = payload;
      req.accessToken = token;
      next();
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        message: err.message || 'Unauthorized' 
      });
    }
  };
}

module.exports = { createAuthMiddleware };
```

## Bước 6: Tạo Logout Use Case

Tạo file `src/use-cases/auth/logout.js`:

```javascript
// src/use-cases/auth/logout.js
const { redisService } = require('../../service/redis.service');

class LogoutUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, accessToken) {
    try {
      // 1. Validate user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // 2. Blacklist current access token in Redis
      if (process.env.REDIS_ENABLED === 'true' && accessToken) {
        // Calculate TTL from JWT expiry
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(accessToken);
        
        if (decoded && decoded.exp) {
          const now = Math.floor(Date.now() / 1000);
          const ttl = decoded.exp - now;
          
          if (ttl > 0) {
            await redisService.blacklistToken(accessToken, ttl);
            console.log(`Token blacklisted for user ${userId}, TTL: ${ttl}s`);
          }
        }
      }

      // 3. Optional: Increment token version to invalidate all tokens
      // await this.userRepository.incrementTokenVersion(userId);

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}

module.exports = { LogoutUseCase };
```

## Bước 7: Cập Nhật Auth Controller

Cập nhật `src/controller/auth.js`:

```javascript
// Thêm vào constructor
constructor(
  loginUseCase,
  registerRestaurantUseCase,
  refreshTokenUseCase,
  logoutUseCase, // Thêm dòng này
  forgotPasswordUseCase,
  resetPasswordUseCase,
  changePasswordUseCase,
  verifyEmailOtpUseCase
) {
  this.loginUseCase = loginUseCase;
  this.registerRestaurantUseCase = registerRestaurantUseCase;
  this.refreshTokenUseCase = refreshTokenUseCase;
  this.logoutUseCase = logoutUseCase; // Thêm dòng này
  // ... rest
}

// Thêm method logout
async logout(req, res, next) {
  try {
    const userId = req.user?.userId;
    const accessToken = req.accessToken;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    await this.logoutUseCase.execute(userId, accessToken);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}
```

## Bước 8: Cập Nhật Auth Routes

Cập nhật `src/routes/v1/auth.js`:

```javascript
// Thêm route logout
router.post('/logout', authMiddleware, (req, res, next) => 
  authController.logout(req, res, next)
);
```

## Bước 9: Cập Nhật app.js

Trong `src/app.js`, thêm LogoutUseCase:

```javascript
// Import
const { LogoutUseCase } = require('./use-cases/auth/logout');

// Khởi tạo
const logoutUseCase = new LogoutUseCase(userRepository);

// Truyền vào AuthController
const authController = new AuthController(
  loginUseCase,
  registerRestaurantUseCase,
  refreshTokenUseCase,
  logoutUseCase, // Thêm dòng này
  forgotPasswordUseCase,
  resetPasswordUseCase,
  changePasswordUseCase,
  verifyEmailOtpUseCase
);
```

## Bước 10: Test

### 10.1. Test Redis Connection

```bash
# Trong terminal
redis-cli ping
# Kết quả: PONG
```

### 10.2. Test Logout API

```bash
# Login trước
POST http://localhost:3000/api/v1/auth/login
{
  "email": "owner@example.com",
  "password": "password123"
}

# Copy access_token từ response

# Logout
POST http://localhost:3000/api/v1/auth/logout
Authorization: Bearer <access_token>

# Try to use token again (should fail)
GET http://localhost:3000/api/v1/staff
Authorization: Bearer <access_token>
# Kết quả: 401 Unauthorized - Token has been revoked
```

### 10.3. Check Redis

```bash
redis-cli
> KEYS blacklist:*
> GET blacklist:<your-token>
```

## Troubleshooting

### Redis không connect được

```bash
# Check Redis đang chạy
redis-cli ping

# Nếu không chạy
# WSL: sudo service redis-server start
# Docker: docker start redis
```

### Token vẫn valid sau logout

- Check REDIS_ENABLED=true trong .env
- Check Redis service đã connect chưa (xem console log)
- Check auth middleware đã gọi redisService.isTokenBlacklisted chưa

### Performance Issues

- Redis blacklist rất nhanh (< 1ms)
- Token tự động expire sau TTL
- Không cần cleanup manual

## Best Practices

1. **Always set TTL** - Token tự động xóa khỏi Redis khi hết hạn
2. **Graceful shutdown** - Disconnect Redis khi server stop
3. **Error handling** - Nếu Redis down, vẫn cho phép request (fallback)
4. **Monitoring** - Log Redis connection status

## Next Steps

Sau khi implement xong logout, có thể thêm:
- Cache menu availability
- Rate limiting
- Session management
- Real-time notifications với Redis Pub/Sub

---

**Tổng kết:** Logout với Redis giúp invalidate token ngay lập tức, tăng bảo mật cho hệ thống. Token được tự động xóa khỏi Redis khi hết hạn, không cần cleanup manual.
