import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('github_issues')
export class GithubIssue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'github_id', unique: true, type: 'bigint' })
  githubId: number;

  @Column({ name: 'node_id' })
  nodeId: string;

  @Column()
  number: number;

  @Column({ name: 'repo_github_id', type: 'bigint' })
  repoGithubId: number;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  body: string;

  @Column()
  url: string;

  @Column({ name: 'repository_url' })
  repositoryUrl: string;

  @Column({ name: 'labels_url' })
  labelsUrl: string;

  @Column({ name: 'comments_url' })
  commentsUrl: string;

  @Column({ name: 'events_url' })
  eventsUrl: string;

  @Column({ name: 'html_url' })
  htmlUrl: string;

  @Column({ name: 'user_github_id', type: 'bigint' })
  userGithubId: number;

  @Column({ type: 'json', default: [] })
  labels: string[];

  @Column()
  state: string;

  @Column({ default: false })
  locked: boolean;

  @Column({ name: 'assignee_github_id', nullable: true, type: 'bigint' })
  assigneeGithubId: number;

  @Column({ type: 'json', default: [] })
  assignees: number[];

  @Column({ name: 'comments_count' })
  commentsCount: number;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ name: 'author_association' })
  authorAssociation: string;

  @Column({ name: 'active_lock_reason', nullable: true })
  activeLockReason: string;

  @Column({ default: false })
  draft: boolean;

  @Column({ name: 'closed_by_github_id', nullable: true, type: 'bigint' })
  closedByGithubId: number;

  @Column({ type: 'json' })
  reactions: {
    total_count: number;
    '+1': number;
    '-1': number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
  };

  @Column({ name: 'timeline_url' })
  timelineUrl: string;

  @Column({ name: 'performed_via_github_app', nullable: true })
  performedViaGithubApp: string | null;

  @Column({ name: 'state_reason', nullable: true })
  stateReason: string | null;

  @Column({ name: 'sub_issues_summary', type: 'json' })
  subIssuesSummary: {
    total: number;
    completed: number;
    percent_completed: number;
  };
}
