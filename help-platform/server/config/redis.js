const { Redis } = require('@upstash/redis');

let redisClient = null;

const connectRedis = () => {
  try {
    if (redisClient) {
      console.log('✅ Redis client already connected');
      return redisClient;
    }

    // Check if Redis credentials are available
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('⚠️ Redis credentials not found, running without Redis');
      return null;
    }

    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    console.log('✅ Upstash Redis connected successfully');
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    return connectRedis();
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
