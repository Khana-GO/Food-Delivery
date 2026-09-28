import { describe, expect, it, jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '../redis/cache.service';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';

import { AuthService } from './services/auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { SessionsService } from '../sessions/sessions.service';
import { NotificationsService } from '../notification/notification.service';

describe('AuthService', () => {
  const mockCacheService = {
    get: jest.fn(async () => undefined),
    set: jest.fn(async () => undefined),
    del: jest.fn(async () => undefined),
  } as unknown as CacheService;

  it('stores pending registration in cache and sends verification email', async () => {
    const sendVerificationEmail = jest.fn(async () => undefined);
    const findByEmail = jest.fn(async () => undefined);

    const users = {
      findByEmail,
      create: jest.fn(),
    } as unknown as UsersService;
    const mail = {
      sendVerificationCode: sendVerificationEmail,
    } as unknown as MailService;
    const config = {
      get: jest.fn((key: string) => (key === 'SALT_ROUNDS' ? '10' : undefined)),
    } as unknown as ConfigService;
    const service = new AuthService(
      users,
      {} as JwtService,
      mail,
      config,
      {} as SessionsService,
      {
        create: jest.fn().mockImplementation(async () => ({})),
      } as unknown as NotificationsService,
      mockCacheService,
      {} as unknown as NeonDatabase<typeof schema>,
    );

    const result = await service.register({
      firstName: 'John',
      lastName: 'Doe',
      email: 'John@Example.com',
      password: 'StrongPass123',
      phone: '1234567',
    });

    // Verify cache.set was called with pending registration data
    expect(mockCacheService.set).toHaveBeenCalledWith(
      expect.stringMatching(/^pending_registration:/),
      expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567',
        otp: expect.stringMatching(/^[a-f0-9]{64}$/),
        otpExpiry: expect.any(Date),
      }),
      600,
    );

    // Verify email was sent with raw OTP
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      'john@example.com',
      expect.stringMatching(/^\d{6}$/),
    );

    // Verify user was NOT created yet
    expect(users.create).not.toHaveBeenCalled();

    // Verify response
    expect(result).toEqual({
      message: 'Check your email for a verification code',
      email: 'john@example.com',
    });
  });

  it('rejects registration when verification email delivery fails', async () => {
    const sendVerificationCode = jest.fn(async () => {
      throw new Error('mail unavailable');
    });
    const findByEmail = jest.fn(async () => undefined);

    const users = {
      findByEmail,
      create: jest.fn(),
    } as unknown as UsersService;
    const config = {
      get: jest.fn((key: string) => (key === 'SALT_ROUNDS' ? '10' : undefined)),
    } as unknown as ConfigService;
    const service = new AuthService(
      users,
      {} as JwtService,
      { sendVerificationCode } as unknown as MailService,
      config,
      {} as SessionsService,
      {} as NotificationsService,
      mockCacheService,
      {} as unknown as NeonDatabase<typeof schema>,
    );

    await expect(
      service.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'StrongPass123',
        phone: '1234567',
      }),
    ).rejects.toThrow('mail unavailable');

    // Verify cache.set was called before email attempt
    expect(mockCacheService.set).toHaveBeenCalled();
    // Verify user was NOT created
    expect(users.create).not.toHaveBeenCalled();
  });

  it('uses the persisted session id for the refresh-token jti so logout can revoke the right session', async () => {
    const user = {
      id: 'user-1',
      email: 'john@example.com',
      role: 'customer',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashed-password',
      isVerified: true,
    };

    const users = {
      findByEmail: jest.fn(async () => user),
      recordLogin: jest.fn(async () => undefined),
    } as unknown as UsersService;

    const sign = jest.fn(
      (payload: Record<string, unknown>) => `token-${payload.jti as string}`,
    );
    const jwt = { sign } as unknown as JwtService;
    const sessionCreate = jest.fn(async () => ({ id: 'session-row-id' }));
    const sessionService = { create: sessionCreate } as any;
    const mail = {} as MailService;
    const config = {
      get: jest.fn((key: string) =>
        key === 'SALT_ROUNDS'
          ? '10'
          : key === 'JWT_EXPIRES_IN'
            ? '15m'
            : key === 'JWT_REFRESH_EXPIRES_IN'
              ? '7d'
              : undefined,
      ),
    } as unknown as ConfigService;

    const service = new AuthService(
      users,
      jwt,
      mail,
      config,
      sessionService,
      {} as NotificationsService,
      {} as any,
    );

    await (service as any).authResponse(user);

    const createArgs = (
      sessionCreate as unknown as { mock: { calls: Array<unknown[]> } }
    ).mock.calls[0];
    expect(createArgs?.[0]).toBe('user-1');
    expect(createArgs?.[1]).toEqual(expect.stringMatching(/^token-/));
    expect(createArgs?.[2]).toEqual(expect.any(Date));
    expect(createArgs?.[3]).toBeUndefined();
    expect(createArgs?.[4]).toEqual(expect.any(String));

    const refreshSignCall = (
      sign as unknown as { mock: { calls: Array<unknown[]> } }
    ).mock.calls.find((call) => {
      const payload = call[0] as Record<string, unknown> | undefined;
      return payload?.type === 'refresh' && typeof payload.jti === 'string';
    });

    expect(refreshSignCall?.[0]).toEqual(
      expect.objectContaining({ type: 'refresh', jti: expect.any(String) }),
    );
    expect(refreshSignCall?.[1]).toEqual(expect.anything());
  });

  describe('logout', () => {
    it('revokes the session by jti when a valid refresh token is provided', async () => {
      const revoke = jest.fn(async () => 1);
      const revokeByToken = jest.fn(async () => undefined);
      const revokeToken = jest.fn();
      const sessionService = {
        revoke,
        revokeByToken,
        revokeToken,
      } as unknown as SessionsService;

      const verifyAsync = jest.fn(async () => ({
        sub: 'user-1',
        type: 'refresh',
        jti: 'session-123',
      }));
      const jwt = { verifyAsync } as unknown as JwtService;
      const users = {} as UsersService;
      const mail = {} as MailService;
      const config = { get: jest.fn() } as unknown as ConfigService;

      const service = new AuthService(
        users,
        jwt,
        mail,
        config,
        sessionService,
        {} as NotificationsService,
        {} as any,
      );

      const result = await service.logout('valid-refresh-token');

      const verifyArgs = (
        verifyAsync as unknown as { mock: { calls: Array<unknown[]> } }
      ).mock.calls[0];
      const revokeArgs = (
        revoke as unknown as { mock: { calls: Array<unknown[]> } }
      ).mock.calls[0];
      expect(verifyArgs?.[0]).toBe('valid-refresh-token');
      expect(revokeArgs?.[0]).toBe('session-123');
      expect(
        (revokeByToken as unknown as { mock: { calls: Array<unknown[]> } }).mock
          .calls,
      ).toHaveLength(0);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('falls back to revokeByToken when the token is expired', async () => {
      const revokeByToken = jest.fn(async () => undefined);
      const revokeToken = jest.fn();
      const sessionService = {
        revokeByToken,
        revokeToken,
      } as unknown as SessionsService;

      const verifyAsync = jest.fn(async () => {
        throw new Error('jwt expired');
      });
      const jwt = { verifyAsync } as unknown as JwtService;
      const users = {} as UsersService;
      const mail = {} as MailService;
      const config = { get: jest.fn() } as unknown as ConfigService;

      const service = new AuthService(
        users,
        jwt,
        mail,
        config,
        sessionService,
        {} as NotificationsService,
        {} as any,
      );

      const result = await service.logout('expired-refresh-token');

      const revokeByTokenArgs = (
        revokeByToken as unknown as { mock: { calls: Array<unknown[]> } }
      ).mock.calls[0];
      expect(revokeByTokenArgs?.[0]).toBe('expired-refresh-token');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('revokes both the access token and refresh token when the user logs out', async () => {
      const revoke = jest.fn(async () => 1);
      const revokeByToken = jest.fn(async () => 0);
      const revokeToken = jest.fn();
      const revokeAllForUser = jest.fn(async () => 1);
      const sessionService = {
        revoke,
        revokeByToken,
        revokeToken,
        revokeAllForUser,
      } as unknown as SessionsService;

      const verifyAsync = jest
        .fn<() => Promise<{ sub: string; type?: string; jti?: string }>>()
        .mockResolvedValueOnce({
          sub: 'user-1',
          type: 'refresh',
          jti: 'session-123',
        })
        .mockResolvedValueOnce({ sub: 'user-1', type: 'access' });
      const jwt = { verifyAsync } as unknown as JwtService;
      const users = {} as UsersService;
      const mail = {} as MailService;
      const config = { get: jest.fn() } as unknown as ConfigService;

      const service = new AuthService(
        users,
        jwt,
        mail,
        config,
        sessionService,
        {} as NotificationsService,
        {} as any,
      );

      const result = await service.logout('refresh-token', 'access-token');

      expect(revokeToken).toHaveBeenCalledWith('access-token', 'user-1');
      expect(revokeToken).toHaveBeenCalledWith('refresh-token', 'user-1');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('falls back to revokeByToken when the token type is not refresh', async () => {
      const revoke = jest.fn(async () => undefined);
      const revokeByToken = jest.fn(async () => undefined);
      const revokeToken = jest.fn();
      const sessionService = {
        revoke,
        revokeByToken,
        revokeToken,
      } as unknown as SessionsService;

      const verifyAsync = jest.fn(async () => ({
        sub: 'user-1',
        type: 'access',
        jti: 'some-id',
      }));
      const jwt = { verifyAsync } as unknown as JwtService;
      const users = {} as UsersService;
      const mail = {} as MailService;
      const config = { get: jest.fn() } as unknown as ConfigService;

      const service = new AuthService(
        users,
        jwt,
        mail,
        config,
        sessionService,
        {} as NotificationsService,
        {} as any,
      );

      const result = await service.logout('access-token');

      const revokeCalls = (
        revoke as unknown as { mock: { calls: Array<unknown[]> } }
      ).mock.calls;
      const revokeByTokenArgs = (
        revokeByToken as unknown as { mock: { calls: Array<unknown[]> } }
      ).mock.calls[0];
      expect(revokeCalls).toHaveLength(0);
      expect(revokeByTokenArgs?.[0]).toBe('access-token');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('falls back to revokeByToken when jti is missing from a refresh token', async () => {
      const revokeByToken = jest.fn(async () => undefined);
      const revokeToken = jest.fn();
      const sessionService = {
        revokeByToken,
        revokeToken,
      } as unknown as SessionsService;

      const verifyAsync = jest.fn(async () => ({
        sub: 'user-1',
        type: 'refresh',
      }));
      const jwt = { verifyAsync } as unknown as JwtService;
      const users = {} as UsersService;
      const mail = {} as MailService;
      const config = { get: jest.fn() } as unknown as ConfigService;

      const service = new AuthService(
        users,
        jwt,
        mail,
        config,
        sessionService,
        {} as NotificationsService,
        {} as any,
      );

      const result = await service.logout('refresh-token-no-jti');

      const revokeByTokenArgs = (
        revokeByToken as unknown as { mock: { calls: Array<unknown[]> } }
      ).mock.calls[0];
      expect(revokeByTokenArgs?.[0]).toBe('refresh-token-no-jti');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('logoutAllDevices', () => {
    it('revokes all sessions for the given user', async () => {
      const revokeAllForUser = jest.fn(async () => undefined);
      const sessionService = { revokeAllForUser } as unknown as SessionsService;
      const users = {} as UsersService;
      const jwt = {} as JwtService;
      const mail = {} as MailService;
      const config = { get: jest.fn() } as unknown as ConfigService;

      const service = new AuthService(
        users,
        jwt,
        mail,
        config,
        sessionService,
        {} as NotificationsService,
        {} as any,
      );

      const result = await service.logoutAllDevices('user-1');

      const revokeAllArgs = (
        revokeAllForUser as unknown as { mock: { calls: Array<unknown[]> } }
      ).mock.calls[0];
      expect(revokeAllArgs?.[0]).toBe('user-1');
      expect(result).toEqual({ message: 'Logged out from all devices' });
    });
  });
});
