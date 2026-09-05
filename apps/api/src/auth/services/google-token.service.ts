import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

@Injectable()
export class GoogleTokenService {
  private readonly client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is not configured');
    }

    this.client = new OAuth2Client(clientId);
  }

  async verifyIdToken(idToken: string): Promise<TokenPayload> {
    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

      if (!clientId) {
        throw new Error('GOOGLE_CLIENT_ID is not configured');
      }

      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      if (!payload.email) {
        throw new UnauthorizedException(
          'Google account does not contain an email',
        );
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired Google ID token');
    }
  }
}
