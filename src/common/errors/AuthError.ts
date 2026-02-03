import { BaseError } from './BaseError';

export class AuthError extends BaseError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ValidationError extends BaseError {
  public details?: Record<string, unknown>[];

  constructor(message: string = 'Validation failed', details?: Record<string, unknown>[]) {
    super(message, 400);
    this.details = details;
  }
}

export class ConflictError extends BaseError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}
