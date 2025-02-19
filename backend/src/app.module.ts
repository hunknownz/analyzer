import { Module } from '@nestjs/common';
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
    AiModule,
    GithubModule,
    AuthModule,
    TagStreamModule,
  ],
  controllers: [AppController, AiController],
  providers: [AppService],
})
export class AppModule {}
