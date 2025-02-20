import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('github_users')
export class GithubUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'github_id', unique: true, type: 'bigint' })
  githubId: number;

  @Column({ name: 'login', unique: true })
  login: string;

  @Column({ name: 'node_id' })
  nodeId: string;

  @Column({ name: 'avatar_url' })
  avatarUrl: string;

  @Column({ name: 'gravatar_id', default: '' })
  gravatarId: string;

  @Column()
  url: string;

  @Column({ name: 'html_url' })
  htmlUrl: string;

  @Column({ name: 'bio', default: '' })
  bio: string;

  @Column({ name: 'followers', default: 0 })
  followers: number;

  @Column({ name: 'following', default: 0 })
  following: number;

  @Column({ name: 'stars', default: 0 })
  stars: number;

  @Column({ name: 'followers_url' })
  followersUrl: string;

  @Column({ name: 'following_url' })
  followingUrl: string;

  @Column({ name: 'gists_url' })
  gistsUrl: string;

  @Column({ name: 'starred_url' })
  starredUrl: string;

  @Column({ name: 'subscriptions_url' })
  subscriptionsUrl: string;

  @Column({ name: 'organizations_url' })
  organizationsUrl: string;

  @Column({ name: 'repos_url' })
  reposUrl: string;

  @Column({ name: 'events_url' })
  eventsUrl: string;

  @Column({ name: 'received_events_url' })
  receivedEventsUrl: string;

  @Column()
  type: string;

  @Column({ name: 'site_admin', default: false })
  siteAdmin: boolean;

  @Column({ name: 'user_view_type', default: 'public' })
  userViewType: string;

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

  @Column({ name: 'score', type: 'float', default: 0 })
  score: number;

  @Column({ name: 'languages', type: 'jsonb', default: [] })
  languages: string[];
}
