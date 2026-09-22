/**
 * ERR-023 regression tests — verification/reset codes must never be written to
 * production logs, even when the mailer is unconfigured or SMTP fails.
 */
import { InternalServerErrorException } from '@nestjs/common';
import { MailService } from './mail.service';

const CODE = '123456';

function buildService(
  env: Record<string, string | undefined>,
  sendMail?: jest.Mock,
) {
  const config: any = { get: (key: string) => env[key] };
  const service = new MailService(config);

  // Replace the real nodemailer transport with a stub.
  (service as any).transporter = { sendMail: sendMail ?? jest.fn() };

  const warn = jest.spyOn((service as any).logger, 'warn').mockImplementation();
  const error = jest
    .spyOn((service as any).logger, 'error')
    .mockImplementation();
  const log = jest.spyOn((service as any).logger, 'log').mockImplementation();

  const logged = () =>
    [...warn.mock.calls, ...error.mock.calls, ...log.mock.calls]
      .flat()
      .map((entry) => String(entry))
      .join('\n');

  return { service, warn, error, logged };
}

describe('MailService code logging (ERR-023)', () => {
  it('throws and logs no code when mail is unconfigured in production', async () => {
    const { service, logged } = buildService({ NODE_ENV: 'production' });

    await expect(
      service.sendVerificationCode('user@example.com', CODE),
    ).rejects.toThrow(InternalServerErrorException);

    expect(logged()).not.toContain(CODE);
  });

  it('throws and logs no code when SMTP fails in production', async () => {
    const sendMail = jest.fn().mockRejectedValue(new Error('SMTP down'));
    const { service, logged } = buildService(
      {
        NODE_ENV: 'production',
        MAIL_FROM: 'KhanaGo <no-reply@khanago.app>',
        MAIL_USER: 'no-reply@khanago.app',
      },
      sendMail,
    );

    await expect(
      service.sendPasswordResetCode('user@example.com', CODE),
    ).rejects.toThrow(InternalServerErrorException);

    expect(sendMail).toHaveBeenCalled();
    expect(logged()).not.toContain(CODE);
    expect(logged()).toContain('SMTP delivery failed');
  });

  it('still logs the code in development when mail is unconfigured', async () => {
    const { service, logged } = buildService({ NODE_ENV: 'development' });

    await expect(
      service.sendVerificationCode('user@example.com', CODE),
    ).resolves.toBeUndefined();

    expect(logged()).toContain(CODE);
  });

  it('still logs the code in development when SMTP fails', async () => {
    const sendMail = jest.fn().mockRejectedValue(new Error('SMTP down'));
    const { service, logged } = buildService(
      { NODE_ENV: 'development', MAIL_FROM: 'x', MAIL_USER: 'y' },
      sendMail,
    );

    await expect(
      service.sendVerificationCode('user@example.com', CODE),
    ).resolves.toBeUndefined();

    expect(logged()).toContain(CODE);
  });

  it('sends the code by email when configured', async () => {
    const sendMail = jest.fn().mockResolvedValue({});
    const { service } = buildService(
      {
        NODE_ENV: 'production',
        MAIL_FROM: 'KhanaGo <no-reply@khanago.app>',
        MAIL_USER: 'no-reply@khanago.app',
      },
      sendMail,
    );

    await service.sendVerificationCode('user@example.com', CODE);

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        text: expect.stringContaining(CODE),
      }),
    );
  });
});
