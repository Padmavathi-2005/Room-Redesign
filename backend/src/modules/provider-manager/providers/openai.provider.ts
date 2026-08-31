import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider, ImageGenerationInput, ImageGenerationOutput } from '../../../common/interfaces/ai-provider.interface';
import axios from 'axios';

@Injectable()
export class OpenAiProvider implements IAIProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI DALL-E AI';
  private readonly logger = new Logger(OpenAiProvider.name);

  private getOpenAiApiKey(): string {
    const key = process.env.OPENAI_API_KEY || process.env.MANUS_API_KEY || '';
    if (key && key.startsWith('sk-')) return key;
    return '';
  }

  async generateImage(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
    const apiKey = this.getOpenAiApiKey();
    if (!apiKey) {
      throw new Error('No valid OpenAI API key (starting with sk-) found in configuration.');
    }

    this.logger.log('Submitting generation request to OpenAI DALL-E 3 API...');

    const promptText = `High precision architectural redesign, 8k resolution, exact layout preservation: ${input.prompt}`;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: promptText.slice(0, 1000),
          n: 1,
          size: '1024x1024',
          quality: 'standard',
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      const imageUrl = response.data?.data?.[0]?.url;
      if (!imageUrl) {
        throw new Error('OpenAI DALL-E API did not return an output image URL.');
      }

      this.logger.log(`OpenAI DALL-E 3 image generation completed successfully.`);

      return {
        imageUrl,
        costUSD: 0.04,
        providerName: this.name,
        modelName: 'dall-e-3',
        chatId: input.chatId || `session_${Date.now()}`,
      };
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || err.message;
      this.logger.error(`OpenAI API failed: ${errMsg}`);
      throw new Error(`OpenAI DALL-E API Error: ${errMsg}`);
    }
  }

  async isHealthy(): Promise<boolean> {
    const key = this.getOpenAiApiKey();
    return key.length > 10;
  }
}
