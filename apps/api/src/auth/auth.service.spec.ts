import { describe, expect, it, jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './services/auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

describe('AuthService', () => {
  it('creates a user with a hashed verification token and sends only the raw token by email', async () => {
    const create = jest.fn(async () => ({ id: 'user-1', email: 'john@example.com' }));

    const sendVerificationEmail = jest.fn(async () => undefined);

    const findByEmail = jest.fn(async () => undefined);

    const users = {
      findByEmail,
      create,
    } as unknown as UsersService;
    const mail = { sendVerificationEmail } as unknown as MailService;
    const config = { get: jest.fn((key: string) => (key === 'SALT_ROUNDS' ? '10' : undefined)) } as unknown as ConfigService;
    const service = new AuthService(users, {} as JwtService, mail, config);

    await service.register({ firstName: 'John', lastName: 'Doe', email: 'John@Example.com', password: 'StrongPass123' });

    const createCall = create.mock.calls[0] as unknown as [Record<string, unknown>] | undefined;
    const createdUser = createCall?.[0] as { email: string; verificationToken: string } | undefined;
    const emailCall = sendVerificationEmail.mock.calls[0] as unknown as [string, string] | undefined;

    expect(createdUser).toEqual(expect.objectContaining({
      email: 'john@example.com',
      verificationToken: expect.stringMatching(/^[a-f0-9]{64}$/),
    }));
    expect(emailCall?.[1]).toEqual(expect.stringMatching(/^[a-f0-9]{64}$/));
    expect(createdUser?.verificationToken).not.toBe(emailCall?.[1]);
  });
});
