import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/BaseError';
import logger from '../utils/logger';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (err instanceof BaseError) {
    if (err.isOperational) {
      logger.error('Operational Error', {
        method: req.method,
        path: req.path,
        statusCode: err.statusCode,
        message: err.message,
        stack: err.stack,
      });

      const response: any = {
        success: false,
        message: err.message,
      };

      if ('details' in err && Array.isArray((err as any).details)) {
        response.errors = (err as any).details;
      }

      if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
      }

      return res.status(err.statusCode).json(response);
    }
  }

  // Non-Operational / Unknown Errors (Crash the process)
  const statusCode = 500;
  const message = 'Internal Server Error';

  logger.error('Critical Error (Non-Operational)', {
    method: req.method,
    path: req.path,
    statusCode,
    message: err.message, // Log original message internally
    stack: err.stack,
  });

  // Attempt to send a final response before crashing
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  // Exit process to allow restart
  process.exit(1);
};
