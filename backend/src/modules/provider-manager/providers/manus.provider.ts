import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider, ImageGenerationInput, ImageGenerationOutput } from '../../../common/interfaces/ai-provider.interface';
import axios from 'axios';

@Injectable()
export class ManusProvider implements IAIProvider {
  readonly id = 'manus';
  readonly name = 'Manus AI';
  private readonly logger = new Logger(ManusProvider.name);

  // In-memory key index pointer for round-robin rotation
  private currentKeyIndex = 0;

  /**
   * Helper to parse array of Manus API keys from process.env
   */
  private getManusApiKeys(): string[] {
    const rawKeys = process.env.MANUS_API_KEYS || process.env.MANUS_API_KEY || '';
    if (!rawKeys) return [];
    return rawKeys
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }

  async generateImage(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
    const startTime = Date.now();
    const apiKeys = this.getManusApiKeys();

    if (apiKeys.length === 0) {
      throw new Error('Manus API Key (MANUS_API_KEYS or MANUS_API_KEY) is missing in backend configuration.');
    }

    let buffer = input.imageBuffer;
    let mimeType = input.imageMimeType || 'image/png';

    // If buffer is missing but imageUrl is present, fetch the image to a Buffer
    if (!buffer && input.imageUrl) {
      this.logger.log(`Input imageBuffer is missing. Fetching image from URL: ${input.imageUrl}...`);
      try {
        const downloadRes = await axios.get(input.imageUrl, { responseType: 'arraybuffer', timeout: 8000 });
        buffer = Buffer.from(downloadRes.data, 'binary');
        const contentType = downloadRes.headers['content-type'];
        mimeType = typeof contentType === 'string' ? contentType : 'image/png';
      } catch (err: any) {
        this.logger.error(`Failed to fetch input image from URL: ${err.message}`);
        throw new Error(`Failed to download input image for Manus AI: ${err.message}`);
      }
    }

    if (!buffer) {
      throw new Error('Manus AI generation requires an input image buffer or a valid image URL.');
    }

    const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;
    const manusApiUrl = process.env.MANUS_API_URL || 'https://api.manus.im/v1';

    // Resolve absolute image URL if input.imageUrl is provided
    let absoluteImageUrl = input.imageUrl || '';
    if (absoluteImageUrl && !absoluteImageUrl.startsWith('http://') && !absoluteImageUrl.startsWith('https://') && !absoluteImageUrl.startsWith('data:')) {
      const host = process.env.BACKEND_URL || 'http://localhost:5001';
      const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
      const cleanPath = absoluteImageUrl.startsWith('/') ? absoluteImageUrl : `/${absoluteImageUrl}`;
      absoluteImageUrl = `${cleanHost}${cleanPath}`;
    }

    const imageRefClause = absoluteImageUrl ? `Source Image URL: ${absoluteImageUrl}. ` : '';
    const fullPrompt = `${imageRefClause}best quality, extremely detailed, photo, 8k, exact 1:1 architectural structure, ${input.prompt}`;

    // Loop through available API keys starting from currentKeyIndex
    let lastErrorMessage = '';
    const attemptsCount = apiKeys.length;

    for (let i = 0; i < attemptsCount; i++) {
      const keyIndex = (this.currentKeyIndex + i) % apiKeys.length;
      const currentApiKey = apiKeys[keyIndex];
      const isKeyRotated = i > 0;

      // Omit previous chatId if we switched to a new API key (new key won't recognize previous account's chatId)
      const effectiveChatId = isKeyRotated ? undefined : input.chatId;

      this.logger.log(
        `Submitting image generation request to Manus AI API (Key #${keyIndex + 1} of ${apiKeys.length})...`,
      );
      if (effectiveChatId) {
        this.logger.log(`   - Continuing Manus AI Chat Session: ${effectiveChatId}`);
      } else if (isKeyRotated) {
        this.logger.log(`   - Key rotated: Starting fresh session thread with Key #${keyIndex + 1} using Project DesignTheme consistency.`);
      }

      try {
        const payload: Record<string, any> = {
          prompt: fullPrompt,
          image_url: absoluteImageUrl || input.imageUrl,
          image: base64Image,
          negative_prompt: input.negativePrompt || 'low quality, bad quality, sketches, distorted architecture',
          options: input.options || {},
        };

        if (effectiveChatId) {
          payload.chat_id = effectiveChatId;
          payload.session_id = effectiveChatId;
          payload.parent_task_id = effectiveChatId;
        }

        const response = await axios.post(`${manusApiUrl}/tasks`, payload, {
          headers: {
            Authorization: `Bearer ${currentApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        });

        const data = response.data;
        let outputUrl = data.imageUrl || data.url || data.output?.[0] || data.data?.[0]?.url;
        const returnedChatId = data.chat_id || data.session_id || data.conversation_id || data.id || data.task_id || effectiveChatId;

        // Async task polling if needed
        if (!outputUrl && (data.id || data.task_id)) {
          const taskId = data.id || data.task_id;
          const taskUrl = data.status_url || `${manusApiUrl}/tasks/${taskId}`;
          this.logger.log(`Manus task submitted successfully. Task ID: ${taskId}. Polling for completion...`);

          let attempts = 0;
          const maxAttempts = 60;
          const pollIntervalMs = 2000;
          let taskStatus = data.status || 'pending';

          while (taskStatus !== 'succeeded' && taskStatus !== 'completed' && taskStatus !== 'failed' && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
            attempts++;

            try {
              const pollRes = await axios.get(taskUrl, {
                headers: { Authorization: `Bearer ${currentApiKey}` },
                timeout: 5000,
              });
              const pollData = pollRes.data;
              taskStatus = pollData.status || (pollData.state ? pollData.state.toLowerCase() : 'pending');
              outputUrl = pollData.imageUrl || pollData.url || pollData.output?.[0] || pollData.data?.[0]?.url;

              if (taskStatus === 'succeeded' || taskStatus === 'completed' || outputUrl) {
                this.logger.log(`Manus task ${taskId} completed successfully on attempt ${attempts}.`);
                break;
              }
            } catch (pollErr: any) {
              this.logger.warn(`Polling attempt ${attempts} encountered error: ${pollErr.message}`);
            }
          }
        }

        if (!outputUrl) {
          throw new Error('Manus API did not return a valid output image URL.');
        }

        // On success, update currentKeyIndex to this working key
        this.currentKeyIndex = keyIndex;

        const totalTime = Date.now() - startTime;
        this.logger.log(`Manus AI generation completed successfully in ${totalTime}ms using Key #${keyIndex + 1}. Session ID: ${returnedChatId}`);

        return {
          imageUrl: outputUrl,
          costUSD: 0.01,
          providerName: this.name,
          modelName: 'manus-vision-gen',
          chatId: returnedChatId,
        };
      } catch (err: any) {
        const status = err.response?.status;
        const errMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
        lastErrorMessage = errMsg;

        this.logger.warn(`Manus API Key #${keyIndex + 1} failed (Status ${status || 'Error'}): ${errMsg}`);

        // If rate limit (429), quota exceeded (402/403), or invalid key, continue loop to try next API key
        if (status === 429 || status === 402 || status === 401 || status === 403 || i < apiKeys.length - 1) {
          this.logger.log(`⚠️ Auto-rotating to next available Manus API Key in pool...`);
          continue;
        }
      }
    }

    throw new Error(`All ${apiKeys.length} Manus API keys in pool failed. Last error: ${lastErrorMessage}`);
  }

  async isHealthy(): Promise<boolean> {
    const keys = this.getManusApiKeys();
    return keys.length > 0;
  }
}
