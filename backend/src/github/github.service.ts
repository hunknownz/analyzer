import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from 'octokit';
import { IsNull, Not, Repository } from 'typeorm';
import { GithubEvent } from './entities/event.entity';
import { GithubIssue } from './entities/issue.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GithubUser } from './entities/github-user.entity';
import { GithubPullRequest } from './entities/pull-request.entity';
import { CommunityOpenRank } from './entities/rank.entity';
import { GithubRepo } from './entities/repo.entity';

@Injectable()
export class GithubService {
  private readonly octokit: Octokit;

  constructor(
    private configService: ConfigService,
    @InjectRepository(GithubEvent)
    private readonly eventRepo: Repository<GithubEvent>,
    @InjectRepository(GithubIssue)
    private readonly issueRepo: Repository<GithubIssue>,
    @InjectRepository(GithubUser)
    private readonly userRepo: Repository<GithubUser>,
    @InjectRepository(GithubPullRequest)
    private readonly pullRequestRepo: Repository<GithubPullRequest>,
    @InjectRepository(GithubRepo)
    private readonly repoRepo: Repository<GithubRepo>,
    @InjectRepository(CommunityOpenRank)
    private readonly rankRepo: Repository<CommunityOpenRank>,
  ) {
    const githubToken = this.configService.get<string>('GITHUB_TOKEN');
    if (!githubToken) {
      throw new Error('Missing GITHUB_TOKEN in environment variables');
    }
    this.octokit = new Octokit({ auth: githubToken });
  }

  async getContributors(githubUrl: string) {
    console.log('getContributors');
    console.log(githubUrl);
    const [owner, repo] = this.parseGithubUrl(githubUrl);
    console.log('owner', owner);
    console.log('repo', repo);
    const repoEntity = await this.repoRepo.findOne({
      where: {
        fullName: `${owner}/${repo}`,
      },
    });
    if (!repoEntity) {
      const response = await this.octokit.rest.repos.listContributors({
        owner,
        repo,
        per_page: 10,
        page: 1,
      });

      return response.data;
    } else {
      console.log('repoEntity', repoEntity);
      // 从rank中取出该仓库排名前十的贡献者（actor_id != null）
      const rankEntity = await this.rankRepo.find({
        where: {
          repoId: repoEntity.githubId,
          actorId: Not(IsNull()),
        },
        order: {
          openrank: 'ASC',
        },
        take: 10,
      });

      // 遍历rankEntiy中的每一个actorId，然后从userRepo中取出对应的user，并建立一个userGithubId => avatar_url的map
      const userMap = new Map<number, string>();
      for (const item of rankEntity) {
        const user = await this.userRepo.findOne({
          where: { githubId: item.actorId },
        });
        if (user) {
          userMap.set(item.actorId, user.avatarUrl);
        }
      }

      // atcorId => id
      // actorLogin => login
      // openrank => contributions
      return rankEntity.map((item) => ({
        id: item.actorId,
        login: item.actorLogin,
        avatar_url: userMap.get(item.actorId),
        contributions: item.openrank,
      }));
    }
  }

  private parseGithubUrl(githubUrl: string): [string, string] {
    if (!githubUrl) {
      throw new Error('GitHub URL is required');
    }

    let owner: string;
    let repo: string;

    if (githubUrl.startsWith('git@github.com:')) {
      // Handle SSH format: git@github.com:owner/repo.git
      const [, path] = githubUrl.split('git@github.com:');
      [owner, repo] = path.split('/');
    } else {
      // Handle HTTPS format: https://github.com/owner/repo
      const parts = githubUrl.split('/');
      owner = parts[3];
      repo = parts[4];
    }

    if (!owner || !repo) {
      throw new Error('Invalid GitHub URL format');
    }

    // Remove .git suffix if present
    repo = repo.replace('.git', '');

    return [owner, repo];
  }
}
