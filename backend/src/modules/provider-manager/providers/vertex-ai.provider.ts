import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider, ImageGenerationInput, ImageGenerationOutput } from '../../../common/interfaces/ai-provider.interface';
import axios from 'axios';

@Injectable()
export class VertexAiProvider implements IAIProvider {
  readonly id = 'vertex-ai';
  readonly name = 'Google Vertex AI (Imagen 3)';
  private readonly logger = new Logger(VertexAiProvider.name);

  private getApiKey(): string {
    const key = process.env.VERTEX_API_KEY || process.env.GEMINI_API_KEY || process.env.GCP_API_KEY || '';
    return key.trim();
  }

  async generateImage(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
    const startTime = Date.now();
    const apiKey = this.getApiKey();
    const projectId = process.env.GCP_PROJECT_ID || '';
    const location = process.env.GCP_LOCATION || 'us-central1';

    if (!apiKey && !projectId) {
      throw new Error('Google Vertex AI requires VERTEX_API_KEY or GCP_PROJECT_ID in backend/.env.');
    }

    this.logger.log(`Submitting photorealistic room redesign to Google Vertex AI Imagen 3...`);

    const promptText = `Photorealistic 8K UHD architectural interior redesign. Layout preservation: ${input.prompt}`;

    try {
      let imageUrl = '';

      if (apiKey) {
        // Direct Google Generative Language / Vertex REST Endpoint using API Key
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
        const payload = {
          instances: [{ prompt: promptText }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1',
            outputOptions: { mimeType: 'image/jpeg' },
          },
        };

        const response = await axios.post(url, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 45000,
        });

        const predictions = response.data?.predictions;
        if (predictions && predictions[0]?.bytesBase64Encoded) {
          imageUrl = `data:image/jpeg;base64,${predictions[0].bytesBase64Encoded}`;
        } else if (predictions && predictions[0]?.mimeType && predictions[0]?.bytesBase64Encoded) {
          imageUrl = `data:${predictions[0].mimeType};base64,${predictions[0].bytesBase64Encoded}`;
        }
      } else {
        // Vertex AI GCP Project Endpoint
        const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-002:predict`;
        const payload = {
          instances: [{ prompt: promptText }],
          parameters: { sampleCount: 1, aspectRatio: '1:1' },
        };

        const response = await axios.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GCP_ACCESS_TOKEN || ''}`,
          },
          timeout: 45000,
        });

        const predictions = response.data?.predictions;
        if (predictions && predictions[0]?.bytesBase64Encoded) {
          imageUrl = `data:image/jpeg;base64,${predictions[0].bytesBase64Encoded}`;
        }
      }

      if (!imageUrl) {
        throw new Error('Vertex AI Imagen 3 response did not contain generated image data.');
      }

      const totalTime = Date.now() - startTime;
      this.logger.log(`Google Vertex AI Imagen 3 completed room redesign in ${totalTime}ms.`);

      return {
        imageUrl,
        costUSD: 0.03,
        providerName: this.name,
        modelName: 'imagen-3.0-generate-002',
        chatId: `vertex_${Date.now()}`,
      };
    } catch (err: any) {
      const status = err.response?.status;
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
      this.logger.error(`Vertex AI generation failed (Status ${status || 'Error'}): ${errMsg}`);
      throw new Error(`Google Vertex AI Error (${status || 'Error'}): ${errMsg}`);
    }
  }

  async isHealthy(): Promise<boolean> {
    const key = this.getApiKey();
    const projectId = process.env.GCP_PROJECT_ID || '';
    return key.length > 5 || projectId.length > 3;
  }
}
