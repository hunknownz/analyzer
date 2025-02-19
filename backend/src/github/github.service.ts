import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from 'octokit';

@Injectable()
export class GithubService {
  private readonly octokit: Octokit;

  constructor(private configService: ConfigService) {
    const githubToken = this.configService.get<string>('GITHUB_TOKEN');
    if (!githubToken) {
      throw new Error('Missing GITHUB_TOKEN in environment variables');
    }
    this.octokit = new Octokit({ auth: githubToken });
  }

  async getContributors(githubUrl: string) {
    const [owner, repo] = this.parseGithubUrl(githubUrl);

    const response = await this.octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 10,
      page: 1,
    });

    return response.data;
  }

  private parseGithubUrl(githubUrl: string): [string, string] {
    const parts = githubUrl.split('/');
    const owner = parts[3];
    const repo = parts[4].replace('.git', '');
    return [owner, repo];
  }
}
