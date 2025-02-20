import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { GithubEvent } from './entities/event.entity';
import { GithubPullRequest } from './entities/pull-request.entity';
import { GithubUser } from './entities/github-user.entity';
import { GithubIssue } from './entities/issue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GithubRepo } from './entities/repo.entity';
import { CommunityOpenRank } from './entities/rank.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      GithubEvent,
      GithubIssue,
      GithubUser,
      GithubPullRequest,
      CommunityOpenRank,
      GithubRepo,
    ]),
  ],
  controllers: [GithubController],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}
