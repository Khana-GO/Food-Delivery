import { describe, expect, it, jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../mail/mail.service';
import { UsersService } from '../../users/users.service';
import { AuthService } from './services/auth.service';

describe('AuthService', () => {
  it('creates a user with a hashed verification token and sends only the raw token by email', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'user-1', email: 'john@example.com' });
    const sendVerificationEmail = jest.fn().mockResolvedValue(undefined);
    const users = {
      findByEmail: jest.fn().mockResolvedValue(undefined),
      create,
    } as unknown as UsersService;
    const mail = { sendVerificationEmail } as unknown as MailService;
    const config = { get: jest.fn((key: string) => key === 'SALT_ROUNDS' ? '10' : undefined) } as unknown as ConfigService;
    const service = new AuthService(users, {} as JwtService, mail, config);

    await service.register({ firstName: 'John', lastName: 'Doe', email: 'John@Example.com', password: 'StrongPass123' });

    expect(create.mock.calls[0][0]).toEqual(expect.objectContaining({
      email: 'john@example.com',
      verificationToken: expect.stringMatching(/^[a-f0-9]{64}$/),
    }));
    expect(sendVerificationEmail.mock.calls[0][1]).toEqual(expect.stringMatching(/^[a-f0-9]{64}$/));
    expect(create.mock.calls[0][0].verificationToken).not.toBe(
      sendVerificationEmail.mock.calls[0][1],
    );
  });
});
