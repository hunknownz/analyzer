import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { TagStreamService } from './tag-stream.service';

@Controller('api/tag-stream')
export class TagStreamController {
  constructor(private readonly tagStreamService: TagStreamService) {}

  @Post('setReceiver')
  async setReceiver(
    @Headers('authorization') authHeader: string,
    @Body() body: { receiverAddress: string },
  ) {
    try {
      if (!authHeader) {
        throw new UnauthorizedException('No authorization token provided');
      }

      const token = authHeader.split(' ')[1];
      const decoded = await this.tagStreamService.verifyToken(token);

      await this.tagStreamService.setReceiver(
        decoded.username,
        body.receiverAddress,
      );
      return { success: true };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error(error);
      throw error;
    }
  }
}
