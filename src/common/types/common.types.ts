import { Request } from 'express';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface TokenPayload {
  userId: string;
  role: UserRole;
  type?: 'access' | 'refresh';
}


export interface AuthRequest extends Request {}
