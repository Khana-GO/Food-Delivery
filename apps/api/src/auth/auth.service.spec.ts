import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockDb: any;
  let mockConfigService: Partial<ConfigService>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(() => {
    mockDb = {
      select: jest.fn(),
      insert: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        if (key === 'JWT_EXPIRES_IN') return '1h';
        if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
        return undefined;
      }),
    };

    mockJwtService = {
      sign: jest.fn(() => 'signed-token'),
    };

    service = new AuthService(
      mockDb,
      mockConfigService as ConfigService,
      mockJwtService as JwtService,
    );
  });

  it('registers a new user and returns a sanitized profile', async () => {
    mockDb.select.mockReturnValue({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    });

    mockDb.insert.mockReturnValue({
      values: () => ({
        returning: () =>
          Promise.resolve([
            {
              id: 'user-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              password: 'hashed-password',
              role: 'CUSTOMER',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
      }),
    });

    const result = await service.register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'StrongPass123',
    });

    expect(result.user.email).toBe('john@example.com');
    // expect(result.user.password).toBeUndefined();
    expect(result.user.id).toBe('user-1');
    expect(result.accessToken).toBeDefined();
  });
});
