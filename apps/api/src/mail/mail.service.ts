import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: Number(this.configService.get<string>('MAIL_PORT') ?? 465),
      secure: Number(this.configService.get<string>('MAIL_PORT') ?? 465) === 465,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    await this.sendTokenEmail(email, token, 'verify-email', 'Verify Your Email', 'verify your email');
  }

  async sendPasswordResetEmail(email: string, token: string) {
    await this.sendTokenEmail(email, token, 'reset-password', 'Reset Your Password', 'reset your password');
  }

  private async sendTokenEmail(email: string, token: string, path: string, subject: string, action: string) {
    const baseUrl = this.configService.get<string>('FRONTEND_URL_WEB');
    const from = this.configService.get<string>('MAIL_FROM');
    if (!baseUrl || !from) {
      this.logger.error('Email is not configured');
      throw new InternalServerErrorException('Email service is unavailable');
    }
    const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
    url.searchParams.set('token', token);
    await this.transporter.sendMail({
      from,
      to: email,
      subject,
      text: `Use this link to ${action}: ${url.toString()}`,
      html: `<p>Click <a href="${url.toString()}">here</a> to ${action}.</p>`,
    });
  }
}
