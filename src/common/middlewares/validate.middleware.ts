import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../errors/AuthError'; // Assuming ValidationError is exported from here or similar

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors to match { field, message } structure
    const formattedErrors = errors.array().map((err: any) => ({
      field: err.path || err.param || 'unknown', 
      message: err.msg,
    }));
    
    // We throw a custom ValidationError which the global handler should catch
    // Assuming ValidationError accepts an array or we join them. 
    // If the global handler expects one message, we might need a specific structure.
    // Let's check AuthError again quickly, but for now assuming standard error throwing.
    // Actually, looking at previous context, global handler handles ZodError. 
    // We need to adapt global handler or throw a compatible error.
    // Let's check checks.
    
    throw new ValidationError('Validation failed', formattedErrors);
  }
  next();
};
