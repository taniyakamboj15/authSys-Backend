import redisClient from '../../config/redis.config';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const OTP_EXPIRY_SECONDS = 300;
const MAX_OTP_ATTEMPTS = 3;

interface ResetOTPData {
  otp: string;
  attempts: number;
  expiresAt: number;
}

import { normalizeEmail } from '../../common/utils/email.helper';

export class PasswordService {
  async requestPasswordReset(email: string): Promise<string> {
    const normalizedEmail = normalizeEmail(email);
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpData: ResetOTPData = {
      otp: await bcrypt.hash(otp, 10),
      attempts: 0,
      expiresAt: Date.now() + OTP_EXPIRY_SECONDS * 1000,
    };

    const key = `password-reset-otp:${normalizedEmail}`;
    await redisClient.setex(key, OTP_EXPIRY_SECONDS, JSON.stringify(otpData));

    return otp;
  }

  async verifyResetOTP(email: string, otp: string): Promise<boolean> {
    const normalizedEmail = normalizeEmail(email);
    const key = `password-reset-otp:${normalizedEmail}`;
    const data = await redisClient.get(key);

    if (!data) {
      return false;
    }

    const otpData: ResetOTPData = JSON.parse(data);

    if (Date.now() > otpData.expiresAt) {
      await redisClient.del(key);
      return false;
    }

    if (otpData.attempts >= MAX_OTP_ATTEMPTS) {
      await redisClient.del(key);
      return false;
    }

    const isValid = await bcrypt.compare(otp, otpData.otp);

    if (!isValid) {
      otpData.attempts += 1;
      const remainingTime = Math.ceil((otpData.expiresAt - Date.now()) / 1000);
      await redisClient.setex(key, remainingTime, JSON.stringify(otpData));
      return false;
    }

    await redisClient.set(`verified-reset:${normalizedEmail}`, '1', 'EX', 600);
    await redisClient.del(key);
    return true;
  }

  async isResetVerified(email: string): Promise<boolean> {
    const normalizedEmail = normalizeEmail(email);
    const verified = await redisClient.get(`verified-reset:${normalizedEmail}`);
    return verified === '1';
  }

  async resetPassword(email: string, newPassword: string, currentPasswordHash: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    // ... logic continues ...
    const isSamePassword = await bcrypt.compare(newPassword, currentPasswordHash);
    if (isSamePassword) {
      throw new Error('New password cannot be the same as the current password');
    }

    await redisClient.del(`verified-reset:${normalizedEmail}`);
  }
}

export const passwordService = new PasswordService();
