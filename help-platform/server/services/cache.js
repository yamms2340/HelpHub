const { getRedisClient } = require('../config/redis');

const cacheService = {
  // Get cached data
  async get(key) {
    try {
      const redis = getRedisClient();
      if (!redis) return null;

      const data = await redis.get(key);
      if (data) {
        console.log(`✅ Cache HIT: ${key}`);
        return JSON.parse(data);
      }
      
      console.log(`❌ Cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Set cached data with TTL (time to live in seconds)
  async set(key, value, ttl = 300) {
    try {
      const redis = getRedisClient();
      if (!redis) return false;

      await redis.set(key, JSON.stringify(value), {
        ex: ttl, // expire after ttl seconds
      });
      
      console.log(`✅ Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Delete cached data
  async del(key) {
    try {
      const redis = getRedisClient();
      if (!redis) return false;

      await redis.del(key);
      console.log(`🗑️ Cache DELETE: ${key}`);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Delete multiple keys by pattern
  async delPattern(pattern) {
    try {
      const redis = getRedisClient();
      if (!redis) return false;

      // Note: Upstash doesn't support SCAN, use with caution
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`🗑️ Cache DELETE pattern: ${pattern} (${keys.length} keys)`);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  },

  // Clear all cache
  async clear() {
    try {
      const redis = getRedisClient();
      if (!redis) return false;

      await redis.flushdb();
      console.log('🗑️ Cache CLEARED');
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }
};

module.exports = cacheService;
