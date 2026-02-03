import { User } from './user.model';
import { Types } from 'mongoose';
import {  RegisterInput, LoginInput, UserRole } from './user.types';
import { hashPassword, verifyPassword } from '../../common/helpers/password.helper';
import { generateAccessToken } from '../../common/helpers/jwt.helper';
import { AuthError, ConflictError, NotFoundError } from '../../common/errors/AuthError';
import { sessionService } from '../session/session.service';
import { otpService } from '../../services/otp/otp.service';
import { emailService } from '../../services/email/email.service';
import logger from '../../common/utils/logger';

export class UserService {
  async register(data: RegisterInput, userAgent?: string, ip?: string) {
    const email = data.email.toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    const hashedPassword = data.password ? await hashPassword(data.password) : undefined;
    const user = await User.create({
      ...data,
      email,
      password: hashedPassword,
      isVerified: false, // New users start unverified
    });

    // Generate and send OTP for email verification
    try {
      const otp = await otpService.generateAndStoreOTP(email);
      await emailService.sendVerificationEmail(email, otp);
      logger.info('Verification OTP sent to new user', { email });
    } catch (error: any) {
      logger.error('Failed to send verification OTP', { email, error: error.message });
      // Don't fail registration if email sending fails
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await sessionService.createSession(user._id, userAgent, ip, user.role);

    return { user, accessToken, refreshToken };
  }

  async login(data: LoginInput, userAgent?: string, ip?: string) {
    const email = data.email.toLowerCase();
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      throw new AuthError('Invalid credentials');
    }

    const isMatch = await verifyPassword(data.password, user.password);
    if (!isMatch) {
      throw new AuthError('Invalid credentials');
    }

    if (!user.isVerified) {
        throw new AuthError('Please verify your email address');
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await sessionService.createSession(user._id, userAgent, ip, user.role);

    return { user, accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const { refreshToken: newRefreshToken, userId, role } = await sessionService.refreshSession(refreshToken);
    const accessToken = generateAccessToken(userId, role);
    return { accessToken, refreshToken: newRefreshToken }; 
  }

  async handleOAuthLogin(userStub: { _id: string | Types.ObjectId; role: UserRole }, userAgent?: string, ip?: string) { // Updated type
    const accessToken = generateAccessToken(userStub._id, userStub.role);
    const refreshToken = await sessionService.createSession(userStub._id, userAgent, ip, userStub.role);

    // Fetch full user for response
    const user = await User.findById(userStub._id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return { user, accessToken, refreshToken };
  }

  async getProfile(userId: string) {
      const user = await User.findById(userId);
      if(!user) throw new NotFoundError("User not found");
      return user;
  }
}

export const userService = new UserService();
