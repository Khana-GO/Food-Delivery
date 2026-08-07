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

  /** Send a 6-digit OTP email with a premium branded HTML template */
  async sendOtpEmail(email: string, otp: string, firstName: string) {
    const from = this.configService.get<string>('MAIL_FROM');
    if (!from) {
      this.logger.error('MAIL_FROM is not configured');
      throw new InternalServerErrorException('Email service is unavailable');
    }

    // Format OTP with spaces for readability: 847291 → 8 4 7 2 9 1
    const otpSpaced = otp.split('').join('  ');
    const year = new Date().getFullYear();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your KhanaGo Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Email wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0"
          style="background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">

          <!-- ── HEADER ─────────────────────────────────────────── -->
          <tr>
            <td style="background:linear-gradient(135deg,#F28D52 0%,#38BDF8 100%);padding:36px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:rgba(255,255,255,0.18);border-radius:16px;padding:10px 20px;">
                      <span style="font-size:28px;vertical-align:middle;">🍔</span>
                      <span style="font-size:26px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;vertical-align:middle;margin-left:8px;">KhanaGo</span>
                    </div>
                    <p style="margin:12px 0 0;color:rgba(255,255,255,0.88);font-size:14px;font-weight:500;">
                      Your favourite food, delivered fast
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── BODY ──────────────────────────────────────────── -->
          <tr>
            <td style="padding:44px 44px 32px;">

              <!-- Greeting -->
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1F2937;">
                Hi ${firstName}! 👋
              </h1>
              <p style="margin:0 0 32px;font-size:15px;color:#6B7280;line-height:1.6;">
                We received a request to verify your KhanaGo account.
                Use the code below to complete verification. It expires in <strong style="color:#1F2937;">10 minutes</strong>.
              </p>

              <!-- OTP card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#F8FAFC;border:2px dashed #E2E8F0;border-radius:16px;padding:32px 24px;text-align:center;">
                    <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:2px;">
                      Verification Code
                    </p>
                    <p style="margin:0;font-size:52px;font-weight:800;color:#1F2937;letter-spacing:14px;line-height:1;">
                      ${otpSpaced}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border-top:1px solid #F1F5F9;"></td>
                </tr>
              </table>

              <!-- Security warning -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                <tr>
                  <td width="32" valign="top" style="padding-top:2px;">
                    <span style="font-size:18px;">⚠️</span>
                  </td>
                  <td style="font-size:13px;color:#9CA3AF;line-height:1.6;">
                    <strong style="color:#6B7280;">Never share this code with anyone.</strong>
                    KhanaGo will never call or email you asking for your verification code.
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="32" valign="top" style="padding-top:2px;">
                    <span style="font-size:18px;">🔒</span>
                  </td>
                  <td style="font-size:13px;color:#9CA3AF;line-height:1.6;">
                    If you didn't sign up for KhanaGo, you can safely ignore this email.
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── FOOTER ─────────────────────────────────────────── -->
          <tr>
            <td style="background:#F8FAFC;padding:20px 44px;border-top:1px solid #E5E7EB;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#9CA3AF;">
                © ${year} KhanaGo. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:#CBD5E1;">
                This is an automated message — please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

    const plainText = [
      `Hi ${firstName},`,
      ``,
      `Your KhanaGo verification code is: ${otp}`,
      ``,
      `This code expires in 10 minutes.`,
      ``,
      `⚠️  Never share this code with anyone. KhanaGo will never ask for it.`,
      `If you didn't sign up for KhanaGo, ignore this email.`,
      ``,
      `– The KhanaGo Team`,
    ].join('\n');

    await this.transporter.sendMail({
      from,
      to: email,
      subject: `${otp} – Your KhanaGo verification code`,
      text: plainText,
      html,
    });

    this.logger.log(`OTP email sent to ${email}`);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    await this.sendTokenEmail(email, token, 'reset-password', 'Reset Your Password', 'reset your password');
  }

  private async sendTokenEmail(
    email: string,
    token: string,
    path: string,
    subject: string,
    action: string,
  ) {
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
