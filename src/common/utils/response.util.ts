import { Response } from 'express';

export class ResponseUtil {
  static success<T = null>(
    res: Response,
    data: T = null as unknown as T,
    message: string = 'Success',
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }
}
