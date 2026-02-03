import { body } from 'express-validator';

export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];

export const verifyResetOTPValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('otp')
    .isString()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .matches(/^\d{6}$/)
    .withMessage('OTP must contain only numbers'),
];

export const resetPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('newPassword')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .trim(),
];
