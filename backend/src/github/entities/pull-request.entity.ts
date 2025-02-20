import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('github_pull_requests')
export class GithubPullRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'github_id', unique: true, type: 'bigint' })
  githubId: number;

  @Column({ name: 'node_id' })
  nodeId: string;

  @Column()
  number: number;

  @Column()
  url: string;

  @Column({ name: 'html_url' })
  htmlUrl: string;

  @Column({ name: 'diff_url' })
  diffUrl: string;

  @Column({ name: 'patch_url' })
  patchUrl: string;

  @Column({ name: 'issue_url' })
  issueUrl: string;

  @Column()
  state: string;

  @Column()
  locked: boolean;

  @Column()
  title: string;

  @Column({ name: 'user_github_id', type: 'bigint' })
  userGithubId: number;

  @Column({ name: 'repo_github_id', type: 'bigint' })
  repoGithubId: number;

  @Column({ name: 'repo_full_name' })
  repoFullName: string;

  @Column('text', { nullable: true })
  body: string | null;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @Column({ name: 'closed_by_github_id', type: 'bigint', nullable: true })
  closedByGithubId: number | null;

  @Column({ name: 'merged_at', type: 'timestamp', nullable: true })
  mergedAt: Date | null;

  @Column({ name: 'merge_commit_sha', nullable: true })
  mergeCommitSha: string | null;

  @Column({ name: 'assignee_github_id', type: 'bigint', nullable: true })
  assigneeGithubId: number | null;

  @Column({ type: 'json', default: [] })
  assignees: number[];

  @Column({ type: 'json', default: [] })
  requestedReviewers: number[];

  @Column({ type: 'json', default: [] })
  requestedTeams: string[];

  @Column({ type: 'json', default: [] })
  labels: string[];

  @Column({ default: false })
  draft: boolean;

  @Column({ name: 'commits_url' })
  commitsUrl: string;

  @Column({ name: 'review_comments_url' })
  reviewCommentsUrl: string;

  @Column({ name: 'review_comment_url' })
  reviewCommentUrl: string;

  @Column({ name: 'comments_url' })
  commentsUrl: string;

  @Column({ name: 'statuses_url' })
  statusesUrl: string;

  @Column({ name: 'author_association' })
  authorAssociation: string;
}
