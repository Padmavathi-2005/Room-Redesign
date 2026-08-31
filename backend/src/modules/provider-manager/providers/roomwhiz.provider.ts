import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider, ImageGenerationInput, ImageGenerationOutput } from '../../../common/interfaces/ai-provider.interface';
import axios from 'axios';

@Injectable()
export class RoomWhizProvider implements IAIProvider {
  readonly id = 'roomwhiz';
  readonly name = 'RoomWhiz AI';
  private readonly logger = new Logger(RoomWhizProvider.name);

  private getApiKey(): string {
    const key = process.env.ROOMWHIZ_API_KEY || '';
    return key.trim();
  }

  async generateImage(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
    const startTime = Date.now();
    const apiKey = this.getApiKey();

    if (!apiKey) {
      throw new Error('RoomWhiz API Key (ROOMWHIZ_API_KEY) is missing in backend environment configuration.');
    }

    const apiUrl = process.env.ROOMWHIZ_API_URL || 'https://roomwhiz.com/api/v1/generate';
    this.logger.log(`Submitting room redesign request to RoomWhiz AI API (${apiUrl})...`);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    const payload = {
      image_url: input.imageUrl,
      room_type: input.options?.roomType || 'Living Room',
      design_style: input.options?.style || 'Modern',
      prompt: input.prompt,
      negative_prompt: input.negativePrompt || 'blurry, low quality, distorted architecture',
    };

    try {
      const response = await axios.post(apiUrl, payload, {
        headers,
        timeout: 45000,
      });

      const data = response.data;
      const outputUrl = data.image_url || data.imageUrl || data.url || data.output?.[0] || data.data?.[0]?.url;

      if (!outputUrl) {
        throw new Error('RoomWhiz API response did not contain a valid generated image URL.');
      }

      const totalTime = Date.now() - startTime;
      this.logger.log(`RoomWhiz AI generation completed successfully in ${totalTime}ms.`);

      return {
        imageUrl: outputUrl,
        costUSD: 0.02,
        providerName: this.name,
        modelName: 'roomwhiz-vision-v1',
        chatId: data.id || data.task_id || `rw_${Date.now()}`,
      };
    } catch (err: any) {
      const status = err.response?.status;
      let errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      if (typeof errMsg === 'object') {
        errMsg = JSON.stringify(errMsg);
      }
      if (status === 429) {
        errMsg = `RoomWhiz Free Tier Hourly Rate Limit Exceeded (10 requests/hour limit reached). Please wait for the hourly reset.`;
      }
      this.logger.error(`RoomWhiz API generation failed (Status ${status || 'Error'}): ${errMsg}`);
      throw new Error(`RoomWhiz API Error (${status || 'Error'}): ${errMsg}`);
    }
  }

  async isHealthy(): Promise<boolean> {
    const key = this.getApiKey();
    return key.length > 5;
  }
}
