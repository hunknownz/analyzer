import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TagStreamController } from './tag-stream.controller';
import { TagStreamService } from './tag-stream.service';

@Module({
  imports: [ConfigModule],
  controllers: [TagStreamController],
  providers: [TagStreamService],
  exports: [TagStreamService],
})
export class TagStreamModule {}
