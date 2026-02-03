import { Response } from 'express';
import { AUTH_COOKIES, AUTH_DEFAULTS } from '../constants/auth.constants';

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

const isProduction = process.env.NODE_ENV === 'production';

const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: false, // Set to false for localhost development
  sameSite: 'lax', // 'lax' allows cookies on top-level navigation (OAuth redirects)
  maxAge: AUTH_DEFAULTS.ACCESS_TOKEN_MAX_AGE_MS,
  path: '/', // Make cookie available on all paths
};

const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: false, // Set to false for localhost development
  sameSite: 'lax', // 'lax' allows cookies on top-level navigation (OAuth redirects)
  maxAge: parseInt(process.env.SESSION_EXPIRY_DAYS || '7', 10) * 24 * 60 * 60 * 1000, 
  path: '/', // Make cookie available on all paths
  // Note: We might want to use AUTH_DEFAULTS.REFRESH_TOKEN_MAX_AGE_MS here unless env override is critical
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie(AUTH_COOKIES.ACCESS_TOKEN, accessToken, accessTokenCookieOptions);
  res.cookie(AUTH_COOKIES.REFRESH_TOKEN, refreshToken, refreshTokenCookieOptions);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(AUTH_COOKIES.ACCESS_TOKEN, accessTokenCookieOptions);
  res.clearCookie(AUTH_COOKIES.REFRESH_TOKEN, refreshTokenCookieOptions);
};
