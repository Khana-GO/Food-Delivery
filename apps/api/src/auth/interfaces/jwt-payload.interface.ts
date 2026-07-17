export interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  type?: string;
  iat?: number;
  exp?: number;
}
