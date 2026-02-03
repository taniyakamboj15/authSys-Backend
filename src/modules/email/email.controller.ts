import { Request, Response, NextFunction } from 'express';
import { otpService } from '../../services/otp/otp.service';
import { emailService } from '../../services/email/email.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { User } from '../user/user.model';
import { AuthError, NotFoundError } from '../../common/errors/AuthError';
import logger from '../../common/utils/logger';
import { getErrorMessage } from '../../common/utils/error.util';

export class EmailController {
 
  async sendVerificationOTP(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email.trim();

    try {
      // Check if user exists
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if already verified
      if (user.isVerified) {
        throw new AuthError('Email already verified');
      }

      // Generate and store OTP
      const otp = await otpService.generateAndStoreOTP(email);

      // Send email
      await emailService.sendVerificationEmail(email, otp);

      logger.info('Verification OTP sent', { email });
      ResponseUtil.success(res, null, 'Verification code sent to your email');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      logger.error(`Failed to send verification OTP: ${message}`, { email, error: message });
      throw error;
    }
  }

  async verifyOTP(req: Request, res: Response, next: NextFunction) {
    const { otp } = req.body;
    const email = req.body.email.trim();

    try {
      // Verify OTP
      const isValid = await otpService.verifyOTP(email, otp);

      if (!isValid) {
        throw new AuthError('Invalid or expired verification code');
      }

      // Update user verification status
      const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { isVerified: true },
        { new: true }
      );

      if (!user) {
        throw new NotFoundError('User not found');
      }

      logger.info('Email verified successfully', { email });
      ResponseUtil.success(res, { user }, 'Email verified successfully');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      logger.error('OTP verification failed', { email, error: message });
      throw error;
    }
  }


  async resendOTP(req: Request, res: Response, next: NextFunction) {
    const email = req.body.email.trim();

    try {
      // Check if user exists
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if already verified
      if (user.isVerified) {
        throw new AuthError('Email already verified');
      }

      // Generate and store new OTP
      const otp = await otpService.generateAndStoreOTP(email);

      // Send email
      await emailService.sendVerificationEmail(email, otp);

      logger.info('Verification OTP resent', { email });
      ResponseUtil.success(res, null, 'Verification code resent to your email');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      logger.error('Failed to resend verification OTP', { email, error: message });
      throw error;
    }
  }
}


export const emailController = new EmailController();
