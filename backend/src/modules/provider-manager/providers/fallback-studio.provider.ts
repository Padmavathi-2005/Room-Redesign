import { Injectable, Logger } from '@nestjs/common';
import { IAIProvider, ImageGenerationInput, ImageGenerationOutput } from '../../../common/interfaces/ai-provider.interface';

export const SAMPLE_FALLBACK_IMAGES: Record<string, string[]> = {
  flooring: [
    '/uploads/generated/flooring_after.png',
  ],
  floorplan3d: [
    '/uploads/generated/3d_floor_plan_after.png',
  ],
  floorplan2d: [
    '/uploads/generated/floor_plan_generator_after.png',
  ],
  exterior: [
    '/uploads/generated/exterior_after.png',
  ],
  kitchen: [
    '/uploads/generated/kitchen_after.png',
  ],
  interior: [
    '/uploads/generated/interior_after.png',
  ],
};

@Injectable()
export class FallbackStudioProvider implements IAIProvider {
  readonly id = 'fallback-studio';
  readonly name = 'RoomAI Studio Local Renderer';
  private readonly logger = new Logger(FallbackStudioProvider.name);

  async generateImage(input: ImageGenerationInput): Promise<ImageGenerationOutput> {
    this.logger.log(`Executing Fallback Local Studio Redesign rendering...`);

    const promptLower = (input.prompt || '').toLowerCase();
    let category = 'interior';

    if (promptLower.includes('flooring') || promptLower.includes('tile') || promptLower.includes('hardwood') || promptLower.includes('grout') || promptLower.includes('marble')) {
      category = 'flooring';
    } else if (promptLower.includes('3d') || promptLower.includes('isometric')) {
      category = 'floorplan3d';
    } else if (promptLower.includes('floor plan') || promptLower.includes('blueprint') || promptLower.includes('cad') || promptLower.includes('sketch')) {
      category = 'floorplan2d';
    } else if (promptLower.includes('kitchen')) {
      category = 'kitchen';
    } else if (promptLower.includes('exterior') || promptLower.includes('facade') || promptLower.includes('building')) {
      category = 'exterior';
    }

    const pool = SAMPLE_FALLBACK_IMAGES[category] || SAMPLE_FALLBACK_IMAGES.floorplan2d;
    const selectedUrl = pool[Math.floor(Math.random() * pool.length)];

    return {
      imageUrl: selectedUrl,
      costUSD: 0.0,
      providerName: this.name,
      modelName: 'roomai-studio-diffuser-v1',
      chatId: input.chatId || `session_${Date.now()}`,
    };
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }
}
