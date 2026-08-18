import { UserRole } from '@food_delivery/types';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  imageUrl?: string;
  pushToken?: string;
  lastLoginAt?: Date;
  isOnline: boolean;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  verificationAttempts: number;
  verificationLastSentAt?: Date;
  resetAttempts: number;
  resetLastSentAt?: Date;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IUserQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isVerified?: boolean;
  isOnline?: boolean;
}
