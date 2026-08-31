import { IPromptBuilder, PromptOutputResult, COMMON_PHOTOGRAPHIC_BOOSTERS, COMMON_NEGATIVE_PROMPT } from './base-prompt.builder';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';

/**
 * Dedicated Prompt Builder for Change Room Light Tool
 */
export class LightPromptBuilder implements IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult {
    const lightType = options.lighting || 'Warm Ambient Sunlight';
    const timeOfDay = options.timeOfDay || 'Golden Hour Sunset';
    const warmth = options.mood || 'warm cozy 3000K Kelvin';

    const finalPrompt = `Architectural lighting redesign. Room is lit with ${lightType} during ${timeOfDay} with a ${warmth} glow. Realistic shadow diffusion and soft ambient bounce lighting. ${COMMON_PHOTOGRAPHIC_BOOSTERS}`;

    return {
      finalPrompt,
      negativePrompt: `${COMMON_NEGATIVE_PROMPT}, harsh overexposure, pitch black shadows, underexposed darkness`,
    };
  }
}
