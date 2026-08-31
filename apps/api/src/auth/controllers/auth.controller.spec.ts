import { describe, expect, it, jest } from '@jest/globals';

import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';

describe('AuthController', () => {
  it('uses the bearer token from the authorization header when no body refresh token is provided', async () => {
    const logout = jest.fn(
      async (_refreshToken: string, _accessToken?: string) => ({
        message: 'Logged out successfully',
      }),
    );
    const authService = { logout } as unknown as AuthService;
    const controller = new AuthController(authService);

    const result = await controller.logout(
      {},
      'Bearer refresh-token-from-header',
    );

    // Controller forwards both tokens so both can be revoked:
    // empty refresh token from the empty body + access token from the header
    expect(logout).toHaveBeenCalledWith('', 'refresh-token-from-header');
    expect(result).toEqual({ message: 'Logged out successfully' });
  });
});
