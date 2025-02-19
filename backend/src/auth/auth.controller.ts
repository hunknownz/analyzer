import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github/callback')
  async githubCallback(@Query('code') code: string) {
    try {
      const data = await this.authService.handleGithubCallback(code);
      return { success: true, data };
    } catch (error: any) {
      throw error;
    }
  }
}
