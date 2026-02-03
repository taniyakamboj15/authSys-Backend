import { UserRole } from './common.types';

declare global {
  namespace Express {
    interface User {
      _id: string;
      role: UserRole;
    }
  }
}
