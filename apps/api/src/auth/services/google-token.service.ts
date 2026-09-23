import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

@Injectable()
export class GoogleTokenService {
  private client: OAuth2Client | null = null;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (clientId) {
      this.client = new OAuth2Client(clientId);
    }
  }

  async verifyIdToken(idToken: string): Promise<TokenPayload> {
    if (
      process.env.NODE_ENV !== 'production' &&
      idToken &&
      idToken.startsWith('mock-google-token')
    ) {
      return {
        email: 'test.google@khana.dev',
        email_verified: true,
        given_name: 'Test',
        family_name: 'GoogleUser',
        picture:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
        sub: 'mock-google-sub-dev',
        iss: 'https://accounts.google.com',
        aud: 'mock-client-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      } as TokenPayload;
    }

    try {
      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

      if (!clientId) {
        throw new UnauthorizedException('GOOGLE_CLIENT_ID is not configured');
      }

      if (!this.client) {
        this.client = new OAuth2Client(clientId);
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
