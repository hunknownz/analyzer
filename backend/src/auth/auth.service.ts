import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async handleGithubCallback(code: string) {
    if (!code) {
      throw new Error('No authorization code provided');
    }

    const authServiceTarget = this.configService.get<string>(
      'AUTH_SERVICE_TARGET',
    );
    if (!authServiceTarget) {
      throw new Error('Missing AUTH_SERVICE_TARGET in environment variables');
    }

    const callbackUrl = `${authServiceTarget}/auth/github/callback?code=${code}`;

    try {
      const response = await axios.get(callbackUrl, {
        headers: {
          Accept: 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }
}
