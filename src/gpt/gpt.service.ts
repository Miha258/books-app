import { Injectable } from '@nestjs/common';
import { ClientOptions, OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GptService {
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        const configuration: ClientOptions = {
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
          }
        this.openai = new OpenAI(configuration);
    }
    async generateText(prompt: string) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        });
        return response.choices[0].message.content;
    }
}
