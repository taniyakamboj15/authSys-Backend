import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthError } from '../errors/AuthError';
import logger from '../utils/logger';

export const googleAuthCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, (err: Error | null, user: Express.User | false, info?: { message?: string }) => {
    if (err) {
      logger.error('Google OAuth Strategy Error', { error: err.message, stack: err.stack });
      return next(err);
    }
    
    if (!user) {
      const failReason = info?.message || 'Unknown strategy failure';
      logger.warn('Google OAuth Authentication Failed', { reason: failReason, ip: req.ip });
      return next(new AuthError('Google Authentication Failed'));
    }

    // Direct assignment now possible due to global Express.User type definition
    req.user = user;
    
    logger.info('Google OAuth Success', { userId: user._id, role: user.role });
    next();
  })(req, res, next);
};
