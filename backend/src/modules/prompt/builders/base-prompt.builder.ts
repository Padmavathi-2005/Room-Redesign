import { RoomAnalysisResult } from '../../room-analysis/dto/room-analysis.dto';
import { PromptInputOptions } from '../interfaces/prompt-input.interface';

export { PromptInputOptions };

export interface PromptOutputResult {
  finalPrompt: string;
  negativePrompt: string;
}

export interface IPromptBuilder {
  build(options: PromptInputOptions): PromptOutputResult;
}

/**
 * High-definition Quality, Bright Lighting, and Vibrant Color Boosters
 */
export const COMMON_PHOTOGRAPHIC_BOOSTERS =
  'award-winning 8k UHD resolution architectural photograph, bright vibrant natural daylighting, well-lit space, crystal clear sharp focus, high dynamic range HDR, vivid attractive color rendering, rich glossy material textures, architectural digest cover aesthetic, octane render, 35mm professional lens';

/**
 * Strict Negative Prompt to avoid dark, dim, blurry, or dull renders
 */
export const COMMON_NEGATIVE_PROMPT =
  'dark room, dim lighting, underexposed, dark muddy shadows, dull desaturated colors, grainy noise, blurry, distorted geometry, low quality, bad proportions, watermarks, text, low resolution, corrupted structures';
