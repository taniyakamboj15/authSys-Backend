import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { TokenPayload, UserRole } from '../types/common.types';
import { AuthError } from '../errors/AuthError';
import { AUTH_DEFAULTS } from '../constants/auth.constants';

export const generateAccessToken = (userId: string | Types.ObjectId, role: UserRole): string => {
  const expiresIn = process.env.JWT_ACCESS_EXPIRY || AUTH_DEFAULTS.ACCESS_TOKEN_LIFESPAN;
  return jwt.sign(
    { userId: userId.toString(), role, type: 'access' },
    process.env.JWT_SECRET as string,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );
};

export const generateRefreshToken = (userId: string | Types.ObjectId, role: UserRole): string => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRY || AUTH_DEFAULTS.REFRESH_TOKEN_LIFESPAN;
  return jwt.sign(
    { userId: userId.toString(), role, type: 'refresh' },
    process.env.JWT_SECRET as string,
    { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
  );
};


export const verifyToken = (token: string): TokenPayload => {
// Removed try/catch to let middleware handle specific error types (Expired vs Malformed)
    return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
};
