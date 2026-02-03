import { Redis } from 'ioredis';
import logger from '../common/utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// Create Redis client
const redisClient = new Redis(REDIS_URL, {
  password: REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    logger.warn(`Redis reconnecting in ${delay}ms...`);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

// Connection event listeners
redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('error', (err) => {
  logger.error('Redis client error', { error: err.message, stack: err.stack });
});

redisClient.on('close', () => {
  logger.warn('Redis connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting');
});

// Graceful disconnect
export const disconnectRedis = async () => {
  try {
    await redisClient.quit();
    logger.info('Redis connection closed gracefully');
  } catch (error) {
    logger.error('Error closing Redis connection', { error });
  }
};

export default redisClient;
