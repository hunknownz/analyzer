import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('github_events')
export class GithubEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  platform: string;

  @Column({ name: 'repo_id', type: 'bigint' })
  repoId: number;

  @Column({ name: 'repo_name' })
  repoName: string;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'actor_id', type: 'bigint' })
  actorId: number;

  @Column({ name: 'actor_login' })
  actorLogin: string;

  @Column()
  type: string;

  @Column()
  action: string;

  @Column({ name: 'issue_number', nullable: true })
  issueNumber: number | null;

  @Column({ name: 'pull_merged', nullable: true })
  pullMerged: boolean | null;

  @Column({ name: 'issue_title', nullable: true })
  issueTitle: string | null;
}
