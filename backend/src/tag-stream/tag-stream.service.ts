import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TagStream } from './tagStream';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TagStreamService {
  private tagStream: TagStream;

  constructor(private configService: ConfigService) {
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    if (!privateKey) {
      //   throw new Error('Missing PRIVATE_KEY in environment variables');
    }
    this.tagStream = new TagStream(privateKey);
  }

  async verifyToken(token: string) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('Missing JWT_SECRET in environment variables');
    }

    const decoded = jwt.verify(token, jwtSecret) as { username: string };
    return decoded;
  }

  async setReceiver(username: string, receiverAddress: string) {
    return await this.tagStream.setReceiverForContract(
      username,
      receiverAddress,
    );
  }
}
