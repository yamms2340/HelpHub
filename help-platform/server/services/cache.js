const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.connect();
  }

  connect() {
    try {
      if (!process.env.REDIS_URL) {
        console.log('⚠️ Redis: No REDIS_URL found, caching disabled');
        return;
      }

      this.redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError(err) {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        }
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis: Connected to Upstash');
        this.isConnected = true;
      });

      this.redis.on('ready', () => {
        console.log('✅ Redis: Ready');
        this.isConnected = true;
      });

      this.redis.on('error', (err) => {
        console.error('❌ Redis Error:', err.message);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('⚠️ Redis: Connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        console.log('🔄 Redis: Reconnecting...');
      });

    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      this.redis = null;
    }
  }

  // ==================== GET ====================
  async get(key) {
    if (!this.redis || !this.isConnected) {
      return null;
    }

    try {
      const data = await this.redis.get(key);
      if (!data) {
        console.log(`⚠️ Cache MISS: ${key}`);
        return null;
      }

      console.log(`✅ Cache HIT: ${key}`);
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Cache GET error for ${key}:`, error.message);
      return null;
    }
  }

  // ==================== SET ====================
  async set(key, value, ttlSeconds = 300) {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttlSeconds, serialized);
      console.log(`💾 Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
      return true;
    } catch (error) {
      console.error(`❌ Cache SET error for ${key}:`, error.message);
      return false;
    }
  }

  // ==================== DELETE ====================
  async del(key) {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      await this.redis.del(key);
      console.log(`🗑️ Cache DEL: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Cache DEL error for ${key}:`, error.message);
      return false;
    }
  }

  // ==================== DELETE PATTERN ====================
  async delPattern(pattern) {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`🗑️ Cache DEL PATTERN: ${pattern} (${keys.length} keys)`);
      }
      return true;
    } catch (error) {
      console.error(`❌ Cache DEL PATTERN error for ${pattern}:`, error.message);
      return false;
    }
  }

  // ==================== EXISTS ====================
  async exists(key) {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`❌ Cache EXISTS error for ${key}:`, error.message);
      return false;
    }
  }

  // ==================== CLEAR ALL ====================
  async clearAll() {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      await this.redis.flushdb();
      console.log('🗑️ Cache: All cleared');
      return true;
    } catch (error) {
      console.error('❌ Cache CLEAR ALL error:', error.message);
      return false;
    }
  }

  // ==================== GET STATS ====================
  async getStats() {
    if (!this.redis || !this.isConnected) {
      return {
        connected: false,
        message: 'Redis not connected'
      };
    }

    try {
      const dbSize = await this.redis.dbsize();
      const info = await this.redis.info('stats');
      
      return {
        connected: true,
        isConnected: this.isConnected,
        keys: dbSize,
        info: info
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // ==================== INCREMENT ====================
  async increment(key, amount = 1) {
    if (!this.redis || !this.isConnected) {
      return null;
    }

    try {
      const result = await this.redis.incrby(key, amount);
      return result;
    } catch (error) {
      console.error(`❌ Cache INCREMENT error for ${key}:`, error.message);
      return null;
    }
  }

  // ==================== EXPIRE ====================
  async expire(key, ttlSeconds) {
    if (!this.redis || !this.isConnected) {
      return false;
    }

    try {
      await this.redis.expire(key, ttlSeconds);
      return true;
    } catch (error) {
      console.error(`❌ Cache EXPIRE error for ${key}:`, error.message);
      return false;
    }
  }
}

const cacheService = new CacheService();
module.exports = cacheService;
