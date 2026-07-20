import { describe, expect, it, jest } from '@jest/globals';

import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';

describe('AuthController', () => {
  it('uses the bearer token from the authorization header when no body refresh token is provided', async () => {
    const logout = jest.fn(async () => ({ message: 'Logged out successfully' }));
    const authService = { logout } as unknown as AuthService;
    const controller = new AuthController(authService);

    const result = await controller.logout({} as any, 'Bearer refresh-token-from-header');

    expect(logout).toHaveBeenCalledWith('refresh-token-from-header');
    expect(result).toEqual({ message: 'Logged out successfully' });
  });
});
