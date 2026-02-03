import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';
import { ValidationError } from '../errors/AuthError'; 

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    const formattedErrors = errors.array().map((err: ExpressValidationError) => {
      // Handle different versions of express-validator types
      const field = 'path' in err ? err.path : ('param' in err ? err.param : 'unknown');
      return {
        field: String(field),
        message: err.msg,
      };
    });
 
    throw new ValidationError('Validation failed', formattedErrors);
  }
  next();
};
