import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../errors/AuthError'; 

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {

    const formattedErrors = errors.array().map((err: any) => ({
      field: err.path || err.param || 'unknown', 
      message: err.msg,
    }));
    
    
    throw new ValidationError('Validation failed', formattedErrors);
  }
  next();
};
