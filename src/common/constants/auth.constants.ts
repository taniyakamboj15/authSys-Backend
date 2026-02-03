export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export const AUTH_DEFAULTS = {
  ACCESS_TOKEN_LIFESPAN: '15m',
  REFRESH_TOKEN_LIFESPAN: '7d',
  ACCESS_TOKEN_MAX_AGE_MS: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;
