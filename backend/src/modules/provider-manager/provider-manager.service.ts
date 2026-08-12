import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IAIProvider, ImageGenerationInput, ImageGenerationOutput } from '../../common/interfaces/ai-provider.interface';
import { ManusProvider } from './providers/manus.provider';

@Injectable()
export class ProviderManagerService implements OnModuleInit {
  private readonly logger = new Logger(ProviderManagerService.name);
  private providers: IAIProvider[] = [];
  private providerHealthStatus = new Map<string, { healthy: boolean; lastChecked: Date }>();

  constructor(
    private readonly manusProvider: ManusProvider,
  ) {}

  onModuleInit() {
    // Register Manus AI as the primary provider
    this.providers = [
      this.manusProvider,
    ];

    for (const provider of this.providers) {
      this.providerHealthStatus.set(provider.id, { healthy: true, lastChecked: new Date() });
    }
  }

  async generateImage(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
    this.logger.log(`Routing image generation request...`);
    const errors: string[] = [];

    for (const provider of this.providers) {
      // Health check filter: Only skip if structurally unconfigured (invalid/missing key)
      const isProviderHealthy = await provider.isHealthy();
      if (!isProviderHealthy) {
        this.logger.warn(`Skipping provider ${provider.name} (unconfigured).`);
        continue;
      }

      this.logger.log(`Attempting image generation using provider: ${provider.name}`);
      try {
        const result = await provider.generateImage(input);
        
        // Mark as healthy on success
        this.providerHealthStatus.set(provider.id, { healthy: true, lastChecked: new Date() });
        this.logger.log(`Successfully generated image using provider ${provider.name}`);
        return result;
      } catch (err: any) {
        const errMsg = err.response?.data?.error?.message || err.message;
        this.logger.error(`Generation failed for provider ${provider.name}. Error: ${errMsg}`);
        errors.push(`${provider.name}: ${errMsg}`);

        // Mark as unhealthy on failure
        this.providerHealthStatus.set(provider.id, { healthy: false, lastChecked: new Date() });
      }
    }

    throw new Error(`All AI image generation providers failed: [${errors.join(', ')}]`);
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
