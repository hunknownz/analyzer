import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('github_repos')
export class GithubRepo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'github_id', unique: true, type: 'bigint' })
  githubId: number;

  @Column()
  name: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'owner_github_id', type: 'bigint' })
  ownerGithubId: number;

  @Column({ name: 'html_url' })
  htmlUrl: string;

  @Column({ name: 'is_private', default: false })
  isPrivate: boolean;

  @Column()
  description: string;

  @Column()
  url: string;

  @Column({ name: 'hooks_url' })
  hooksUrl: string;

  @Column({ name: 'issue_events_url' })
  issueEventsUrl: string;

  @Column({ name: 'events_url' })
  eventsUrl: string;

  @Column({ name: 'assignees_url' })
  assigneesUrl: string;

  @Column({ name: 'issues_url' })
  issuesUrl: string;

  @Column({ name: 'pulls_url' })
  pullsUrl: string;

  @Column()
  homepage: string;

  @Column({ name: 'stargazers_count' })
  stargazersCount: number;

  @Column({ name: 'watchers_count' })
  watchersCount: number;

  @Column({ name: 'forks_count' })
  forksCount: number;

  @Column({ name: 'open_issues_count' })
  openIssuesCount: number;

  @Column({ name: 'subscribers_count' })
  subscribersCount: number;

  @Column({ name: 'size' })
  size: number;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ name: 'pushed_at' })
  pushedAt: Date;

  @Column({ name: 'avatar_url', default: '' })
  avatarUrl: string;

  @Column({ name: 'score', type: 'float', default: 0 })
  score: number;

  @Column('simple-array', { name: 'languages', nullable: true })
  languages: string[];

  // TODO: relation table
  @Column('jsonb', { name: 'contributors', nullable: true })
  contributors: any[];
}
