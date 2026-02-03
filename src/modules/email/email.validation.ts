import { body } from 'express-validator';

export const sendOTPValidators = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
];

export const verifyOTPValidators = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('otp')
    .isString()
    .withMessage('OTP must be a string')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
];

export const resendOTPValidators = [
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
];
