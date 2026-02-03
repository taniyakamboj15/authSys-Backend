import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many registration attempts. Please try again after 1 hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const emailVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: 'Too many verification attempts. Please try again after 5 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const resendOTPLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: 'Too many OTP resend requests. Please try again after 5 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const verifyOTPLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: 'Too many OTP verification attempts. Please try again after 5 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Too many password reset attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

