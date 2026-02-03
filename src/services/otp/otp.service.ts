import redisClient from '../../config/redis.config';
import logger from '../../common/utils/logger';
import crypto from 'crypto';

const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
const OTP_RATE_LIMIT_KEY_PREFIX = 'otp:ratelimit:';
const OTP_KEY_PREFIX = 'otp:';
const MAX_OTP_PER_HOUR = 50;

import { normalizeEmail } from '../../common/utils/email.helper';
import { getErrorMessage } from '../../common/utils/error.util';

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
    const normalizedEmail = normalizeEmail(email);
    
    // Check rate limiting
    await this.checkRateLimit(normalizedEmail);

    // Generate OTP
    const otp = this.generateOTP();
    const key = `${OTP_KEY_PREFIX}${normalizedEmail}`;

    try {
      // Store in Redis with expiry
      await redisClient.setex(key, OTP_EXPIRY_SECONDS, otp);
      
      // Increment rate limit counter
      await this.incrementRateLimitCounter(normalizedEmail);

      logger.info(`DEBUG: OTP SET key=${key} otp=${otp} expiry=${OTP_EXPIRY_SECONDS}`);
      logger.info('OTP generated and stored', { email: normalizedEmail });
      return otp;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      logger.error('Failed to store OTP in Redis', { email: normalizedEmail, error: message });
      throw new Error('Failed to generate OTP');
    }
  }

  /**
   * Verify OTP against stored value
   */
  async verifyOTP(email: string, otp: string): Promise<boolean> {
    const normalizedEmail = normalizeEmail(email);
    const key = `${OTP_KEY_PREFIX}${normalizedEmail}`;

    try {
      const storedOTP = await redisClient.get(key);
      logger.info(`DEBUG: OTP GET key=${key} stored=${storedOTP} input=${otp}`);

      if (!storedOTP) {
        logger.warn('OTP not found or expired', { email: normalizedEmail });
        return false;
      }

      const isValid = storedOTP === otp;

      if (isValid) {
        // Delete OTP after successful verification
        await redisClient.del(key);
        logger.info('OTP verified successfully', { email: normalizedEmail });
      } else {
        logger.warn('Invalid OTP provided', { email: normalizedEmail });
      }

      return isValid;
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      logger.error('Failed to verify OTP', { email: normalizedEmail, error: message });
      throw new Error('Failed to verify OTP');
    }
  }

  /**
   * Check if user has exceeded OTP rate limit
   */
  private async checkRateLimit(email: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const rateLimitKey = `${OTP_RATE_LIMIT_KEY_PREFIX}${normalizedEmail}`;
    
    try {
      const count = await redisClient.get(rateLimitKey);
      
      if (count && parseInt(count, 10) >= MAX_OTP_PER_HOUR) {
        throw new Error('Too many OTP requests. Please try again later.');
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      if (message.includes('Too many')) {
        throw error; // Re-throw rate limit errors
      }
      logger.error('Rate limit check failed', { email: normalizedEmail, error: message });
    }
  }

  /**
   * Increment rate limit counter
   */
  private async incrementRateLimitCounter(email: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const rateLimitKey = `${OTP_RATE_LIMIT_KEY_PREFIX}${normalizedEmail}`;
    const ONE_HOUR = 60 * 60;

    try {
      const current = await redisClient.get(rateLimitKey);
      
      if (current) {
        await redisClient.incr(rateLimitKey);
      } else {
        // Set with 1-hour expiry
        await redisClient.setex(rateLimitKey, ONE_HOUR, '1');
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      logger.error('Failed to increment rate limit', { email: normalizedEmail, error: message });
    }
  }

  /**
   * Delete OTP (for cleanup or cancellation)
   */
  async deleteOTP(email: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const key = `${OTP_KEY_PREFIX}${normalizedEmail}`;
    
    try {
      await redisClient.del(key);
      logger.info('OTP deleted', { email: normalizedEmail });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      logger.error('Failed to delete OTP', { email: normalizedEmail, error: message });
    }
  }
}

export const otpService = new OTPService();
