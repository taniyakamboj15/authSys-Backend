import { Session } from './session.model';
import { generateRefreshToken, verifyToken } from '../../common/helpers/jwt.helper';
import { hashToken } from '../../common/utils/hash.util';
import { AuthError } from '../../common/errors/AuthError';
import { Types } from 'mongoose';
import { UserRole } from '../../common/types/common.types';

export class SessionService {
  async createSession(userId: string | Types.ObjectId, userAgent: string = 'Unknown', ipAddress: string = 'Unknown', role: UserRole) {
    const refreshToken = generateRefreshToken(userId, role);
    const refreshTokenHash = hashToken(refreshToken);

    const sessionTTL = parseInt(process.env.SESSION_EXPIRY_DAYS || '7', 10) * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + sessionTTL);

    await Session.create({
      userId,
      refreshTokenHash,
      userAgent,
      ipAddress,
      expiresAt,
    });

    return refreshToken;
  }

  async refreshSession(refreshToken: string) {
    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      throw new AuthError('Invalid refresh token type');
    }

    const refreshTokenHash = hashToken(refreshToken);
    const session = await Session.findOne({
      userId: payload.userId,
      refreshTokenHash,
    });

    if (!session) {

      await Session.deleteMany({ userId: payload.userId });
      throw new AuthError('Session reuse detected. Security alert: All sessions revoked.');
    }

    // Check expiry
    if (session.expiresAt < new Date()) {
        await session.deleteOne();
        throw new AuthError('Session expired');
    }

    // Rotation: Delete old session
    await session.deleteOne();

    // Create new session (Rotate)
    const newRefreshToken = await this.createSession(payload.userId, session.userAgent || 'Unknown', session.ipAddress || 'Unknown', payload.role as UserRole);
    
    return {
      refreshToken: newRefreshToken,
      userId: payload.userId,
      role: payload.role as UserRole,
    };
  }

  async revokeSession(sessionId: string) {
      await Session.findByIdAndDelete(sessionId);
  }

  async revokeSessionByToken(refreshToken: string) {
      const refreshTokenHash = hashToken(refreshToken);
      await Session.deleteOne({ refreshTokenHash });
  }
}

export const sessionService = new SessionService();
