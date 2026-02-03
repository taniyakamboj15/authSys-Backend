import redisClient from '../../config/redis.config';
import logger from '../../common/utils/logger';
import crypto from 'crypto';

const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
const OTP_RATE_LIMIT_KEY_PREFIX = 'otp:ratelimit:';
const OTP_KEY_PREFIX = 'otp:';
const MAX_OTP_PER_HOUR = 3;

export class OTPService {
  /**
   * Generate a secure 6-digit OTP
   */
  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generate and store OTP in Redis
   */
  async generateAndStoreOTP(email: string): Promise<string> {
    // Check rate limiting
    await this.checkRateLimit(email);

    // Generate OTP
    const otp = this.generateOTP();
    const key = `${OTP_KEY_PREFIX}${email}`;

    try {
      // Store in Redis with expiry
      await redisClient.setex(key, OTP_EXPIRY_SECONDS, otp);
      
      // Increment rate limit counter
      await this.incrementRateLimitCounter(email);

      logger.info('OTP generated and stored', { email });
      return otp;
    } catch (error: any) {
      logger.error('Failed to store OTP in Redis', { email, error: error.message });
      throw new Error('Failed to generate OTP');
    }
  }

  /**
   * Verify OTP against stored value
   */
  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const key = `${OTP_KEY_PREFIX}${email}`;

    try {
      const storedOTP = await redisClient.get(key);

      if (!storedOTP) {
        logger.warn('OTP not found or expired', { email });
        return false;
      }

      const isValid = storedOTP === otp;

      if (isValid) {
        // Delete OTP after successful verification
        await redisClient.del(key);
        logger.info('OTP verified successfully', { email });
      } else {
        logger.warn('Invalid OTP provided', { email });
      }

      return isValid;
    } catch (error: any) {
      logger.error('Failed to verify OTP', { email, error: error.message });
      throw new Error('Failed to verify OTP');
    }
  }

  /**
   * Check if user has exceeded OTP rate limit
   */
  private async checkRateLimit(email: string): Promise<void> {
    const rateLimitKey = `${OTP_RATE_LIMIT_KEY_PREFIX}${email}`;
    
    try {
      const count = await redisClient.get(rateLimitKey);
      
      if (count && parseInt(count, 10) >= MAX_OTP_PER_HOUR) {
        throw new Error('Too many OTP requests. Please try again later.');
      }
    } catch (error: any) {
      if (error.message.includes('Too many')) {
        throw error; // Re-throw rate limit errors
      }
      logger.error('Rate limit check failed', { email, error: error.message });
    }
  }

  /**
   * Increment rate limit counter
   */
  private async incrementRateLimitCounter(email: string): Promise<void> {
    const rateLimitKey = `${OTP_RATE_LIMIT_KEY_PREFIX}${email}`;
    const ONE_HOUR = 60 * 60;

    try {
      const current = await redisClient.get(rateLimitKey);
      
      if (current) {
        await redisClient.incr(rateLimitKey);
      } else {
        // Set with 1-hour expiry
        await redisClient.setex(rateLimitKey, ONE_HOUR, '1');
      }
    } catch (error: any) {
      logger.error('Failed to increment rate limit', { email, error: error.message });
    }
  }

  /**
   * Delete OTP (for cleanup or cancellation)
   */
  async deleteOTP(email: string): Promise<void> {
    const key = `${OTP_KEY_PREFIX}${email}`;
    
    try {
      await redisClient.del(key);
      logger.info('OTP deleted', { email });
    } catch (error: any) {
      logger.error('Failed to delete OTP', { email, error: error.message });
    }
  }
}

export const otpService = new OTPService();
