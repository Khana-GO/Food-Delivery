export interface AuthUserPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: Omit<AuthUserPayload, 'password'>;
}
