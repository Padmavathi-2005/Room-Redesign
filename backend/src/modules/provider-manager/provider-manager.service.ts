import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IAIProvider, ImageGenerationInput, ImageGenerationOutput } from '../../common/interfaces/ai-provider.interface';
import { RoomWhizProvider } from './providers/roomwhiz.provider';
import { VertexAiProvider } from './providers/vertex-ai.provider';
import { ManusProvider } from './providers/manus.provider';

@Injectable()
export class ProviderManagerService implements OnModuleInit {
  private readonly logger = new Logger(ProviderManagerService.name);
  private providers: IAIProvider[] = [];
  private providerHealthStatus = new Map<string, { healthy: boolean; lastChecked: Date }>();

  constructor(
    private readonly roomWhizProvider: RoomWhizProvider,
    private readonly vertexAiProvider: VertexAiProvider,
    private readonly manusProvider: ManusProvider,
  ) {}

  onModuleInit() {
    // Manus AI is the primary provider for main room redesign features
    this.providers = [
      this.manusProvider,
    ];

    for (const provider of this.providers) {
      this.providerHealthStatus.set(provider.id, { healthy: true, lastChecked: new Date() });
    }
  }

  async generateImage(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
    this.logger.log(`Routing image generation request exclusively via Manus AI Provider...`);
    return this.manusProvider.generateImage(input);
  }

  /**
   * Dedicated generator using Google Vertex AI Imagen 3.
   */
  async generateImageWithVertex(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
    this.logger.log(`Executing request directly via Google Vertex AI Imagen 3 Provider...`);
    return this.vertexAiProvider.generateImage(input);
  }

  /**
   * Dedicated generator for RoomWhiz AI.
   */
  async generateImageWithRoomWhiz(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
    this.logger.log(`Executing test request directly via RoomWhiz AI Provider...`);
    return this.roomWhizProvider.generateImage(input);
  }

  async checkProviderHealth(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};
    for (const provider of this.providers) {
      try {
        const isHealthy = await provider.isHealthy();
        this.providerHealthStatus.set(provider.id, { healthy: isHealthy, lastChecked: new Date() });
        healthStatus[provider.id] = isHealthy;
      } catch (e) {
        this.providerHealthStatus.set(provider.id, { healthy: false, lastChecked: new Date() });
        healthStatus[provider.id] = false;
      }
    }
    return healthStatus;
  }
}
