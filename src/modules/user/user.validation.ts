import { body } from 'express-validator';

export const registerValidators = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('Invalid email format'),
  
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isLength({ max: 72 }).withMessage('Password too long')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),
    
  body('name')
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
    .isLength({ max: 50 }).withMessage('Name is too long')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
];

export const loginValidators = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail().withMessage('Invalid email format'),
    
  body('password')
    .notEmpty().withMessage('Password is required'),
];
