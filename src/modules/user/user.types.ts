

import { Document } from 'mongoose';
import { UserRole } from '../../common/types/common.types';

export { UserRole };

export interface IUser {
  _id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  googleId?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterInput {
  email: string;
  password?: string;
  name: string;
  googleId?: string;
  isVerified?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface IUserDocument extends Document {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  googleId?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
