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

async sendVerificationCode(email: string, code: string) {
  await this.sendCodeEmail(email, code, 'Verify Your Email', 'verify your email');
}

async sendPasswordResetCode(email: string, code: string) {
  await this.sendCodeEmail(email, code, 'Reset Your Password', 'reset your password');
}

private async sendCodeEmail(email: string, code: string, subject: string, action: string) {
  const from = this.configService.get<string>('MAIL_FROM');
  if (!from) {
    this.logger.error('Email is not configured');
    throw new InternalServerErrorException('Email service is unavailable');
  }
  await this.transporter.sendMail({
    from,
    to: email,
    subject,
    text: `Your code to ${action} is: ${code}\nThis code expires in 10 minutes.`,
    html: `<p>Your code to ${action} is:</p><h2 style="letter-spacing:4px">${code}</h2><p>This code expires in 10 minutes.</p>`,
  });
}
}
