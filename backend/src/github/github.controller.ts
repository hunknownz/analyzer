import { Controller, Get, Query } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('api/github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('contributors')
  async getContributors(@Query('githubUrl') githubUrl: string) {
    try {
      const data = await this.githubService.getContributors(githubUrl);
      return { success: true, data };
    } catch (error: any) {
      throw error;
    }
  }
}
