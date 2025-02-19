import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('api/ai')
export class AiController {
  constructor(private readonly deepseekService: AiService) {}

  @Get('analyze')
  async analyzeRepository(@Query('githubUrl') githubUrl: string) {
    try {
      const result = await this.deepseekService.analyzeRepository(githubUrl);
      return { success: true, data: result };
    } catch (error: any) {
      throw error;
    }
  }
}
