import { UserRole } from '@food_delivery/types';

export class User {
  id!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  password!: string;
  phone?: string;
  role!: UserRole;
  imageUrl?: string;
  pushToken?: string;
  lastLoginAt?: Date;
  isOnline!: boolean;
  isVerified!: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  verificationAttempts!: number;
  verificationLastSentAt?: Date;
  resetAttempts!: number;
  resetLastSentAt?: Date;
  verifiedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}