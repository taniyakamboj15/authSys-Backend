import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { AuthRequest } from '../../common/types/common.types';
import { setAuthCookies, clearAuthCookies } from '../../common/utils/cookie.util';
import { ResponseUtil } from '../../common/utils/response.util';
import { AuthError } from '../../common/errors/AuthError';

import { sessionService } from '../session/session.service';

export class UserController {
  async register(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || 'Unknown';
    const result = await userService.register(req.body, userAgent, ip);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    ResponseUtil.success(res, { user: result.user }, 'User registered successfully', 201);
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || 'Unknown';
    const result = await userService.login(req.body, userAgent, ip);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    ResponseUtil.success(res, { user: result.user }, 'Logged in successfully');
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.cookies.refreshToken; // Only check cookie
    if (!refreshToken) {
      throw new AuthError('No refresh token provided');
    }
    const result = await userService.refresh(refreshToken);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    ResponseUtil.success(res, null, 'Token refreshed successfully');
  }

  async logout(req: Request, res: Response, next: NextFunction) {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
          await sessionService.revokeSessionByToken(refreshToken);
      }
      clearAuthCookies(res);
      ResponseUtil.success(res, null, 'Logged out successfully');
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
      if (!req.user) {
        throw new AuthError('Unauthorized'); 
      }
      const result = await userService.getProfile(req.user._id.toString());
      ResponseUtil.success(res, result, 'User profile retrieved');
  }

  async googleCallback(req: Request, res: Response, next: NextFunction) {
    const user = req.user; // Global type augmentation should work here
    if (!user) {
      throw new AuthError('Google authentication failed');
    }
    
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || 'Unknown';
    const result = await userService.handleOAuthLogin(user, userAgent, ip);
    
    setAuthCookies(res, result.accessToken, result.refreshToken);

    // Redirect to frontend profile page
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/profile`);
  }
}

export const userController = new UserController();
