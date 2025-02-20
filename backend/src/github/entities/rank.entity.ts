import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('community_openrank')
export class CommunityOpenRank {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'platform',
    nullable: true,
  })
  platform: string | null;

  @Column({
    name: 'repo_id',
    type: 'bigint',
    nullable: true,
  })
  repoId: number | null;

  @Column({
    name: 'repo_name',
    nullable: true,
  })
  repoName: string | null;

  @Column({
    name: 'actor_id',
    type: 'bigint',
    nullable: true,
  })
  actorId: number | null;

  @Column({
    name: 'actor_login',
    nullable: true,
  })
  actorLogin: string | null;

  @Column({
    name: 'issue_number',
    type: 'int',
    nullable: true,
  })
  issueNumber: number | null;

  @Column({
    name: 'pr_number',
    type: 'int',
    nullable: true,
  })
  prNumber: number | null;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    nullable: true,
  })
  createdAt: Date | null;

  @Column({
    name: 'openrank',
    type: 'float',
    nullable: true,
  })
  openrank: number | null;
}
