import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';
import { AiController } from './ai/ai.controller';
import { GithubModule } from './github/github.module';
import { AuthModule } from './auth/auth.module';
import { TagStreamModule } from './tag-stream/tag-stream.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AiModule,
    GithubModule,
    AuthModule,
    TagStreamModule,
  ],
  controllers: [AppController, AiController],
  providers: [AppService],
})
export class AppModule {}
