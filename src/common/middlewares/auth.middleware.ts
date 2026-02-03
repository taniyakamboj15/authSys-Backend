import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../helpers/jwt.helper';
import { AuthError } from '../errors/AuthError';
import { AuthRequest } from '../types/common.types';
import logger from '../utils/logger';
import { UserRole } from '../types/common.types';
import { AUTH_COOKIES } from '../constants/auth.constants';

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies[AUTH_COOKIES.ACCESS_TOKEN];

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AuthError('Access token missing');
    }

    const decoded = verifyToken(token);

    if (decoded.type !== 'access') {
      throw new AuthError('Invalid access token');
    }

    // Performance Update: Trust the token claims instead of querying DB every request
    // Since we include role in JWT and revocation is handled via short expiry
    req.user = {
      _id: decoded.userId,
      // Future-proof: Fallback to USER if role is missing/invalid type
      role: (decoded.role as UserRole) || UserRole.USER,
    };
    
    next();
  } catch (err) {
    // Distinguish between Expired vs Invalid tokens for better client handling
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AuthError('Token expired'));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new AuthError('Invalid token'));
    }

    logger.warn('Auth middleware failed', {
      path: req.path,
      error: err instanceof Error ? err.message : 'Unknown error',
      ip: req.ip
    });

    if (err instanceof AuthError) {
      return next(err);
    }
    
    next(new AuthError('Invalid or expired token'));
  }
};
