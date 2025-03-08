import OpenAI from 'openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error('Missing DEEPSEEK_API_KEY in environment variables.');
    }

    this.openai = new OpenAI({
      baseURL: 'https://api.siliconflow.cn/v1',
      apiKey,
    });
  }

  async analyzeRepository(githubUrl: string): Promise<string> {
    console.log(`Analyzing repository: ${githubUrl}`);

    const prompt = `Please provide a concise analysis of this GitHub repository: ${githubUrl}.`;
    const completion = await this.openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'deepseek-ai/DeepSeek-V3',
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('Message content is null');
    }

    console.log(`Analysis result: ${content}`);
    return content;
  }
}
